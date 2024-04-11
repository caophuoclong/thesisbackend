import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../Interfaces/ISocket";
import { MessageStatus } from "../../enum";
import { socketAuthenticator } from "../../middlewares/socket";
import { ConversationService } from "../../services/Conversation";
import { UserService } from "../../services/User";
import { IMessageCreate, MessageService } from "../../services/message";
import Storage from "../../utils/Storage";
import { Server, Socket } from "socket.io";

export class SocketService {
    private _socket: Socket;
    public get socket(): Socket {
        return this._socket;
    }
    public set socket(value: Socket) {
        value.on(
            "send_message",
            this.sendMessage,
        );
        value.on("received_message", this.receivedMessage);
        value.on("seen_message", (data) => {});
        value.on("typing", (data) => {});
        value.on("offline", this.offline);
        value.on("online", this.online);
        value.on("disconnect", this.offline);
        value.on("call_request",this.callRequest);
        value.on("accept_call",this.acceptCall);
        value.on("reject_call",this.rejectCall);
        value.on("call_answered", this.callAnswered)
        value.on("new_candidates", this.newCandidate)
        value.on("end_call", this.endCall)
        value.on("add_friend", (data)=>{

        })
        this._socket = value;

    }
    private _io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    public get io(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
        return this._io;
    }
    private _listId: Array<string> = [];
    public get listId(): Array<string> {
        return this._listId;
    }
    public set listId(value: Array<string>) {
        this._listId = value;
    }
    private _messageService: MessageService;
    private _mapSocketToUser: Storage;
    public get mapSocketToUser(): Storage {
        return this._mapSocketToUser;
    }

    private _user: any;
    public get user(): any {
        return this._user;
    }
    public set user(value: any) {
        this._user = value;
    }
    constructor(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        this._messageService = new MessageService();
        this._mapSocketToUser = Storage.getInstance();
        io.use(socketAuthenticator);
        io.on("connection", async (socket) => {
            console.log("New socket connect!", socket.id);
            const { user } = socket.data;
            const data = await ConversationService.getConversationByUser(user.sub);
            const listId = data.map(({ _id }) => _id.toString());
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
            this.listId = listId;
            this.mapSocketToUser.set(socket.id, {
                userId: user.sub,
                status: "online",
            });
            socket.to(listId).emit("user_online", {
                userId: user.sub,
            });
            
            this.socket = socket;
            this.user = socket.data.user;
        });
        this._io = io;

    }
    public async sendMessage(data: IMessageCreate & { _id: string }) {
        const { content, destination, type, width, height } = data;
        const sender_id = this.user.sub;
        const message = await MessageService.createMessage({
            content,
            destination: destination,
            type,
            sender_id,
            width,
            height,
        });
        this.socket.to(destination._id).emit("new_message", message);
        this.socket.emit("sent_message", {
            message,
            tempId: data._id,
        });
    }
    public async receivedMessage(data: any) {
        const {
            messageId,
            destination: { _id },
        } = data;
        console.log("🚀 ~ file: index.ts:79 ~ Socket ~ socket.on ~ data:", data);
        const status = await MessageService.changeStatus({
            messageId,
            userId: this.user.sub,
            newStatus: MessageStatus.RECEIVED,
        });
        const sender = await MessageService.getSender(messageId);
        const socketId = this.getMySocketId(sender._id);
        console.log("🚀 ~ file: index.ts:74 ~ Socket ~ socket.on ~ socketId:", socketId);
        if (socketId) {
            this.io.to(socketId).emit("message_received", {
                messageId,
                conversationId: _id,
                status,
            });
        }
    }
    public async offline(data: any) {
        const user = this.onOffline(this.socket.id);
        if (user)
            this.socket.to(this.listId).emit("user_offline", {
                userId: user.userId,
                lastOnline: user.lastOnline,
            });
    }
    public async online(data: any) {
        console.log("🚀 ~ file: SocketService.ts:93 ~ SocketService ~ online ~ this.socket:", this.socket)
        const user = this.onOnline(this.socket.id);
        if (user)
            this.socket.to(this.listId).emit("user_online", {
                userId: user.userId,
            });
    }
    public async callRequest(data: any) {
        const { destination, offer, candidates } = data;
        console.log("🚀 ~ file: index.ts:124 ~ Socket ~ socket.on ~ request_call: from", candidates);
        this.socket
            .to(destination)
            .emit("request_call", { from: this.user.sub, destination: destination, offer: offer, candidates });
    }
    public async acceptCall(data: any){
        const {destination, offer} = data;
        // console.log("🚀 ~ file: index.ts:128 ~ Socket ~ socket.on ~ offer:", offer)
        this.socket.to(destination).emit("call_accepted", {offer: offer});
    }
    public async rejectCall(data: any){
        const {destination} = data;
        this.socket.to(destination).emit("reject_call", {from: this.user.sub});
    }
    public async callAnswered(data: any){
        const {destination, answer} = data;
        console.log("🚀 ~ file: index.ts:137 ~ Socket ~ socket.on ~ answer:", answer)
        this.socket.to(destination).emit("call_answered", {answer: answer});
    }
    public async newCandidate(data:any){
        const {destination, candidate} = data;
        this.socket.to(destination).emit("new_candidates", {candidate: candidate});
    }
    public async endCall(data: any){
        const {destination} = data;
        this.socket.to(destination).emit("end_call", {from: this.user.sub});
    }
    private getMySocketId(userId: string) {
        const list = Array.from(this.mapSocketToUser.entries());
        const entry = list.find(([f, s]) => s["userId"] === userId);
        return entry ? entry[0] : undefined;
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
}
