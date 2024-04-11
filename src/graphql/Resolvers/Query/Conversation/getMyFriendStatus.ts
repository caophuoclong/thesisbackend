import { FriendService } from "../../../../services/Friend";
import { UserService } from "../../../../services/User";
import Storage from "../../../../utils/Storage";
import { AuthResult } from "express-oauth2-jwt-bearer";

export default async function getMyFriendStatus(parent, args, context: AuthResult, info) {
    const { sub } = context.payload;
    if (!sub) {
        return null;
    }
    const storage = Storage.getInstance();
    const array = Array.from(storage.entries());
    const userId = sub;
    const user = await FriendService.getFriend(userId);
    const newUsers = user[0].friends.map((friend: any) => friend.user) as string[];
    const result = await Promise.all(newUsers.map(async (user) => {
        const newUser = await UserService.getUser(user);
        const y = array.find(([key, value]) => {
            if (Array.isArray(value)) return undefined;
            if (value === null) return undefined;
            if (value["userId"] === user) {
                return true;
            }
            return undefined;
        });
        if (!y)
            return {
                _id: user,
                status: {
                    status: "offline",
                    lastOnline: newUser?.lastOnline,
                }
            };
        return {
            _id: user,
            status:{
                lastOnline: newUser?.lastOnline,
                status: y[1].status
            }
        }
    }));
    return result;
}
