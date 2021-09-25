const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listdishSchema = new Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
},{
    timestamps: true
})

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [listdishSchema]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;