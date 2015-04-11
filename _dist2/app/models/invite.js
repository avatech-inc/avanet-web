var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

var InviteSchema = new Schema({
    created: {
        type: Date, 
        default: Date.now
    },
    user: {
        type: Schema.ObjectId, ref: 'User'
    },
    email: {
        type: String
    }
});

mongoose.model('Invite', InviteSchema);