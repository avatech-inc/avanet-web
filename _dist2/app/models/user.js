/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore');


/**
 * User Schema
 */
var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    fullName: String,
    email: String,

    email_normalized: {
        type: String,
        index: true
    },

    username: String,

    org: String,
    jobTitle: String,
    profession: String,
    city: String,
    state: String,
    postal: String,
    country: String,

    location: {
        type: [Number],
        index: '2dsphere'
    },

    created: { type: Date },
    pending: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    provider: String,
    hashed_password: String,
    salt: String,
    //hashedId: String,

    organizations: [{
        type: Schema.Types.ObjectId,
        ref: 'Organization',
    }],

    settings: {
        distance: { type: Number, default: 0 }, // 0 = meters, 1 = feet
        elevation: { type: Number, default: 0 }, // 0 = meters, 1 = feet
        fracture: { type: Number, default: 0 }, // 0 = US, 1 = Canada
        tempUnits: { type: Number, default: 0 }, // 0 = C, 1 = F
        defaultMap: { type: String },
        graphDetailLevel: { type: Number }
    },

    // keeps track of arbitrary stuff
    //state: { type: Schema.Types.Mixed },

    test: { type: Boolean, default: false },

    student: { type: Boolean, default: false },

    permissions: {
        bulkDownload: { type: Boolean, default: false }
    }

});

// set new password (create hash in the background)
// note: this only gets called when using mongoose's .save() method, not native mongodb operations
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password; // <-- todo: what's this about??
});
/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
// UserSchema.path('name').validate(function(name) {
//     // if you are authenticating by any of the oauth strategies, don't validate
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return name.length;
// }, 'Name cannot be blank');

// UserSchema.path('email').validate(function(email) {
//     // if you are authenticating by any of the oauth strategies, don't validate
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return email.length;
// }, 'Email cannot be blank');

// UserSchema.path('username').validate(function(username) {
//     // if you are authenticating by any of the oauth strategies, don't validate
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return username.length;
// }, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    //if (authTypes.indexOf(this.provider) !== -1) return true;
    if (this.pending) return true;
    return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    //if (!this.isNew) return next();

    console.log("PRE SAVE:");
    // console.log(this._id);
    // console.log(this.hashedId);

    // set hashedId
    // if (!this.hashedId) {
    //     var Hashids = require("hashids"),
    //     hashids = new Hashids("isaidnosalt");
    //     this.hashedId = hashids.encryptHex(this._id);

    //     console.log("IDs:");
    //     console.log(this._id);
    //     console.log(this.hashedId);
    //     //var objectId = hashids.decryptHex(hash);
    // }

    next();

    // if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
    //     next(new Error('Invalid password'));
    // else
    //     next();
});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        // console.log("PLAIN TEXT: " + plainText);
        // console.log("HASHED NEW: " + this.encryptPassword(plainText));
        // console.log("HASHED  DB: " + this.hashed_password);
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }
};

mongoose.model('User', UserSchema);