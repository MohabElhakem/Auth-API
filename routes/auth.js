const express = require('express');
const router = express.Router();
const path = require('path');
const utils = require(path.join(__dirname,'..','utils/usersDB.js'));
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

router.post('/login',async(req , res)=>{
    try {
        const {username , password} = req.body;
        // check if user name and password are provided
        if(!username || !password){
            return res.status(400).send("Username and Password are required.");
        }

        //search for the user in the database
        const Infos = await utils.FindUser(username);
    
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

module.exports= router;