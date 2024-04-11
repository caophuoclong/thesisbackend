import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { EnumTypedef, InputTypeDef, MutationTypeDef, QueryTypeDef, TypeDef } from "./graphql/typedefs";
import { resolvers } from "./graphql/Resolvers";
import { auth } from "express-oauth2-jwt-bearer";
import cors from "cors";
import { json } from "body-parser";
import express from "express";
import { verify } from "./middlewares/verify";
import { authController } from "./controller/auth.controller";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from 'socket.io';
import mongoose from "mongoose";
import * as jwt from "jsonwebtoken"
import * as fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./Interfaces/ISocket";
import {Socket} from "./sockets"
import { verifyToken } from "./middlewares";
  
  
dotenv.config();
(async () => {
    mongoose.connect(process.env.READ_DB_URL!)
    .then(async ()=>{
    console.log("Connected to database...");
    const app = express();
    const httpServer = createServer(app);
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer);
    const socket = Socket.getInstance();
    socket.io = io;
    const server = new ApolloServer({
        typeDefs: [EnumTypedef, TypeDef, InputTypeDef, MutationTypeDef, QueryTypeDef],
        resolvers,
    });
    app.use(cors({ origin: "*", credentials: true }));
    const PORT = +(process.env.PORT || 26031);
    const jwtCheck = auth({
        audience: "http://localhost:26031",
        issuerBaseURL: "https://dev-kwz2txyk.us.auth0.com/",
        tokenSigningAlg: "RS256",
    });
    await server.start();
    app.use(bodyParser.json());
    app.use("/auth", verify);
    app.post("/auth", authController.onSignUp);

    app.use(
        "/graphql",
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
            context: 
            async ({ req, res }) => {
                try{
                    const token = req.headers.authorization?.split(" ")[1];
                    // console.log("🚀 ~ file: index.ts:59 ~ token:", token)
                    if(!token) return res.status(403).send("No token provided");
                    const user =await verifyToken(token);
                    req.auth = {
                        payload: user,
                        header: { alg: "RS256", typ: "JWT", kid: "" },
                        token: token,
                    }
                    return req.auth;
                    // req.auth = {
                    //     payload: {
                    //         nickname: "caophuoclong1",
                    //         name: "caophuoclong1@gmail.com",
                    //         picture:
                    //             "https://s.gravatar.com/avatar/74aad8db19f9e8fc415a0e80048ceaf1?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fca.png",
                    //         updated_at: "2023-09-21T17:09:54.301Z",
                    //         email: "caophuoclong1@gmail.com",
                    //         email_verified: true,
                    //         iss: "https://dev-kwz2txyk.us.auth0.com/",
                    //         aud: "pR0khcclv6cva5WKLRs0n4oO9DZoEj61",
                    //         iat: 1695316196,
                    //         exp: 1695352196,
                    //         sub: "google-oauth2|118248810453691006155"                        ,
                    //         sid: "WURBxwOp-zNlQ9Yihhh8awvDpLT4zkWw",
                    //         nonce: "wiShVK4gNtsLYTCowdNDBAnC-AmrJhkT-M6sZZvRNW4",
                    //     },
                    //     header: { alg: "RS256", typ: "JWT", kid: "" },
                    //     token: "",
                    // };
                    // return req.auth;
                }catch(error){
                    console.log("🚀 ~ file: index.ts:93 ~ error:", error)
                    return res.status(401).send("Unauthorized");
                }
                
            },
        }
        ),
    );
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
    })
    .catch((err)=>{
        console.log("Error connecting to database...");
        console.log(err);
    })
})();
