'use strict'
var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = "8c72efc160e0d1771104";
var GITHUB_CLIENT_SECRET = "b2341d1231a1f33f2d1346c400a27c8ad97d8d12";

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    passport.use(new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                console.log("esto es su profile"+profile);
                return done(null, profile);
            });
        }
    ));
};

// const GitHubStrategy = require('passport-github2').Strategy;
// const GITHUB_CLIENT_ID = '';
// const GITHUB_CLIENT_SECRET = '';

// module.exports = function(passport) {
//     passport.use(new GitHubStrategy({
//         clientID: GITHUB_CLIENT_ID,
//         clientSecret: GITHUB_CLIENT_SECRET,
//         callbackURL: "http://localhost:3000/api/login/callback"
//     },
//     function(accessToken,refreshToken,profile,done){
//         process.nextTick(function(){
//             console.log(profile);
//             return done(null,profile);
//         })
//     }
//     ))
// }