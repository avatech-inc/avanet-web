var mongoose = require('mongoose'),
    async = require('async'),
    Comment = mongoose.model('Comment'),
    _ = require('underscore'),
    fs = require('fs');

exports.destroy = function(req, res) {
    Comment.findOne({ _id: req.params.commentId }).exec(function(err, comment) {
        if (err || !comment) return res.json({ success: false });

        // user only able to delete comments they created
        if (req.user._id.equals(comment.user)) {
            comment.remove(function(err){
                if (err) return res.json({ success: false });
                else res.json({ success: true });
            });
        }
        else res.json({ success: false });
    });
};

exports.create = function(req, res) {
    var comment = new Comment({
        user: req.user,
        ownerType: req.params.ownerType,
        ownerId: req.params.ownerId,
        content: req.body.content
    });
    comment.save(function(){  
        Comment.populate(comment,{ path: 'user', select: 'fullName' }, function(err, doc){
            if (err) res.json({ success: false });
            else res.json(doc);
        });
    });
};

exports.all = function(req, res) {
    Comment.find({ ownerType: req.params.ownerType, ownerId: req.params.ownerId })
    .select('-ownerId -ownerType')
    .sort('-created')
    .populate('user','fullName')
    .exec(function(err, comments) {
        if (err) {
            // res.render('error', {
            //     status: 500
            // });
            console.log(err);
        } else {
            res.json(comments);
        }
    });
};