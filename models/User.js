var mongoose = require('mongoose');
var bcrypt= require('bcrypt');
const passport = require('passport');



var userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    
    password:{
        type: String,
        required: true
    },

    username : {
        type: String,
    },
    
    contact: {
        type: Number,
    },

    address: {
        type: String,
    },

    image: {
        type: String,
        default : '/upload/simple_avatar.png',
    },

    hasAuth: {
        type: Boolean,
        default : false,
    }
});
 
userSchema.methods.hashPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5),null);
}

userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User',userSchema);