import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../Interfaces/ISocket";
import { Server } from "socket.io";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import path from "path";
import { ConversationService } from "../services/Conversation";
import { socketAuthenticator } from "../middlewares/socket";
import { IMessageCreate, MessageService } from "../services/message";
import { MemberRole, MessageStatus } from "../enum";
import { UserService } from "../services/User";
import Storage from "../utils/Storage";
import { FriendService } from "../services/Friend";
import { ConversationType, GroupType } from "../models/Conversation.model";
import { MemberType } from "../models/Member.model";
import { UserType } from "../models/User.model";

export class Socket {
    private static instance: Socket;
    private _io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    private mapSocketToUser = Storage.getInstance();
    private constructor() {}
    public static getInstance(): Socket {
        if (!Socket.instance) {
            Socket.instance = new Socket();
        }
        return Socket.instance;
    }
    public set io(io: Server<any, any, InterServerEvents, SocketData>) {
        this._io = io;
        io.use(socketAuthenticator);
        io.on("connection", async (socket) => {
            console.log("New socket connect!", socket.id);
            const { user } = socket.data;
            const data = await ConversationService.getConversationByUser(user.sub);
            console.log("🚀 ~ file: index.ts:43 ~ Socket ~ listId.forEach ~ this.mapSocketToUser:", this.mapSocketToUser)
            const listId = data
                .filter((x) => !x.inactive)
                .filter((x) => x.members.find((m) => m.user._id === user.sub)?.inactive !== true)
                .map(({ _id }) => _id.toString());
            socket.join(listId);
            this.mapSocketToUser.delete(this.getMySocketId(user.sub) as string);
            listId.forEach((id) => {
                const isExist = this.mapSocketToUser.has(id);
                if (!isExist) {
                    this.mapSocketToUser.set(id, [user.sub]);
                } else {
                    const list = this.mapSocketToUser.get(id);
                    list.push(user.sub);
                    const set = new Set(list);
                    this.mapSocketToUser.set(id, Array.from(set));
                }
            });
            this.mapSocketToUser.set(socket.id, {
                userId: user.sub,
                status: "online",
                calling: false,
            });
            // console.log("🚀 ~ file: index.ts:51 ~ Socket ~ io.on ~ mapSocketToUser:", this.mapSocketToUser)
            socket.to(listId).emit("user_online", {
                userId: user.sub,
            });
            socket.on("recall_message", (data) => {
                const { conversation, message } = data;
                console.log(
                    "🚀 ~ file: index.ts:55 ~ Socket ~ socket.on ~ conversation, message:",
                    conversation,
                    message,
                );
                MessageService.recallMessage(message);
                socket.to(conversation).emit("recall_message", message);
            });
            socket.on("delete_message", (data) => {
                const { conversation, message } = data;
                console.log("🚀 ~ file: index.ts:61 ~ Socket ~ socket.on ~ message:", message);
                MessageService.deleteMessage(message, user.sub);
            });
            socket.on("sending_audio", async (data1) => {
                const { audio, data } = data1;
                const newData = data as FormData;
                console.log("🚀 ~ file: index.ts:56 ~ Socket ~ socket.on ~ newData:", newData);
                // const file = newData.get("file");
                // const fileName = newData.get("fileName");
                // const fileType = newData.get("type");
                // fs.writeFile(path.join(__dirname,".","audio.wav"), `data:${fileType};base64,${file}`, (err)=>{
                //     console.log(err);
                // });
            });
            socket.on(
                "send_message",
                async (
                    data: IMessageCreate & {
                        _id: string;
                    },
                ) => {
                    const { content, destination, type, width, height, reply } = data;
                    const sender_id = user.sub;
                    console.log("🚀 ~ file: index.ts:90 ~ Socket ~ io.on ~ sender_id:", sender_id);
                    const message = (await MessageService.createMessage({
                        content,
                        destination: destination,
                        type,
                        sender_id,
                        width,
                        height,
                        reply,
                    })) as any;
                    (message.sender = typeof message.sender === "string" ? message.sender : message.sender._id),
                        socket.to(destination._id).emit("new_message", message);
                    socket.emit("sent_message", {
                        message,
                        tempId: data._id,
                    });
                },
            );
            socket.on("received_message", async (data) => {
                const {
                    messageId,
                    destination: { _id },
                } = data;
                const status = await MessageService.changeStatus({
                    messageId,
                    userId: user.sub,
                    newStatus: MessageStatus.RECEIVED,
                });
                const sender = await MessageService.getSender(messageId);
                const socketId = this.getMySocketId(sender._id);
                if (socketId) {
                    this.io.to(socketId).emit("message_received", {
                        messageId,
                        conversationId: _id,
                        status,
                    });
                }
            });
            socket.on("seen_message", async (data) => {
                const {
                    messageId,
                    destination: { _id },
                } = data;
                console.log("🚀 ~ file: index.ts:138 ~ Socket ~ socket.on ~ data:", data);
                try {
                    const status = await MessageService.changeStatus({
                        messageId,
                        userId: user.sub,
                        newStatus: MessageStatus.SEEN,
                    });
                    // console.log("🚀 ~ file: index.ts:144 ~ Socket ~ socket.on ~ status:", status)
                    const sender = await MessageService.getSender(messageId);
                    const socketId = this.getMySocketId(sender._id);
                    if (socketId) {
                        this.io.to(socketId).emit("message_seen", {
                            messageId,
                            conversationId: _id,
                            status,
                        });
                    }
                    // socket.to(_id).emit("message_seen", {
                    //     messageId,
                    //     conversationId: _id,
                    //     status,
                    // });
                } catch (error) {
                    console.log(error);
                }
            });
            socket.on("typing", (data) => {});
            socket.on("offline", (data) => {
                const user = this.onOffline(socket.id);
                if (user){
                    this.mapSocketToUser.pull("reading_conversation", user?.userId);
                    socket.to(listId).emit("user_offline", {
                        userId: user.userId,
                        lastOnline: user.lastOnline,
                    });
                }
            });
            socket.on("online", (data) => {
                const user = this.onOnline(socket.id);
                if (user)
                    socket.to(listId).emit("user_online", {
                        userId: user.userId,
                    });
            });
            socket.on("disconnect", (data) => {
                const user = this.onOffline(socket.id);
                this.mapSocketToUser.pull("reading_conversation", user?.userId);
                if (user) {
                    socket.to(listId).emit("user_offline", {
                        userId: user.userId,
                        lastOnline: user.lastOnline,
                    });
                }
            });
            socket.on("add_friend", async (data) => {
                const { id } = data;
                const x = await FriendService.addFriend(user.sub, id);
                if (!x) return;
                const { request, receipt } = x;
                io.to(this.getMySocketId(id)!).emit("new_friend_request", receipt);
                socket.emit("new_friend_request", request);
                const conversation = await ConversationService.createConversation({
                    members: [
                        {
                            userId: user.sub!,
                            role: MemberRole.MEMBER,
                        },
                        {
                            userId: id,
                            role: MemberRole.MEMBER,
                        },
                    ],
                });
                console.log("🚀 ~ file: index.ts:231 ~ Socket ~ socket.on ~ conversation:", conversation);
                const otherSocket = this.getMySocket(id);
                otherSocket?.join(conversation._id.toString());
                socket.join(conversation._id.toString());
                io.to(this.getMySocketId(id)!).emit("new_conversation", conversation);
                socket.emit("new_conversation", conversation);
            });
            socket.on("accept_friend", async (data) => {
                const { _id } = data;
                const { sub } = user;
                console.log("🚀 ~ file: index.ts:175 ~ Socket ~ socket.on ~ data:", data);
                const { request, receipt } = await FriendService.acceptFriend(user.sub, _id);
                if (request)
                    io.to(this.getMySocketId(_id)!).emit("friend_request_accepted", {
                        ...request._doc,
                        status: "friends",
                    });
                if (receipt)
                    socket.emit("friend_request_accepted", {
                        ...receipt._doc,
                        status: "friends",
                    });
            });
            socket.on("reject_friend", async (data) => {
                const { _id } = data;
                const { sub } = user;
                const { request, receipt } = await FriendService.rejectFriend(user.sub, _id);
                if (request) io.to(this.getMySocketId(_id)!).emit("friend_request_rejected", request._id);
            });
            socket.on("cancel_friend", async (data) => {
                console.log("🚀 ~ file: index.ts:231 ~ Socket ~ socket.on ~ data:", data);
                const { _id } = data;
                const { sub } = user;
                const { request, receipt } = await FriendService.unSendRequest(sub, _id);
                if (receipt) io.to(this.getMySocketId(_id)!).emit("friend_request_canceled", receipt._id);
            });
            socket.on("create_group_conversation", async (data) => {
                const { sub } = user;
                const { name, avatar, members } = data;
                const newMembers = members.map((member) => ({
                    userId: member,
                    role: MemberRole.MEMBER,
                }));
                newMembers.push({
                    userId: sub,
                    role: MemberRole.ADMIN,
                });
                const conversation = await ConversationService.createConversation({
                    creatorId: sub,
                    members: newMembers,
                    name,
                    avatar,
                    type: GroupType.PRIVATE,
                });
                const listId = newMembers.map(({ userId }) => userId);
                listId.forEach((id) => {
                    const socket = this.getMySocket(id);
                    socket?.join(conversation._id.toString());
                });
                io.to(conversation._id.toString()).emit("new_conversation", conversation);
            });
            socket.on("remove_conversation", async (data) => {
                const { conversationId } = data;
                const { sub } = user;
                const conversation = await ConversationService.removeConversation(conversationId, sub);
            });
            socket.on("clear_messages", async (data) => {
                const { conversationId } = data;
                const { sub } = user;
                const conversation = await ConversationService.clearMessages(conversationId, sub);
            });
            socket.on("out_conversation", async (data) => {
                const { conversationId } = data;
                const { sub } = user;
                const conversation = await ConversationService.outConversation(conversationId, sub);
                socket.leave(conversationId);
                io.to(conversationId).emit("new_conversation", conversation);
            });
            socket.on("add_members", async (data) => {
                try {
                    console.log(data);
                    const { conversationId, members } = data;
                    const { sub } = user;
                    const conversation = (await ConversationService.addMember(conversationId, members, sub)) as {
                        members: (MemberType & {
                            user: UserType;
                        })[];
                        [key: string]: any;
                    };
                    if (conversation) {
                        io.to(conversationId).emit("add_members", {
                            conversationId: conversationId,
                            members: conversation.members.filter((member) => {
                                return members.map((x) => x.id).includes(member.user._id);
                            }),
                        });
                    }
                    await Promise.all(
                        members.map(async ({ id }) => {
                            const socket = this.getMySocket(id);
                            await socket?.join(conversationId);
                            socket?.emit("new_conversation", conversation);
                            return true;
                        }),
                    );
                } catch (error) {
                    console.log(error);
                }
            });
            socket.on("remove_members", async (data) => {
                const { conversationId, members } = data;
                const { sub } = user;
                const conversation = await ConversationService.removeMembers(conversationId, members, sub);
                console.log("🚀 ~ file: index.ts:309 ~ Socket ~ socket.on ~ conversation:", conversation);
                // const listId = members.map(({ userId }) => userId);

                io.to(conversationId).emit("remove_members", {
                    conversationId: conversationId,
                    members: members,
                });
                members.forEach((id) => {
                    const socket = this.getMySocket(id);
                    socket?.leave(conversationId);
                });
            });
            socket.on("read_conversation", (data) => {
                const { conversation } = data;
                const { sub } = user;
                const listReading = this.mapSocketToUser.get("reading_conversation") || {};
                // console.log(
                //     "🚀 ~ file: index.ts:342 ~ Socket ~ socket.on ~ this.mapSocketToUser:",
                //     this.mapSocketToUser,
                // );
                this.mapSocketToUser.set("reading_conversation", {
                    ...listReading,
                    [sub]: conversation,
                });
            });
            socket.on("unread_conversation", (data) => {
                const { conversation } = data;
                const { sub } = user;
                const listReading = this.mapSocketToUser.get("reading_conversation") || {};
                console.log(
                    "🚀 ~ file: index.ts:342 ~ Socket ~ socket.on ~ this.mapSocketToUser:",
                    this.mapSocketToUser,
                );

                this.mapSocketToUser.set("reading_conversation", {
                    ...listReading,
                    [sub]: undefined,
                });
            });

            socket.on("call_request", (data) => {
                const { destination, offer, candidates } = data;
                const otherId = this.mapSocketToUser.get(destination).filter((x: string) => x !== user.sub);
                const otherSocketId = this.getMySocketId(otherId[0]);
                if (!otherSocketId) return;
                const response = this.mapSocketToUser.get(otherSocketId);
                if (response.calling === true) return socket.emit("user_busy", { from: user.sub, destination });
                console.log("🚀 ~ file: index.ts:376 ~ Socket ~ socket.on ~ user_available:")
                socket.emit("user_available", {
                    destination,
                    to: {
                        userId: otherId[0],
                        socketId: otherSocketId,
                    },
                });
                // console.log("🚀 ~ file: index.ts:382 ~ Socket ~ socket.on ~ otherId:", otherId)
                // socket.to(destination).emit("request_call", { from: user.sub, destination: destination, candidates });
            });
            socket.on("new_offer", (data) => {
                const {
                    destination,
                    offer,
                    to: { userId, socketId },
                    type
                } = data;
                const otherId = this.mapSocketToUser.get(destination).filter((x: string) => x !== user.sub);
                const otherSocket = this.getMySocket(otherId[0]);
                otherSocket?.emit("incoming_call", {
                    destination,
                    offer,
                    from: {
                        userId: user.sub,
                        socketId: socket.id,
                    },
                    type
                });
            });
            socket.on("accept_call", (data) => {
                const { destination, offer, from: {
                    userId, socketId
                } } = data;
                console.log("🚀 ~ file: index.ts:398 ~ Socket ~ socket.on ~ data:", data.from)
                // console.log("🚀 ~ file: index.ts:128 ~ Socket ~ socket.on ~ offer:", offer)
                const otherSocket = this.getMySocket(userId);
                otherSocket?.emit("call_accepted", {
                    destination,
                    offer,
                    from: {
                        userId: user.sub,
                        socketId: socket.id,
                    },
                });
                // socket.to(destination).emit("call_accepted", { offer: offer });
            });

            socket.once("reject_call", (data) => {
                const { destination } = data;
                console.log("🚀 ~ file: index.ts:417 ~ Socket ~ socket.on ~ destination:", destination)
                socket.to(destination).emit("reject_call", { from: user.sub });
            });
            socket.on("call_answered", (data) => {
                const { destination, answer } = data;
                console.log("🚀 ~ file: index.ts:137 ~ Socket ~ socket.on ~ answer:", answer);
                socket.to(destination).emit("call_answered", { answer: answer });
            });
            socket.on("new_candidates", (data) => {
                const { destination, candidate } = data;
                // console.log("🚀 ~ file: index.ts:146 ~ Socket ~ socket.on ~ candidate:");
                socket.to(destination).emit("new_candidates", { destination, candidate: candidate });
            });
            socket.on("end_call", (data) => {
                const { destination } = data;
                console.log("🚀 ~ file: index.ts:433 ~ Socket ~ socket.on ~ destination:", destination)
                socket.to(destination).emit("end_call", { from: user.sub });
            });
        });
        io.on("disconnect", async (socket) => {
            const { user } = socket.data;
            this.mapSocketToUser.delete(socket.id);

            console.log("🚀 ~ file: index.ts:34 ~ io.on ~ mapSocketToUser:", this.mapSocketToUser);
        });
    }
    public handleNewConversation;
    public get io(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
        return this._io;
    }
    public sendMessageToConversation(conversationId: string, message: any) {
        this.io.to(conversationId).emit("message", message);
    }
    public getSocketRoomsIn(userId: string) {}
    private notifyOnline(userId: string) {}
    private getRoomIdByUser(userId: string) {
        const list = Array.from(this.mapSocketToUser.entries());
        const list2 = list.filter(([_, id]) => id === userId).map(([id]) => id);
        return list2;
    }
    private getMySocketId(userId: string) {
        const list = Array.from(this.mapSocketToUser.entries());
        const entry = list.find(([f, s]) => s["userId"] === userId);
        return entry ? entry[0] : undefined;
    }
    private getMySocket(userId: string) {
        return this.io.sockets.sockets.get(this.getMySocketId(userId) as string);
    }
    private removeUserIdOutOfRoom(userId: string) {
        const list = this.getRoomIdByUser(userId);
        list.forEach((id) => {
            try {
                const listUser = JSON.parse(this.mapSocketToUser.get(id) as string);
                const newList = listUser.filter((user: string) => user !== userId);
                this.mapSocketToUser.set(id, JSON.stringify(newList));
            } catch (error) {
                const id1 = this.mapSocketToUser.get(id) as string;
                if (id1 === userId) {
                    this.mapSocketToUser.delete(id);
                }
            }

            // this.mapSocketToUser.set(id, JSON.stringify(newList));
        });
    }
    public leaveRoom(userId: string) {
        const mySocket = this.getMySocket(userId);
        this.removeUserIdOutOfRoom(userId);
        // console.log(mySocket)
        mySocket?.disconnect();
        // console.log("🚀 ~ file: index.ts:34 ~ Socket ~ this.mapSocketToUser", this.mapSocketToUser);
    }
    private onOnline(id: string) {
        const x = this.mapSocketToUser.get(id);
        if (!x) {
            return;
        }
        x["status"] = "online";
        console.log(x.userId, "Online");
        this.mapSocketToUser.set(id, x);
        return x;
    }
    private onOffline(id: string) {
        const x = this.mapSocketToUser.get(id);
        if (!x) {
            return;
        }
        x["status"] = "offline";
        const { userId } = x;
        const lastOnline = Date.now();
        UserService.updateUser(userId, {
            lastOnline,
        });
        console.log(x.userId, "Offline");
        this.mapSocketToUser.set(id, x);
        return {
            userId: x.userId,
            lastOnline,
        };
    }
}
