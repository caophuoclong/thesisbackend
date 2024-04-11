import { UserType } from "../models/User.model";

export interface IUserService{
    getSystemUser(): Promise<UserType>;
    getUser(id: string): Promise<UserType | null>;
    getManyUser(ids: string[]): Promise<UserType[]>;
}