import {Schema, model, InferSchemaType} from "mongoose"
export enum FriendStatus {
    REQUESTED = "requested",
    PENDING = "pending",
    FRIENDS = "friends",
    BLOCKED = "blocked",
}
const schema = new Schema({
    requester: {
        type: String,
        ref: "users"
    },
    recipient: {
        type: String,
        ref: "users"
    },
    status: {
        type: String,
        enum: FriendStatus,
        default: "pending",
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

});
export type FriendSType = InferSchemaType<typeof schema>;
export const FriendsModel = model("friends", schema);