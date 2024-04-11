export class NotificationService {
    private static instance: NotificationService;
    constructor() {}
    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    public notifyUser(
        userId: string,
        data: {
            message: string;
            payload?: any;
        },
    ) {}
    public notifyUsers(
        userIds: string[],
        data: {
            message: string;
            payload?: any;
        },
    ) {}
    public notifyConversation(
        conversationId: string,
        data: {
            message: string;
            payload?: any;
        },
    ) {}
    public notifyConversations(
        conversationIds: string[],
        data: {
            message: string;
            payload?: any;
        },
    ) {}
}
