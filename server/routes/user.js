'use strict'
import express from 'express';
import userController from '../controllers/user';
import githubController from '../controllers/github';
import passport from 'passport'
const api = express.Router();


// api.get('/inicio',userController.ejemplo);
api.get('/inicio',userController.obtener);
// api.get('/auth/github',githubController.auth);
api.get('login/github',githubController);
api.get('/auth/github',passport.authenticate('github'),
function(req,res){
    console.log(req+'prueba:'+res);
});

api.get('/auth/github/callback',
// passport.authenticate('github', { failureRedirect: '/' }),
function(req, res) {
    res.send("res");
    console.log(req.params);
}
);

module.exports=api;