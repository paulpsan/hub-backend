'use strict';

import gitlab from './repositories/gitlab';

class ProxyService {
  constructor(url, repositorio) {
    this.url = url;
    this.repositorio = repositorio;
    this.obtenerServicio();
  }

  proyectos() {
    try {
      return this.servicio.proyectos();
    } catch (e) {
      console.log(e);
    }
  }

  proyecto() {
    try {
      console.log(this.repoId);
      return this.servicio.proyecto(this.repoId);
    } catch (e) {
      console.log(e);
    }
  }

  validarUrl() {
    try {
      this.host = this.repositorio.url.split('//')[1];
    } catch (e) {
      throw new Error('Url invalida');
    }
    if (!this.url.includes(this.host)) {
      throw new Error('Url incorrecta');
    }
  }

  obtenerProyecto() {
    this.repoId = this.url.split(this.host)[1].slice(0, -4).slice(1);
    return this.servicio.proyecto(this.repoId);
  }

  obtenerServicio() {
    try {
      //agregar validaciones para los otros repositorios
      if (this.repositorio.tipo == 'gitlab') {
        this.servicio = new gitlab(this.repositorio.url, '7-VmBEpTd33s28N5dHvy');
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default ProxyService;
