'use strict'
import redis from "redis";
var client = redis.createClient();
var svgCaptcha = require('svg-captcha');

class Captcha {
    static getCurrent(id) {
        return new Promise((resolve, reject) => {
            client.get(`sess:${id}`, function (err, reply) {
                if (err) {
                    reject(err);
                }
                resolve(reply)
            })
        })
    }
    static create() {
        var captcha = svgCaptcha.create();
        client.set('captcha', captcha.text);
        client.expire('captcha', 360)
        return captcha;
    }
    static delete(id) {
        client.del(`sess:${id}`)
        return ;
    }
}
export default Captcha;