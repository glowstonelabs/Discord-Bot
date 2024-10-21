import mongoose, { Document, Schema } from 'npm:mongoose';
import { v4 as uuidv4 } from 'npm:uuid';

interface IVote {
  userId: string;
  optionIndex: number;
}

interface IPoll extends Document {
  messageId: string;
  options: string[];
  votes: number[];
  userVotes: IVote[];
}

const pollSchema: Schema = new Schema({
  messageId: { type: String, required: true, unique: true, default: uuidv4 },
  options: { type: [String], required: true },
  votes: { type: [Number], required: true },
  userVotes: { type: [{ userId: String, optionIndex: Number }], required: true, default: [] },
});

const Poll = mongoose.model<IPoll>('Poll', pollSchema);

export default Poll;
