import { convertBigintToNumber } from "../../../../utils/index";
import { ConversationService } from "../../../../services/Conversation";
export default async function getConversation(parent, args) {
    const { id, userId } = args;
    return ConversationService.getConversation(id, userId);
}
