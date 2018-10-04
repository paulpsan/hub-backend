"use strict";
var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('.htmlTemplate.html', 'utf8');
var options = {
    format: 'Letter'
};

class Documento {
    static generate(usuario, proyecto) {
        return new Promise((resolve, reject) => {

            pdf.create(html, options).toFile('./documento.pdf', function (err, res) {
                if (err) {
                    return console.log(err);
                    reject(err);
                }
                console.log(res);
                resolve(resp);
            });

        });
    }
}
export default Documento;