var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var Vote = require('../models/vote');
var errors = require('../errors');

exports.create = function(req, res) {
    var alternativeId = req.body.alternativeId;
    if (!alternativeId) {
        var error = new errors.InvalidPayloadError('alternativeId');
        return errors.handleError(res, error);
    }

    return Alternative.findById(alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            if (!alternative) throw new errors.NotFoundError('alternative');
            return alternative.addVote(req.user);
        })
        .spread(function(vote) {
            return res.status(201).send(vote);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('alternative');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.list = function(req, res) {
    return Alternative.findByIdAsync(req.params.alternativeId)
        .then(function(alternative) {
            if (!alternative) throw new errors.NotFoundError('alternative');
            return Vote.findAsync({ alternative: alternative.id });
        })
        .then(function(votes) {
            return res.send(votes);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('alternative');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.retrieve = function(req, res) {
    var hash = req.get('Vote-Hash');
    return Vote.findByHash(hash, req.user)
        .then(function(vote) {
            return res.send(vote);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
