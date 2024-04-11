import { ErrorType, MemberRole, ResponseStatus } from "../enum";
import { Error } from "../utils/Error";
import { Response } from "../utils/Response";
import ConversationModel, { ConversationType, GroupType } from "../models/Conversation.model";
import UserModel, { UserType } from "../models/User.model";
import { userInfo } from "os";
import { UserService } from "./User";
import MemberModel, { MemberType } from "../models/Member.model";
import { Types } from "mongoose";
import LogModel, { LogTypeEnum } from "../models/Log.model";
import { IUserService } from "../Interfaces/IUserservice";
import { LogService } from "./Log";
import { MessageService } from "./message";
import MessageModel from "../models/Message.model";

export class ConversationService {
    constructor() {}
    public static async checkExistConversation(conversationId: string) {
        try {
            const conversation = await ConversationModel.findById({
                conversationId,
            });
            return conversation ? true : false;
        } catch (error) {
            return false;
        }
    }
    public static async getUnreadMessage(conversationId: string, userId: string) {
        const x = await MessageModel.find(
            {
                destination: conversationId,
                status: {
                    $elemMatch: {
                        user: userId,
                        status: {
                            $ne: "seen",
                        },
                    },
                },
            },
            {
                _id: true,
            },
        );
        return x;
    }

