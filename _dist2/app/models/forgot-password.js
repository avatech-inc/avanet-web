var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

var ForgotPasswordSchema = new Schema({
    created: {
        type: Date, 
        default: Date.now, 
        expires: '1d'
    },
    user: {
        type: Schema.ObjectId, ref: 'User'
    }
});

mongoose.model('ForgotPassword', ForgotPasswordSchema);