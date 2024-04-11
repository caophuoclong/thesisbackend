import { gql } from "apollo-server-express";

const MutationTypedef = gql`
    type Mutation {
        createConversation(name: String!, description: String, members: [String]): CommandResponse
        deleteConversation(id: String!): CommandResponse
        updateConversation(id: String!, name: String, description: String): CommandResponse
        addMemberToConversation(input: AddMemberInput): CommandResponse
        removeMemberFromConversation(id: String!, members: [String]): CommandResponse
        blockMemberFromConversation(id: String!, members: [String]): CommandResponse
        unblockMemberFromConversation(id: String!, members: [String]): CommandResponse
        leaveConversation(id: String!): CommandResponse
        updateConversationTheme(id: String!, theme: ConversationTheme): CommandResponse
        updateConversationRole(id: String!, members: [String], role: ConversationRole): CommandResponse
        updateConversationNotificationType(
            id: String!
            members: [String]
            notification_type: NotificationType
        ): CommandResponse
        updateConversationNotificationCustom(
            id: String!
            members: [String]
            notification_custom: String
        ): CommandResponse
        sendMessage(input: MessageInput): CommandResponse
        updateMessageStatus(input: UpdateMessageInput): CommandResponse
        addFriend(input: AddFriendInput): AddFriendResult
        unSendFriendRequest(input: UnSendFriendRequestInput): CommandResponse
        acceptFriend(input: AcceptFriendInput): AcceptFriendResult
        rejectFriend(input: RejectFriendInput): CommandResponse
        logout: CommandResponse
        updateMessageStatusInConversation(conversation: String): String
        updateReceivedAllMessage: String
    }
`;

export default MutationTypedef;
