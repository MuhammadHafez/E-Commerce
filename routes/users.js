var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const passport = require('passport');
const csrf = require('csurf');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const multer = require('multer');

const fileFilter = function (req, file, cb) {
  if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
    cb(new Error('Please insert Image in JPEG or PNG Templete'), false);
  } else {
    cb(null, true);
  }
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload');
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + (new Date().toDateString() + file.originalname).slice(-4));
  }
});



const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
  storage: storage,
});

router.use(upload.single('myfile'), function (err, req, res, next) {
  if (err) {
    req.flash('profileImageError', err.message);
    res.redirect('profile');
  }
});
router.use(csrf());

//SIGNUP With PassportJS
router.get('/signup', isSignout, function (req, res, next) {
  var massesgesError = req.flash('signupError');
  res.render('user/signup', { errors: massesgesError, Token: req.csrfToken() });
});

router.post('/signup', [
  check('email').not().isEmpty().withMessage('Please Enter your Mail'),
  check('email').isEmail().withMessage('Please Enter Valid Email'),
  check('password').not().isEmpty().withMessage('Please Enter Your Password'),
  check('password').isLength({ min: 5 }).withMessage('Please Enter Password more than 5 Chars'),
  check('confirm-password').custom(function (val, { req }) {
    if (val !== req.body.password) {
      throw new Error('password & confirm-password NOT matched')
    }
    else {
      return true;
    }
  })
], function (req, res, next) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    errors.errors.forEach(element => {
      validationMassages.push(element.msg);
    });
    req.flash('signupError', validationMassages);
    res.redirect('signup');
  }
  else {
    next();
  }
}, passport.authenticate('local-signup', {
  session: false,
  successRedirect: 'signin',
  failureRedirect: 'signup',
  failureFlash: true,
})
);


router.get('/logout', isSignin, function (req, res, next) {
  req.logOut();
  res.redirect('/');
});


router.get('/profile', isSignin, function (req, res, next) {
  Order.find({ user: req.user._id }, function (err, order) {
    if (err) {
      console.log(err);
    }
    else {

      var massesgesError = req.flash('profileError');
      var hasMessageError = false;
      if (massesgesError.length > 0) {
        hasMessageError = true;
      }
      if (req.user.hasAuth == true) {
        Order.find({}, function (err, order) {
          if (err) {
            console.log(err);
          }
          else {
            var allOrders = order;
            Product.find({},function(err,product){
              if(err){
                console.log(err);
              }
              else{
                var allProducts = product;
               // console.log(allProducts);

                res.render('user/profile', {
                  checkuser: true,
                  checkProfile: true,
                  totalSelectedProducts: req.user.cartTotalQuantity,
                  userOrderList: order,
                  Token: req.csrfToken(),
                  profileError: massesgesError,
                  hasMessageError: hasMessageError,
                  User: req.user,
                  imageError: req.flash('profileImageError'),
                  AllOrders: allOrders,
                  AllProducts:allProducts
                });
              }
            })
          }
        });

      }else{
        res.render('user/profile', {
          checkuser: true,
          checkProfile: true,
          totalSelectedProducts: req.user.cartTotalQuantity,
          userOrderList: order,
          Token: req.csrfToken(),
          profileError: massesgesError,
          hasMessageError: hasMessageError,
          User: req.user,
          imageError: req.flash('profileImageError'),
        });
      }  
    }
  })
});

// do Signin with PassportJS
router.get('/signin', isSignout, function (req, res, next) {
  var signinErrors = req.flash('signinError');
  res.render('user/signin', { errors: signinErrors, Token: req.csrfToken() });
});

router.post('/signin', [
  check('email').not().isEmpty().withMessage('Please Enter your Mail'),
  check('email').isEmail().withMessage('Please Enter Valid Email'),
  check('password').not().isEmpty().withMessage('Please Enter Your Password'),
  check('password').isLength({ min: 5 }).withMessage('Please Enter Password more than 5 Chars')
], function (req, res, next) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    errors.errors.forEach(element => {
      validationMassages.push(element.msg);
    });
    req.flash('signinError', validationMassages);
    res.redirect('signin');
  }
  else {
    next();
  }

}, passport.authenticate('local-signin', {
  successRedirect: 'profile',
  failureRedirect: 'signin',
  failureFlash: true
}))


function isSignin(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('signin');
  }
}

function isSignout(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/');
  }
}





router.post('/updateuser', [
  check('username').not().isEmpty().withMessage('Please Enter your username'),
  check('email').not().isEmpty().withMessage('Please Enter your Mail'),
  check('email').isEmail().withMessage('Please Enter Valid Email'),
  check('contact').not().isEmpty().withMessage('Please Enter your Contact'),
  check('address').not().isEmpty().withMessage('Please Enter your Address'),

  check('password').not().isEmpty().withMessage('Please Enter Your Password'),
  check('password').isLength({ min: 5 }).withMessage('Please Enter Password more than 5 Chars'),
  check('confirm-password').custom(function (val, { req }) {
    if (val !== req.body.password) {
      throw new Error('password & confirm-password NOT matched')
    }
    else {
      return true;
    }
  })
], function (req, res, next) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    var errorsUpdate = [];
    errors.errors.forEach(element => {
      errorsUpdate.push(element.msg);
    });
    req.flash('profileError', errorsUpdate);
    res.redirect('profile');
    console.log(errorsUpdate);
  }
  else {
    User.find({ email: req.body.email }, function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        if (result.length > 0 && req.user.email != req.body.email) {
          req.flash('profileError', 'This Email is already used!');
          res.redirect('profile');
        }
        else {
          updateUser(req, res);
        }
      }
    })

  }
});


var updateUser = function (req, res) {
  var updatedUser = {
    email: req.body.email,
    password: new User().hashPassword(req.body.password),
    username: req.body.username,
    contact: req.body.contact,
    address: req.body.address,
  }
  User.updateOne({ _id: req.user._id }, { $set: updatedUser }, function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(result);
      req.logOut();
      res.redirect('signin');
    }
  })

}



router.post('/uploadfile', function (req, res, next) {
  var user = req.user;
  user.image = "/upload/" + req.file.filename;
  User.updateOne({ _id: user._id }, { $set: user }, function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(req.file);
      res.redirect('profile');
    }
  })



})

module.exports = router;