    public static async getConversation(conversationId: string, userId?: string) {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
        const members = await this.getMembers(conversationId);
        const creator = await UserService.getUser(conversation.creator);
        const logs = await LogModel.find({ _id: { $in: conversation.logs } });
        const latestMessage = await MessageService.getOne(conversation.latestMessage?.toString());
        let unreadMessage: Array<any> = [];
        if (userId) {
            unreadMessage = await this.getUnreadMessage(conversationId, userId);
        }
        const result = {
            ...conversation.toObject(),
            members,
            logs,
            creator,
            latestMessage,
            unreadMessage: unreadMessage.length,
        };
        // console.log("🚀 ~ file: Conversation.ts:37 ~ ConversationService ~ getConversation ~ result:", result)
        return result;
    }
    public static async getManyConversation(conversationIds: string[], userId: string) {
        return await Promise.all(
            conversationIds.map(async (conversationId) => await this.getConversation(conversationId, userId)),
        );
    }
    public static async createMembers(members: { id: string; role?: MemberRole; conversation: string }[]) {
        const newMembers = await Promise.all(
            members.map(async ({ id, role, conversation }) => {
                const newMember = await MemberModel.create({
                    role: role ? role : MemberRole.MEMBER,
                    user: id,
                    conversation,
                });
                await newMember.save();
                return newMember._id;
            }),
        );
        return newMembers;
    }
    static async addMember(conversation_id: string, members: { id: string; role?: MemberRole }[], by: string): Promise<
    ConversationType & {
        members: (MemberType & {
            user: UserType;
        })[];
    }
    > {
        try {
            const user = await UserService.getUser(by);
            if (!user) {
                throw Error(ErrorType.NOT_FOUND, "User not found");
            }
            const conversation = await ConversationModel.findById(conversation_id);
            if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
            const existedUsers = await UserService.getManyUser(members.map(({ id }) => id));
            if (existedUsers.length !== members.length) throw Error(ErrorType.NOT_FOUND, "User not found");
            const existedMembers = await this.getMembers(conversation_id);
            // const notExistedUser = existedMembers.filter(({ user }) => !members.find(({ id }) => id === user));
            const notExistedUsers = members.filter(({ id }) => !existedMembers.find(({ user }) => user._id === id));
            const members1 = await this.createMembers(
                notExistedUsers.map((x) => ({ ...x, conversation: conversation_id })),
            );
            const newLogs = notExistedUsers.map((member) => ({
                content: `${user._id} add ${member.id} to conversation`,
                type: LogTypeEnum.ADD_MEMBER,
                by: user,
            }));
            const logs = await LogService.createManyLog(newLogs);
            
            return await ConversationModel.findByIdAndUpdate(conversation_id, {
                $push: {
                    members: {
                        $each: members1.map((x) => x),
                    },
                    logs: {
                        $each: logs.map((log) => log._id),
                    },
                },
            }, {returnDocument: "after"}).populate({
                path: "members",
                populate: {
                    path: "user",
                },
            }) as ConversationType & {
                members: (MemberType & {
                    user: UserType;
                })[];
            }
            
        } catch (error) {
            throw Error(ErrorType.INVALID_DATA, error.message);
        }
    }
    getMessages(conversation_id: string) {
        // return this.prisma.message.findMany({
        //     where: {
        //         destination: conversation_id,
        //     },
        //     include: {
        //         user: true,
        //         message_status: {
        //             include: {
        //                 user: true,
        //             },
        //         },
        //     },
        // });
    }
    public static async getMembersWithMembersId(memberIds: string[]): Promise<MemberType[]>{
        const members = await MemberModel.find({ _id: { $in: memberIds } });
        return members;
    }
    public static async getMembers(conversationId: string): Promise<
        (MemberType & {
            user: UserType;
        })[]
    > {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
        const members = await MemberModel.find({ _id: { $in: conversation.members } }).populate("user");
        return members as any;
    }
    getBlockedUsers(conversation_id: string) {
        // return this.prisma.conversation_blocked.findMany({
        //     where: {
        //         conversation_id,
        //     },
        //     include: {
        //         user: true,
        //     },
        // });
    }
    public static async getConversationByUser(userId: string) {
        const members = await MemberModel.find({ user: userId });
        const conversationsIds = await ConversationModel.aggregate([
            {
                $match: {
                    members: {
                        $in: members.map(({ _id }) => _id),
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        return this.getManyConversation(
            conversationsIds.map(({ _id }) => _id.toString()),
            userId,
        );
    }
    // convertConversation(conversation) {
    //     const { user, conversation_member, ...rest } = conversation!;
    //     const newConversation = {
    //         ...convertBigintToNumber(rest),
    //         creator: user,
    //         members: this.getMember(conversation_member),
    //         messages: this.getMessages(conversation.id),
    //     };
    //     return newConversation;
    // }
    static async createConversation({
        creatorId,
        name,
        description,
        members,
        type,
        avatar,
    }: {
        creatorId?: string;
        name?: string;
        description?: string;
        type?: GroupType;
        members: {
            userId: string;
            role?: MemberRole;
        }[];
        avatar?: string;
    }) {
        const listMember = await MemberModel.find({
            user: {
                $in: members.map(({ userId }) => userId),
            },
        });
        console.log("🚀 ~ file: Conversation.ts:212 ~ ConversationService ~ listMember:", listMember);
        const existConversation = await ConversationModel.findOne({
            type: GroupType.DIRECT,
            members: {
                $size: 2,
                $all: listMember.map(({ _id }) => _id),
            },
        });
        if (existConversation && listMember.length === members.length)
            return {
                ...existConversation.toObject(),
                members: await this.getMembers(existConversation._id.toString()),
            };
        const conversation = new ConversationModel();
        let creator: UserType | null = null;
        const systemUser = await UserService.getSystemUser();
        if (creatorId) {
            creator = await UserService.getUser(creatorId);
        }

        conversation.creator = creator ? creator._id : systemUser._id;
        conversation.name = name;
        conversation.description = description;
        conversation.type = type ? type : GroupType.DIRECT;
        conversation.avatar = avatar;
        const membersIds = await Promise.all<Types.ObjectId>(
            members.map(async (member) => {
                const newMember = await MemberModel.create({
                    role: member.role ? member.role : MemberRole.MEMBER,
                    user: member.userId,
                    conversation: conversation._id,
                });
                await newMember.save();
                return newMember._id;
            }),
        );
        conversation.members = membersIds;
        const newLogs = [
            {
                content: `${creator ? creator._id : systemUser._id} create conversation`,
                type: LogTypeEnum.CREATE_CONVERSATION,
                by: creator ? creator : systemUser,
            },
            ...members.map((member) => ({
                content: `${creator ? creator._id : systemUser._id} add ${member.userId} to conversation`,
                type: LogTypeEnum.ADD_MEMBER,
                by: creator ? creator : systemUser,
            })),
        ];
        const logs = await LogService.createManyLog(newLogs);
        conversation.logs = logs.map((log) => log._id);
        await conversation.save();
        return {
            ...conversation.toObject(),
            members: await this.getMembers(conversation._id.toString()),
            creator: creator ? creator : systemUser,
        };
    }
    static async updateConversation(_id: string, conversation: Partial<ConversationType>) {
        const newConversation = await ConversationModel.findByIdAndUpdate(_id, conversation);
        return newConversation;
    }
    public static async updateStatus(conversationId: string, userId: string) {
        const x = await MessageModel.updateMany(
            {
                destination: conversationId,
                status: {
                    $elemMatch: {
                        user: userId,
                        status: "received",
                    },
                },
                sender: {
                    $ne: userId,
                },
            },
            {
                $set: {
                    "status.$.status": "seen",
                },
            },
        );
        console.log("🚀 ~ file: Conversation.ts:270 ~ ConversationService ~ updateStatus ~ x:", x);

        return "success";
    }
    static async updateReceivedAllMessage(userId: string) {
        await MessageModel.updateMany(
            {
                "status.user": userId,
                "status.status": "sent",
                sender: {
                    $ne: userId,
                },
            },
            {
                $set: {
                    "status.$.status": "received",
                },
            },
        );
    }
    static async removeConversation(conversationId: string, userId: string) {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
        const user = await UserService.getUser(userId);
        if (!user) throw Error(ErrorType.NOT_FOUND, "User not found");
        const members = await MemberModel.find({
            conversation: conversationId,
        });
        const creator = members.find((x) => x.user === conversation.creator);
        if (conversation.creator.toString() !== user._id.toString() && creator) {
            throw "You are not creator of this conversation";
        }
        const me = members.find((m) => m.user === userId);
        if (me?.role !== MemberRole.ADMIN) {
            throw "You are not admin of this conversation";
        }
        await conversation.updateOne({
            inactive: true,
        });
        return Response(ResponseStatus.SUCCESS, "Remove conversation success");
    }
    static async clearMessages(conversationId: string, userId: string) {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
        const user = await UserService.getUser(userId);
        if (!user) throw Error(ErrorType.NOT_FOUND, "User not found");
        await MemberModel.updateOne(
            {
                user: userId,
                conversation: conversationId,
            },
            {
                clearAt: Date.now(),
            },
        );
    }
    static async outConversation(conversationId: string, userId: string) {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) throw Error(ErrorType.NOT_FOUND, "Conversation not found");
        const user = await UserService.getUser(userId);
        if (!user) throw Error(ErrorType.NOT_FOUND, "User not found");
        const members = await MemberModel.find({
            conversation: conversationId,
        });
        const roleAdmin = members.filter((m) => m.role === MemberRole.ADMIN);
        const me = members.find((m) => m.user === userId);
        if (roleAdmin.length === 1 && me?.role === MemberRole.ADMIN) {
            const newAdmin = members.filter((m) => m.user !== userId)[0];
            await MemberModel.updateOne(
                {
                    _id: newAdmin._id,
                },
                {
                    role: MemberRole.ADMIN,
                },
            );
        }
        await MemberModel.deleteOne({
            _id: me?._id,
        });
        return {
            ...conversation,
            members: members.filter((m) => m.user !== userId),
        };
    }
    static async removeMembers(conversationId: string, members: string[], by: string) {
        try {
            const user = await UserService.getUser(by);
            if (!user) {
                throw Error(ErrorType.NOT_FOUND, "User not found");
            }
            const conversation = await ConversationModel.findById(conversationId);
            if (!conversation) return Error(ErrorType.NOT_FOUND, "Conversation not found");
            const existedUsers = await UserService.getManyUser(members);
            console.log("🚀 ~ file: Conversation.ts:398 ~ ConversationService ~ removeMembers ~ existedUsers:", existedUsers)
            if (existedUsers.length !== members.length) return Error(ErrorType.NOT_FOUND, "User not found");
            const newLogs = members.map((member) => ({
                content: `${user._id} remove ${member} from conversation`,
                type: LogTypeEnum.REMOVE_MEMBER,
                by: user,
            }));
            const logs = await LogService.createManyLog(newLogs);
            conversation.updateOne({
                $push: {
                    logs: {
                        $each: logs.map((log) => log._id),
                    },
                },
            });
            await MemberModel.updateMany(
                {
                    user: {
                        $in: members,
                    },
                    conversation: conversationId,
                },
                {
                    $set: {
                        inactive: true,
                        clearAt: Date.now(),
                    },
                },
            );
            await conversation.save();
            return conversation.populate({
                path: "members",
                populate: {
                    path: "user",
                },
            })
        } catch (error) {
            return Error(ErrorType.INVALID_DATA, error.message);
        }
    }
}
