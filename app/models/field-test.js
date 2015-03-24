var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

var schema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },

    // device tests
    test1: { type: Schema.Types.ObjectId, ref: 'Test' },
    test2: { type: Schema.Types.ObjectId, ref: 'Test' },
    test3: { type: Schema.Types.ObjectId, ref: 'Test' },
    test4: { type: Schema.Types.ObjectId, ref: 'Test' },
    test5: { type: Schema.Types.ObjectId, ref: 'Test' },
    test6: { type: Schema.Types.ObjectId, ref: 'Test' },
    test7: { type: Schema.Types.ObjectId, ref: 'Test' },
    test8: { type: Schema.Types.ObjectId, ref: 'Test' },
    test9: { type: Schema.Types.ObjectId, ref: 'Test' },
    test10: { type: Schema.Types.ObjectId, ref: 'Test' },
    test11: { type: Schema.Types.ObjectId, ref: 'Test' },
    test12: { type: Schema.Types.ObjectId, ref: 'Test' },
    test13: { type: Schema.Types.ObjectId, ref: 'Test' },
    test14: { type: Schema.Types.ObjectId, ref: 'Test' },
    test15: { type: Schema.Types.ObjectId, ref: 'Test' },
    test16: { type: Schema.Types.ObjectId, ref: 'Test' },
    test17: { type: Schema.Types.ObjectId, ref: 'Test' },
    test18: { type: Schema.Types.ObjectId, ref: 'Test' },

    // feedback
    feedback1: { type: String },
    feedback2: { type: String },
    feedback3: { type: String }
});

schema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('user').exec(cb);
    }
};

mongoose.model('FieldTest', schema);