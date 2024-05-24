import mongoose, { Schema } from 'mongoose';
import { IUser } from './user';

export interface IPackage extends Document {
    packageName: string;
    dependencies: mongoose.Types.ObjectId[] | IPackage[];
    user: mongoose.Types.ObjectId | IUser,
    fileName: string
}

const validateSnakeCase = (value: string): boolean => {
    const re = RegExp('^[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*$');
    return re.test(value);
};

export const packageSchema = new Schema<IPackage>(
    {
        packageName: {
            type: String,
            required: true,
            unique: true,
            validate: validateSnakeCase,
            index: true
        },
        dependencies: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Package',
                default: []
            }
        ],
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        fileName: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const Package = mongoose.model<IPackage>('Package', packageSchema);
