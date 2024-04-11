import { MessageStatus } from "../enum";
import {InferSchemaType, Schema, model} from "mongoose";
export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    FILE = "file",
    AUDIO = "audio",
    LOCATION = "location",
    CONTACT = "contact",
    STICKER = "sticker",
    EMOJI = "emoji",
    GIF = "gif",
    REPLY = "reply",
    FORWARD = "forward",
    SYSTEM = "system",
    RECALL = "recall",
    DELETE = "delete",
    REACTION = "reaction",
    CALL = "call",
    VOICE_CALL = "voice_call",
    VIDEO_CALL = "video_call",
    GROUP_JOIN = "group_join",
    GROUP_LEAVE = "group_leave",
    GROUP_UPDATE = "group_update",
    GROUP_RENAME = "group_rename",
    TYPING = "typing",
    UNKNOWN = "unknown",
}
const schema = new Schema({
    destination: {
        type: Schema.Types.ObjectId,
        ref: "conversations",
        required: true,
    },
    sender: {
        type: String,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    media: {
        type: [String],
        default: [],
        required: false

    },
    status: [
        {
            status:{
                type: String,
                enum: MessageStatus,
                default: MessageStatus.SENT,
            },
            deleted: {
                type: Boolean,
                default: false,
            },
            updatedAt:{
                type: Number,
                default: Date.now,
            },
            user: {
                type: String,
                ref: "User",
            },
        }
    ],
    createdAt:{
        type: Number,
        default: Date.now,
        required: false

    },
    updatedAt:{
        type: Number,
        default: Date.now,
        required: false

    },
    recall:{
        type: Boolean,
        default: false,
        required: false

    },
    reply:{
        type: Schema.Types.ObjectId,
        ref: "message",
        required: false

    },
    type:{
        type: String,
        enum: MessageType,
        default: MessageType.TEXT,
    },
    deleted:{
        type: Boolean,
        default: false,
        required: false

    },
    width:{
        type: Number,
        default: 0,
    },
    height:{
        type: Number,
        default: 0,
    },
    

})


export type TypeMessage = InferSchemaType<typeof schema>;
const MessageModel = model<TypeMessage>("message", schema);
export default MessageModel;