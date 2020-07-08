const express = require("express"),
      mongoose = require("mongoose"),
      bodyparser = require("body-parser"),
      User=require("./models/user.js"),
      Lists=require("./models/list.js"),
      flash = require("connect-flash"),
      passport= require("passport"),
      LocalStartegy = require("passport-local"),
      passportlocalmongoose= require("passport-local-mongoose");
const Passport = require("passport"),
     methodoverride= require("method-override");
const user = require("./models/user.js");
var app= express();
require("dotenv").config();
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);
var url = process.env.databaseURL || "mongodb://localhost:27017/project1";
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify: false});
app.set("view engine","ejs");
app.use(methodoverride("_method"));
app.use(require("express-session")({
  secret : "keep this secret",
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
Passport.use(new LocalStartegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static("public"));
app.use(flash());
app.use(bodyparser.urlencoded({extended : true}));
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
 res.locals.error = req.flash("error");
 res.locals.success = req.flash("success");
  next();
});
//==============Landing Route=============//
app.get("/",function(req,res){
  res.render("index");
});

//==============Todolist Routes======================//
app.get("/todolist",isLoggedIn,function(req,res){
   User.findByUsername(req.user.username).populate("lists").exec(function(Error,founduser){
           if(Error)
        {
          console.log(Error.message+"1");
          req.flash("error","Something Went Wrong");
        }
            else
            {
              res.render("todolist",{user : founduser});
            }
   });
});
app.post("/todolist",function(req,res){
     User.findById(req.user._id,function(Error,user){
          if(Error)
          {
            console.log(Error);
            req.flash("error","Something Went Wrong"); 
          }
          else
          {
            var newlistitem ={
              name : req.body.listitemname
            };
            Lists.create(newlistitem,function(Error,listitem){
                    if(Error)
                    {
                      console.log(Error.message+"2");
                      req.flash("error","Something Went Wrong"); 
                    }
                    else
                    {
                      user.lists.push(listitem);
                      user.save();
                      res.redirect("/todolist");
                    }
            });
          }
     });
});
//=========================Register Routes=================//
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    var username = req.body.username;
     var newUser = {
       username : username
     };
     User.register(newUser,req.body.password,function(Error,user){
       if(Error)
       {
         console.log("Error");
         req.flash("error",Error.message); 
         res.redirect("/register");
       }
       else{
         Passport.authenticate("local")(req,res,function(Error){
                    if(Error)
                    {
                      console.log(Error.message+"3");
                      req.flash("error",Error.message);
                    }
                    else
                    {
                      req.flash("success","Successfully signed up ,"+req.user.username);
                      res.redirect("/todolist")
                    }
         });
       }
     })
   
  

});
//=========================Login Routes=====================//
app.get("/login",function(req,res){
  if(req.isAuthenticated())
    res.redirect("/todolist");
  else
   res.render("login");
});
app.post("/login",passport.authenticate("local",{
  successRedirect : "/todolist",
  failureRedirect : "/login"
}),function(req,res){});
//================logout Route======================================//
app.get("/logout",function(req,res){
   req.logOut();
   req.flash("success","Successfully logged out");
   res.redirect('/');
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
    return next();
    req.flash("error","You must login first to do")
	res.redirect("/login");
}
//===============Delete Item Route ============================//
app.delete("/:id",function(req,res){
     Lists.findByIdAndRemove(req.params.id,function(Error){
        if(Error)
        console.log(Error+"5");
        else
        {
          res.redirect("/todolist");
        }
     });
});
//=====================update Listitem==================================//
app.put("/:id",function(req,res){
        Lists.findById(req.params.id,function(Error,listitem){
             if(Error)
              console.log(Error.message);
              else{
                listitem.isCompleted=!listitem.isCompleted;
                listitem.save();
                res.redirect("/todolist");
              }
        });
});
app.listen(process.env.PORT || 5500,function(){
     console.log("Server Started..");
});