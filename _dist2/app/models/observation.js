var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

var ObservationSchema = new Schema({
    created: {
        type: Date, default: Date.now
    },
    updated: {
        type: Date, default: Date.now
    },

    location: {
        type: [Number],
        index: '2dsphere'
    },
    locationName: { type: String },
    slope: { type: Number},
    aspect: { type: Number},
    elevation: { type: Number},

    date: { type: Date },
    time: { type: Date },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },


    avalancheType: { type: String },
    trigger: { type: String },
    secondaryTriggers: [{ type: String }],

    sizeDestructive: { type: String },
    sizeRelative: { type: String },
    slabThickness: { type: Number},
    slabVertical: { type: Number},
    slabWidth: { type: Number},
    
    peopleBuriedPartially: { type: Number},
    peopleBurriedFully: { type: Number},
    peopleCarried: { type: Number},
    peopleCaught: { type: Number},
    peopleInjured: { type: Number},
    peopleKilled: { type: Number},

    notes: { type: String },

    photos: [{ 
        url: { type: String}, 
        caption: { type: String}, 
        name: { type: String} 
    }],

    // sharing
    
    published: { type: Boolean, default: false },
    sharingLevel: { type: String },
    shareWithAvyCenter: { type: Boolean, default: true },
    shareWithStudents: { type: Boolean, default: true },
    sharedOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],

    type: { type: String, default: 'avy' }
});

// ProfileSchema.statics = {
//     load: function(id, cb) {
//         this.findOne({
//             _id: id
//         })
//         .populate('user','fullName')
//         .populate('organization','name')
//         .populate('sharedOrganizations','name')
//         .exec(cb);
//     }
// };

mongoose.model('Observation', ObservationSchema);