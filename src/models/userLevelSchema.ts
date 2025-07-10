import mongoose, { Document, Schema } from 'mongoose';

export interface IUserLevel extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  lastMessageXp: Date;
}

const userLevelSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastMessageXp: { type: Date, default: null },
});

userLevelSchema.index({ userId: 1, guildId: 1 }, { unique: true });

const UserLevel = mongoose.model<IUserLevel>('UserLevel', userLevelSchema);

export default UserLevel;
