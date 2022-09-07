

const router = require("express").Router();
const fetch = require("cross-fetch");
// const stripe = require("stripe")(process.env.STRIPE_KEY);
const KEY = process.env.STRIPE_KEY



const stripe = require("stripe")(process.env.STRIPE_KEY);





router.get("/payment/search/:id", async (req, res) =>{
  try {

    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ['customer','line_items', 'payment_intent'],
    });
    
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json(error);
  }
  
})



router.post("/payment", async (req, res) => {

  
  //possible solution to explore
  const coupon = await stripe.coupons.create({percent_off: 15, duration: 'once'});
  

  
  const childrenResponses = await Promise.all(
    req.body.products.map((product) =>
      fetch(process.env.APP_API + `products/find/${product.id}`)
            .then(response=>response.json())
            .then(res => {
              
              return res
            })
            .catch(e => {
            console.error(e.error)
            })
    )
  );

 
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      allow_promotion_codes:true,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Next day delivery',
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            }
          }
        },
      ],
      line_items: childrenResponses.map(item => {
        const productID = item._id
        const quantity = req.body.products.filter((item)=>item.id == productID)[0].quantity;
        
        
        return {
          price_data: {
            currency: "usd",
            tax_behavior: "inclusive",
            product_data: {
              name: item.title,
              images: [item.img],
              
              
            },
            unit_amount: item.storePrice * 100,
          },
          quantity: quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/success/` + '{CHECKOUT_SESSION_ID}',
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    })
    res.json({ id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  });








// stripe.charges.create(
//   {
//     source: req.body.tokenId,
//     amount: req.body.amount,
//     currency: "usd",
//   },
//   (stripeErr, stripeRes) => {
//     if (stripeErr) {
//       res.status(500).json(stripeErr);
//     } else {
//       res.status(200).json(stripeRes);
//     }
//   }
// );

module.exports = router;