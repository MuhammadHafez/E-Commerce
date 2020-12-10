const e = require('express');
const passport = require('passport');
const Cart = require('../models/Cart');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Passport Signin
passport.serializeUser(function(user,done){
    return done(null,user._id);
});

passport.deserializeUser(function(id, done){
    User.findById(id,'_id email username contact address image hasAuth',function(err,user){
       if(err){
        return done(err);
       }
       else {
        Cart.findById(id,'',function(err,cart){
            if(!cart){
                user.cart = null;
                user.cartTotalQuantity = 0;
                return done(err,user);
            }
            else{
                user.cart = cart;
                user.cartTotalQuantity = cart.totalQuantity;
                return done(err,user);
            }
        });
       }   
    });
});


passport.use('local-signin', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
}, function(req,email,password, done){
    User.findOne({email: email},'',function(err,result){
        if(err){
            return done(err);
        }
        else{
            if(!result){
                return done(null, false, req.flash('signinError','This User Not Found.'));
            }
            else if(!result.comparePassword(password)){
                return done(null,false,req.flash('signinError','Wrong Password'));
            }
            else{
                return done(null,result);
            }
        }
    })

}));



// Passport Signup

passport.use('local-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req,email,password,done){
    User.findOne({email: email},'', function(err,result){
        if(err){
            return done(err);
        }
        else{
            if(result){
                return done(null,false,req.flash('signupError','This mail is Used Before'));
            }
            else{
                var user= new User({
                    email: email,
                    password: new User().hashPassword(password),
                });

                user.save(function(err,result){
                    if(err){
                        return done(err);
                    }
                    else{
                        return done(null,result);
                    }
                });
            }
        }
    });
}
))
