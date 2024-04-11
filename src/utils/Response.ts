import { ResponseStatus } from "../enum";

export function Response(status: ResponseStatus, message: string, data?: any) {
    return {
        __typename: "Response",
        status,
        message,
    };
}
