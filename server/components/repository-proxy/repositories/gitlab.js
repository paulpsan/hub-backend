'use strict';

import gitlabFactory from 'gitlab';

var request = require('request');

// const gitlabproxy = 'http://192.168.40.217/api/v1/';
const gitlaburl = 'https://gitlab.geo.gob.bo/api/v4';
const gitlabtoken = '7-VmBEpTd33s28N5dHvy';

var proyectoJson = {
  id: 0,
  descripcion: '',
  branch_por_defecto: '',
  tags: [],
  ssh_url_repo: '',
  http_url_repo: '',
  web_url: '',
  nombre: '',
  directorio: '',
  directorio_con_grupo: '',
  fecha_creacion: '',
  fecha_ultima_actividad: '',
  id_del_creador: 0,
  grupo: {
    id: 0,
    nombre: '',
    directorio: ''
  },
  contador_estrellas: 0,
  contador_forks: 0,
  usuarios: [],
  eventos: [],
  commits: []
}


class Gitlab {
  constructor(urlBase, token) {
    console.log(urlBase);
    this.gitlab = gitlabFactory({
      url: urlBase,
      token: token
    });
  }

  /**
	 * Se modifica para que obtenga los proyectos en el formato solicitado
	 */
  proyectos(opciones) {
    let object = this.gitlab;
	if(opciones === undefined){
		opciones={
			pagina:1,
			limite:20
		}
	}
	var formParams = {
		private_token:gitlabtoken,
		order_by:'name',
		sort:'asc',
		page: opciones.pagina,
		per_page: opciones.limite
	}
	//console.log(opciones);
	if(opciones.buscar!==undefined){
		formParams.search=opciones.buscar;
	}
	//console.log(formParams);
    return new Promise(function (resolve,reject) {
    	let urlGetProyectos=gitlaburl+"/projects"
    	console.log(urlGetProyectos);
    	request(urlGetProyectos, {rejectUnauthorized: false, form:formParams}, function (error, response, body) {
    		if(error===null){
    			//console.log(body);
    			var proyectos = JSON.parse(body);
    			var proyectos_procesados=[];
    	    	for(var i=0;i<proyectos.length;i++){
    	    		//console.log(response.headers);
    	    		//console.log(proyectos[i].path_with_namespace);
    	    		var proyectoJson = {
    	    		      id: proyectos[i].id,
    	    		      descripcion: proyectos[i].description,
    	    		      branch_por_defecto: proyectos[i].default_branch,
    	    		      tags: proyectos[i].tag_list,
    	    		      ssh_url_repo: proyectos[i].ssh_url_to_repo,
    	    		      http_url_repo: proyectos[i].http_url_to_repo,
    	    		      web_url: proyectos[i].web_url,
    	    		      nombre: proyectos[i].name,
    	    		      directorio: proyectos[i].path,
    	    		      directorio_con_grupo: proyectos[i].path_with_namespace,
    	    		      fecha_creacion: proyectos[i].created_at,
    	    		      fecha_ultima_actividad: proyectos[i].last_activity_at,
    	    		      icono: proyectos[i].avatar_url,
    	    		      id_creador: proyectos[i].creator_id,
    	    		      grupo: proyectos[i].namespace,
    	    		      contador_estrellas: proyectos[i].star_count,
    	    		      contador_forks: proyectos[i].forks_count,
    	    		      usuarios: [],
    	    		      totalCommits: 0,
    	    		   }
    	    		proyectos_procesados.push(proyectoJson);
    	    	}
    	    	var metadatos = {
    	    		total: response['headers']['x-total'],
    	    		cantidad: proyectos_procesados.lenght,
    	    		porPagina: response['headers']['x-per-page'],
    	    		paginaActual: response['headers']['x-page'],
    	    		totalPaginas: response['headers']['x-total-pages']
    	    	};
    	    	resolve({metadatos:metadatos, datos:proyectos_procesados});
    		}else{
    			let mensaje="Error al obtener los proyectos";
    			console.log(mensaje,error);
    			reject({
    	           message: mensaje
    	        });
    		}
    	});
    	
//      object.projects.all(function (proyectos) {
//    	var proyectos_procesados=[];
//    	for(var i=0;i<proyectos.length;i++){
//    		console.log(proyectos[i].path_with_namespace);
//    		var proyectoJson = {
//    		      id: proyectos[i].id,
//    		      descripcion: proyectos[i].description,
//    		      branch_por_defecto: proyectos[i].default_branch,
//    		      tags: proyectos[i].tag_list,
//    		      ssh_url_repo: proyectos[i].ssh_url_to_repo,
//    		      http_url_repo: proyectos[i].http_url_to_repo,
//    		      web_url: proyectos[i].web_url,
//    		      nombre: proyectos[i].name,
//    		      directorio: proyectos[i].path,
//    		      directorio_con_grupo: proyectos[i].path_with_namespace,
//    		      fecha_creacion: proyectos[i].created_at,
//    		      fecha_ultima_actividad: proyectos[i].last_activity_at,
//    		      icono: proyectos[i].avatar_url,
//    		      id_creador: proyectos[i].creator_id,
//    		      grupo: proyectos[i].namespace,
//    		      contador_estrellas: proyectos[i].star_count,
//    		      contador_forks: proyectos[i].forks_count,
//    		      usuarios: [],
//    		      totalCommits: 0,
//    		   }
//    		proyectos_procesados.push(proyectoJson);
//    	}
//        // resolve(proyectos);
//    	resolve(proyectos_procesados);
//      });
    });
  }

