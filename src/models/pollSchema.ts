import mongoose, { Document, Schema } from 'npm:mongoose';
import { v4 as uuidv4 } from 'npm:uuid';

/**
 * Interface representing a vote.
 */
interface IVote {
  userId: string;
  optionIndex: number;
}

/**
 * Interface representing a poll document.
 */
interface IPoll extends Document {
  messageId: string;
  options: string[];
  votes: number[];
  userVotes: IVote[];
}

/**
 * Schema for the Poll model.
 */
const pollSchema: Schema = new Schema({
  messageId: { type: String, required: true, unique: true, default: uuidv4 },
  options: { type: [String], required: true },
  votes: { type: [Number], required: true },
  userVotes: {
    type: [{ userId: String, optionIndex: Number }],
    required: true,
    default: [],
  },
});

/**
 * Poll model.
 */
const Poll = mongoose.model<IPoll>('Poll', pollSchema);

export default Poll;
