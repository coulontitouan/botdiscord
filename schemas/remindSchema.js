const { model, Schema } = require('mongoose');

let remindSchema = new Schema({
    User: String,
    Time: String,
    id: String,
})

module.exports = model('rSch', remindSchema);