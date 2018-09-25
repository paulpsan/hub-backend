"use strict";
import config from "../config/environment";
import jwt from "jsonwebtoken";
import compose from "composable-middleware";

export function isAuthenticated() {
  return (
    compose()
    // Validate jwt
    .use(function (req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty("access_token")) {
        console.log("entro 1");
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }

      if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1];
        console.log("TokenEntrante", token);
        verifyToken(token)
          .then(decoded => {
            if (decoded) {
              req.usuario = decoded.usuario;
              next();
            } else {
              return res.status(401).json({
                message: "Token incorrecto o Token Expirado",
                errors: err
              });
            }
          })
          .catch(err => {
            console.log("errToken", err);
            return res.status(401).json({
              message: "Token incorrecto o Token Expirado",
              errors: err
            });
          });
      } else {
        return res.status(401).json({
          message: "No cuenta con los accesos al sistema"
        });
      }
    })
  );
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(user, expires = 60 * 60 * 24) {
  return jwt.sign({
      _id: user._id,
      rol: user.rol
    },
    config.secrets.session, {
      expiresIn: expires
    }
  );
}

export function createToken(user, expires = 60 * 60 * 24) {
  return jwt.sign({
      nombre: user.nombre,
      login: user.login,
      email: user.email,
      password: user.password
    },
    config.secrets.create, {
      expiresIn: expires
    }
  );
}
export function verifyTokenCreate(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.create, (err, decoded) => {
      if (err) {
        reject(false);
      } else {
        resolve(decoded);
      }
    });
  });
}



export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.session, (err, decoded) => {
      if (err) {
        reject(false);
      } else {
        resolve(decoded);
      }
    });
  });
}