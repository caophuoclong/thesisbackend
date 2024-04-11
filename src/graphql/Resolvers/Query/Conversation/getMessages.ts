import { ErrorType } from "../../../../enum";
import { MessageService } from "../../../../services/message";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function getMessages(parent, { input:{
    conversationId,
    limit,
    offset
} }, context: AuthResult, info){
    const {sub} = context.payload;
    if(!sub) return Error(ErrorType.NOT_AUTHORIZED);
    const x = await MessageService.getMany(conversationId, {limit, offset, user: sub});
    return x
}