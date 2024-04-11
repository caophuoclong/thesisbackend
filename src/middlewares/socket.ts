import { verifyToken } from ".";

export const socketAuthenticator = async (socket, next) => {
    const token = socket.handshake.auth.token ? socket.handshake.auth.token : socket.handshake.headers.token;
    try {
        // console.log("🚀 ~ file: socket.ts:7 ~ socketAuthenticator ~ token:", token)
        const user = await verifyToken(token);
        socket.data.user = user;
        next();
    } catch (error) {
        console.log("Error");
    }
};
