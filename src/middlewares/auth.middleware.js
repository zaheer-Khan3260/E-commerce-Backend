import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import {asyncHandler} from "../utils/asyncHandler.js";


export const verifyJwt = asyncHandler(async (req, _, next) => {

    try {

        const token = req.cookies?.accesstoken || req.headers("Authorization")?.replace("Bearer ", "");

        if(!token) throw new ApiError(401, "unauthorized request");

        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

        const user = decodedToken;

        req.user = user;

        next();

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid access token");
    }
})