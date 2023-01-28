const jwt = require('jsonwebtoken');

let getSignUp = (req,res) => {
    return res.render('signUp')
}

let getLogin = (req,res) => {
    return res.render('login')
}

let signUp = async (req,res) => {
    //check if all the required fields are in!!     
    let required_fields = ['firstName','lastName','email','password']
    let form_fields = Object.keys({...req.body});
    let difference = required_fields.filter(x => !form_fields.includes(x));
    if(difference.length > 0)
    {
        console.log("the fields ["+difference+"] are required");
        return res.status(500).json('the fields ['+difference+"] are required");
    }
    let {firstName, lastName, email, password, middleName} = req.body;

    //check if the password is valid
    let regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    let isValid = regex.test(password);
    if(!isValid)
    {
        return res.status(500).json({errCode:"password", Message: "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character"});
    }
    
    //hashing the password
    let bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt();
    bcrypt.hash(password,salt).then(async (pass) => {
        // if it went well save the user with the hashed pass
        try {
            let user = await  req.app.locals.prisma.user.create({
                data:{
                    firstName,
                    lastName,
                    middleName,
                    email,
                    password: pass
                }
            })
            const token = createToken(user.id);
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge*1000 })
            return res.status(201).json({user: user.id});
        }
        catch (err) 
        {
            if(err.code == "P2002")
            {
                console.log(err);
                return res.status(500).json({errCode: "emailError",Message:"This email address is already registred!"});
            }
            else
            {
                console.log(err);
                return res.status(500).json({errCode:"unknown_err",Unknown_Error: err});
            }           
        }
    }).catch(err=>{
        console.log(err);
        return res.status(500).json({errCode:"bcrypt", error: err});
    }) 
} 


const maxAge = 3*24*60*60; //3days

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: maxAge 
    })
}

let login = async (req,res) => {
    let {email, password} =req.body;
    try
    {
        let user = await  req.app.locals.prisma.user.findFirst({
        where:{
            email: email
        }
        })
        if(user)
        {
            let bcrypt = require('bcrypt');
            const auth = await bcrypt.compare(password,user.password)
            if(auth)
            {
                const token = createToken(user.id); // create a new token containing the user Id
                res.cookie('jwt',token,{maxAge: maxAge}); // creates a cookie named jwt then saves the user token to it
                return res.status(200).json({user: user.id});
            }
            else
            {
                return res.status(401).json({errCode: "password",Message:'Incorrect Password'}); 
            }
        }
        else
            return res.status(401).json({errCode: "emailError",Message:'This email is not registred'}); 
    }
    catch (error) 
    {
        return res.status(401).json(error);
    }
}

let logout = (req,res) => {
    res.cookie('jwt',"",{maxAge: 1});
    res.redirect('/');
}

module.exports = {
    getSignUp,
    getLogin,
    signUp,
    login,
    logout
}