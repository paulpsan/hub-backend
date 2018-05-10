'use strict';

import express from 'express';
import passport from 'passport';
import {
  signToken
} from '../auth.service';
import Usuario from '../../api/usuario/usuario.model';
var controller = require('./../auth.controller');

var router = express.Router();

router.post('/', function (req, res, next) {
  passport.authenticate('ldapauth', {
    session: false
  }, function (err, usuarioLDAP, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!usuarioLDAP) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }
    //TODO todos los de adsib son admins por ahora
    var token = signToken(usuarioLDAP.mail, 'usuario');
    let usuarioExistente;
    Usuario.findOne({
        nombreUsuario: usuarioLDAP.mail
      }).exec()
      .then(usuario => {
        if (!usuario) {
          return Usuario.create({
            nombreUsuario: usuarioLDAP.mail,
            nombres: usuarioLDAP.givenName,
            apellidos: usuarioLDAP.sn,
            correo: usuarioLDAP.mail,
            rol: 'usuario',
            sigla: usuarioLDAP.initials,
            organizacion: usuarioLDAP.o,
            telefono: usuarioLDAP.telephoneNumber,
            ci: usuarioLDAP.facsimileTelephoneNumber,
            cargo: usuarioLDAP.title
          });
        }
        usuarioExistente = usuario;
        return Usuario.update({
          _id: usuario._id
        }, {
          nombreUsuario: usuarioLDAP.mail,
          nombres: usuarioLDAP.givenName,
          apellidos: usuarioLDAP.sn,
          correo: usuarioLDAP.mail,
          rol: 'usuario',
          sigla: usuarioLDAP.initials,
          organizacion: usuarioLDAP.o,
          telefono: usuarioLDAP.telephoneNumber,
          ci: usuarioLDAP.facsimileTelephoneNumber,
          cargo: usuarioLDAP.title
        });
      })
      .then(usr => {
        res.json({
          token,
          _id: usr._id || usuarioExistente._id
        });
      })
      .catch(err => next(err));
  })(req, res, next);
});

router.post('/password', controller.cambiarPassword);

export default router;
