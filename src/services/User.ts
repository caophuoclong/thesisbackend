import { SYSTEM_ID } from '../configs';
import UserModel, { UserType } from '../models/User.model';
import { IUserService } from '../Interfaces/IUserservice';
import { Socket } from '../sockets';
export class UserService{
    private static instance: UserService;
    private socket: Socket | null = null;
    constructor(){
        this.socket = Socket.getInstance();
    }
    public static async getSystemUser(): Promise<UserType>{
        const user = await UserModel.findById(SYSTEM_ID);
        return user!;
    }
    
    public static async getUser(id: string) {
        const user = await UserModel.findById(id);
        return user;
    }
    public static async getManyUser(ids: string[]) {
        const users = await UserModel.find({
            _id: {
                $in: ids,
            },
        });
        return users;
    }
    public static async updateUser(id: string, data: any) {
        await UserModel.findByIdAndUpdate(id, data);
        return;
    }
    public static getInstance(){
        if(!UserService.instance){
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    public static async logout(id: string){
        this.getInstance().socket?.leaveRoom(id);
    }

}