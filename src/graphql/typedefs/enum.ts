import { gql } from "apollo-server-express";

const EnumTypedef = gql`
    enum ConversationTheme {
        system
        halloween
        tet
        summer
        christmas
    }
    enum ConversationRole {
        member
        admin
        optional
    }
    enum NotificationType {
        normal
        no_notify
        h3
        h2
        h1
        m15
        custom
    }
    enum Gender {
        male
        female
        other
    }

    enum UserLogType {
        add
        delete
        updated
    }
    enum MessageStatusType {
        sent
        received
        seen
    }
    enum ErrorType {
        NOT_FOUND
        NOT_AUTHORIZED
        NOT_ALLOWED
        INVALID_DATA
        UNKNOWN
    }
    enum ResponseStatus {
        SUCCESS
        FAIL
    }
    enum MessageAttachmentType {
        text
        audio
        video
        image
        system
        sticker
    }
`;
export default EnumTypedef;
