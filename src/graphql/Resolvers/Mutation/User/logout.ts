import { ErrorType, ResponseStatus } from "../../../../enum";
import { UserService } from "../../../../services/User";
import { Response } from "../../../../utils/Response";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function logout (parent, args, context: AuthResult, info) {
    try {
        const { sub } = context.payload;
        if (!sub) return Error(ErrorType.NOT_AUTHORIZED);
        UserService.logout(sub!);
        return Response(ResponseStatus.SUCCESS,"Logout successfully");
    } catch (error) {
        console.log("🚀 ~ file: addFriend.ts:43 ~ addFriend ~ error:", error);
        return Error(error);
    }
}