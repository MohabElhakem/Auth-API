const jwt = require('jsonwebtoken');

function authMiddleware (req , res ,next){
    // when some one go to the middelware look at the request header for somthing under authorization
    const authHeader = req.headers.authorization ; 

    //check if the key is even there and given correctly
    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "No token provided" });
    }

    //take the real key (token) 
    const token = authHeader.split(" ")[1];

    //check if the key is valied
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode; // attach the user data to the request
        next() //Pass control to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;

/**
 * Auth Middleware Story:
 *
 * 1. When a request comes in, this middleware looks for a special token in the
 *    "Authorization" header. This token acts like a secret key proving the user is logged in.
 *
 * 2. It checks if the header exists and starts with "Bearer ". If not, it immediately
 *    denies access with a 401 Unauthorized error.
 *
 * 3. If the token is present, it extracts the actual token string (the secret key).
 *
 * 4. The middleware then verifies this token using a secret key stored on the server.
 *    This confirms the token was issued by us and hasn't expired or been tampered with.
 *
 * 5. If the token is valid, the decoded user information (like user ID) inside the token
 *    is attached to the request object as `req.user` so later code knows who is making the request.
 *
 * 6. The middleware calls `next()` to let the request continue to the protected route.
 *
 * 7. If the token is invalid or missing, the middleware responds with a 401 Unauthorized error,
 *    preventing access to protected routes.
 *
 * This way, only users with a valid token can access routes guarded by this middleware.
 */