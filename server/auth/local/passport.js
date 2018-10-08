import passport from "passport";
import bcrypt from "bcrypt-nodejs";
import {
  Strategy as LocalStrategy
} from "passport-local";
import Sequelize from "sequelize";

function localAuthenticate(User, email, password, done) {
  let login;
  let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!emailRegex.test(email)) {
    login = email
  }
  const Op = Sequelize.Op;
  User.findOne({
      where: {
        [Op.or]: [{
          email: email.toLowerCase()
        }, {
          login: login
        }]
      }
    })
    .then(user => {
      if (user != null) {
        console.log(user);
        if (user.estado == 'habilitado') {
          bcrypt.compare(password, user.password, (err, check) => {
            if (check) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Contraseña incorrecta"
              });
            }
          });
        } else {
          return done(null, false, {
            message: "Su usuario fue bloqueado, Contactese con el soporte tecnico"
          });
        }
      } else {
        return done(null, false, {
          message: "No existe el usuario"
        });
      }
    })
    .catch(err => done(err));
}

export function setup(User) {
  passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password", // this is the virtual field on the model
      },
      function (email, password, done) {
        return localAuthenticate(User, email, password, done);
      }
    )
  );
}