const express = require ('express');
const app = express();
const authRouter = require('./routes/auth');

app.get('/',(req , res)=>{
    res.send("Welcome to my Auth API!")
});
//the homepage to the app
app.use(express.json());
//Middleware to parse JSON from POST requests
app.use('/auth',authRouter);
//Use the imported router under the /auth path

app.listen(3000,()=>{
    console.log('Server running on http://localhost:3000');
});
//Start the server on port 3000