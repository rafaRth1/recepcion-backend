import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
	{
		nick_name: {
			type: String,
			require: true,
			trim: true,
		},

		password: {
			type: String,
			require: true,
			trim: true,
		},

		email: {
			type: String,
			require: true,
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

UserSchema.pre('save', async function (next) {
	const user = this;

	if (!user.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.checkPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

const User = model('User', UserSchema);

export default User;
