var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User');

module.exports = function(passport) {
    // // Serialize sessions
    // passport.serializeUser(function(user, done) {
    //     done(null, user.id);
    // });

    // // Deserialize user (reloading fresh from db on every call - how expensive?)
    // passport.deserializeUser(function(id, done) {
    //     console.log("Deserializing user.");
    //     User.findOne({
    //         _id: id
    //     }).select("-hashed_password -salt").exec(function(err, user) {
    //         done(err, user);
    //     });
    // });


    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            // find user in DB
            User.findOne({
                email_normalized: email.toLowerCase()
            }, function(err, user) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        error: "invalid"
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        error: "invalid"
                    });
                }
                if (user && user.disabled) {
                    return done(null, false, {
                        error: "disabled"
                    });
                }
                return done(null, user);
            });
        }
    ));
};