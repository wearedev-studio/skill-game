import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: string;
    username: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    balance: number;
    resetPasswordCode?: string;
    resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: 'default-avatar.png' },
    balance: { type: Number, default: 1000 },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date }
});

export default mongoose.model<IUser>('User', UserSchema);