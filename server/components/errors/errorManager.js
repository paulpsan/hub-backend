import * as filtro from '../errors/busqueda.filter';

export function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    // res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    // res.header("Pragma", "no-cache");
    // res.header("Expires", 0);
    if (entity) {
      if (!res.busquedaInterna)
        res.status(statusCode).json(entity);
      else {
        if (res.inclusiones) {
          entity.rows = filtro.filtrar(entity.rows, res.inclusiones);
          entity.count = entity.rows.length;
        }
        if (res.tienePaginacion) {
          entity.rows = entity.rows.slice(res.offset, res.offset + res.limit);
        }
        res.status(statusCode).json(entity);
      }
    }
  };
}

export function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

export function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.header("Cache-Control", "no-cache, no-store, must-revalidate");
          res.header("Pragma", "no-cache");
          res.header("Expires", 0);
          res.status(204).end();
        });
    }
  };
}

export function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      // TODO crear un error customizado.
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.status(404).json({
        message: 'Entidad no encontrada'
      }).end();
      return null;
    }
    return entity;
  };
}

export function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    if (err.name === 'SequelizeValidationError') {
      statusCode = 400;
      //TODO formatear el error de la validadcion, remover objetos inecesarios
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      //err.message = 'El objeto ya existe';
    } else if (err.name === 'SequelizeDatabaseError') {
      statusCode = 400;
    }
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.status(statusCode).send(err);
  };
}
