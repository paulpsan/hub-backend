'use strict';

import ldapjs from 'ldapjs';
import ssha from 'ssha';
import config from '../config/environment';
import validator from 'validator';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

export function cambiarPassword(req, res) {
  let esCorreo = validator.isEmail(req.body.email);
  return new Promise((resolve, reject) => {
      let ldapOptions = {
        url: esCorreo ? config.ldapUrlUsuario : config.ldapUrl,
        reconnect: true
      };
      const ldapClient = ldapjs.createClient(ldapOptions);
      let searchBase = esCorreo ? 'mail=' + req.body.email + ',' + config.ldapSearchBaseUsuario : 'uid=' + req.body.email + ',' + config.ldapSearchBase;
      ldapClient.bind(searchBase, req.body.password, err => {
        if (err) return reject(err);
        ldapClient.modify(searchBase, [new ldapjs.Change({
          operation: 'replace',
          modification: {
            userPassword: ssha.create(req.body.newPassword)
          }
        })], error => {
          if (err) return reject(err);
          return resolve(true);
        });
      });
    })
    .then(respondWithResult(res, 200))
    .catch(handleError(res));
}
