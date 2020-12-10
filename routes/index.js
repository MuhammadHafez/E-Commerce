var express = require('express');
var router = express.Router();
var Product = require('../models/Product');
var Cart = require('../models/Cart');
const Order = require('../models/Order');
var stripe = require('stripe')('sk_test_51Ho0ubALvAtmtEd1xewNscxiN3CcsRN5iVGI7nUtckMffErHvLDAzgZSiRKRudCbSJY66EDQwLRfa2hpFkg0mlLt00ejJrVGXc');


// Check is User Signin or not
function isSignin(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/users/signin');
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* GET home page. */
router.get('/', function (req, res, next) {

  var success = req.flash('success');
  if (req.isAuthenticated()) {
    var totalSelectedProducts = req.user.cartTotalQuantity;
  }
  
  var productGrid = [];
  Product.find({}, '', function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      var colGrid = 3;
      for (var i = 0; i < result.length; i += colGrid) {
        productGrid.push(result.slice(i, i + colGrid));
      };
      res.render('index', {
        title: 'Shopping-Cart',
        Products: productGrid,
        checkuser: req.isAuthenticated(),
        totalSelectedProducts: totalSelectedProducts,
        success: success,
      });
    }
  });
});







/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/addToCart/:_id/:price/:name', isSignin, function (req, res, next) {
  req.session.hasCart = true;
  console.log(req.user._id);
  cartID = req.user._id;
  var newProduct = {
    _id: req.params._id,
    productName: req.params.name,
    price: parseInt(req.params.price, 10),
    quantity: 1,
  }

  Cart.findById(cartID, '', function (err, cart) {
    if (err) {
      console.log(err);
    }
    else {
      if (!cart) {
        var newCart = new Cart({
          _id: cartID,
          totalQuantity: 1,
          totlaPrice: newProduct.price,
          selectedProduct: [newProduct],
          createAt : Date.now(),
        });
        newCart.save(function (err, result) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(result);
            res.redirect('/');
          }
        });
      }

      else {
        var isFound = false;
        for (var i = 0; i < cart.selectedProduct.length; i++) {
          if (newProduct._id === cart.selectedProduct[i]._id) {
            cart.selectedProduct[i].quantity += 1;
            cart.selectedProduct[i].price += newProduct.price;
            isFound = true;
            break;
          }
        }

        if (!isFound) {
          cart.selectedProduct.push(newProduct);
        }

        cart.totalQuantity += 1;
        cart.totlaPrice += newProduct.price;

        cart.createAt = Date.now();
        Cart.updateOne({ _id: cart._id }, { $set: cart }, function (err, updateddata) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(cart);
            res.redirect('/');
          }
        });
      }
    }
  })
 // res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/shopping-cart', isSignin, function (req, res, next) {
  
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin');
  }
  
  res.render('cart/shopping-cart', { checkuser: true,
                                     userCart: req.user.cart,
                                     totalSelectedProducts: req.user.cartTotalQuantity,
                                      hasCart: req.user.cart,
                                      expired: req.session.hasCart
                                   }
            );     
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/increaseProduct/:index', isSignin, function (req, res, next) {
  if(req.user.cart){
    var cart = req.user.cart;
    var index = req.params.index;
    var currentProduct = cart.selectedProduct[index];
    var productPrice = (currentProduct.price) / (currentProduct.quantity);
    cart.totalQuantity += 1;
    cart.totlaPrice += productPrice;
    currentProduct.price += productPrice;
    currentProduct.quantity += 1;
    cart.selectedProduct[index] = currentProduct;
    cart.createAt = Date.now();
    Cart.updateOne({ _id: cart._id }, { $set: cart }, function (err, updated) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(cart);
        res.redirect('/shopping-cart');
      }
    });
  }
  else{
    res.redirect('/shopping-cart');
  }


  


});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/decreaseProduct/:index', isSignin, function (req, res, next) {
 if(req.user.cart){
  var cart = req.user.cart;
  var index = req.params.index;
  var currentProduct = cart.selectedProduct[index];
  var productPrice = (currentProduct.price) / (currentProduct.quantity);
  cart.totalQuantity -= 1;
  cart.totlaPrice -= productPrice;
  currentProduct.price -= productPrice;
  currentProduct.quantity -= 1;
  cart.selectedProduct[index] = currentProduct;
  cart.createAt = Date.now();
  Cart.updateOne({ _id: cart._id }, { $set: cart }, function (err, updated) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(cart);
      res.redirect('/shopping-cart');
    }
  });
 }
 else{
   res.redirect('/shopping-cart');
 }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/deleteProduct/:index', isSignin, function (req, res, next) {

