"use strict";
var promisify = require("promisify-node");
var fse = promisify(require('fs-extra'));
const NodeGit = require('nodegit'),
    path = require('path');

var TOKEN = "c28ffbf512c5288d2add81b71174be2df09c665405e26f5d2f4554a547b82ecb";
var cloneURL = "https://gitlab.geo.gob.bo/psanchez/hub-software-backend"
var localPath = require("path").join("/tmp/repos");
var cloneOptions = {};
var remote;
cloneOptions.fetchOpts = {
    callbacks: {
        certificateCheck: function () {
            return 1;
        },
        credentials: function () {
            return NodeGit.Cred.userpassPlaintextNew(TOKEN, "x-oauth-basic");
        }
    }
};

function remote(repo) {
    console.log("s", repo);

    var repo = NodeGit.Remote.addPush(repo, "adsib", "")
}

function push(repo) {
    console.log("s", repo);
    var repo = NodeGit.Push(repo, "adsib", "")
}
class Git {
    static clone() {
        fse.remove(localPath).then(function () {
            NodeGit.Clone(cloneURL, localPath, cloneOptions)
                .done(function (repo) {
                    if (repo instanceof NodeGit.Repository) {
                        NodeGit.Remote.delete(repo, "origin").then(() => {
                            return NodeGit.Remote.create(repo, "origin", "https://gitlab.com/paulpsan/prueba").then(remoteResult => {
                                remote = remoteResult;
                                return remote.push(
                                    ["refs/heads/master:refs/heads/master"], {
                                        callbacks: {
                                            certificateCheck: function () {
                                                return 1;
                                            },
                                            credentials: function () {
                                                return NodeGit.Cred.userpassPlaintextNew('8xAkhgGhrJLxPoea8e4Q', "x-oauth-basic");
                                            }
                                        }
                                    }
                                ).then(resp => {
                                    console.log("then", resp);
                                }).catch(err => {
                                    console.log("err", err);
                                })
                            })
                        })
                        console.info("We cloned the repo!");
                    } else {
                        console.error("Something borked :(");
                    }
                });
        });
    }
    static push(repo) {
        console.log("s", repo);
        var repo = NodeGit.Remote.create(repo, "adsib", "http://192.168.5.217/psanchez/prueba.git")
    }
    // static delete() {
    //     fs.removeSync('/tmp/repo');
    // }

}
export default Git;