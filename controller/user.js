const User = require("../models/user");


module.exports.renderSignupForm =  (req,res) =>{
    res.render("users/signup.ejs");
}

module.exports.signup = async (req,res) =>{
    try{
    let {username, email, password} = req.body;
    const newUser= new User({email,username});
    const registerdUser= await User.register(newUser, password);

    req.login(registerdUser,(err)=> {
        if(err){
            return next(err);
        }
         req.flash("success", "Welcome to StayVista!");
         res.redirect("/listings");
    });
    
    }catch(err){
        req.flash("error", err.message );
        res.redirect("/signup");
    }   
  }


  module.exports.renderLoginForm =(req,res) =>{
    res.render("users/login.ejs");
}

module.exports.login =  async(req,res) =>{
    req.flash("success","Welcome to StayVista!");
    let redirectUrl= res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) =>{
    req.logout((err)=> {
        if(err){
          return  next(err);
        }
        req.flash("success", "Your are loggedOut!");
        res.redirect("/listings");
    })
}