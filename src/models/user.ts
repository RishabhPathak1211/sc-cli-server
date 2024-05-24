import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { generateApiKey } from 'generate-api-key';

export interface IUser extends Document {
    username: string;
    hashPassword?: string;
    email: string;
    fullName: string;
    consumerKey: string;
    comparePassword: (password: string) => boolean;
}

const validateEmail = (value: string): boolean => {
    const re = RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$');
    return re.test(value);
};

export const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        hashPassword: {
            type: String
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate: validateEmail
        },
        fullName: {
            type: String,
            required: true
        },
        consumerKey: {
            type: String,
            index: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compareSync(password, this.hashPassword);
};

userSchema.pre('save', async function (next) {
    this.consumerKey = generateApiKey({
        dashes: false,
        method: 'uuidv4',
        length: 32
    }) as string;

    return next();
});

export const User = mongoose.model<IUser>('User', userSchema);
