import { model, Schema } from 'mongoose';

const remindSchema = new Schema({
    User: { type: String, required: true },
    Time: { type: Date, required: true },
    url: { type: String, required: true },
});

export const remindModel = model('partie', remindSchema);