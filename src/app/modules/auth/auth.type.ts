import mongoose, { Document } from 'mongoose';

export type UserRoleType = 'student' | 'admin';

export interface IRegister {
  name: string;
  email: string;
  role?: UserRoleType;
  password: string;
  registrationKey?: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export type IRegisterResponse = {
  accessToken: string;
  refreshToken?: string;
};

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoleType;
  avatar?: string | null;
  enrolledCourses: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type IRefreshTokenResponse = {
  accessToken: string;
};
