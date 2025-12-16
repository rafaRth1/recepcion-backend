import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { UserDocument, UserModel } from '../interfaces/user';

const UserSchema = new Schema<UserDocument, UserModel>(
	{
		nickName: {
			type: String,
			required: [true, 'El nombre de usuario es obligatorio'],
			trim: true,
		},
		password: {
			type: String,
			required: [true, 'La contraseña es obligatoria'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'El email es obligatorio'],
			trim: true,
			unique: true,
		},
		token: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.pre('save', async function () {
	if (!this.isModified('password')) {
		return;
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
	return bcrypt.compare(password, this.password);
};

const UserModel = model<UserDocument, UserModel>('User', UserSchema);

export default UserModel;
