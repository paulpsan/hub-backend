"user strict";
import Sequelize from "sequelize";
import config from "../config/environment";

let db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};
db.Usuario = db.sequelize.import("../models/usuario");
db.Commit = db.sequelize.import("../models/commit");
db.Rating = db.sequelize.import("../models/rating");
db.Grupo = db.sequelize.import("../models/grupo");
db.Token = db.sequelize.import("../models/token");
db.Repositorio = db.sequelize.import("../models/repositorio");
db.Proyecto = db.sequelize.import("../models/proyecto");
db.UsuarioGrupo = db.sequelize.import("../models/usuarioGrupo");
db.ProyectoGrupo = db.sequelize.import("../models/proyectoGrupo");


db.inclusiones = {};

//aqui agregamos inclusiones
/**
 * variable que ayuda con las inclusiones
 * se deben agregar las inclusiones con sus respectivos modelos al nombre de la inclusion
 * esto se usa para los query strings
 */
// db.Usuario.belongsToMany(db.Proyecto, {
//   through: "UsuarioProyecto",
//   foreignKey: "fk_proyecto"
// });
// db.Proyecto.belongsToMany(db.Usuario, {
//   through: "UsuarioProyecto",
//   foreignKey: "fk_usuario"
// });

//malll
// db.Usuario.hasMany(db.Grupo, {
//   foreignKey: {
//     name: "fk_usuario",
//     allowNull: true
//   }
// });
db.Grupo.belongsToMany(db.Usuario, {
  through: 'UsuarioGrupo',
  foreignKey:'fk_grupo'
});
db.Usuario.belongsToMany(db.Grupo, {
  through: 'UsuarioGrupo',
  foreignKey:'fk_usuario'
});

db.Grupo.belongsToMany(db.Proyecto, {
  through: 'ProyectoGrupo',
  foreignKey:'fk_grupo'
});
db.Proyecto.belongsToMany(db.Grupo, {
  through: 'ProyectoGrupo',
  foreignKey:'fk_proyecto'
});

db.Usuario.hasMany(db.Repositorio, {
  foreignKey: {
    name: "fk_usuario",
    allowNull: false
  }
});
db.Repositorio.belongsTo(db.Usuario, {
  foreignKey: {
    name: "fk_usuario",
    allowNull: false
  }
});
db.Repositorio.hasMany(db.Proyecto, {
  foreignKey: {
    name: "fk_repositorio",
    allowNull: true
  }
});

db.Proyecto.belongsTo(db.Repositorio, {
  foreignKey: {
    name: "fk_repositorio",
    allowNull: true
  }
});

db.Proyecto.belongsTo(db.Usuario, {
  foreignKey: {
    name: "fk_usuario",
    allowNull: true
  }
});

db.Repositorio.hasMany(db.Commit, {
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

db.Token.belongsTo(db.Usuario, {
  foreignKey: {
    name: "fk_usuario",
    allowNull: false
  }
});

module.exports = db;


// function createAssociation(usuarios) {
//   return async function (entity) {
//     for (const usuario of usuarios) {
//       let obj = {
//         fk_usuario: usuario._id,
//         fk_grupo: entity._id
//       }
//       await UsuarioGrupo.create(obj)
//         .then()
//         .catch(err => {
//           console.log(err);
//           return err;
//         });
//     }
//     return entity;
//   };
// }