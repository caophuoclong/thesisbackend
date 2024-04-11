import getConversation from "./Conversation/get";
import getMyConversation from "./Conversation/getMyConversation";
import getMessages from "./Conversation/getMessages";
import findFriend from "./Friends/findFriend";
import getFriends from "./Friends/getFriends";
import getMyFriendStatus from "./Conversation/getMyFriendStatus";
import { getMe } from "./getMe";

export const Query = {
    getMe: getMe,
    conversation: getConversation,
    findFriend: findFriend,
    getFriends: getFriends,
    getMyConversation: getMyConversation,
    getMessages,
    getMyFriendStatus
};
