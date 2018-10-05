'use strict';

export function filtrar(registros, inclusionesBusqueda) {
  var resultado = [];
  inclusionesBusqueda.forEach(x=> {
    var inclusion = JSON.parse(x);
    resultado = [...resultado, ...registros.filter(registro=>(registro[inclusion.entidad].length >= inclusion.buscar.length))];
  });
  return resultado;
}
