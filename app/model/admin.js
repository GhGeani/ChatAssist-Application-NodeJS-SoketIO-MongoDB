let mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
    isAdmin: Boolean,
    name: String,
    roomID: String
})

module.exports = AdminModel = mongoose.model('admin', AdminSchema);

module.exports.createAdmin = function(isAdmin, name, roomID) {
     new AdminModel({
        isAdmin: isAdmin,
        name: name,
        roomID: roomID,
    }).save();
   
}

module.exports.deleteAdmin = function(id){
    AdminModel.findOneAndRemove({roomID: id })
    .then((response)=>{
        console.log(response)
    })
    .catch((err) =>{
        console.log(err);
    })
}