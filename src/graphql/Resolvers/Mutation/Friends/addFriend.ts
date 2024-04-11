import { ErrorType, FriendStatus, MemberRole, ResponseStatus } from "../../../../enum";
import { FriendsModel } from "../../../../models/Friends.model";
import UserModel from "../../../../models/User.model";
import { ConversationService } from "../../../../services/Conversation";
import { FriendService } from "../../../../services/Friend";
import { Error } from "../../../../utils/Error";
import { Response } from "../../../../utils/Response";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function addFriend(parent, { input: { id } }, context: AuthResult, info) {
    try {
        const { sub } = context.payload;
        if (!sub) return Error(ErrorType.NOT_AUTHORIZED);
        const conversation = await ConversationService.createConversation({
            members: [
                {
                    userId: sub!,
                    role: MemberRole.MEMBER
                },
                {
                    userId: id,
                    role: MemberRole.MEMBER
                }
            ]
        })
        console.log("🚀 ~ file: addFriend.ts:26 ~ addFriend ~ conversation:", conversation)
        const friend = await FriendService.addFriend(sub!, id)
        return {
            friend,
            conversation
        };
    } catch (error) {
        console.log("🚀 ~ file: addFriend.ts:43 ~ addFriend ~ error:", error);
        return Error(error);
    }
}
