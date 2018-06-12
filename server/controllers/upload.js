/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/usuarios              ->  index
 * POST    /api/usuarios              ->  create
 * GET     /api/usuarios/:id          ->  show
 * PUT     /api/usuarios/:id          ->  upsert
 * PATCH   /api/usuarios/:id          ->  patch
 * DELETE  /api/usuarios/:id          ->  destroy
 */

"use strict";

import _ from "lodash";
import { Usuario, Repositorio, Proyecto } from "../sqldb";
var fs = require("fs");

export function uploadFile(req, res) {
  var tipo = req.params.tipo;
  var id = req.params.id;
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada",
      errors: { message: "Debe de seleccionar una imagen" }
    });
  }
  // Obtener nombre del archivo
  let archivo = req.files.imagen;
  console.log("archivo", archivo);
  let nombreCortado = archivo.name.split(".");
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Sólo estas extensiones aceptamos
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no válida",
      errors: {
        message: "Las extensiones válidas son " + extensionesValidas.join(", ")
      }
    });
  }

  // Nombre de archivo personalizado
  // 12312312312-123.png
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover el archivo del temporal a un path
  var path = `./server/uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({
    //   ok: true,
    //   mensaje: "Archivo movido",
    //   extensionArchivo: extensionArchivo
    // });
  });
}

function subirPorTipo(tipo, id, nombreArchivo, res) {
  console.log("entro");
  if (tipo === "usuarios") {
    Usuario.find({
      where: {
        _id: id
      }
    })
      .then(usuario => {
        if (!usuario) {
          return res.status(400).json({
            ok: true,
            mensaje: "Usuario no existe",
            errors: { message: "Usuario no existe" }
          });
        }
        var pathViejo = "./server/uploads/usuarios/" + usuario.avatar;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo);
        }
        usuario
          .update({ avatar: nombreArchivo })
          .then(usuarioActualizado => {
            return res.status(200).json({
              ok: true,
              mensaje: "Imagen de usuario actualizada",
              usuario: usuarioActualizado
            });
          })
          .catch(err => {
            return err;
          });
      })
      .catch(err => {
        return res.status(500).json({
          mensaje: "No se pudo actualizar",
          errors: err
        });
      });
  }

  if (tipo === "repositorios") {
    Repositorio.findById(id, (err, repositorio) => {
      if (!repositorio) {
        return res.status(400).json({
          ok: true,
          mensaje: "repositorio no existe",
          errors: { message: "repositorio no existe" }
        });
      }

      var pathViejo = "./uploads/repositorios/" + repositorio.avatar;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      repositorio.avatar = nombreArchivo;

      repositorio.save((err, repositorioActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de médico actualizada",
          repositorio: repositorioActualizado
        });
      });
    });
  }

  if (tipo === "proyectos") {
    Proyecto.findById(id, (err, proyecto) => {
      if (!proyecto) {
        return res.status(400).json({
          ok: true,
          mensaje: "proyecto no existe",
          errors: { message: "proyecto no existe" }
        });
      }

      var pathViejo = "./uploads/proyectos/" + proyecto.avatar;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      proyecto.avatar = nombreArchivo;

      proyecto.save((err, proyectoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de proyecto actualizada",
          proyecto: proyectoActualizado
        });
      });
    });
  }
}
