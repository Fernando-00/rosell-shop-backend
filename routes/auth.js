const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken")

//REGISTER

router.post("/register", async (req, res)=>{

    console.log(req.body)

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC)
        .toString(),
        img: req.body.img ? req.body.img : "https://usercontent.one/wp/info-ted.eu/wp-content/uploads/2019/12/profile-photo.png" ,
        fullname: req.body.fullname ? req.body.fullname : "",
        phone: req.body.phone ? req.body.phone : "",
        address: req.body.address ? req.body.address : "",
        gender: req.body.gender ? req.body.gender : "",
    });


    try{
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }catch(err){
        res.status(500).json(err);
    }
    
});


//LOGIN

router.post("/login", async (req, res)=>{
    try{
        const user = await User.findOne({username:req.body.username});
        
        if(!user) {
            return res.status(401).json("Wrong credentials")
            
        } 

        const hashedPassword = CryptoJS.AES.decrypt
        (user.password, process.env.PASS_SEC);

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        

        if (originalPassword !== req.body.password){
            return res.status(401).json("Wrong credentials");
            
        }
        
        const accessToken = jwt.sign({
            id:user._id, 
            isAdmin: user.isAdmin,
        }, 
        process.env.JWT_SEC,
        {expiresIn:"1d"}
        );
        const { password, ...others } = user._doc;

        res.status(200).json({...others, accessToken});
    } catch(err){
        res.status(500).json(err)
    }
    

});

module.exports = router;