  /**
	 * @param url
	 *            /grupo/proyecto_publico
	 */
  proyecto(url) {
    let object = this.gitlab;
    return new Promise(function (resolve, reject) {
      object.projects.show(url, function (proyecto) {
        // console.log(proyecto);
        var proyectoJson = {
          id: proyecto.id,
          descripcion: proyecto.description,
          branch_por_defecto: proyecto.default_branch,
          tags: proyecto.tag_list,
          ssh_url_repo: proyecto.ssh_url_to_repo,
          http_url_repo: proyecto.http_url_to_repo,
          web_url: proyecto.web_url,
          nombre: proyecto.name,
          directorio: proyecto.path,
          directorio_con_grupo: proyecto.path_with_namespace,
          fecha_creacion: proyecto.created_at,
          fecha_ultima_actividad: proyecto.last_activity_at,
          icono: proyecto.avatar_url,
          id_creador: proyecto.creator_id,
          grupo: proyecto.namespace,
          contador_estrellas: proyecto.star_count,
          contador_forks: proyecto.forks_count,
          usuarios: [],
          totalCommits: 0,
        }
        // console.log (proyectoJson);
        if (proyecto !== null) {
          // obtenemos a los usuarios del proyecto
          request(gitlaburl + '/projects/' + proyecto.id + '/users?per_page=100', {
            rejectUnauthorized: false
          }, function (error, response_us, body) {
            if (response_us.statusCode === 200) {
              var usuarios = JSON.parse(body);
              // proyectoJson.usuarios= usuarios;
            }
            // obtenermos a los eventos del proyecto
            var urlGetEvents=gitlaburl+'/projects/'+proyecto.id+'/events?private_token='+gitlabtoken+'&per_page=100';
            console.log(urlGetEvents);
            request(urlGetEvents,{rejectUnauthorized: false}, function (error, response_ev, body){
              if(response_us.statusCode === 200){
                var eventos = JSON.parse(body);
              }
              // obtenemos los commits separados
              var urlGetCommits = gitlaburl + '/projects/' + proyecto.id + '/repository/commits?private_token=' + gitlabtoken + '&per_page=100';
              console.log(urlGetCommits);
              request(urlGetCommits, {
                rejectUnauthorized: false
              }, function (error, response, body) {
                if (response.statusCode === 200) {
                  var commits = [];
                  if (response['headers']['x-total']) {
                    proyectoJson.totalCommits = response['headers']['x-total'];
                  }
                  if(commits = JSON.parse(body)){
                    // inicializacion de commits para cada usuario
                    for(var i=0; i<usuarios.length; usuarios[i].commits=[],i++);
                    var commitsDepurados=[];
                    // max T(n)=n3
                    for(var i=0; i<eventos.length; i++){
                      // si hay commits
                      if(eventos[i].data!==null){
                        for(var j=0;j<usuarios.length;j++){
                          if(usuarios[j].id===eventos[i].author_id){
                            usuarios[j].email=eventos[i].data.user_email;
                          }
                        }
                        for(var j=0;j<eventos[i].data.commits.length;j++){
                          for(var k=0;k<commits.length;k++){
                            if(commits[k].id===eventos[i].data.commits[j].id){
                              var commitDepurado=commits[k];
                              commitDepurado.author_id=eventos[i].author_id;
                              commitsDepurados.push(commitDepurado);
                              j=eventos[i].data.commits.length+1;
                              break;
                            }
                          }
                        }  
                      }
                    }
                    for(var j=0; j<usuarios.length; j++){
                      for(var k=0;k<commitsDepurados.length;k++){
                        if(usuarios[j].id===commitsDepurados[k].author_id){
                          var commitUsuario={
                            id:commitsDepurados[k].id,
                            fecha:commitsDepurados[k].committed_date
                          };
                          usuarios[j].commits.push(commitUsuario);    
                        }
                      }
                    }
                    proyectoJson.usuarios=usuarios;
                  }
                  resolve(proyectoJson);
                }
              });
            });
          });
        } else {
          reject({
            message: "El proyecto " + url + " no es publico"
          });
        }
      });
    });
  }

