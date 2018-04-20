"user strict";
import Sequelize from "sequelize";
import config from "../config/environment";

let db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};
db.Usuario = db.sequelize.import("../models/usuario");
db.Organizacion = db.sequelize.import("../models/organizacion");
db.Repositorio = db.sequelize.import("../models/repositorio");
db.Proyecto = db.sequelize.import("../models/proyecto");
db.UsuarioRepositorio = db.sequelize.import("../models/usuarioRepositorio");
//aqui agregamos inclusiones
/**
 * variable que ayuda con las inclusiones
 * se deben agregar las inclusiones con sus respectivos modelos al nombre de la inclusion
 * esto se usa para los query strings
 */
db.Usuario.belongsToMany(db.Proyecto, {
  through: "UsuarioProyecto",
  foreignKey: "fk_proyecto"
});
db.Proyecto.belongsToMany(db.Usuario, {
  through: "UsuarioProyecto",
  foreignKey: "fk_usuario"
});

module.exports = db;
