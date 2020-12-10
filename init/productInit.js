var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shopping_cart' ,{useNewUrlParser: true, useUnifiedTopology: true},function(err){
    if(err){
        console.log('Error DataBase Connection: ' + err);
      }
      else{
        console.log('DB is Connected...');
      }
});

var products = [ new Product({
    imagePath: '/images/HuaweiY9.jpg',
    productName: 'Huawei Y9',
    information: {
        storageCapacity: 64,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 16,
        dispalySize: 6.5
    },
    price: 220
}),
new Product({
    imagePath: '/images/iphonex.jpg',
    productName: 'Apple iphone X',
    information: {
        storageCapacity: 64,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 12,
        dispalySize: 5.2
    },
    price: 200
}),
new Product({
    imagePath: '/images/oppoa35.jpg',
    productName: 'Oppo A35',
    information: {
        storageCapacity: 64,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 20,
        dispalySize: 5.5
    },
    price: 230
}),
new Product({
    imagePath: '/images/samsunggalaxynote9.jpg',
    productName: 'Samsung Galaxy Note 9',
    information: {
        storageCapacity: 128,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 12,
        dispalySize: 6.4
    },
    price: 250
}),
new Product({
    imagePath: '/images/sonyexperiaxz1.jpg',
    productName: 'Sony Xperia XZ1',
    information: {
        storageCapacity: 64,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 19,
        dispalySize: 5.2
    },
    price: 220
}),
new Product({
    imagePath: '/images/htcdesire10.jpg',
    productName: 'HTC Desire 10',
    information: {
        storageCapacity: 16,
        numberOfSIM: 'Dual SIM',
        cameraResolution: 13,
        dispalySize: 6.2
    },
    price: 170
}),
];



var done =0;
for(var i=0;i< products.length; i++){
    products[i].save(function(err, result){
        if(err){
            console.log(err);
        }
        else{
            console.log('done :'+ i);
            done++;
        }
        if(done === products.length){
            mongoose.disconnect();
        }
    });
}
