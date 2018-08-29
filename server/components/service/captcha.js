'use strict'
import redis from "redis";
var client = redis.createClient();
var svgCaptcha = require('svg-captcha');

let secret = "clave_secreta";
exports.getCurrent = (id) => {
    console.log("id",id);
    return new Promise((resolve, reject) => {
        client.get(`sess:${id}`, function (err, reply) {
            if (err) {
                reject(err);
            }
            resolve(reply)
        })
    })

}

exports.create = () => {
    var captcha = svgCaptcha.create();
    client.set('captcha', captcha.text);
    client.expire('captcha', 360)
    return captcha;
}