  /**
	 * Obtiene un proyecto publico por ID
	 * 
	 * @param id
	 * El identificador del proyecto a mostrar @
	 * @return un promise
	 */
  proyectoId(id) {
    return new Promise(function (resolve,reject) {
    	let urlGetProyecto=gitlaburl+"/projects/"+id;
    	console.log(urlGetProyecto);
    	request(urlGetProyecto, {rejectUnauthorized: false,form:{private_token:gitlabtoken}}, function (error, response, body) {
    		if (response.statusCode === 200 && error === null) {
    			var proyecto=JSON.parse(body);
    			var proyectoJson = {
    				id: proyecto.id,
    			    descripcion: proyecto.description,
    			    branch_por_defecto: proyecto.default_branch,
    			    tags: proyecto.tag_list,
    			    ssh_url_repo: proyecto.ssh_url_to_repo,
    			    http_url_repo: proyecto.http_url_to_repo,
    			    web_url: proyecto.web_url,
    			    nombre: proyecto.name,
    			    directorio: proyecto.path,
    			    directorio_con_grupo: proyecto.path_with_namespace,
    			    fecha_creacion: proyecto.created_at,
    			    fecha_ultima_actividad: proyecto.last_activity_at,
    			    icono: proyecto.avatar_url,
    			    id_creador: proyecto.creator_id,
    			    grupo: proyecto.namespace,
    			    contador_estrellas: proyecto.star_count,
    			    contador_forks: proyecto.forks_count,
    			    usuarios: [],
    			    totalCommits: 0,
    			    tags: proyecto.tag_list,
    			}
    			//console.log(proyectoJson);
    			var urlGetUsers=gitlaburl+'/projects/'+ id +'/users';
    			//console.log(urlGetUsers);
    			request(urlGetUsers, {rejectUnauthorized: false, form:{private_token:gitlabtoken}}, function (error, response_us, body) {
    	            if (response_us.statusCode === 200) {
    	              var usuarios = JSON.parse(body);
    	              // proyectoJson.usuarios= usuarios;
    	            }
    	            // obtenermos a los eventos del proyecto
    	            //var urlGetEvents=gitlaburl+'/projects/'+ id +'/events?private_token='+gitlabtoken+'&per_page=100';
    	            var urlGetEvents=gitlaburl+'/projects/'+ id +'/events';
    	            console.log(urlGetEvents);
    	            request(urlGetEvents,{rejectUnauthorized: false, form:{private_token:gitlabtoken}}, function (error, response_ev, body){
    	              if(response_us.statusCode === 200){
    	                var eventos = JSON.parse(body);
    	              }
    	              // obtenemos los commits separados
    	              //var urlGetCommits = gitlaburl + '/projects/' + id + '/repository/commits?private_token=' + gitlabtoken + '&per_page=100';
    	              var urlGetCommits = gitlaburl + '/projects/' + id + '/repository/commits';
    	              console.log(urlGetCommits);
    	              request(urlGetCommits, {
    	                rejectUnauthorized: false,form:{private_token:gitlabtoken}
    	              }, function (error, response, body) {
    	                if (response.statusCode === 200) {
    	                  var commits = [];
    	                  if (response['headers']['x-total']) {
    	                    proyectoJson.totalCommits = response['headers']['x-total'];
    	                  }
    	                  if(commits = JSON.parse(body)){
    	                    // inicializacion de commits para cada usuario
    	                    for(var i=0; i<usuarios.length; usuarios[i].commits=[],i++);
    	                    var commitsDepurados=[];
    	                    // max T(n)=n3
    	                    for(var i=0; i<eventos.length; i++){
    	                      // si hay commits
    	                      if(eventos[i].data!==null){
    	                        for(var j=0;j<usuarios.length;j++){
    	                          if(usuarios[j].id===eventos[i].author_id){
    	                            usuarios[j].email=eventos[i].data.user_email;
    	                          }
    	                        }
    	                        for(var j=0;j<eventos[i].data.commits.length;j++){
    	                          for(var k=0;k<commits.length;k++){
    	                            if(commits[k].id===eventos[i].data.commits[j].id){
    	                              var commitDepurado=commits[k];
    	                              commitDepurado.author_id=eventos[i].author_id;
    	                              commitsDepurados.push(commitDepurado);
    	                              j=eventos[i].data.commits.length+1;
    	                              break;
    	                            }
    	                          }
    	                        }  
    	                      }
    	                    }
    	                    for(var j=0; j<usuarios.length; j++){
    	                      for(var k=0;k<commitsDepurados.length;k++){
    	                        if(usuarios[j].id===commitsDepurados[k].author_id){
    	                          var commitUsuario={
    	                            id:commitsDepurados[k].id,
    	                            fecha:commitsDepurados[k].committed_date
    	                          };
    	                          usuarios[j].commits.push(commitUsuario);    
    	                        }
    	                      }
    	                    }
    	                    proyectoJson.usuarios=usuarios;
    	                  }
    	                  resolve(proyectoJson);
    	                }
    	              });
    	            });
    	          });
    		}else{
    			let mensaje="Error al obtener el proyecto: "+id;
    			console.log(mensaje,error);
    			reject({
    	           message: mensaje
    	        });
    		}
    	});
    });
  }
  
  
  /**
   * Obtiene un proyecto a partir de si ID
   * @param idProyecto Identificador del proyecto
   * */
  getProyecto(idProyecto) {
    return new Promise(function (resolve, reject) {
    	request
	      object.projects.show(url, function (proyecto) {
	        // console.log(proyecto);
	        var proyectoJson = {
	          id: proyecto.id,
	          descripcion: proyecto.description,
	          branch_por_defecto: proyecto.default_branch,
	          tags: proyecto.tag_list,
	          ssh_url_repo: proyecto.ssh_url_to_repo,
	          http_url_repo: proyecto.http_url_to_repo,
	          web_url: proyecto.web_url,
	          nombre: proyecto.name,
	          directorio: proyecto.path,
	          directorio_con_grupo: proyecto.path_with_namespace,
	          fecha_creacion: proyecto.created_at,
	          fecha_ultima_actividad: proyecto.last_activity_at,
	          icono: proyecto.avatar_url,
	          id_creador: proyecto.creator_id,
	          grupo: proyecto.namespace,
	          contador_estrellas: proyecto.star_count,
	          contador_forks: proyecto.forks_count,
	          usuarios: [],
	          totalCommits: 0,
	        }
	        // console.log (proyectoJson);
	        if (proyecto !== null) {
	          // obtenemos a los usuarios del proyecto
	          request(gitlaburl + '/projects/' + proyecto.id + '/users?per_page=100', {
	            rejectUnauthorized: false
	          }, function (error, response_us, body) {
	            if (response_us.statusCode === 200) {
	              var usuarios = JSON.parse(body);
	              // proyectoJson.usuarios= usuarios;
	            }
	            // obtenermos a los eventos del proyecto
	            var urlGetEvents=gitlaburl+'/projects/'+proyecto.id+'/events?private_token='+gitlabtoken+'&per_page=100';
	            console.log(urlGetEvents);
	            request(urlGetEvents,{rejectUnauthorized: false}, function (error, response_ev, body){
	              if(response_us.statusCode === 200){
	                var eventos = JSON.parse(body);
	              }
	              // obtenemos los commits separados
	              var urlGetCommits = gitlaburl + '/projects/' + proyecto.id + '/repository/commits?private_token=' + gitlabtoken + '&per_page=100';
	              console.log(urlGetCommits);
	              request(urlGetCommits, {
	                rejectUnauthorized: false
	              }, function (error, response, body) {
	                if (response.statusCode === 200) {
	                  var commits = [];
	                  if (response['headers']['x-total']) {
	                    proyectoJson.totalCommits = response['headers']['x-total'];
	                  }
//	                  if(commits = JSON.parse(body)){
//	                    // inicializacion de commits para cada usuario
//	                    for(var i=0; i<usuarios.length; usuarios[i].commits=[],i++);
//	                    var commitsDepurados=[];
//	                    // max T(n)=n3
//	                    for(var i=0; i<eventos.length; i++){
//	                      // si hay commits
//	                      if(eventos[i].data!==null){
//	                        for(var j=0;j<usuarios.length;j++){
//	                          if(usuarios[j].id===eventos[i].author_id){
//	                            usuarios[j].email=eventos[i].data.user_email;
//	                          }
//	                        }
//	                        for(var j=0;j<eventos[i].data.commits.length;j++){
//	                          for(var k=0;k<commits.length;k++){
//	                            if(commits[k].id===eventos[i].data.commits[j].id){
//	                              var commitDepurado=commits[k];
//	                              commitDepurado.author_id=eventos[i].author_id;
//	                              commitsDepurados.push(commitDepurado);
//	                              j=eventos[i].data.commits.length+1;
//	                              break;
//	                            }
//	                          }
//	                        }  
//	                      }
//	                    }
//	                    for(var j=0; j<usuarios.length; j++){
//	                      for(var k=0;k<commitsDepurados.length;k++){
//	                        if(usuarios[j].id===commitsDepurados[k].author_id){
//	                          var commitUsuario={
//	                            id:commitsDepurados[k].id,
//	                            fecha:commitsDepurados[k].committed_date
//	                          };
//	                          usuarios[j].commits.push(commitUsuario);    
//	                        }
//	                      }
//	                    }
//	                    proyectoJson.usuarios=usuarios;
//	                  }
	                  proyectoJson.usuarios=usuarios;
	                  resolve(proyectoJson);
	                }
	              });
	            });
	          });
	        } else {
	          reject({
	            message: "El proyecto " + url + " no es publico"
	          });
	        }
	      });
	    });
	  }

}

export default Gitlab;
