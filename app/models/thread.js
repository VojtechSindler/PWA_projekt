'use strict'
var mongoose = require('mongoose');
//schema
var Schema = mongoose.Schema;
var _Schema = new Schema({
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
   ,title: String
  , url: String
  , text: String
});

_Schema.statics.findOneByUrl = function(url, cb) {
    Model.findOne({url: url}, cb);
};                      

var Model = module.exports = mongoose.model('thread', _Schema);