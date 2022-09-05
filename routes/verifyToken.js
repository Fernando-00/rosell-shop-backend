const jwt = require("jsonwebtoken");
const fetch = require("cross-fetch");


const verifyToken = (req, res, next)=>{
    const authHeader = req.headers.token
    console.log(authHeader)
    console.log(req.headers)
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user)=>{
            if(err) res.status(403).json("Token is not valid!");
            
            req.user = user;
            next();
        });
    }else{
        return res.status(401).json("You are not authenticated!");
    }
};


const verifyStripe = (req, res, next)=>{
    console.log(req.body.stripeId)
    if(req.body.stripeId){
        fetch(`http://localhost:5000/api/checkout/payment/search/${req.body.stripeId}`)
            .then(res => {
                if (res.ok) return next()
                return res.json().then(json => Promise.reject(json))
            })
            .catch(e => {
                return res.status(401).json("You are not authenticated!");
            })

    }else{
        return res.status(401).json("You are not authenticated!");
    }
};

const verifyTokenAndAuthorization = (req, res, next) =>{
    console.log(req.params)
    console.log(req.user)
    verifyToken(req, res, ()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You are not allowed to do that!");
        }
    });
};


const verifyTokenAndAdmin = (req, res, next) =>{
    verifyToken(req, res, ()=> {
        console.log(req)
        if(req.user.isAdmin){
            next();
        }else{
            console.log(req)
            res.status(403).json("You are not allowed to do that!");
        }
    });
};

module.exports = {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyStripe}