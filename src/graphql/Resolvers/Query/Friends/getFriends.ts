import { FriendService } from "../../../../services/Friend";
import { AuthResult } from "express-oauth2-jwt-bearer";
import { GraphQLError } from "graphql";

export default async function getFriends(parent, args, context: AuthResult){
    const {sub} = context.payload;
    if(!sub) return new GraphQLError("Unauthorized");
    const user = await FriendService.getFriend(sub);
    const {users, ...rest} = user[0]
    const response = rest.friends.map((friend)=>({
        ...friend,
        user: users.find((user)=>user._id === friend.user)
    }))
    return response;
}