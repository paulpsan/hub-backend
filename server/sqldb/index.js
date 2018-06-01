"user strict";
import Sequelize from "sequelize";
import config from "../config/environment";

let db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};
db.Usuario = db.sequelize.import("../models/usuario");
db.Commit = db.sequelize.import("../models/commit");
db.Repositorio = db.sequelize.import("../models/repositorio");
db.Proyecto = db.sequelize.import("../models/proyecto");

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

db.Repositorio.belongsTo(db.Usuario, {
  foreignKey: {
    name: "fk_usuario",
    allowNull: false
  }
});

db.Proyecto.belongsTo(db.Repositorio, {
  foreignKey: {
    name: "fk_repositorio",
    allowNull: false
  }
});

db.Commit.belongsTo(db.Repositorio, {
  foreignKey: {
    name: "fk_repositorio",
    allowNull: false
  }
});

module.exports = db;
