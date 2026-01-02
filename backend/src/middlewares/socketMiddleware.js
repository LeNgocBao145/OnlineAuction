import jwt from "jsonwebtoken";
import { getUserById } from "../libs/sqlQuery.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if(!token){
            return next(new Error("Unauthorized - Token is non-existed!"));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if(!decoded){
            return next(new Error("Unauthorized - Access token is expired or invalid!"));
        }

        const user = await query(getUserById, [decoded.userId]);

        if(!user) {
            return next(new Error("User is not existed!"));
        }

        socket.user = user;

        next();
    } catch (error) {
        console.error("Error when verify JWT in socketAuthMiddleware", error);
        return next(new Error("Unauthorized"));        
    }
}