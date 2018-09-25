"use strict";

import nodemailer from "nodemailer";
import redis from "redis";
import config from "../../config/environment";
import {
  createToken,
  verifyTokenCreate
} from "../../auth/auth.service";

let client = redis.createClient();
let smtpTransport = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

class Email {
  static sendSolicitudAprobada(user, solicitud, text) {
    return new Promise((resolve, reject) => {
      //guarda en redis
      let mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: "Solicitud de aprobación de Titularidad",
        html: "Usted realizo una solicitud de titularidad de la institución " + solicitud.institucon +
          " en el Repositorio Estatal <br> La cual fue ACEPTADA por el administrador "
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Message sent: " + response);
          resolve(response);
        }
      });
    });
  }

  static sendToken(user) {
    return new Promise((resolve, reject) => {
      const token = createToken(user, 60 * 60 * 24);
      client.set(token, "confirm");
      //expira en 1 dia
      client.expire(token, 60 * 60 * 24);

      //guarda en redis
      let link = `${config.email.url_verify}?token=${token}`;
      let mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: "Por favor verifique su cuenta de Correo Electronico ",
        html: "Hola,<br> Usted se registro en el Catalogo del Repositorio Estatal <br>Por favor hacer Click en el Enlace para verificar su email.<br><a href=" +
          link +
          ">Click aqui para verificar</a>"
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Message sent: " + response);
          resolve(response);
        }
      });
    });
  }

  static sendRecover(user) {
    return new Promise((resolve, reject) => {
      const token = createToken(user, 60 * 60 * 24);
      client.set(token, "reset");
      client.expire(token, 60 * 60 * 24);

      //guarda en redis
      let link = `${config.email.url_reset}?token=${token}`;
      let mailOptions = {
        from: config.email.from,
        to: user.email,
        subject: "Servicio de recuperación de contraseña ",
        html: "Hola,<br> Please Click on the link to verify your email.<br><a href=" +
          link +
          ">Click here to verify</a>"
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Message sent: " + response);
          resolve(response);
        }
      });
    });
  }
  static verify(token) {
    return new Promise((resolve, reject) => {
      console.log(token);
      client.get(token, function (error, response) {
        console.log(response);
        if (error) {
          console.log(error);
          reject(false);
        }
        if (response === "confirm" || response === "reset") {
          verifyTokenCreate(token)
            .then(user => {
              user ? resolve(user) : resolve(false);
            })
            .catch(err => {
              resolve(false);
            });
        } else {
          resolve(false);
        }
      });
    });
  }
  static delete(token) {
    client.del(token)
    return;
  }
}
export default Email;