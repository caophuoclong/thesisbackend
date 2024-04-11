import { AuthResult } from "express-oauth2-jwt-bearer";
import UserModel from "../../../models/User.model";
import { GraphQLError } from "graphql";


export async function getMe(parent, args, context: AuthResult, info) {
    const {
        payload: { sub },
    } = context;
    if (!sub) throw new GraphQLError("Unauthorized");
    const user = await UserModel.findById(sub);
    if(!user) throw new GraphQLError("Unauthorized");
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
