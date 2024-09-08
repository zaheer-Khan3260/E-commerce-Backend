import mongoose, {Schema} from "mongoose";


const orderSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        total_amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["Pending", "Canceled", "Completed"]
        },
    },
    {
        timestamps: true,
    }

)



export const Order = mongoose.model('Order', orderSchema);