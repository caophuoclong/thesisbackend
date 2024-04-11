import { ConversationService } from "../../../../services/Conversation";

export function updateReceivedAllMessage(parent, {  }, context, info) {
    const { sub } = context.payload;
    return ConversationService.updateReceivedAllMessage(sub);
}