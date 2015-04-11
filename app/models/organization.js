var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    Schema = mongoose.Schema;

var schema = new Schema({
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        admin: { type: Boolean, default: false },
        student: { type: Boolean, default: false }
        //index: true
    }],
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    name: {
        type: String,
        default: '',
        trim: true,
    },
    location: {
        type: String,
        default: '',
        trim: true,
    },
    type: {
        type: String,
        trim: true,
    },
    educationType: {
        type: String,
        trim: true,
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postal: { type: String, trim: true },
    country: { type: String, trim: true },

    logoUrl: { type: String },

    hidden: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
});

//schema.index({ "ownerType": 1, "ownerId": 1, "created": 1 });

// schema.statics = {
//     load: function(id, cb) {
//         this.findOne({
//             _id: id
//         }).populate('user', '-hash -salt -rows').exec(cb);
//     }
// };

mongoose.model('Organization', schema);