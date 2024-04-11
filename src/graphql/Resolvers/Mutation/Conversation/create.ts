import {  ErrorType, MemberRole, ResponseStatus } from "../../../../enum";
import { ConversationService } from "../../../../services/Conversation";
import { Error } from "../../../../utils/Error";
import { Response } from "../../../../utils/Response";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function createConversation(parent, { name, description, members }, context: AuthResult, info) {
    const { sub } = context.payload;
    try{
        const newListMember = members.map(item => ({
            userId: item,
            role: MemberRole.MEMBER
        })) as Array<{
            userId: string,
            role: MemberRole
        }>
        await ConversationService.createConversation({
            name,
            description,
            members: [...newListMember, {
                userId: sub!,
                role: MemberRole.ADMIN
            }]
        })
        
        return Response(ResponseStatus.SUCCESS, "Create conversation success");
    }catch(error){
        return Error(ErrorType.INVALID_DATA, error.message);
    }
}
