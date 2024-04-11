import { ConversationService } from "../../../../services/Conversation";

export function updateMessageStatusInConversation(parent, { conversation }, context, info) {
    const { sub } = context.payload;
    console.log("🚀 ~ file: updateStatus.ts:5 ~ updateMessageStatusInConversation ~ sub:", sub)
    return ConversationService.updateStatus(conversation, sub);
}
