import { MessageService } from "../../../../services/message";

export function updateMessageStatus(parent, { input: { message_id, status } }, context, info) {
    const { sub } = context.payload;
    return MessageService.changeStatus({
        messageId: message_id,
        newStatus: status,
        userId: sub,
    });
}
