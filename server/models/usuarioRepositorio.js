'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('UsuarioRepositorio', {
    email: DataTypes.STRING
  }, {
    tableName: 'usuario_repositorio',
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion'
  });
}
