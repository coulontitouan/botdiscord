import { model, Schema } from 'mongoose';

const gameSchema = new Schema({
    User: String,
    Time: Date,
    url: String,
})

export default { schema: model('partie', gameSchema) };