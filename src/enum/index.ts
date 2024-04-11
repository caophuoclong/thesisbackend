export enum MemberRole {
    ADMIN = "admin",
    MEMBER = "member",
    OPTIONAL = "optional",
}
export enum ErrorType {
    NOT_FOUND = "NOT_FOUND",
    NOT_AUTHORIZED = "NOT_AUTHORIZE",
    NOT_ALLOWED = "NOT_ALLOWED",
    INVALID_DATA = "INVALID_DATA",
    UNKNOWN = "UNKNOWN",
}
export enum ResponseStatus {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}

export type CommandResponse = {
    __typename: string
    message: string,
    status: ResponseStatus
} | {
    __typename: string
    message?: string,
    type: ErrorType
};

export enum MessageAttachmentType {
    TEXT = "text",
    AUDIO = "audio",
    VIDEO = "video",
    IMAGE = "image",
    SYSTEM = "system",
    STICKER = "sticker",
}
export enum MessageStatus {
    SENT = "sent",
    RECEIVED = "received",
    SEEN = "seen",
}
export enum ConversationLogType {
    ADD_MEMBER = "add_memeber",
    UPDATE_INFO = "update_info",
    UPDATE_ADMIN = "update_admin",
    UPDATE_AVATAR = "update_avatar",
    DELETE_MEMBER = "delete_member",
    BLOCK_MEMBER = "block_member",
}
export enum FriendStatus {
    REQUESTED = "requested",
    PENDING = "pending",
    FRIENDS = "friends",
    BLOCKED = "blocked",
}
