// init newrelic
require('newrelic');

var express = require('express');
var fs = require('fs');
var passport = require('passport');

// register mongoose models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
});

var env = process.env.NODE_ENV || 'development',
    auth = require('./config/authorization'),
    mongoose = require('mongoose');

// connect to db
var connectionString = "mongodb://access:wons@c248.candidate.34.mongolayer.com:10248,c248.candidate.35.mongolayer.com:10248/avatech?replicaSet=set-53e28c08f48cfdcd4f00030a";
var db = mongoose.connect(connectionString);

// register passport config
require('./config/passport')(passport);

var app = express();

// express settings
require('./config/express')(app, passport);

// register routes
require('./config/routes')(app, passport, auth);

// start it up
var port = process.env.PORT || 3000;
app.listen(port);
console.log('AvaTech is up and running on port ' + port);

exports = module.exports = app;