const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorites');

var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

function existsinarray(array, element){
    let boolean1 = false;
    for(let i = 0; i < array.length; i++){
        if(array[i].dish.equals(element)) boolean1 = true;
    }
    return boolean1;
}

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({'user': req.user._id})
    .populate('user')
    .populate('dishes.dish')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({'user': req.user._id})
    .then((favorite) => {
        console.log('Entro al then mayor ',req.body[0].dish);
        let boolean1 = [];
        for(let j = 0; j < req.body.length; j++)
            boolean1[j] = existsinarray(favorite.dishes, req.body[j].dish);
        for (let j = 0; j < req.body.length; j++) {
            if(!boolean1[j]){
                favorite.dishes.push(req.body[j]);
            }
          }
        favorite.save()
        .then((dish) => {
            Favorites.findOne({'user': req.user._id})
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            })            
        }, (err) => next(err));   
    })
    .catch(() => {
        Favorites.create({user: req.user._id, dishes:req.body})
        .then((favorite) => {
            console.log('Favorite list created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err));
    });
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({'user': req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // var boolean1 = false;
    Favorites.findOne({'user': req.user._id})
    .then((favorite) => {
        console.log('Entro al then.')
        let boolean1 = false;
        for(let i = 0; i < favorite.dishes.length; i++){
            if(favorite.dishes[i].dish.equals(req.params.dishId))
                boolean1 = true;
        }
        if(!boolean1){
            favorite.dishes.push({'dish': req.params.dishId});
            favorite.save()
            .then((favorite) => {
                Favorites.findOne({'user': req.user._id})
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else{
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json('ERROR');
        }
    })
    .catch(_ => {
        Favorites.create({'user': req.user._id, 'dishes':[{'dish': req.params.dishId}]})
        .then((favorite) => {
            boolean1 = true;
            console.log('Favorite list created ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err))
    });  
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('ENTRO AL DELETE',req.user);
    Favorites.findOne({'user': req.user._id})
    .then((favorite) => {
        console.log('ENTRO AL FOR');
        let a;
        for(let i = 0; i < favorite.dishes.length; i++){
            if(favorite.dishes[i].dish.equals(req.params.dishId)){
                a = i;
                break;
            }
        }
        console.log('SALIO DEL FOR', a);
        favorite.dishes.splice(a, 1);
        favorite.save();
        res.statusCode = 200;    
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);  
    })
    .catch((err) =>{ 
        console.log('ERROR', err);
        next(err);
    });             
});

module.exports = favoriteRouter;