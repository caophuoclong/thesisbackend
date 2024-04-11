import { createConversation, addMemberToConversation } from "./Conversation";
import { sendMessage } from "./Message";
import { updateMessageStatus } from "./Message/updateMessageStatus";
import { addFriend, unSendFriendRequest, acceptFriend, rejectFriend } from "./Friends";
import {logout} from "./User";
import { updateMessageStatusInConversation } from './Message/updateStatus';
import { updateReceivedAllMessage } from './Message/updateReceivedAllMessage';
export const Mutation = {
    createConversation,
    addMemberToConversation,
    sendMessage,
    updateMessageStatus,
    addFriend,
    unSendFriendRequest,
    acceptFriend,
    rejectFriend,
    logout,
    updateMessageStatusInConversation,
    updateReceivedAllMessage
};
