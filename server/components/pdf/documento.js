"use strict";
var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('server/components/pdf/htmlTemplate.html').toString();
let handlebars = require('handlebars');
var options = {
    format: 'Letter'
};

class Documento {
    static generate(usuario, proyecto) {
        return new Promise((resolve, reject) => {
            let data = {
                titular: "titular",
                tipo: "tipo",
                nombre: "nombre",
                autores: "autores",
                fechaInicio: "fechaInicio",
                fechaFin: "fechaFin",
                version: "version",
                descripciones: "descripciones",
                funcionalidades: "funcionalidades",
                observaciones: "observaciones",
                sistemasOperativos: "sistemasOperativos",
                lenguaje: "lenguaje",
                baseDatos: "baseDatos",
                dependencias: "dependencias",
            }
            const template = handlebars.compile(html);
            const result = template(data);
            pdf.create(result, options).toFile('./documento.pdf', function (err, res) {
                if (err) {
                    return console.log(err);
                    reject(err);
                }
                console.log(res);
                resolve(res);
            });

        });
    }
}
export default Documento;