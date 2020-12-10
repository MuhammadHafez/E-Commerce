const mongoose = require('mongoose');
var schema = mongoose.Schema;


var orderSchema = mongoose.Schema({

    user : {
        required: true,
        type: schema.Types.ObjectId,
        ref: 'User',
    },

    cart: {
        type: Object,
        required: true,
    },

    address: {
        type: String,
        required: true,
    },
    
    contact: {
        type: Number,
        required: true,
    },
    
    name: {
        type: String,
        required: true,
    },

    paymentId: {
        type: String,
        required: true,
    },

    orderPrice: {
        type: Number,
        required: true,
    },

    currentDate: {
        type: String,
        required: true,
    },

    currentTime: {
        type: String,
        required: true,
    }
});


module.exports = mongoose.model('Order',orderSchema);
