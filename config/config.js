var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

//var db = "mongodb://access:wons@candidate.1.mongolayer.com:10127/avatech-production,mongodb://access:wons@candidate.1.mongolayer.com:10127,candidate.2.mongolayer.com:10127/avatech-production";
//var db = "mongodb://access:wons@candidate.34.mongolayer.com:10248,candidate.35.mongolayer.com:10248/avatech";
var db = "mongodb://access:wons@c248.candidate.34.mongolayer.com:10248,c248.candidate.35.mongolayer.com:10248/avatech?replicaSet=set-53e28c08f48cfdcd4f00030a";
//var db = "mongodb://access:wons@c133.alcatraz.0.mongolayer.com:10133,c133.alcatraz.1.mongolayer.com:10133/avatech?replicaSet=set-5526f06c9c0d9210b9001d84";
module.exports = {
    development: {
        db: db,
        root: rootPath,
        app: {
            name: 'AvaTechWeb'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    },
    test: {
        db: db,
        root: rootPath,
        app: {
            name: 'AvaTechWeb'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    },
    production: {
        db: db,
        root: rootPath,
        app: {
            name: 'AvaTechWeb'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    }
};