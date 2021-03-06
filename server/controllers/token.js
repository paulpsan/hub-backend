"use strict";
import { Token } from "../sqldb";

class TokenController {
  static getToken(tipo, id_usuario) {
    return new Promise((resolver, rechazar) => {
      Token.findOne({
        where: {
          fk_usuario: id_usuario,
          tipo: tipo
        }
      })
        .then(resp => {
          if (resp !== null) {
            resolver(resp.token);
          } else {
            resolver(null);
          }
        })
        .catch(err => {
          rechazar(err);
        });
    });
  }

  static updateCreateToken(tipo, usuario, token) {
    return new Promise((resolver, rechazar) => {
      let objToken = {};
      objToken.token = token;
      objToken.tipo = tipo;
      objToken.fk_usuario = usuario._id;
      Token.findOne({
        where: {
          fk_usuario: usuario._id,
          tipo: objToken.tipo
        }
      })
        .then(respToken => {
          if (respToken !== null) {
            return respToken.update(objToken, {
              where: {
                fk_usuario: usuario._id
              }
            });
          } else {
            return Token.create(objToken);
          }
        })
        .then(token => {
          console.log("token____", token);
          resolver(true);
        })
        .catch(err => {
          rechazar(err);
        });
    });
  }

  static createToken(tipo, usuario, token) {
    let objToken = {};
    objToken.token = token;
    objToken.tipo = tipo;
    objToken.fk_usuario = usuario._id;
    Token.create(objToken);
  }
}
export default TokenController;
