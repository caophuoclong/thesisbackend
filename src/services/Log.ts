import LogModel, { LogTypeEnum } from "../models/Log.model";
import { UserType } from "../models/User.model";

export class LogService{
    private static instance: LogService;
    constructor(){

    }
    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }
    public static async createLog({content, by, type}: {
        content: string;
        by: Partial<UserType>;
        type: LogTypeEnum
    }){
        const log = await LogModel.create({
            content,
            by: by._id,
            type
        });
        await log.save();
        return log;
    }
    public static async createManyLog(logs: {
        content: string;
        by: UserType;
        type: LogTypeEnum
    }[]){
        return await Promise.all(logs.map(async(log)=> this.createLog(log)));
    }
}