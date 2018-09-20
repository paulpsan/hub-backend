"use strict";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Grupo", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Ingrese su nombre"
          }
        }
      },
      id_gitlab: {
        type: DataTypes.INTEGER,
         allowNull: false,
      },
      entidad: {
        type: DataTypes.TEXT,
      },
      estado: {
        type: DataTypes.TEXT
      },
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      visibilidad: {
        type: DataTypes.TEXT,
         allowNull: false,
      },
      path: {
        type: DataTypes.TEXT
      },
      usuarios: {
        type: DataTypes.JSONB
      },
      proyectos: {
        type: DataTypes.JSONB
      },
    }, {
      tableName: "grupo",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};