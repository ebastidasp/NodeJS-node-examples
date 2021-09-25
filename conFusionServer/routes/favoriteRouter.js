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
        for (i = 0; i < req.body.length; i++ )
            if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
                favorite.dishes.push(req.body[i]);
        favorite.save()
        .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
        })
        .catch((err) => {
            return next(err);
        });   
    })
    .catch(() => {
        Favorites.create({user: req.user._id, dishes:req.body})
        .then((favorite) => {
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err) => {
                return next(err);
            });
        })
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
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // var boolean1 = false;
    Favorites.findOne({'user': req.user._id})
    .then((favorite) => {
        if (favorite.dishes.indexOf(req.params.dishId) < 0) {                
            favorite.dishes.push(req.body);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err) => {
                return next(err);
            })
        }
        else{
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.send("ERROR");
        }
    })
    .catch(_ => {
        Favorites.create({'user': req.user._id})
        .then((favorite) => {
            favorite.dishes.push({ "dish": req.params.dishId });
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err) => {
                return next(err);
            });
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
        favorite.save()
        .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
        })
    })
    .catch((err) =>{ 
        console.log('ERROR', err);
        next(err);
    });             
});

module.exports = favoriteRouter;