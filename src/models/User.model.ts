import { InferSchemaType, Schema, model } from "mongoose";

const schema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: String,
    username: {
        type: String,
        required: true,
    },
    dob: Date,
    avatar: String,
    cover: String,
    bio: String,
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other",
    },
    phone: String,
    notifications: [
        {
            type: Schema.ObjectId,
            ref: "notifications"
        },
    ],
    logs: [
        {
            type: Schema.ObjectId,
            ref: "logs"
        },
    ],
    friends: [{
        type: Schema.ObjectId,
        ref: "friends",
    }],
    createdAt: {
        type: Number,
        default: Date.now,
        required: false,
    },
    updatedAt: {
        type: Number,
        default: Date.now,
        required: false,
    },
    lastOnline:{
        type: Number,
        default: Date.now,
        required: false,
    },
});

export type UserType = InferSchemaType<typeof schema>;
const UserModel = model<UserType>("User", schema);
export default UserModel;
