import { InferSchemaType, Schema, model } from "mongoose";
export enum LogTypeEnum{
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    ADD_MEMBER = "addMember",
    BLOCK_MEMBER = "blockMember",
    UNBLOCK_MEMBER = "unblockMember",
    CHANGE_ROLE = "changeRole",
    CHANGE_THEME = "changeTheme",
    CHANGE_NAME = "changeName",
    CHANGE_DESCRIPTION = "changeDescription",
    CHANGE_AVATAR = "changeAvatar",
    CHANGE_COVER = "changeCover",
    CREATE_CONVERSATION = "createConversation",
    SEND_FRIEND_REQUEST = "sendFriendRequest",
    UN_SEND_FRIEND_REQUEST = "unSendFriendRequest",
    REJECT_FRIEND_REQUEST = "rejectFriendRequest",
    REMOVE_MEMBER = "removeMember",
}
const schema = new Schema({
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: LogTypeEnum,
        default: null,
    },
    createdAt: {
        type: Number,
        default: Date.now,
        required: false,
    },
    by: {
        type: String,
        ref: "users",
    }
})
export type LogType = InferSchemaType<typeof schema>;


const LogModel = model<LogType>("logs", schema);
export default LogModel;
