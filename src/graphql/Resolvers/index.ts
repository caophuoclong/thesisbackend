import { AuthResult } from "express-oauth2-jwt-bearer";
import { Query } from "./Query";
import { Mutation } from "./Mutation";

export const resolvers = {
    Query,
    Mutation,
};
