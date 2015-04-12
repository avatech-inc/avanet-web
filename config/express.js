/**
 * Module dependencies.
 */
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var compression = require('compression')

var path = require('path');
var root = path.normalize(__dirname + '/..');


module.exports = function(app, passport) {
    app.set('showStackError', true);

    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    app.use(favicon(root + '/public/img/favicon.png'));

    app.use(express.static(root + '/public'));

    //Don't use logger for test env
    //if (process.env.NODE_ENV !== 'test') {
       app.use(morgan('dev'));
    //}

    //Enable jsonp
    app.enable("jsonp callback");

    // always HTTPS when in production (not guaranteed to work outside of nodejitsu, might work on heroku)
    app.use(function(req, res, next) {
        if (process.env.NODE_ENV && process.env.NODE_ENV == "production" && req.headers['x-forwarded-proto'] == 'http') {
            console.log("REDIRECTING TO HTTPS");
            console.log("https://" + req.get('host') + req.url);
            res.redirect("https://" + req.get('host') + req.url);
        }
        else next();
    });

    app.use(cookieParser());
    app.use(bodyParser());
    app.use(methodOverride());
    app.use(passport.initialize());

    // register routes
    require('./routes')(app, passport);

    // error handling
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      if (req.xhr) {
        res.status(500).send({ error: '500 Error' });
      } else {
        //next(err);
        res.status(500).sendfile('./app/views/500.html'); 
      }
    });


    // //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    // app.use(function(err, req, res, next) {
    //     //Treat as 404
    //     //if (~err.message.indexOf('not found')) return next();

    //     //Log it
    //     console.error(err.stack);

    //     //Error page
    //     res.status(500).render('500', {
    //         error: err.stack
    //     });
    // });
};