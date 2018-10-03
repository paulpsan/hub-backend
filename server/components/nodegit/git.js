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
        var fileName = "newfile.txt";
        var fileContent = "hello world";
        var directoryName = "/home/paul";
        var repo;
        var index;
        var oid;
        console.log(obj);
        fse.remove(localPath).then(function () {
            NodeGit.Clone(obj.path, localPath, cloneOptions).done(function (repo) {
                if (repo instanceof NodeGit.Repository) {
                    console.info("We cloned the repo!");
                } else {
                    console.error("Something borked :(");
                }
                NodeGit.Repository.open(localPath).then(function (repoResult) {
                        repo = repoResult;
                        return fse.ensureDir(path.join(repo.workdir(), directoryName));
                    })
                    .then(function () {
                        return fse.writeFile(path.join(repo.workdir(), fileName), fileContent);
                    })
                    // .then(function () {
                    //     return fse.writeFile(
                    //         path.join(repo.workdir(), directoryName, fileName),
                    //         fileContent
                    //     );
                    // })
                    .then(function () {
                        return repo.refreshIndex();
                    })
                    .then(function (indexResult) {
                        console.log(indexResult);
                        index = indexResult;
                    })
                    .then(function () {
                        // this file is in the root of the directory and doesn't need a full path
                        return index.addByPath(fileName);
                    })
                    // .then(function () {
                    // this file is in a subdirectory and can use a relative path
                    // return index.addByPath(path.posix.join(directoryName, fileName));
                    // })
                    .then(function () {
                        // this will write both files to the index
                        return index.write();
                    })
                    .then(function () {
                        return index.writeTree();
                    })
                    .then(function (oidResult) {
                        oid = oidResult;
                        return NodeGit.Reference.nameToId(repo, "HEAD");
                    })
                    .then(function (head) {
                        return repo.getCommit(head);
                    })
                    .then(function (parent) {
                        var author = NodeGit.Signature.create("Scott Chacon",
                            "schacon@gmail.com", 123456789, 60);
                        var committer = NodeGit.Signature.create("Scott A Chacon",
                            "scott@github.com", 987654321, 90);

                        return repo.createCommit("HEAD", author, committer, "message", oid, [parent]);
                    })
                    .done(function (commitId) {
                        console.log("New Commit: ", commitId);
                    })
            })

        }).catch(err => {
            console.log(err);
        })

    }
}
export default Git;