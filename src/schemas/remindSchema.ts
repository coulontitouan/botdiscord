import { model, Schema, Document, Model } from 'mongoose';

interface IRemind extends Document {
    User: string;
    Time: number;
    url: string;
}

const remindSchema: Schema<IRemind> = new Schema({
    User: { type: String, required: true },
    Time: { type: Number, required: true },
    url: { type: String, required: true },
});

const RemindModel: Model<IRemind> = model<IRemind>('rappel', remindSchema);

export default RemindModel;