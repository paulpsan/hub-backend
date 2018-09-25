import passport from "passport";
import bcrypt from "bcrypt-nodejs";
import {
  Strategy as LocalStrategy
} from "passport-local";

function localAuthenticate(User, email, password, done) {
  User.findOne({
      where: {
        email: email.toLowerCase(),
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
            message: "Confirmar el Correo Electrónico del Usuario. Revise su correo electronico"
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
        passwordField: "password" // this is the virtual field on the model
      },
      function (email, password, done) {
        return localAuthenticate(User, email, password, done);
      }
    )
  );
}