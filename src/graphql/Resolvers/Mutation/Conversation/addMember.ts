import { AuthResult } from "express-oauth2-jwt-bearer";
import { GraphQLError } from "graphql";
import { Error } from "../../../../utils/Error";
import { ErrorType, MemberRole, ResponseStatus } from "../../../../enum";
import { Response } from "../../../../utils/Response";
import { ConversationService } from "../../../../services/Conversation";

export default async function addMemberToConversation(
    parent,
    { input: { conversation_id, users } },
    context: AuthResult,
    info,
) {
    const { sub } = context.payload;
    try {
        await ConversationService.addMember(conversation_id, users, sub!);
        return Response(ResponseStatus.SUCCESS, "Add member success");
    } catch (error) {
        return Error(ErrorType.INVALID_DATA, error.message);
    }
}
