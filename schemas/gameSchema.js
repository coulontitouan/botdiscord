const { model, Schema } = require('mongoose');

let gameSchema = new Schema({
    User: String,
    Time: Date,
    url: String,
})

module.exports = model('partie', gameSchema);