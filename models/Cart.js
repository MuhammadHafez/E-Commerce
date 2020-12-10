var mongoose = require('mongoose');


var cartSchema = mongoose.Schema({
    _id: {
        required: true,
        type: String
    },

    totalQuantity: {
        required: true,
        type: Number
    },

    totlaPrice: {
        required: true,
        type: Number,
    },

    selectedProduct:{
        required: true,
        type: Array,
    },
    createAt: {
        type: Date,
        index: {expires:'3d'}
    }
});


module.exports = mongoose.model('Cart', cartSchema);
