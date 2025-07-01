const express = require('express');
const router = express.Router();
const path = require('path');
const utils = require(path.join(__dirname,'..','utils/usersDB.js'));
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {authMiddleware,blacklistedtokens} = require (path.join(__dirname,'..','middleware/authMW.js'));


//REGISTER ROUTE
router.post ('/register', async(req , res )=>{
    try{
        const { username , password } = req.body ;
        // check if user name and password are provided
        if (!username || !password){
            return res.status(400).send("username and password are required.");
        }
        //if true make the new user
        await utils.NewUser(username,password);
        res.status(201).send("User registered successfully.");
    }catch(err){
        //if any thing gone wrong
        console.log(err);
        res.status(500).send("Internal Server Error.");   
    }
});
//#region 
// We use express.Router() here to create a modular, mini Express app.
// This lets us define routes (like /register) in separate files,
// keeping our project organized and making it easy to maintain.
// Later, we import this router into app.js and mount it with a base path (e.g. /auth)
// req.body contains data sent by the client in the body of a POST, PUT, or PATCH request.
// It is usually used to access form data or JSON payloads, like login credentials or new user info.
// Requires middleware like express.json() to work properly.
// after the middleware it is in a js structure
//#endregion


//LOGIN ROUTE
router.post('/login',async(req , res)=>{
    try {
        const {username , password} = req.body;
        // check if user name and password are provided
        if(!username || !password){
            return res.status(400).send("Username and Password are required.");
        }

        //search for the user in the database
        const Infos = await utils.SearchBy("username" , username);
    
        // found the user and the search is succesfull
        if(Infos.safe && Infos.state){
        
            // start check the password
            const login = await utils.VerifyThePassword(password,Infos.user.password);
            
            // correct pass word make the token
            if (login) {
                const Payload = {
                    id: Infos.user.id,
                    role: Infos.user.role,
                    username: Infos.user.username
                }
                const token = jwt.sign(Payload,process.env.JWT_SECRET,{expiresIn:"1h"});
                return res.status(201).send("Token Has Been Issued\n" +token);
        
            }else{
                // wrong password
                return res.status(401).send("Wrong Password!!");
            }
    
        }else if (Infos.safe && !Infos.state){
            // user is not found in the database
            return res.status(404).send("User not found\nSign in First");
        }else if(!Infos.safe){

            // somthing happend while reading the user infos
            return res.status(500).send(Infos.massege)
        }
    } catch (error) {
        // server error while loging in 
        console.error("Login error:", error.message);
        return res.status(500).send(error.message);
    }
        
    
})
//#region 
//verify the password is a function that returns a promise so its i used await
//i made a return for every possiple outcome 
// i made a an usique id while making the user 
//the payload is every important information about the user 
// the JWT_SECREt is like auther password i need to make a sup file .env.example 
//the to make ppl taste the server 
//#endregion

//DELETE ROUTE
// the router have a middleware so you must provide a token for it to work 
router.delete('/profile/delete_acc',authMiddleware, async(req,res)=>{
    try {
        //first take the password from the user
        const givenPassword = req.body.password;
        
        //check if the password is provided
        if(!givenPassword){
            return res.status(400).send("Password is required");
        }
        
        //find the user to get the password
        const info = await utils.SearchBy('id',req.user.id);

        if (info.safe && info.state) {
            //found him now compare the passwords
            const allowed = await utils.VerifyThePassword(givenPassword,info.user.password);
            if(allowed){
                //its him delete the account and token as well 
                    blacklistedtokens.add(req.token);
                    await utils.DeleteUserById(req.user.id);
                    return res.status(200).send("WE WILL MISS YOU ......");
            }else{
                //password are wrong not him 
                return res.status(401).send("Wrong Password!!!!")
            }
        }else if (!info.safe){
            //the search function had a proplem
            return res.status(500).send(info.message)
        }else{
            // didn't find him while searching
            return res.status(404).send("User not found — maybe already deleted");
        }
    } catch (error) {
        console.log("Proplem in the deleting server",error.message)
        return res.status(500).send("The server encouterd a proplem")
    }

})


//PROFILE ROUTE
router.get("/profile",authMiddleware,async(req,res)=>{
    try {
        const search = await utils.SearchBy("id",req.user.id);
        if (search.safe && search.state){
            return res.status(200).json(search.user);
        }else if (search.safe && !search.state){
            return res.status(404).send("We don't have that user.......")
        }
        return res.status(400).send("Invalid user search result.");
    } catch (error) {
        console.log("Error geting the user profile",error.massege);
        return res.status(500).send("Error in profile router")
    }
})

//LOGOUT ROUTE
router.post("/profile/logout",authMiddleware,async(req,res)=>{
    try {
        //first take the password from the user
            const givenPassword = req.body.password;
            
            //check if the password is provided
            if(!givenPassword || !req.token){
                return res.status(400).send("Password and token are required");
            }
            
            //find the user to get the password
            const info = await utils.SearchBy('id',req.user.id);
    
            
            if(info.safe && info.state){
                // we found the user make sure its him 
                const logout = await utils.VerifyThePassword(givenPassword,info.user.password);
                if(logout){
                    blacklistedtokens.add(req.token);
                    console.log(blacklistedtokens);
                    return res.status(200).send("Logged out successfully");
                }else{
                    return res.status(401).send("Wrong Password!!");
                }
            }else if (info.safe && !info.state){
                // user is not found in the database
                return res.status(404).send("User not found\nSign in First");
            }else {
                // somthing happend while reading the user infos
                return res.status(500).send(info.message)
            }
    } catch (error) {
         // server error while loging out
        console.error("Login error:", error.message);
        return res.status(500).send(error.message);
    }

})

//#region 
//the logout uses a set instance to keep trak of thoken that blacklisted
//if it is it deny the acces to the route 
// in the future you will use somthing like mongoDB to deall with all of that
//#endregion
module.exports= router;