const mongoose = require('mongoose');


const productScehma = mongoose.Schema({
    imagePath: {
        type: String,
        required: true
    },

    productName: {
        type: String,
        required: true
    },

    information:{
        type:{
            storageCapacity : Number,
            numberOfSIM : String,
            cameraResolution : Number,
            dispalySize : Number
        },
        required: true
    },

    price:{
        type: Number,
        required: true
    }

});


module.exports = mongoose.model('Product',productScehma);
