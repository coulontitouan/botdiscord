const { model, Schema } = require('mongoose');

let remindSchema = new Schema({
    User: String,
    Time: Date,
    url: String,
})

module.exports = model('rappel', remindSchema);