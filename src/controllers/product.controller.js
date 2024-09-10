import { Product } from "../models/product.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";



export const listProducts = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        sort_by = 'createdAt', 
        order = 'desc',
        search = ''
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const sortOptions = {};
    sortOptions[sort_by] = order === 'asc' ? 1 : -1;

    const searchQuery = search
        ? { name: { $regex: search, $options: 'i' } }
        : {};

    const totalProducts = await Product.countDocuments(searchQuery);

    const products = await Product.find(searchQuery)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    if (!products.length) {
        throw new ApiError(404, "No products found");
    }

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json(
        new ApiResponse(200, {
            products,
            currentPage: pageNumber,
            totalPages,
            totalProducts
        }, "Products retrieved successfully")
    );
});


export const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock } = req.body;

   
    if (!name || !description || !price || stock === undefined) {
        throw new ApiError(
            400, 
            "All fields (name, description, price, stock) are required"
        );
    }

    
    if (typeof price !== 'number' || price <= 0) {
        throw new ApiError(
            400, 
            "Price must be a positive number"
        );
    }

    if (!Number.isInteger(stock) || stock < 0) {
        throw new ApiError(
            400, 
            "Stock must be a non-negative integer"
        );
    }

    // Create new product
    const newProduct = await Product.create({
        name,
        description,
        price,
        stock
    });

    // Check if product was created successfully
    if (!newProduct) {
        throw new ApiError(
            500, 
            "Failed to create product"
        );
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(
            201,
            newProduct,
            "Product created successfully"
        )
    );
});


export const viewSingleProduct = asyncHandler(async (req, res) => {

    const id = req.params.id

    if(!id){
        throw new ApiError(
            400,
            "Cann't find Product id"
        );
    };

    const product = await Product.findById(id)

    if(!product){
        throw new ApiError(
            404,
            "Product not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "Product fetched successfully"
        )
    )
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const { name, stock, description, price } = req.body;

    if (!name && stock === undefined && !description && price === undefined) {
        throw new ApiError(
            400, 
            "At least one field (name, stock, description, price) is required for update"
        );
    };


    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(stock !== undefined && { stock }),
                ...(description && { description }),
                ...(price !== undefined && { price })
            }
        },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        throw new ApiError(
            404, 
            "Product not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedProduct,
            "Product updated successfully"
        )
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {

    const id = req.params.id

    if(!id){
        throw new ApiError(
            400,
            "Cann't find Product id"
        );
    }

    const deletedProduct = await Product.findByIdAndDelete(
        new mongoose.Types.ObjectId(id)
    );

    if(!deletedProduct){
        throw new ApiError(
            404,
            "Product not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedProduct,
            "Product deleted successfully"
        )
    );

});


