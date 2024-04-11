import { ErrorType } from "../../../../enum";
import { ConversationService } from "../../../../services/Conversation";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function getMyConversation(parent, args, context: AuthResult, info){
    const {sub} = context.payload;
    if(!sub) return Error(ErrorType.NOT_AUTHORIZED);
    const conversations = await ConversationService.getConversationByUser(sub);
    return conversations;
}