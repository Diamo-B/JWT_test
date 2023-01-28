const jwt = require('jsonwebtoken');

const checkAuthStatus =  (req, res, next) => {
    const token = req.cookies.jwt;

    //check if the token exists and is valid
    if(token)
    {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err)
            {
                console.log(err.Message);
                res.redirect('/login');
            }
            else    
            {
                console.log(decodedToken);
                next();
            }
        })
    }
    else
    {
        res.redirect('/login');
    }
} 

// check current user

const checkUser =  (req, res, next) => {
    const token = req.cookies.jwt;

    if(token)
    {
        jwt.verify(token,process.env.JWT_SECRET, async (err, decodedtoken)=>{
            if(err)
            {
                console.log(err);
                res.locals.currentUser = null; 
                next();
            }
            else
            {
                let user = await  req.app.locals.prisma.user.findUnique({
                    where:{
                        id: decodedtoken.id
                    }
                })
                res.locals.currentUser = user; 
                next();
            }
        })
    }
    else
    {
        res.locals.currentUser = null; 
        next();
    }
}

module.exports = { checkAuthStatus,checkUser }