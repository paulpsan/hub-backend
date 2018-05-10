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
      url: config.ldapUrl,
      // bindDn: config.ldapBindDn,
      // bindCredentials: config.ldapBindCredentials,
      searchBase: config.ldapSearchBase,
      searchFilter: config.ldapSearchFilter,
      groupSearchBase: config.ldapGroupSearchBase,
      groupDnProperty: config.ldapGroupDnProperty,
      groupSearchFilter: config.ldapGroupSearchFilter,
      groupSearchAttributes: config.ldapGroupSearchAttributes,
      tlsOptions: {
        ca: [
          fs.readFileSync(config.ldapTlsOptions)
        ]
      }
    },
    usernameField: 'email',
    passwordField: 'password'
  }, function (user, done) {
    return autenticacionLdap(user, done);
  }));
}
