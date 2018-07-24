import passport from "passport";
import bcrypt from "bcrypt-nodejs";
import { Strategy as LocalStrategy } from "passport-local";

function localAuthenticate(User, email, password, done) {
  User.findOne({
    where: {
      email: email.toLowerCase(),
      tipo: "local"
    }
  })
    .then(user => {
      if (user != null) {
        bcrypt.compare(password, user.password, (err, check) => {
          if (check) {
            return done(null, user);
          } else {
            return done(null, false, { mensaje: "Contraseña incorrecta" });
          }
        });
      } else {
        return done(null, false, {
          mensaje: "No existe el usuario o contraseña incorrecta"
        });
      }
    })
    .catch(err => done(err));
}

export function setup(User) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password" // this is the virtual field on the model
      },
      function(email, password, done) {
        return localAuthenticate(User, email, password, done);
      }
    )
  );
}
