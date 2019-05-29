let mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    isAdmin: Boolean,
    name: String,
    roomID: String,
})
const UserModel = mongoose.model('user', UserSchema);


module.exports = UserModel;

module.exports.createUser = function(isAdmin, name, roomID) {
    new UserModel({
        isAdmin: isAdmin,
        name: name,
        roomID: roomID,
    }).save();
  
}

module.exports.deleteUser = function(id){
    UserModel.findOneAndRemove({roomID: id })
    .then((response)=>{
        console.log(response)
    })
    .catch((err) =>{
        console.log(err);
    })
}