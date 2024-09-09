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
            "Something went wrong while generating referesh and access token"
        )
    }
}

export const userRegistration = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body

    if(!username && !password && !email){
        return new ApiError(
            406, 
            "All fields required"
        );
    } 
        
    const existingUser = await User.findOne({email});

    if(existingUser) {
        return new ApiError(409, "Email already exists");
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
        return new ApiError(
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

        if (!email ||!password) {
            return new ApiError(
                406, 
                "All fields required"
            );
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return new ApiError(
                404,
                "User not found"
            )
        };
        
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if(!isPasswordCorrect){
            return new ApiError(
                401,
                "Invalid credentials"
            )
        }
        
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

        const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

        const option = {
            httpOnly : true,
            secure: true,
            sameSite: 'None'
        };

        return res.status(200)
        .cookies("accessToken", accessToken, option)
        .cookies("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                "User logged in successfully"
            )
        )
});


export const viewProfile = asyncHandler(async (req, res) => {
        const id = req.params.id

        if(!id){
            return new ApiError(
                400,
                "Invalid user ID"
            )
        }

        const user = await User.findById(id)
        .select("-password -refreshToken")

        if(!user){
            return new ApiError(
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
        return new ApiError(
            400,
            "Invalid user ID"
        )
    }

    if(!username && !email){
        return new ApiError(
            406,
            "At least one field required"
        )
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                username,
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    if(!updatedUser){
        return new ApiError(
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


