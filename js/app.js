angular.module('idle', [])


.controller('MainController', ['$scope', '$rootScope', function(scope, RS){
  
  
  
  
}]) // Main Controller

.controller('MenuController', ['$scope', '$rootScope', function(scope, RS){
  
  scope.menus = [
    {
      name : 'Machines'
    },
    {
      name : 'Upgrades'
    }
  ];
  
  RS.currentMenu = scope.menus[0];
  
  scope.goToMenu = function(menu){
    RS.currentMenu = menu;
  }
  
}]) // Menu Controller