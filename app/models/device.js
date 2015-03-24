var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;


var schema = new Schema({
    serial:  { type: String },
    verified: { type: Boolean },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Device', schema);