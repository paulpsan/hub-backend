"use strict";
import config from "../config/environment";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import compose from "composable-middleware";
import { Usuario } from "../sqldb";
// import Usuario from '../api/usuario/usuario.model';

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the usuario object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
  return (
    compose()
      // Validate jwt
      .use(function(req, res, next) {
        // allow access_token to be passed through query parameter as well
        if (req.query && req.query.hasOwnProperty("access_token")) {
          req.headers.authorization = `Bearer ${req.query.access_token}`;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if (req.query && typeof req.headers.authorization === "undefined") {
          req.headers.authorization = `Bearer ${req.cookies.token}`;
        }
        console.log("Authorization :",req.headers);
        if (req.headers.authorization) {
          validateJwt(req, res, next);
        }
        // next();
      })
      // Attach Usuario to request
      .use(function(req, res, next) {
        console.log("requeee ",req.user);
        Usuario.findOne({ usuario: req.user._id })
          .then(usuario => {
            if (!usuario) {
              return res.status(401).end();
            }
            req.usuario = usuario;
            next();
          })
          .catch(err => next(err));
      })
  );
}

/**
 * Checks if the usuario role meets the minimum requirements of the route
 */
// export function hasRole(roleRequired) {
//   if(!roleRequired) {
//     throw new Error('Required role needs to be set');
//   }

//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       if(config.userRoles.indexOf(req.usuario.rol) >= config.userRoles.indexOf(roleRequired)) {
//         return next();
//       } else {
//         return res.status(403).send('Forbidden');
//       }
//     });
// }

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, rol) {
  return jwt.sign({ _id: id, rol }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
// export function setTokenCookie(req, res) {
//   if(!req.usuario) {
//     return res.status(404).send('It looks like you aren\'t logged in, please try again.');
//   }
//   var token = signToken(req.usuario._id, req.usuario.role);
//   res.cookie('token', token);
//   res.redirect('/');
// }
