// =========================================
// Server dependencies
// =========================================

var fs = require('fs');
var express = require('express');

// =========================================
// Server initiation
// =========================================

var app = express();

app.use(express.static(__dirname)); // This grants the users access to all data within the /public folder


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

// =========================================
// Server start
// =========================================

app.listen(80);