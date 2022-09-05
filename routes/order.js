const Order = require("../models/Order");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyStripe } = require("./verifyToken");

const router = require("express").Router();


//CREATE

router.post("/", verifyStripe, async (req, res)=>{
    console.log(req)
    const newOrder = new Order(req.body);

    try{
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    }catch(err){
        res.status(500).json(err)
    }
});




//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res)=>{
    
    try{
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new:true}
        );
        res.status(200).json(updatedOrder);
    }catch(err){res.status(500).json(err);
    }
});


//DELETE

router.delete("/:id", verifyTokenAndAdmin, async (req, res)=>{
    try{
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Product has been deleted...")
    }catch(err){
        res.status(500).json(err)

    }
});


//GET USER ORDER

router.get("/find/:id", verifyTokenAndAuthorization,async (req, res)=>{
    
    
    console.log("HEHEEHE")
    try{
        const orders = await Order.find({userId: req.params.id});

        res.status(200).json(orders);
    }catch(err){
        res.status(500).json(err)

    }
});






//GET ALL ORDERS

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  });

//GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req,res)=>{
    const productId = req.query.pid;
    const date = new Date();
    //create last month
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    //create 2 months back (ex: if September previousMonth would be July)
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try{
        const income = await Order.aggregate([
            {$match:{createdAt:{$gte:previousMonth}, ...(productId && {
                products:{$elementMatch:{productId}},
            })}},
            {
                // order the orders by their month and the amount of
                // sales they generated
                $project:{
                    month:{$month:"$createdAt"},
                    sales:"$amount"
                },
            },
            // group all the orders greater than the previous month 
            //by their id(month) and calculate total sales by 
            //calculating sum    
            {
                $group:{
                    _id:"$month",
                    total:{$sum:"$sales"},
                }
            },
                  
        ]);
        // send status if income calculation was a success
        res.status(200).json(income);
    }catch(err){
        res.status(500).json(err);
    }
});





module.exports = router;