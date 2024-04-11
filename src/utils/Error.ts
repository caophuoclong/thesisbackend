import { ErrorType } from "../enum";

export function Error(type: ErrorType, message?: string) {
    return {
        __typename: "Error",
        type,
        message,
    };
}
