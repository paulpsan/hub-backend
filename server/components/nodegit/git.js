"use strict";
import config from "../../config/environment"
var promisify = require("promisify-node");
var fse = promisify(require('fs-extra'));
const NodeGit = require('nodegit'),
    path = require('path');

var TOKEN = config.repo.gitlab.privateToken;
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
    static addFile(obj) {
        var fileName = "newFile.txt";
        var fileContent = "hello world";

        var repoDir = "/tmp/repos";

        var repository;
        var remote;

        var signature = NodeGit.Signature.create("Foo bar",
            "foo@bar.com", 123456789, 60);

        // Create a new repository in a clean directory, and add our first file
        fse.remove(path.resolve(__dirname, repoDir))
            .then(function () {
                return fse.ensureDir(path.resolve(__dirname, repoDir));
            })
            .then(function () {
                return NodeGit.Repository.init(path.resolve(__dirname, repoDir), 0);
            })
            .then(function (repo) {
                repository = repo;
                console.log(repo);
                return fse.writeFile(path.join(repository.workdir(), fileName), fileContent);
            })

            // Load up the repository index and make our initial commit to HEAD
            .then(function () {
                return repository.refreshIndex();
            })
            .then(function (index) {
                return index.addByPath(fileName)
                    .then(function () {
                        return index.write();
                    })
                    .then(function () {
                        return index.writeTree();
                    });
            })
            .then(function (oid) {
                return repository.createCommit("HEAD", signature, signature,
                    "initial commit", oid, []);
            })

            // Add a new remote
            .then(function () {
                return NodeGit.Remote.create(repository, "origin",
                        "http://gitlab.paul.com:30080/psanchez/prueba2.git")
                    .then(function (remoteResult) {
                        remote = remoteResult;
                        console.log("remote");
                        // Create the push object for this remote
                        return repository.fetch("origin", {
                                callbacks: {
                                    credentials: function () {
                                        return NodeGit.Cred.userpassPlaintextNew("psanchez", "12345678");
                                    }
                                }
                            })

                        // return remote.push(
                        //         ["refs/heads/master:refs/heads/master"], {
                        //             callbacks: {
                        //                 credentials: function (url, userName) {
                        //                     return NodeGit.Cred.sshKeyFromAgent(userName);
                        //                 }
                        //             }
                        //         }
                        //     )
                            .then(resp => {
                                console.log("then", resp);
                            }).catch(err => {
                                console.log("err", err);
                            })
                    })
            })
        // .done(function () {
        //     console.log("Done!");
        // });
    }
}
export default Git;