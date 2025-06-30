
const fs = require ('fs').promises;
const bcrypt = require ('bcrypt');
const path = require('path');
const {v4:uuidv4} = require('uuid');

async function ReadData (path){
    try {
        const data = await fs.readFile(path , "utf-8" );
        return JSON.parse(data);
    }
    catch (err){
     console.error("Error reading data:", err);
     return [];
    }
};
//#region 
//require a fs .promises to get out from the call back hell 
//the data gets out in a js structure
//#endregion

async function NewUser (UserName, Password){
    try{
        const SafePassword = await bcrypt.hash(Password,10);
        const User = { username : UserName , password : SafePassword , id : uuidv4(), role : "user"};
        const filePath = path.join(__dirname,'..','users.json');
        const UserArr = await ReadData (filePath);
        UserArr.push(User); 
        await fs.writeFile(filePath,JSON.stringify(UserArr,null,2),"utf-8");
        console.log ('User added successfully');
    }catch(err){
        console.log('problem has occurred',err);
    }

};
//#region 
//the bcrypt.hash ads a sult and make a weird password
//it then extract the same sult and do the process again with the same sult when you compare it
//path.join(...parts)
// This method joins multiple path segments into one normalized file path.
// It's cross-platform, so it works on Windows, macOS, and Linux.

// Example:
// If __dirname is "/Users/mohab/Desktop/auth-API/utils"
// Then path.join(__dirname, '..', 'users.json') becomes:
// "/Users/mohab/Desktop/auth-API/users.json"

//We use this to safely reach the users.json file from the utils folder.
//#endregion

async function FindUser (userToBeFound){
    try {
        const users = await ReadData(path.join(__dirname,'..','users.json'));
        const userInfo = users.find(u=>u.username.toLowerCase()===userToBeFound.toLowerCase());
        if (userInfo ) {
            return{
                state : true,
                user : userInfo,
                safe : true,
                message : "User Found Successfully"
            } 
        }else{
            return{
                state : false,
                user : null,
                safe : true,
                message : "User not found"
           }
        }
    } catch (error) {
       return {
        state : false,
        user: null,
        safe: false,
        message: "A porblem has been occurred\t"+error.message
       }
    };
}
//#region 
//you returning an object of values to use all of them if needed 
// the state for conditioning and user to deal with
//safe is to check is it okay to make the user if not found
//but dont make the user if a proplem occurred
//#endregion

function VerifyThePassword (userPassworedToCheck,saltpassword){
    return bcrypt.compare(userPassworedToCheck,saltpassword);
}
//#region 
//The function returns a promise so alwyas make sure you use await with it 
//it returns true or false so its safe to use
//#endregion
    
    

module.exports = {ReadData , NewUser, FindUser , VerifyThePassword }