var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    Schema = mongoose.Schema;

var schema = new Schema({
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    updated: {
        type: Date, default: Date.now
    },
    date: { type: Date, index: true },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        index: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },
    title: {
        type: String,
        default: '',
        trim: true
    },

    location: {
        type: [Number],
        index: '2dsphere'
    },

    hash: { type: String, index: true },
    metaData: { type: Schema.Types.Mixed },

    raw: { type: Buffer },
    rows: [{ type: Schema.Types.Mixed }],
    rows_compressed: [{ type: Schema.Types.Mixed }],
    rows_small: [{ type: Schema.Types.Mixed }],

    version: { type: String },

    type: { type: String, default: 'test' },

    demo: { type: Boolean, default: false},

    timeZone: { type: String },

    deviceId: { type: String },

    softwareVersion: { type: String },

    appVersion: { type: String },

    localTime: { type: String },

    slope: { type: Number },
    aspect: { type: Number },
    elevation: { type: Number },

    depth: { type: Number },

    favorite: { type: Boolean },
    dateNumber: { type: Number },

    deviceProfileId: { type: Number },

    removed: { type: Boolean, default: false},
    
    // sharing

    published: { type: Boolean, default: false, index: true },
    sharingLevel: { type: String },
    shareWithAvyCenter: { type: Boolean, default: true },
    shareWithStudents: { type: Boolean, default: true },
    sharedOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }]

});

schema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user', '-hash -salt -rows').exec(cb);
    }
};

mongoose.model('Test', schema);