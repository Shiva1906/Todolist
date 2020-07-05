var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");
 var list = require("./list");
var userSchema=mongoose.Schema({
   username : String,
   password : String,
   lists : [{
       type : mongoose.Schema.Types.ObjectId,
       ref : "list"
   }
]
});
userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("Users",userSchema);