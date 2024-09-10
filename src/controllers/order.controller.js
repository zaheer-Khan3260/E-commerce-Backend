import mongoose from "mongoose";
import { Order_item } from "../models/order_items.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const placeOrder = asyncHandler( async (req, res) => {
    const user_id = req.user._id;
    const { items } = req.body;

    if(!user_id) {
        throw new ApiError(
            401, 
            "User not authenticated"
        );
    }

    if(items.length === 0) {
        throw new ApiError(
            400,
            "No items in the order"
        );
    }

    const session = await mongoose.startSession();
    if(!session){
        throw new ApiError(500,"Failed to start session");
    }
    session.startTransaction();

    try {

        let totalAmount = 0;
        let orderItems = [];

        for(const item of items){
            const product = await Product.findById(item.product_id).session(session);
            if(!product){
                throw new ApiError(
                    404,
                    `Product ${item.product_id} not found`
                );
            }
    
            if(product.stock < item.quantity){
                throw new ApiError(
                    400,
                    `Insufficiant stock for product ${item.product_id}`
                );
            }
            
            totalAmount += product.price * item.quantity;

            orderItems.push({
                product_id: product._id,
                quantity: item.quantity,
                price: product.price
            });

            product.stock -= item.quantity;
            await product.save({ session });
        }

        const order = new Order({
            user_id,
            total_amount: totalAmount,
            status: 'Pending'
        });

        await order.save({ session });

        for(const item of orderItems){
            const orderItem = new Order_item({
                order_id: order._id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            });

            await orderItem.save({ session });
        };

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(
                201,
                order,
                "Order placed successfully"
            )
        )
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(
            500,
            error.message
        )
    }
});

export const viewOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

   try {
     const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 });
 
     if (orders.length === 0) {
         throw new ApiError(404, "No orders found for this user");
     }
 
     let orderHistory = [];
 
     for (let order of orders) {
 
         const orderItems = await Order_item.find({ order_id: order._id }).populate('product_id');
 
         if (orderItems.length === 0) {
             throw new ApiError(404, "No order items found for this order");
         }
 
         orderHistory.push({
             order_id: order._id,
             user_id: order.user_id,
             total_amount: order.total_amount,
             status: order.status,
             order_items: orderItems.map(item => ({
                 product_id: item.product_id._id,
                 product_name: item.product_id.name,
                 quantity: item.quantity,
                 price: item.price
             })),
             createdAt: order.createdAt,
             updatedAt: order.updatedAt
         });
     }
 
     res.status(200).json(
         new ApiResponse(200, orderHistory, "Order history retrieved successfully")
     );
   } catch (error) {
    throw new ApiError(
        500,
        error.message
    )
   }
});


export const viewSingleOrder = asyncHandler(async (req, res) => {
    const id = req.params.id;

    if(!id){
        throw new ApiError(
            400,
            "Id is Required"
        );
    }

    const order = await Order.findById(id)
    if(!order){
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    const orderItems = await Order_item.find({ order_id: order._id }).populate('product_id');
    if(!orderItems){
        throw new ApiError(
            404,
            "No order items found for this order"
        );
    }

    const order_details = [
        {
            order_id: order._id,
            user_id: order.user_id,
            total_amount: order.total_amount,
            status: order.status,
            order_items: orderItems.map(item => ({
                product_id: item.product_id._id,
                product_name: item.product_id.name,
                quantity: item.quantity,
                price: item.price
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }
    ]


    return res.status(200).json(
        new ApiResponse(
            200,
            order_details,
            "Order fetched successfully"
        )
    )
})

export const cancelOrder = asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!id) {
        throw new ApiError(400, "Order ID is required");
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "completed") {
        throw new ApiError(400, "Completed orders cannot be canceled");
    }

    const orderItems = await Order_item.find({ order_id: order._id }).populate('product_id');

    for (const item of orderItems) {
        const product = item.product_id;
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    await Order_item.deleteMany({ order_id: order._id });

    await Order.findByIdAndDelete(order._id);

    res.status(200).json(
        new ApiResponse(200, null, "Order and related items have been deleted successfully")
    );
});
