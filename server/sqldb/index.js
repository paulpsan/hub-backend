'user strict'
import Sequelize from 'sequelize';

let db = {
    Sequelize,
    sequelize: new Sequelize('postgres://postgres:@localhost:5432/clases')
}
db.User=db.sequelize.import('../models/user') ;

//aqui agregamos inclusiones
/**
 * variable que ayuda con las inclusiones
 * se deben agregar las inclusiones con sus respectivos modelos al nombre de la inclusion
 * esto se usa para los query strings
 */

module.exports=db;
