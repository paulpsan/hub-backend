'use strict';
import express from 'express';
//config del ldap ADSIB
import config from '../config/environment';

import validator from 'validator';

// Passport Configuration

var router = express.Router();

router.use('/ldap', (req, res, next) => {
  console.log(req.body.email);
  if (!validator.isEmail(req.body.email)) { // preguntar si es un correo o un numero de carnet
    //admins
    console.log('entra admin');
    require('./ldap/passport').setup(config);
    require('./ldap').default(req, res, next);
  } else {
    //usuarios
    console.log('entra usuarios');
    require('./ldapUsuario/passport').setup(config);
    require('./ldapUsuario').default(req, res, next);
  }
});

export default router;
