import { Schema, model, Document } from 'mongoose';

// Интерфейс для типизации в TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string; // Пароль храним только в виде хэша
  isVerified: boolean;
  status: 'online' | 'offline';
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  // ... другие поля в будущем: balance, gameHistory, etc.
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
}, { timestamps: true }); // timestamps добавляет поля createdAt и updatedAt

export const UserModel = model<IUser>('User', UserSchema);