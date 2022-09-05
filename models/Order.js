const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema(
    {
        userId:{type:String},
        orderId:{type:String, required: true},
        stripeID:{type:String},
        products: [
            {
                productId:{
                    type:String,
                },
                quantity: {
                    type:Number,
                    default: 1,
                },
                name:{
                    type:String,
                },
            },
        ],
        dataProducts:{type:String},
        amount: {type:Number, required:true},
        address:{ type:Object, required:true },
        status:{type:String, default: "pending"},
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);