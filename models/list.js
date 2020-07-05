var mongoose = require("mongoose");
listSchema = mongoose.Schema({
    name : String,
    isCompleted : {type :Boolean,default:true} 
});
 module.exports = mongoose.model("list",listSchema);