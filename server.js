var express = require('express');
var fs = require('fs');

var app = express();

// configure Express
require('./server/express')(app);

// start it up
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Avanet is now running on port ' + port);

exports = module.exports = app;