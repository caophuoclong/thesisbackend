import { gql } from "apollo-server-express";

const QueryTypedef = gql`
    type Query {
        getMe: GetMe
        getFriends: [Friend]
        conversation(id: String!): Conversation
        conversations(userId: String!): [Conversation]
        findFriend(q: String!): User
        getMyConversation: [Conversation]
        getMessages(input: GetMessagesInput): MessageResult
        getMyFriendStatus: [StatusResult]
    }
`;
export default QueryTypedef;
