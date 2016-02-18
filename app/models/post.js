var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
module.exports = mongoose.model('Post', new Schema({
    _owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _thread:{
        type: Schema.Types.ObjectId,
        ref: 'Thread'
    },
 
    text: String,
 
    created_at: Date
}));