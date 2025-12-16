import { Document, Model } from 'mongoose';

export interface User {
	nickName: string;
	password: string;
	email: string;
	token?: string;
}

interface UserMethods {
	checkPassword(password: string): Promise<boolean>;
}

export interface UserDocument extends User, UserMethods, Document {
	createdAt: Date;
	updatedAt: Date;
}

export interface RegisterBody {
	nickName: string;
	email: string;
	password: string;
}

export interface AuthenticateBody {
	email: string;
	password: string;
}

export interface NewPasswordBody {
	password: string;
}

export interface TokenParams {
	token: string;
}

export interface MessageResponse {
	msg: string;
}

export interface AuthResponse {
	_id: string;
	nickName: string;
	email: string;
	token: string;
}

export interface AuthenticatedRequest extends Request {
	user?: UserDocument;
}

export type UserModel = Model<UserDocument>;
