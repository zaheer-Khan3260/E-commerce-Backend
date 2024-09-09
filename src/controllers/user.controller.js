import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save(
            { 
                validateBeforeSave: false 
            }
        )

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(
            500, 
            error.message
        )
    }
}

export const userRegistration = asyncHandler(async (req, res) => {
    
    const {username, email, password} = req.body

    if(!username && !password && !email){
        throw new ApiError(
            406, 
            "All fields required"
        );
    } 
        
    const existingUser = await User.findOne({email});

    if(existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    const user = await User.create({
        username,
        email, 
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(
            500, 
            "Failed to create a new User"
        )
    }
        res.status(200).json(
            new ApiResponse(
                200,
                createdUser,
                "User registered successfully"
            )
        )
});

export const userLogin = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email && !password) {
            throw new ApiError(
                406, 
                "All fields required"
            );
        }
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            )
        };
        const passwordValidation = await user.isPasswordCorrect(password);

        if(!passwordValidation){
           throw new ApiError(
                401,
                "Invalid credentials"
           )
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

        const updatedUser = await User.findByIdAndUpdate(
            user._id,    
        ).select("-password -refreshToken")
        
        if(!updatedUser){
            throw new ApiError(
                500,
                "Failed to update user"
            )
        }
        const option = {
            httpOnly : true,
            secure: true
        };

        return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User logged in successfully"
            )
        )
});


export const viewProfile = asyncHandler(async (req, res) => {
    console.log("req params data: ", req.params);
        const id = req.params.id
            console.log("id: ", id)
        if(!id){
            throw new ApiError(
                400,
                "Invalid user ID"
            )
        }

        const user = await User.findById(new mongoose.Types.ObjectId(id))
        .select("-password -refreshToken")

        if(!user){
            throw new ApiError(
                404,
                "User not found"
            )
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                user,
                "User profile fetched successfully"
            )
        )
});

export const updateProfile = asyncHandler(async (req, res) => {

    const id = req.params.id
    const {username, email} = req.body

    if(!id){
        throw new ApiError(
            400,
            "Invalid user ID"
        )
    }

    if(!username && !email){
        throw new ApiError(
            406,
            "At least one field required"
        )
    }
    const user = await User.findById(id)

    if(!user){
        throw new ApiError(
            404,
            "User not found"
        )
    }

    user.email = email? email : user.email;
    user.username = username? username : user.username;
    user.save(
        {
            validateBeforeSave: false
        }
    )
    const updatedUser = await User.findById(id).select("-password -refreshToken")
    if(!updatedUser){
        throw new ApiError(
            404,
            "User not found"
        )
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "User profile updated successfully"
        )
    )
});


