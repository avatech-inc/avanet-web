var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    Schema = mongoose.Schema;

var ProfileSchema = new Schema({
    created: {
        type: Date, default: Date.now
    },
    updated: {
        type: Date, default: Date.now
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

    date: { type: Date },
    time: { type: Date },

    depth: { type: Number },
    
    layers: [{ type: Schema.Types.Mixed }],
    temps: [{ type: Schema.Types.Mixed }],
    density: [{ type: Schema.Types.Mixed }],
    notes: [{ type: Schema.Types.Mixed }], // stability tests
    comments: [{ type: Schema.Types.Mixed }],
    photos: [{ type: Schema.Types.Mixed }],
    metaData: { type: Schema.Types.Mixed },

    type: { type: String, default: 'profile' },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        index: true
    },

    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },

    // sharing

    published: { type: Boolean, default: false, index: true },
    sharingLevel: { type: String },
    shareWithAvyCenter: { type: Boolean, default: true },
    shareWithStudents: { type: Boolean, default: true },
    sharedOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }]
});

ProfileSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        })
        .populate('user','fullName student')
        .populate('organization','name type logoUrl')
        .populate('sharedOrganizations','name type')
        .exec(cb);
    }
};

mongoose.model('Profile', ProfileSchema);