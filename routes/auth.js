const express = require('express');
const router = express.Router();
const utils = require('../utils/usersDB');

router.post ('/register', async(req , res )=>{
    try{
        const { Username , Password } = req.body ;
        if (!Username || !Password){
            return res.status(400).send("Username and Password are required.");
        }
        await utils.NewUser(Username,Password);
        res.status(201).send("User registered successfully.");
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error.");   
    }
});
//#region 
// We use express.Router() here to create a modular, mini Express app.
// This lets us define routes (like /register) in separate files,
// keeping our project organized and making it easy to maintain.
// Later, we import this router into app.js and mount it with a base path (e.g. /auth)
//#endregion



module.exports= router;