"use strict";
import { Token } from "../sqldb";
import SequelizeHelper from "../components/sequelize-helper";
import { isNull } from "util";

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
    // let result;
    // return async function() {
    //   await Token.findOne({
    //     where: {
    //       fk_usuario: id_usuario,
    //       tipo: tipo
    //     }
    //   }).then(res => {
    //     result = res;
    //     if (result !== null) return result.token;
    //     else return null;
    //   });
    // };
  }

  static updateToken(tipo, usuario, token) {
    let objToken = {};
    objToken.token = token;
    objToken.tipo = tipo;
    objToken.fk_usuario = usuario._id;
    Token.update(objToken, {
      where: {
        fk_usuario: usuario._id
      }
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
