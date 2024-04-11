import { IMessageCreate } from "../services/message";
import { Socket } from "socket.io";

export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    message: (data: any)=>void;
    sent_message: (data: any)=>void;
    new_conversation: (data: any)=>void;
    new_message: (data: any)=>void;
    message_received: (data: any)=>void;
    user_online: (data:any) => void;
    user_offline: (data:any) => void;
    incoming_call: (data:any) => void;
    accept_call: (data:any) => void;
    reject_call: (data:any) => void;
    request_call: (data:any) => void;
    call_accepted: (data:any) => void;
    call_answered: (data:any) => void;
    new_candidates: (data:any) => void;
    end_call: (data:any) => void;
    new_friend_request: (data:any) => void;
    friend_request_accepted: (data:any) => void;
    friend_request_rejected: (data:any) => void;
    friend_request_canceled: (data:any) => void;
    new_offer: (data:any) => void;
    recall_message: (data:any) => void;
    add_members: (data:any) => void;
    remove_members: (data:any) => void;
    message_seen: (data:any) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    message: ()=>void;
    send_message: (data: any)=>void;
    received_message: (data: any)=>void;
    seen_message: (data: any)=>void;
    typing: (data: any)=>void;
    online: (data: any)=>void;
    offline: (data: any)=>void;
    call_request: (data: any)=>void;
    accept_call: (data: any)=>void;
    reject_call: (data: any)=>void;
    call_accept: (data: any) => void;
    call_answered: (data: any) => void;
    new_candidates: (data: any) => void;
    end_call: (data: any) => void;
    add_friend: (data: any) => void;
    accept_friend: (data: any) => void;
    reject_friend: (data: any) => void;
    cancel_friend: (data: any) => void;
    new_conversation: (data: any) => void;
    new_offer: (data: any) => void;
    sending_audio: (data: any) => void;
    recall_message: (data: any) => void;
    delete_message: (data: any) => void;
    create_group_conversation: (data:any) => void;
    remove_conversation: (data:any) => void;
    clear_messages: (data:any) => void;
    out_conversation: (data:any) => void;
    add_members: (data:any) => void;
    remove_members: (data:any) => void;
    read_conversation: (data:any) => void;
    unread_conversation: (data:any) => void;
}

export interface InterServerEvents {
    ping: () => void;
    disconnect: (socket: Socket)=> void;
}

export interface SocketData {
    user: any;
}
