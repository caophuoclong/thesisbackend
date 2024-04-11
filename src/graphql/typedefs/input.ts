import { gql } from "apollo-server-express";

const InputTypeDef = gql`
    input AddMemberInput {
        conversation_id: String
        users: [UserMemberInput]
    }
    input UserMemberInput {
        id: String
        role: ConversationRole
    }
    input MessageInput {
        destination: String!
        sender_id: String!
        content: String
        messageAttachmentType: MessageAttachmentType
    }
    input UpdateMessageInput {
        message_id: [String!]
        status: MessageStatusType
    }
    input AddFriendInput{
        id: String!
    }
    input UnSendFriendRequestInput{
        _id: String!
    }
    input AcceptFriendInput{
        _id: String!
    }
    input RejectFriendInput{
        _id: String!
    }
    input GetMessagesInput{
        conversationId: String!
        limit: Int
        offset: Int
    }
`;
export default InputTypeDef;
