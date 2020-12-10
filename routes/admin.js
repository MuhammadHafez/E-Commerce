var express = require('express');
var router = express.Router();
var multer = require('multer');

const { check, validationResult } = require('express-validator');

const csrf = require('csurf');
const Product = require('../models/Product');
const Order = require('../models/Order');
var isSend = false;


var fileFilter = function(req,file,cb){
    console.log(file);
    if(file.fieldname != undefined){
        isSend = true;
        cb(null,true);
    }else{
        isSend= false;
        cb(null,true);
    }
    console.log("isSned: "+isSend);
}

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'public/products');
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }   
})

const upload = multer({
                        fileFilter:fileFilter,
                        storage:storage,
                     })



router.use(upload.single('productimage'));
router.use(csrf());

router.get('/deleteProduct/:id',isAdmin, function(req,res,next){
    const productID = req.params.id;

    Product.deleteOne({_id: productID}, function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log(result);
            res.redirect('/');
        }
    })
});


router.get('/addproduct',isAdmin , function(req,res,next){
    var addProductError = req.flash('addProductError')
    res.render('admin/addproduct', {
                                     Token: req.csrfToken(),
                                     addProductError:addProductError,
                                     checkuser: true,
                                     totalSelectedProducts: req.user.cartTotalQuantity, 
                                   });
});



router.post('/addproduct',[
    check('productname').not().isEmpty().withMessage('insert Product Name'),
    check('storagecapacity').not().isEmpty().withMessage('insert Product storagecapacity'),
    check('numberofsim').not().isEmpty().withMessage('insert Product numberofsim'),
    check('cameraresolution').not().isEmpty().withMessage('insert Product cameraresolution'),
    check('dispalysize').not().isEmpty().withMessage('insert Product dispalysize'),
    check('price').not().isEmpty().withMessage('insert Product price'),
    check('productimage').custom(function(value, {req}){
        console.log(isSend);
        if(isSend == false){

            throw new Error('insert image for Product');
        }
        else{
            return true;
        }
    })
] ,function(req,res,next){
    var messageErrors = [];
    var errors = validationResult(req);
    if(!errors.isEmpty()){
      //  console.log(errors);
        errors.errors.forEach(element => {
            messageErrors.push(element.msg);
        });
        req.flash('addProductError', messageErrors);
        res.redirect('addproduct');
    }
    else{
        Product.find({productName: req.body.productname}, function(err,founded){
            if(err){
                console.log(err);
            }
            else{
                if(founded.length > 0){
                    req.flash('addProductError', 'This Product is already exist');
                    res.redirect('addproduct');
                }   
                else{
                    var newProduct = new Product ({
                        imagePath: '/products/'+req.file.originalname,
                        productName: req.body.productname,
                        information: {
                            storageCapacity: req.body.storagecapacity,
                            numberOfSIM: req.body.numberofsim,
                            cameraResolution: req.body.cameraresolution,
                            dispalySize: req.body.dispalysize
                        },
                        price: req.body.price
                    });
            
                    newProduct.save(function(err,result){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(newProduct);
                        res.redirect('/');
                        }
                    })
                }   
            }
        })
    }
})



 function isAdmin(req,res,next){
    if(req.user === undefined){
        res.redirect('/users/signin');
    }
    else  if(req.user.hasAuth === true){
        next();
    }
    else{
        res.redirect('/');
    }
}


router.get('/editproduct/:id',isAdmin , function(req,res,next){
    var product ;
    Product.findById(req.params.id, function(err,product){
        if(err){
            console.log(err);
        }
        else{
            product = product;
            var editProductError = req.flash('editProductError');
            res.render('admin/editproduct',{ Product:product,
                                             Token: req.csrfToken(),
                                             editProductError:editProductError,
                                             checkuser: true,
                                             totalSelectedProducts: req.user.cartTotalQuantity,
                                            });
        }
    })
   
})


router.post('/editproduct',
[
    check('productname').not().isEmpty().withMessage('insert Product Name'),
    check('storagecapacity').not().isEmpty().withMessage('insert Product storagecapacity'),
    check('numberofsim').not().isEmpty().withMessage('insert Product numberofsim'),
    check('cameraresolution').not().isEmpty().withMessage('insert Product cameraresolution'),
    check('dispalysize').not().isEmpty().withMessage('insert Product dispalysize'),
    check('price').not().isEmpty().withMessage('insert Product price'),
    check('productimage').custom(function(value, {req}){
        if(isSend == false && req.body.pastimage =="" ){
            throw new Error('insert image for Product');
        }
        else{
            return true;
        }
    })
]
 ,
 function(req,res,next){
    var messageErrors = [];
    var errors = validationResult(req);
    if(!errors.isEmpty()){
      //  console.log(errors);
        errors.errors.forEach(element => {
            messageErrors.push(element.msg);
        });
        req.flash('editProductError', messageErrors);
        res.redirect('editproduct/'+req.body.productid);
    }
    else{

        if(req.file){
            var editedProduct = {
                imagePath: '/products/'+req.file.originalname,
                productName: req.body.productname,
                information: {
                    storageCapacity: req.body.storagecapacity,
                    numberOfSIM: req.body.numberofsim,
                    cameraResolution: req.body.cameraresolution,
                    dispalySize: req.body.dispalysize
                },
                price: req.body.price
            }
            console.log(editedProduct);
        }
        else{
            var editedProduct = {
                imagePath: req.body.pastimage,
                productName: req.body.productname,
                information: {
                    storageCapacity: req.body.storagecapacity,
                    numberOfSIM: req.body.numberofsim,
                    cameraResolution: req.body.cameraresolution,
                    dispalySize: req.body.dispalysize
                },
                price: req.body.price
            }  
        }
        Product.updateOne({_id: req.body.productid} ,{$set:editedProduct }, function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                res.redirect('/');
            }
        })
        console.log(editedProduct);


       
    }
});

router.get('/viewOrderDetails/:id',isAdmin, function(req,res,next){
    var order ;
    Order.findById(req.params.id, function(err,result){
        if(err){
            console.log(err);
        }
        else{
            order = result;
            res.render('admin/vieworderdetails', {order, order ,checkuser: true, totalSelectedProducts: req.user.cartTotalQuantity,});
        }
    })
});







module.exports = router;

