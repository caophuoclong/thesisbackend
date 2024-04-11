import { gql } from "apollo-server-express";

const Type = gql`
    type UserLog {
        id: String
        createdAt: Float
        action: String
        device: String
        type: UserLogType
    }
    type User {
        _id: String
        email: String
        emailVerified: Boolean
        firstName: String!
        username: String
        dob: Int
        avatar: String
        createdAt: Float
        updatedAt: Float
        gender: Gender
        conversations: [Conversation]
    }

    type ConversationLog {
        _id: String
        content: String
        createdAt: Float
        type: String
        by: User
    }
    type ConversationBlocked {
        user: User
        createdAt: Float
        updatedAt: Float
    }
    type ConversationMember {
        _id: String
        role: String
        theme: String
        createdAt: Float
        updatedAt: Float
        nickName: String
        user: User,
        inactive: Boolean
        notificationType: String
        notificationCustom: Int
    }
    type Conversation {
        _id: String
        name: String
        description: String
        creator: User
        avatar: String
        type: String
        createdAt: Float
        updatedAt: Float
        blocked: [ConversationBlocked]
        logs: [ConversationLog]
        members: [ConversationMember]
        messages: [Message]
        latestMessage: Message
        unreadMessage: Int
        inactive: Boolean
    }
    type MessageAttachment {
        type: String
        content: String
    }

    type Error {
        type: ErrorType
        message: String
    }
    type Response {
        status: ResponseStatus
        message: String
    }
    # Command is a task that can be executed to create, update, delete
    union CommandResponse = Response | Error

    type MessageStatus {
        user: User
        status: MessageStatusType
        deleted: Boolean
        updatedAt: Float
    }
    type ReplyMessageSender {
        _id: String,
        firstName: String,
    }
    type ReplyMessage {
        _id: String
        sender: ReplyMessageSender
        content: String
        type: String
        recall: Boolean
    }
    type Message {
        _id: String
        sender: User
        attachments: [MessageAttachment]
        status: [MessageStatus]
        createdAt: Float
        updatedAt: Float
        content: String
        recall: Boolean
        width: Int
        height: Int
        type: String
        reply: ReplyMessage
        destination: Conversation
    }
    type Friend{
        _id: String
        status: String
        createdAt: Float
        updatedAt: Float
        user: User
    }
    type GetMe{
        _id: String
        firstName: String
        username: String
        email: String
        avatar: String
        createdAt: Float
        updatedAt: Float
    }
    type AddFriendResult {
        friend: Friend
        conversation: Conversation
    }
    type AcceptFriendResult{
        _id: String
        status: String
        createdAt: Float
        updatedAt: Float
    }
    type MessageResult{
        messages: [Message]
        count: Int
    }
    type UserStatus{
        status: String
        lastOnline: Float
    }
    type StatusResult{
        _id: String
        status: UserStatus
    }
`;

export default Type;
