import { InferSchemaType, Schema, model } from "mongoose";
import UserModel from "./User.model";

const schema = new Schema({
    role: {
        type: String,
        enum: ["admin", "member", "optional"],
        default: "member",
    },
    theme: {
        type: String,
        default: "light",
        required: false,
    },
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
    nickName: {
        type: String,
        required: false,
        default: ""
    },
    user: {
        type: String,
        ref: UserModel,
    },
    notificationType: {
        type: String,
        enum: ["all", "custom", "none", "1h", "2h", "3h", "15m"],
        default: "all",
        required: false,
    },
    notificationCustom: {
        type: Number,
        required: false,
        default: 0,
    },
    clearAt: {
        type: Number,
        required: false,
        default: 0,
    },
    conversation: {
        type: Schema.Types.ObjectId,
        ref: "conversations",
    },
    inactive:{
        type: Boolean,
        default: false,
        required: false,
    }
});

export type MemberType = InferSchemaType<typeof schema>;

const MemberModel = model<MemberType>("members", schema);
export default MemberModel;
