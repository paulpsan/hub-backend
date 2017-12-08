'use strict';

import {
  inclusiones
} from '../../../sqldb';

function obtenerInclusiones(modeloRaw, atributos) {
  let indice = modeloRaw.indexOf('.');
  let modelo = indice !== -1 ? modeloRaw.substring(0, indice) : modeloRaw;
  let includes = [{
    model: inclusiones[modelo],
    as: modelo
  }];
  if (indice !== -1) {
    let subInclusion = modeloRaw.substring(indice + 1);
    includes[0].includes = obtenerInclusiones(subInclusion, atributos);
  }
  return includes;
}

function asignarAtributos(inclusion, atributos) {
  if (inclusion[0].includes) {
    asignarAtributos(inclusion[0].includes, atributos);
  }
  inclusion[0].attributes = atributos;
  return;
}

function obtenerAtributos(modelo = '', atributosRaw) {
  let atributos = [];
  if (atributosRaw !== null) {
    if (modelo == '') {
      atributos = atributosRaw.filter(atributo => !atributo.includes('.'));
    } else {
      atributosRaw
        .filter(atributo => atributo.startsWith(modelo))
        .forEach(atr => atributos.push(atr.substring(modelo.length + 1)));
    }
  }
  return atributos;
}

class Inclusor {

  static incluirSequelize(incluir = '', atributos = '') {
    let modelosRaw = incluir == '' ? [] : incluir.split(',');
    let atributosRaw = atributos == '' ? null : atributos.split(',');
    let includes = [];
    modelosRaw.forEach(modeloRaw => {
      let atributosIncluir = obtenerAtributos(modeloRaw, atributosRaw);
      let modelosIncluir = obtenerInclusiones(modeloRaw);
      if (atributosIncluir.length > 0) {
        asignarAtributos(modelosIncluir, atributosIncluir);
      }
      includes.push(modelosIncluir[0]);
    });
    console.log(includes);
    return includes;
  }

  static obtnerAtributos(atributos = '') {
    let atributosRaw = atributos == '' ? null : atributos.split(',');
    let atributosIncluir = obtenerAtributos('', atributosRaw);
    return atributosIncluir.length > 0 ? {
      attributes: obtenerAtributos('', atributosRaw)
    } : null;
  }
}

export default Inclusor;
