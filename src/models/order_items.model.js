import mongoose, {Schema} from "mongoose";


const order_itemSchema = new Schema(
    {
        order_id: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }

    }
);


export const Order_item = mongoose.model('Order_item', order_itemSchema);