if(req.user.cart){
  var cart = req.user.cart;
  var index = req.params.index;
  var currentProduct = cart.selectedProduct[index];
  cart.totalQuantity -= currentProduct.quantity;
  cart.totlaPrice -= currentProduct.price;
  cart.selectedProduct.splice(index, 1);
  if (cart.selectedProduct.length) {
    cart.createAt = Date.now();
    Cart.updateOne({ _id: cart._id }, { $set: cart }, function (err, updated) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(cart);
        res.redirect('/shopping-cart');
      }
    });
  }
  else {
    Cart.deleteOne({ _id: cart._id }, function (err, deleted) {
      if (err) {
        console.log(err);
      }
      else {
        req.session.hasCart = false;
        res.redirect('/shopping-cart');
      }
    });
  }
}
else{
  res.redirect('/shopping-cart');
}
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/deleteAllProducts', isSignin, function (req, res, next) {
  if(req.user.cart){
    var cart = req.user.cart;
    Cart.deleteOne({ _id: cart._id }, function (err, deleted) {
      if (err) {
        console.log(err);
      }
      else {
        req.session.hasCart = false;
        res.redirect('/shopping-cart');
      }
    });
  }
else{
  res.redirect('/shopping-cart');
}
})


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/checkout' , function(req,res,next){
  if(req.user.cart){
    if(req.user.username === undefined || req.user.address === undefined || req.user.contact === undefined ){
      req.flash('profileError', 'Please update your information before make any Order'); 
      res.redirect('/users/profile');
      
    }
    else{
      var checkoutError = req.flash('checkoutError');
    res.render('checkout', {checkuser: true,
                          totalSelectedProducts: req.user.cartTotalQuantity ,
                          TotalPrice: req.user.cart.totlaPrice ,
                          checkoutError: checkoutError,
                          user: req.user
                          }
            );
    } 
  }
  else{
    res.redirect('/shopping-cart');
  }
  
})


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/checkout', function(req,res,next){
  stripe.charges.create({
    amount: req.user.cart.totlaPrice*100,
    currency: 'usd',
    source : req.body.stripeToken,
    description: 'Charged to test100@gmail.com',
  }, function(err,charge){
    if(err){
        req.flash('checkoutError', err.raw.message);
        res.redirect('/checkout');
    }
    else{
      
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
       var time = today.getHours() + ":" + today.getMinutes()+ ":" + today.getSeconds();
      var order = new Order({
        user: req.user._id,
        cart: req.user.cart,
        address: req.body.address,
        contact: req.body.contact,
        name: req.body.name,
        paymentId: charge.id,
        orderPrice: parseInt(req.user.cart.totlaPrice,10),
        currentDate: date,
        currentTime: time,
      });

      order.save(function(err,result){
        if(err){
          console.log(err);
        }
        else{
          req.flash('success' , 'You are Successfuly Bought All Products!');
          Cart.deleteOne({_id: req.user._id}, function(err,result){
            if(err){
              console.log(err);
            }
            else{
              res.redirect('/');
            }
          })
        }
      })     
    }
  }) 
});
////////////////////////////Index Display Deatails////////////////////////////////////////////////////

router.get('/displaydetails/:id', function(req,res,next){
  var product ;
  var totalQuantity;
  if(req.isAuthenticated()){
     totalQuantity = req.user.cartTotalQuantity;
  }
  Product.findById(req.params.id,function(err,result){
    if(err){
      console.log(err);
    }
    else{
      product = result;
      res.render('productinfo',{Product: product , checkuser: req.isAuthenticated(),totalSelectedProducts:totalQuantity});
    }
  })
  
})


module.exports = router;

























