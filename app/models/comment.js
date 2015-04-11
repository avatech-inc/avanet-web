var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    ownerType: {
        type: String
    },
    ownerId: {
        type: Schema.Types.ObjectId
    },
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    content: {
        type: String,
        default: '',
        trim: true,
    }
});

schema.index({ "ownerType": 1, "ownerId": 1, "created": 1 });

// schema.statics = {
//     load: function(id, cb) {
//         this.findOne({
//             _id: id
//         }).populate('user', '-hash -salt -rows').exec(cb);
//     }
// };

mongoose.model('Comment', schema);