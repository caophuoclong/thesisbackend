import { CommandResponse, ErrorType, FriendStatus, ResponseStatus } from "../enum";
import { FriendSType, FriendsModel } from "../models/Friends.model";
import UserModel from "../models/User.model";
import { LogService } from "./Log";
import { LogTypeEnum } from "../models/Log.model";
import { Response } from "../utils/Response";
import { Error } from "../utils/Error";

export class FriendService {
    private static async removeFriend(userId: string, friendId: string): Promise<any> {
        const existedFriend = await FriendsModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            requester: userId,
                            recipient: friendId,
                        },
                        {
                            recipient: userId,
                            requester: friendId,
                        },
                    ],
                },
            },
        ]);
        if (existedFriend) {
            const temp = existedFriend.map(item => ({
                friendId: item._id,
                userId: item.requester
            }))
            await Promise.all(temp.map(async(item) => {
                await FriendsModel.deleteOne({ _id: item.friendId });
                await UserModel.findOneAndUpdate({_id: item.userId}, {
                    $pull:{
                        friends: item.friendId
                    }
                })
            }))
            const request = existedFriend.find(item => item.status === "pending");
            const receipt = existedFriend.find(item => item.status === "requested");
            return {
                request,
                receipt
            };
        }
        return false;
    }
    static async unSendRequest(userId: string, friendId: string): Promise<any> {
        // Code to remove friend request from userId to friendId
        const result = await this.removeFriend(userId, friendId);
        if(result){
            const log = await LogService.createLog({
                content: `You unsend friend request to ${friendId}`,
                type: LogTypeEnum.UN_SEND_FRIEND_REQUEST,
                by: {_id: userId},
            });
            UserModel.findByIdAndUpdate(userId, {
                $push: {
                    logs: log._id
                }
            });
            return result;
        }else{
            return Error(ErrorType.INVALID_DATA);
        }
        

    }

    static async acceptFriend(userId: string, friendId: string): Promise<any> {
        // Code to accept friend request from friendId to userId
        const existedFriend = await FriendsModel.find({
            $or:[
                {
                    requester: userId,
                    recipient: friendId,
                },
                {
                    requester: friendId,
                    recipient: userId,
                },
            ]
        })
        console.log("🚀 ~ file: Friend.ts:79 ~ FriendService ~ acceptFriend ~ ", {
            requester: userId,
            recipient: friendId,
        },
        {
            requester: friendId,
            recipient: userId,
        },)
        console.log("🚀 ~ file: Friend.ts:84 ~ FriendService ~ acceptFriend ~ existedFriend:", existedFriend)
        if(existedFriend.length !== 2) throw Error(ErrorType.INVALID_DATA);
        const temp = existedFriend.map(item => ({
            friendId: item._id,
        }))
        await FriendsModel.updateMany({
            _id: {$in: temp.map(item => item.friendId)}
        }, {
            $set: {
                status: FriendStatus.FRIENDS
            }
        })
        const request = existedFriend.find(item => item.status === "pending");
        const receipt = existedFriend.find(item => item.status === "requested");
        return {
            request,
            receipt
        };
    }

    static async rejectFriend(userId: string, friendId: string): Promise<any> {
        const result = await this.removeFriend(userId, friendId);
        if(result){ 
            const log = await LogService.createLog({
                content: `You reject friend request from ${friendId}`,
                type: LogTypeEnum.REJECT_FRIEND_REQUEST,
                by: {_id: userId},
            });
            UserModel.findByIdAndUpdate({
                $push: {
                    logs: log._id
                }
            })
            return result;
            // return Response(ResponseStatus.SUCCESS, "Reject friend request successfully");
        }else{
            return Error(ErrorType.INVALID_DATA)
        }
    }

    static async blockUser(userId: string, friendId: string): Promise<void> {
        // Code to block friendId from userId

    }

    static async deleteFriend(userId: string, friendId: string): Promise<void> {
        // Code to delete friend relationship between userId and friendId
    }

    static async addFriend(userId: string, friendId: string): Promise<any> {
        // Code to add friend relationship between userId and friendId
        const existedFriend = await FriendsModel.find({
            $or: [
                {
                    requester: userId,
                    recipient: friendId,
                },
                {
                    requester: friendId,
                    recipient: userId,
                },
            ],
        });
        console.log("🚀 ~ file: addFriend.ts:16 ~ addFriend ~ existedFriend:", existedFriend);
        if (existedFriend.length > 0) return null;
        const requester = new FriendsModel({
            requester: userId,
            recipient: friendId,
            status: FriendStatus.PENDING,
        });
        const recipient = new FriendsModel({
            requester: friendId,
            recipient: userId,
            status: FriendStatus.REQUESTED,
        });
        console.log("🚀 ~ file: Friend.ts:91 ~ FriendService ~ addFriend ~ requester:", requester)
        await requester.save();
        await recipient.save();
        const requesterUser = await UserModel.findByIdAndUpdate(userId, {
            $push: {
                friends: requester,
            },
        });
        const log = await LogService.createLog({
            content: `You send friend request to ${friendId}`,
            type: LogTypeEnum.SEND_FRIEND_REQUEST,
            by: requesterUser!,
        })
        await requesterUser!.updateOne({
            $push: {
                logs: log._id
            }
        })
        const recipientUser = await UserModel.findByIdAndUpdate(friendId, {
            $push: {
                friends: recipient,
            },
        });
        return {
            receipt: {
                _id: recipient._id,
                status: recipient.status,
                createdAt: recipient.createdAt,
                updatedAt: recipient.updatedAt,
                user: requesterUser,
            },
            request: {
                _id: requester._id,
                status: requester.status,
                createdAt: requester.createdAt,
                updatedAt: requester.updatedAt,
                user: recipientUser,
            },
        }
    }

    static async getFriend(userId: string){
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId,
                },
            },
            {
                $lookup: {
                    from: "friends",
                    localField: "friends",
                    foreignField: "_id",
                    as: "friends",
                },
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    lastOnline: 1,
                    friends: {
                        $map: {
                            input: "$friends",
                            as: "friend",
                            in: {
                                _id: "$$friend._id",
                                status: "$$friend.status",
                                createdAt: "$$friend.createdAt",
                                updatedAt: "$$friend.updatedAt",
                                user: {
                                    $cond: {
                                        if: {
                                            $eq: ["$$friend.requester", userId],
                                        },
                                        then: "$$friend.recipient",
                                        else: "$$friend.requester",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $lookup:{
                    from: "users",
                    localField: "friends.user",
                    foreignField: "_id",
                    as: "users",
                }
            }
        ]);
        return user;
    }
    
}
