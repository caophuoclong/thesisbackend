import { PrismaClient } from "@prisma/client";
import { ErrorType, MessageAttachmentType, MessageStatus, ResponseStatus } from "../enum";
import { v4 as uuidv4 } from "uuid";
import { ConversationService } from "./Conversation";
import MessageModel, { MessageType } from "../models/Message.model";
import { ConversationType } from "../models/Conversation.model";
import { UserType } from "../models/User.model";
import { Error as CustomError } from "../utils/Error";
import MemberModel from "../models/Member.model";
import Storage from "../utils/Storage";
export interface IMessageCreate {
    content: string;
    destination: Partial<ConversationType> & {
        _id: string;
    };
    type: MessageType;
    reply?: {
        _id: string;
    };
    sender_id: string;
    width?: number;
    height?: number;
}
export class MessageService {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }
    public static async createMessage({ content, destination, type, sender_id, width, height, reply }: IMessageCreate) {
        try {
            const conversation = await ConversationService.getConversation(destination._id);
            if (!conversation) return CustomError(ErrorType.NOT_FOUND, "Conversation not found");
            const members = conversation.members;
            const storage = Storage.getInstance();
            const reading_conversation = storage.get("reading_conversation");
            const status = members.map((m) => {
                if (m.user._id === sender_id) {
                    return {
                        status: MessageStatus.SEEN,
                        user: m.user,
                    };
                }
                if (reading_conversation && reading_conversation[m.user._id] === conversation._id.toString()) {
                    return {
                        status: MessageStatus.SEEN,
                        user: m.user,
                    };
                }
                return {
                    status: MessageStatus.SENT,
                    user: m.user,
                };
            });
            const newMessage: any = {
                destination: {
                    ...conversation,
                },
                sender: sender_id,
                status,
                content: content,
                type: type,
                width,
                height,
            };
            if (reply && reply._id) {
                newMessage.reply = reply._id;
            }
            const message = (await new MessageModel(newMessage).populate(["destination", "sender"])).populate({
                path: "reply",
                populate: {
                    path: "sender",
                },
            });
            await (await message).save().then((m) => {
                const { _id } = m;
                ConversationService.updateConversation(destination._id, {
                    latestMessage: _id,
                });
            });

            // const members = await this.prisma.conversation_member.findMany({
            //     where: {
            //         conversation_id: destination,
            //     },
            // });
            // const message = await this.prisma.message.create({
            //     data: {
            //         destination,
            //         sender: sender_id,
            //         type: MessageAttachmentType.TEXT,
            //         content,
            //         created_at: Date.now(),
            //         updated_at: Date.now(),
            //     },
            // });
            // await this.prisma.message_status.createMany({
            //     data: members
            //         .map((m) => m.user_id)
            //         .map((u) =>
            //             u === sender_id
            //                 ? {
            //                       user_id: u,
            //                       message_id: message.id,
            //                       status: "seen",
            //                       updated_at: Date.now(),
            //                   }
            //                 : {
            //                       user_id: u,
            //                       message_id: message.id,
            //                       status: "sent",
            //                       updated_at: Date.now(),
            //                   },
            //         ),
            // });
            // return Response(ResponseStatus.SUCCESS, "Create message successfully");
            return message;
        } catch (error) {
            console.log("🚀 ~ file: message.ts:73 ~ Message ~ error:", error.message);
            return CustomError(ErrorType.UNKNOWN, error.message);
        }
    }

    public static async changeStatus({
        messageId,
        userId,
        newStatus,
    }: {
        messageId: string;
        userId: string;
        newStatus: MessageStatus;
    }) {
        try {
            const message = await MessageModel.findById(messageId).populate("status.user");
            if (!message) throw new Error("Message not found");
            const status = message.status.map((status) => {
                return {
                    status: status.status,
                    user: status.user,
                    updatedAt: status.updatedAt,
                } as any;
            });
            const index = status.findIndex((s) => s.user._id === userId);
            if (index === -1) throw new Error("Message status not found");
            if (status[index].status === MessageStatus.SEEN) return status;
            status[index].status = newStatus;
            message.status = status;
            await message.save();
            // console.log("🚀 ~ file: message.ts:112 ~ Message ~ xyz:");
            return status;
        } catch (error) {
            console.log("🚀 ~ file: message.ts:114 ~ Message ~ error:", error);
            throw new Error(error.message);
        }
    }
    public static async getSender(messageId: string) {
        const message = await MessageModel.findById(messageId).populate("sender");
        if (!message) throw new Error("Message not found");
        return message.sender as any;
    }
    public static async getOne(messageId?: string) {
        if (!messageId) return null;
        const message = await MessageModel.findById(messageId)
            .populate("sender")
            .populate("destination")
            .populate("status.user");
        return message;
    }
    public static async getMany(
        conversationId: string,
        {
            limit = 20,
            offset = 0,
            order = {
                createdAt: "desc",
            },
            user,
        }: {
            limit?: number;
            offset?: number;
            order?: {
                createdAt: "desc" | "asc";
            };
            user: string;
        },
    ) {
        const member = await MemberModel.findOne({
            conversation: conversationId,
            user,
        });
        if (!member) throw new Error("Your are not allow to see this conversation");
        const clearAt = member.clearAt;
        const inactive = member.inactive;
        const createdAt = inactive
            ? {
                  $lt: clearAt,
              }
            : {
                  $gt: clearAt,
              };
        const messages = await MessageModel.find({
            destination: conversationId,
            createdAt,
            status: {
                $not: {
                    $elemMatch: {
                        deleted: true,
                    },
                },
            },
        })
            .skip(offset)
            .limit(20)
            .sort(order)
            .populate("sender")
            .populate("status.user")
            .populate("destination")
            .populate({
                path: "reply",
                populate: {
                    path: "sender",
                },
            });

        const count = await MessageModel.countDocuments({
            destination: conversationId,
        }).exec();
        return {
            messages,
            count,
        };
    }
    public static async recallMessage(messageId: string) {
        try {
            const message = await MessageModel.findById(messageId);
            if (!message) throw new Error("Message not found");
            message.recall = true;
            await message.save();
            return message;
        } catch (error) {
            console.log("🚀 ~ file: message.ts:194 ~ MessageService ~ error:", error);
            throw new Error(error.message);
        }
    }
    public static async deleteMessage(messageId: string, by: string) {
        try {
            const message = await MessageModel.findById(messageId);
            if (!message) throw new Error("Message not found");
            message.status = message.status.map((s) => {
                if (s.user === by) {
                    return {
                        ...s,
                        deleted: true,
                    };
                }
                return s;
            });
            await message.save();
            return message;
        } catch (error) {
            console.log("🚀 ~ file: message.ts:194 ~ MessageService ~ error:", error);
            throw new Error(error.message);
        }
    }
}
