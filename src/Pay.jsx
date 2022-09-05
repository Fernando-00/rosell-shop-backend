import StripeCheckout from "react-stripe-checkout";
import {useState, useEffect} from "react"
import axios from "axios";



const Pay = () => {

    const [stripeToken, setStripeToken] = useState(null);
    const history = useHistory();

    const onToken = (token) =>{
        setStripeToken(token);
    };

    useEffect(()=>{
        const makeRequest = async () =>{
            try{
                const res = await axios.post("https:localhost:5000/api/checkout/payment", {
                    tokenId: stripeToken.id,
                    amount: 2000,
                });
                console.log(res.data);
                history.push("/success");
            }catch(err){
                console.log(err);
            }
        };
        stripeToken && makeRequest
    }, [stripeToken, history])

  return (
    <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}>
        {stripeToken ? (<span>Processing. Please wait ...</span>): (

        
        <StripeCheckout 
        name="Rosell Shop" 
        image="https://i.ibb.co/GVCj7MY/logo.png"
        billingAddress
        shippingAddressdecription = "Your total is $20"
        amount={2000}
        token={onToken}
        stripeKey= {process.env.STRIPE_PUBLISHABLE_KEY}>
            <button style={{
                border: "none",
                width: 120,
                borderRadius: 5,
                padding:"20px",
                backgroundColor: "black",
                color: "white",
                fontWeight: "600",
                cursor: pointer,
            }}>
                PAY NOW
            </button>
        </StripeCheckout>
        )}
    </div>
  );
};

export default Pay;