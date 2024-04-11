import { MessageService } from "../../../../services/message";

export default function sendMessage(parent, { input }, context, info) {
    console.log("🚀 ~ file: create.ts:4 ~ createMessage ~ input:", input);
    return MessageService.createMessage(input);
}
