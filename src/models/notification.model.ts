import { InferSchemaType, Schema, model } from "mongoose";

const schema = new Schema({
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["system", "conversation", "friend", "group", "other"],
    },
    read: {
        type: Boolean,
        default: false,
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
})

export type NotificationType = InferSchemaType<typeof schema>;
const NotificationModel = model<NotificationType>("notifications", schema);
export default NotificationModel;