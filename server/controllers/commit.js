/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/commits              ->  index
 * POST    /api/commits              ->  create
 * GET     /api/commits/:id          ->  show
 * PUT     /api/commits/:id          ->  upsert
 * PATCH   /api/commits/:id          ->  patch
 * DELETE  /api/commits/:id          ->  destroy
 */

"use strict";

import {
  Commit
} from "../sqldb";
import https from "https";
import TokenController from "./token";
import qs from "querystringify";
import LineChart from "../components/graficos/lineChart";
import Sequelize from "sequelize";
import _ from "lodash";

var fetch = require("node-fetch");
var meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
const agent = new https.Agent({
  rejectUnauthorized: false
});

function getJson() {
  return function (resultado) {
    return resultado.json();
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    return entity
      .updateAttributes(updates)
      .then(updated => {
        return updated;
      })
      .catch(err => {
        return err;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy().then(() => {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function crearCommit(objCommit) {
  return Commit.findOne({
      where: {
        sha: objCommit.sha,
        fk_repositorio: objCommit.fk_repositorio
      }
    })
    .then(respCommit => {
      console.log("respCommit", respCommit);
      if (respCommit === null) {
        return Commit.create(objCommit).catch(err => {
          console.log(err);
        });
      } else {
        return respCommit.update(objCommit).catch(err => {
          console.log(err);
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}
async function addCommitsGithub(commits, repo) {
  for (const commit of commits) {
    let objCommit = {
      sha: commit.sha,
      autor: commit.commit.author.name || "",
      mensaje: commit.commit.message,
      fecha: commit.commit.author.date,
      id_usuario: repo.fk_usuario,
      estado: repo.visibilidad && repo.estado,
      avatar_autor: commit.committer !== null ? commit.committer.avatar_url : "",
      web_url_autor: commit.committer !== null ? commit.committer.html_url : "",
      fk_repositorio: repo._id
    };
    console.log("commm", objCommit.estado);
    await crearCommit(objCommit);
  }
  return true;
}
async function addCommitsGitlab(commits, repo) {
  for (const commit of commits) {
    let objCommit = {
      sha: commit.id,
      autor: commit.author_name || "",
      mensaje: commit.message,
      fecha: commit.committed_date,
      estado: repo.visibilidad && repo.estado,
      id_usuario: repo.fk_usuario,
      fk_repositorio: repo._id
    };
    await crearCommit(objCommit);
  }
  return true;
}
async function addCommitsBitbucket(commits, repo) {
  for (const commit of commits) {
    console.log(commit);
    let objCommit = {
      sha: commit.hash,
      autor: commit.author.user ? commit.author.user.username : "",
      mensaje: commit.message,
      fecha: commit.date,
      estado: repo.visibilidad && repo.estado,
      avatar_autor: commit.author.user ? commit.author.user.links.avatar.href : "",
      web_url_autor: commit.author.user ? commit.author.user.links.html.href : "",
      id_usuario: repo.fk_usuario,
      fk_repositorio: repo._id
    };
    await crearCommit(objCommit);
  }
  return true;
}

export function index(req, res) {
  return Commit.findAll({
      order: [
        ["fecha", "desc"]
      ]
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Commit from the DB
export function show(req, res) {
  return Commit.findAll({
      where: {
        fk_repositorio: req.params.id
      },
      order: [
        ["fecha", "desc"]
      ]
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

async function getToken(repo) {
  let token = await TokenController.getToken(repo.tipo, repo.fk_usuario);
  return token;
}

// Creates a new Commit in the DB
export async function create(req, res) {
  let repo = req.body;
  let tipo = req.body.tipo;
  let options =
    "&" +
    qs.stringify({
      page: 1,
      per_page: 100
    });
  let token = await getToken(repo);
  switch (tipo) {
    case "github":
      fetch(repo.commits.url + "?access_token=" + token + options, {
          agent,
          strictSSL: false
        })
        .then(getJson())
        .then(commits => {
          //validar
          if (addCommitsGithub(commits, repo)) {
            res.json({
              respuesta: "Se actualizaron correctamente!"
            });
          } else {
            res
              .status(500)
              .json({
                error: "Problema en actualizacion"
              })
              .end();
          }
        });

      break;
    case "bitbucket":
      options = options + "&" + qs.stringify({
        pagelen: 100
      });
      fetch(repo.commits.url + "?access_token=" + token + options, {
          agent,
          strictSSL: false
        })
        .then(getJson())
        .then(commits => {
          console.log(commits);
          if (addCommitsBitbucket(commits.values, repo)) {
            res.json({
              respuesta: "Se actualizaron correctamente!"
            });
          } else {
            res
              .status(500)
              .json({
                error: "Problema en actualizacion"
              })
              .end();
          }
        });

      break;
    default:
      if (token) {
        fetch(repo.commits.url + "?access_token=" + token + options, {
            agent,
            strictSSL: false
          })
          .then(response => {
            let total = response.headers.get("x-total");
            console.log("total", total);
            return response.json();
          })
          .then(commits => {
            if (addCommitsGitlab(commits, repo)) {
              res.json({
                respuesta: "Se actualizaron correctamente!"
              });
            } else {
              res
                .status(500)
                .json({
                  error: "Problema en actualizacion"
                })
                .end();
            }
          });
      } else {
        res
          .status(500)
          .json({
            error: "Problema en actualizacion"
          })
          .end();
      }
      break;
  }
}

// Upserts the given Commit in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Commit.upsert(req.body, {
      where: {
        _id: req.params.id
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Commit in the DB
export function patch(req, res) {
  return Commit.findAll({
      where: {
        fk_repositorio: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Commit from the DB
export function destroy(req, res) {
  return Commit.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
export function totalCommit(req, res) {
  return Commit.findOne({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id_usuario")), "total"]
      ],
      where: {
        id_usuario: req.params.id,
        estado: true
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(err => {
      console.log(err);
    });
}
//gráfica commits por usuario
export function byUser(req, res) {
  let result;
  return Commit.findAll({
      where: {
        id_usuario: req.params.id,
        estado: true
      },
      order: [
        ["fecha", "asc"]
      ]
    })
    .then(response => {
      result = LineChart.byCommits(response)
      console.log(result);
      return res
        .status(200)
        .json({
          total: result.total,
          años: result.año,
          mes: result.mes,
          heatMap:result.heatMap,
        });
    })
    .catch(err => {
      console.log(err);
    });
}

export function graficaRepositorio(req, res) {
  return Commit.findAll({
      where: {
        fk_repositorio: req.params.id,
        estado: true
      },
      order: [
        ["fecha", "asc"]
      ]
    })
    .then(response => {
      let barChartData = [];
      let años = [];
      let datosArray = [];
      let datosMes = [];
      let commits = response;
      let fecha;
      let count_month = 0;
      let dateAux;
      for (const key in commits) {
        fecha = new Date(commits[key].fecha);
        console.log(fecha);
        if (key == 0) {
          dateAux = new Date(fecha);
        }
        if (
          fecha.getMonth() === dateAux.getMonth() &&
          fecha.getFullYear() === dateAux.getFullYear()
        ) {
          count_month++;
          // console.log(fecha, meses[fecha.getMonth()]);
        } else {
          datosMes.push({
            año: dateAux.getFullYear(),
            mes: meses[dateAux.getMonth()],
            date: new Date(dateAux.getFullYear(), dateAux.getMonth()),
            total: count_month
          });
          count_month = 1;
          dateAux = new Date(fecha);
        }
      }
      datosMes.push({
        año: dateAux.getFullYear(),
        mes: meses[dateAux.getMonth()],
        date: new Date(dateAux.getFullYear(), dateAux.getMonth()),
        total: count_month
      });
      // datosMes = datosMes.reverse();
      console.log("+++++", datosMes);

      for (const commit of commits) {
        if (commit.estado) {
          fecha = new Date(commit.fecha);
          if (años.indexOf(fecha.getFullYear()) < 0) {
            años.push(fecha.getFullYear());
          }
        }
      }
      años = _.sortBy(años);
      for (const año of años) {
        let count_year = 0;
        for (const commit of commits) {
          fecha = new Date(commit.fecha);
          if (año === fecha.getFullYear()) {
            count_year += 1;
          }
        }
        datosArray.push(count_year);
      }

      barChartData.push({
        data: datosArray,
        label: "Commits"
      });
      return res
        .status(200)
        .json({
          años: {
            barChartData,
            años
          },
          mes: datosMes
        });
    })
    .catch(err => {
      console.log(err);
    });
}