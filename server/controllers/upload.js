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
import { Usuario, Repositorio, Proyecto } from "../sqldb";
import fs from "fs";
const path = require("path");

export function getImage(req, res) {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  console.log("pathImagen", pathImagen);

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var pathNoImagen = path.resolve(__dirname, "../assets/no-img.jpg");
    res.sendFile(pathNoImagen);
  }
}
export function uploadFile(req, res) {
  var tipo = req.params.tipo;
  var id = req.params.id;
  if (!req.files) {
    return res.status(400).json({
      mensaje: "No selecciono nada",
      errors: { message: "Debe de seleccionar una imagen" }
    });
  }
  // Obtener nombre del archivo
  let archivo = req.files.avatar;
  let nombreCortado = archivo.name.split(".");
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Sólo estas extensiones aceptamos
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
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
    Usuario.findById(id)
      .then(usuario => {
        if (!usuario) {
          return res.status(400).json({
            mensaje: "Usuario no existe",
            errors: { message: "Usuario no existe" }
          });
        }
        var pathViejo = "./server/uploads/usuarios/" + usuario.avatar;

        // Si existe, elimina la imagen anterior
        console.log(pathViejo);
        if (fs.existsSync(pathViejo) && usuario.avatar != "") {
          fs.unlink(pathViejo);
        }
        usuario
          .update({ avatar: nombreArchivo })
          .then(usuarioActualizado => {
            usuarioActualizado.password = ":)";
            return res.status(200).json({
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
    Repositorio.findById(id)
      .then(repositorio => {
        if (!repositorio) {
          return res.status(400).json({
            mensaje: "repositorio no existe",
            errors: { message: "repositorio no existe" }
          });
        }
        var pathViejo = "./server/uploads/repositorios/" + repositorio.avatar;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo) && repositorio.avatar != "") {
          fs.unlink(pathViejo);
        }

        repositorio.avatar = nombreArchivo;
        repositorio
          .update({ avatar: nombreArchivo })
          .then(repositorioActualizado => {
            return res.status(200).json({
              mensaje: "Imagen de repositorio actualizada",
              repositorio: repositorioActualizado
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

  if (tipo === "proyectos") {
    Proyecto.findById(id)
      .then(proyecto => {
        if (!proyecto) {
          return res.status(400).json({
            mensaje: "proyecto no existe",
            errors: { message: "proyecto no existe" }
          });
        }

        var pathViejo = "./uploads/proyectos/" + proyecto.avatar;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo) && proyecto.avatar != "") {
          fs.unlink(pathViejo);
        }
        proyecto
          .update({ avatar: nombreArchivo })
          .then(proyectoActualizado => {
            return res.status(200).json({
              mensaje: "Imagen de proyecto actualizada",
              proyecto: proyectoActualizado
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
}
