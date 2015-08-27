angular.module('idle', ['mgcrea.ngStrap'])
.config(function($popoverProvider) {
  angular.extend($popoverProvider.defaults, {
    placement: 'bottom',
    container: 'body',
    trigger: 'hover'
  });
})

.controller('MainController', ['$scope', function(scope){

  // ===============================================================================
  //  SETUP
  // ===============================================================================

  
  scope.game = {
    money : 50,
    miningLevel : 2,
  };
  
  
  
  scope.game.multipliers = {}; // Multiplier for individual mining output
  scope.game.globalMultipliers = []; // Multiplicative multiplier for all mining output  
  scope.game.inventory = [];
  scope.selectedItem;
  scope.selectedMachine;
  scope.game.machines = [];
  var itemsList = [
    {
      name : 'Stone',
      dropChance : 100,
      requiresMiningLevel : 0,
      sellPrice : 1
    },
    {
      name : 'Iron ore',
      dropChance : 15,
      requiresMiningLevel : 2,
      sellPrice : 7
    },
    {
      name : 'Iron bar',
      sellPrice : 12,
      smeltTime : 5000,
      materials : {
        'Iron ore' : 1
      },
      isCraftable : true
    },
    {
      name : 'Pickaxe',
      sellPrice : 25,
      isEquipment : 'pickaxe',
      isStackable : false
    },
    {
      name : 'Belt',
      sellPrice : 50,
      isEquipment : 'belt',
      isStackable : false
    }
  ];
  


  
  // ===============================================================================
  //  ITEMS
  // =============================================================================== 
  
    var itemProto = {
    dropChance : 0, // % drop chance
    requiresMiningLevel : 0, // This mining level is required to abtain the item through mining
    sellPrice : 0, // The price at which the item can be sold for
    image : '', // The path to the image
    processTime : false, // The time it takes the item to be processed (smelt, crafting etc.) in ms - or false if it can't be processed
    materials : {}, // An object of items needed to create this item, with name : amount pairs
    isStackable : true, // Whether or not the item can be stacked
    isEquipment : false, // Whether or not the item can be equipped - false or equipment slot(string)
    isCraftable : false, // Whether or not the items is craftable - if true, remember to make the materials object.
    craftinText : false, // Text to be displayed on the buttons (craft / smelt / pulverize / refine etc.)
    rarity : 'common', // Common, uncommon, rare, unique, artifact
    image : '', // The image path is automatically being generated.
    id : '', // A unique ID given to every item.
    amount : 1
  }
  scope.game.items = [];
  
  // Create an item from the proto object, only parse in properties that needed to be changed from the defaults.
  scope.createItemFromProto = function(obj, protoKey){
    var proto = _.clone(itemProto);
    var item = _.extend(proto, obj);
    item.name = protoKey;
    item.image = item.image == '' ? protoKey.replace(' ','').toLowerCase() : item.image;
    scope.game.multipliers[protoKey] = 1;
    return item;
  }
  
  scope.createItem = function(obj) {
    return _.extend(_.clone(_.findWhere(scope.game.items,{name : obj.proto || obj.name})), obj);
  }
  
  // Initialize the list of items.
  _.each(itemsList, function(values){
    scope.game.items.push(scope.createItemFromProto(values, values.name));
  });
  
  
  // ===============================================================================
  //  MINE
  // ===============================================================================
  
  scope.mine = function(){
    
    _.each(scope.game.items, function(item){
      var r = _.random(1,100);
      
      // First check if the item can drop from mining
      if(!item.hasOwnProperty('dropChance') || !item.hasOwnProperty('requiresMiningLevel')) return false;
      
      // Then check if it was picked in the drop table
      if(r <= item.dropChance){
        
        // Then check if we can actually mine it
        if(item.requiresMiningLevel <= scope.game.miningLevel){
          // First add all the additive miltipliers
          var total = 1 * scope.game.multipliers[item.name];
          // Then add all the multiplicative multipliers
          _.each(scope.game.globalMultipliers, function(value){
            total *= value
          });
          scope.addToInventory(item, total);
          
        }
      }
    })
  }
  
  
  // ===============================================================================
  //  CRAFTING
  // ===============================================================================
  
  var affixes = {
    prefixes : {
      'Iron' : {
        multiplies : 'Iron ore',
        multiplier : []
      }
    }
  }
  
  
  scope.generateRandomItem = function(slot){
    // If the slot wasn't specified, generate item for a random slot
    if(typeof slot === 'undefined'){
      items = _.where(items, function(d){ return !!d.isEquipment});
      slot = items[_.random(0,items.length-1)].isEquipment;
    }
    console.log(slot)
  }
  
  scope.getRarity = function(){
  // Sizes are relative to each other. This will also give diminishing returns later on
    var rarityChance = {
      common : 1000,
      uncommon : 250,
      rare : 50,
      unique : 10,
      artifact : 2
    };
    
    var arr = [];
    
    _.each(rarityChance, function(chance, rarity){
      for(i = 1;i<=chance;i++){
        arr.push(rarity);
      }
    })
    var random = arr[_.random(0,arr.length-1)];
    window.t = random;
    console.log(random);
    return random;
    
  }
  
  // ===============================================================================
  //  BUY / SELL
  // ===============================================================================

  scope.setSelectedItem = function(item){
    scope.selectedItem = item;
  }
  
  scope.unsetSelectedItem = function(){
    scope.selectedItem = false;
  }
  
  scope.sellItem = function(item, amount){
    var item = _.findWhere(scope.game.inventory, {name : item.name});
    var amount = amount == 'all' ? item.amount : amount;
    
    scope.game.money = scope.game.money + (amount * item.sellPrice);
    item.amount = item.amount - amount;
    
    if(item.amount <= 0){
      scope.removeFromInventory(item);
    }
  }
  
  scope.sellAllItems = function(){
    _.each(scope.game.inventory, function(item){
      scope.sellItem(item, 'all');
    })
  }
  
  
  // ===============================================================================
  //  INVENTORY MANAGEMENT
  // ===============================================================================  

  scope.addToInventory = function(item, amount){
    var exists = _.where(scope.game.inventory, {name : item.name}).length;
    if(!exists){
      item.id = _.uniqueId();
      scope.game.inventory.push(scope.createItem(item));
    } else {
      _.findWhere(scope.game.inventory, {name : item.name}).amount += parseInt(amount);
    }
  }
  
  t = {
    proto : 'Pickaxe',
    name : 'Pickaxe of Doom',
    rarity : 'artifact'
  }
  
  scope.addToInventory(t,1)
  
  scope.removeFromInventory = function(item){
    scope.game.inventory = _.reject(scope.game.inventory, function(d){ return d.id == item.id; });
    scope.unsetSelectedItem();
  }
  
  
  // ===============================================================================
  //  EQUIPMENT
  // ===============================================================================  
  
  scope.game.equipment = {
    helm : {},
    amulet : {},
    pickaxe : {},
    torch : {},
    belt : {},
    ring : {}
  }
  
  scope.equip = function(item){
    scope.game.equipment[item.isEquipment.toLowerCase()] = item;
    scope.removeFromInventory(item);
  }
  
  scope.unEquip = function(slot){
    if(!scope.game.equipment[slot]) return
    scope.addToInventory(scope.game.equipment[slot], 1);
    scope.game.equipment[slot] = {};
  }
  
  // ===============================================================================
  //  MENU
  // ===============================================================================   
  
  scope.menus = ['Machines', 'Upgrades', 'Crafting'];
  scope.currentMenu = scope.menus[0]; 
  scope.goToMenu = function(menu){
    scope.currentMenu = menu;
  }
  

  // ===============================================================================
  //  MACHINES
  // ===============================================================================   
  
  var machineProto = {
    name : '', // The name of the machine
    description : '', // What does this machine do?
    image : '', // Path to the image used
    recipes : [], // Recipes for what items this machine can make.
    price : {}, // The money / material this machine costs, material : value pairs
    costMultiplier : 1.22, // The cost multiplier for each level
    upgradeable : false, // If false it's a one-time buy, else it's upgradeable
    level : 1, // The level of the machine, only used if 'upgradeable' is true
    sellable : false, // Whether the machine can be sold or not.
    unlocked : false, // Whether the machine unlocked or not.
    unlocksAt : {}, // Criterias for when the machine should be unlocked game.??? : value pairs
    bought : false // Whether the machine has been bought or not
  }
  
  var machines = [
    {
      name : 'Furnace',
      image : 'furnace.png',
      recipes : ['Iron bar'],
      price : {
        money : 50,
        Stone : 1
      },
      description : 'Smelt ores into bars at a slow rate'
    }
  ]
  // Initialize machines
  _.each(machines, function(machine){
    scope.game.machines.push(_.extend(_.clone(machineProto), machine));
  });
  
  scope.setSelectedMachine = function(machine){
    scope.selectedMachine = machine;
  }
  
  scope.unsetSelectedMachine = function(){
    scope.selectedMachine = false;
  }
   

  // ===============================================================================
  //  UPGRADES
  // ===============================================================================  
  
  

 
  
}]) // Main Controller















