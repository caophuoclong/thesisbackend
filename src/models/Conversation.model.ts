import { InferSchemaType, Schema, model } from "mongoose";
import UserModel from "./User.model";
export enum GroupType {
    PRIVATE = "private",
    PUBLIC = "public",
    DIRECT = "direct",
}
const schema = new Schema({
    name: {
        type: String,
        required: false,
        default: ""
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    type: {
        type: String,
        enum: GroupType,
    },
    creator: {
        type: String,
        ref: "users",
        required: true
    },
    avatar: {
        type: String,
        required: false,
        default: ""
    },
    members: [
        {
            type: Schema.ObjectId,
            ref: "members"
        },
    ],
    blocked: [
        {
            user: {
                type: String,
                ref: "users",
            },
            createdAt: {
                type: Number,
                default: Date.now,
                required: false,
            },
            lockTo: {
                type: Number,
                default: Date.now,
                required: false,
            },
        },
    ],
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "messages",
        },
    ],
    logs: [
        {
            type: Schema.ObjectId,
            ref: "logs"
        },
    ],
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
    latestMessage: {
        type: Schema.Types.ObjectId,
        ref: "messages",
    },
    inactive: {
        type: Boolean,
        default: false,
        required: false,
    }
});

export type ConversationType = InferSchemaType<typeof schema>;
const ConversationModel = model<ConversationType>("conversations", schema);
export default ConversationModel;
