import passport from 'passport';
import {
  Strategy as LdapStrategy
} from 'passport-ldapauth';
import fs from 'fs';

function autenticacionLdap(usuario, done) {
  return done(null, usuario);
}

export function setup(config) {
  passport.use(new LdapStrategy({
    server: {
      url: config.ldapUrlUsuario,
      // bindDn: config.ldapBindDnUsuario,
      // bindCredentials: config.ldapBindCredentialsUsuario,
      searchBase: config.ldapSearchBaseUsuario,
      searchFilter: config.ldapSearchFilterUsuario,
      groupSearchBase: config.ldapGroupSearchBaseUsuario,
      groupDnProperty: config.ldapGroupDnPropertyUsuario,
      groupSearchFilter: config.ldapGroupSearchFilterUsuario,
      groupSearchAttributes: config.ldapGroupSearchAttributesUsuario,
      tlsOptions: {
        ca: [
          fs.readFileSync(config.ldapTlsOptionsUsuario)
        ]
      }
    },
    usernameField: 'email',
    passwordField: 'password'
  }, function (user, done) {
    return autenticacionLdap(user, done);
  }));
}
