/*eslint-env node, mocha*/
/**
 * Generated by PluginGenerator 2.20.5 from webgme on Wed Dec 12 2018 16:14:35 GMT-0600 (Central Standard Time).
 */

describe('ImportSpaceExConfig', function () {
    var testFixture = require('../../globals'),
        Q = testFixture.Q,
        gmeConfig = testFixture.getGmeConfig(),
        expect = testFixture.expect,
        fs = testFixture.fs,
        path = testFixture.path,
        bc,
        core,
        rootHash,
        logger = testFixture.logger.fork('ImportSpaceExConfig'),
        PluginCliManager = testFixture.WebGME.PluginCliManager,
        projectName = 'testProject',
        pluginName = 'ImportSpaceExConfig',
        project,
        gmeAuth,
        storage,
        commitHash;

    before(function (done) {
        testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName)
            .then(function (gmeAuth_) {
                gmeAuth = gmeAuth_;
                // This uses in memory storage. Use testFixture.getMongoStorage to persist test to database.
                storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth);
                return storage.openDatabase();
            })
            .then(function () {
                var importParam = {
                    projectSeed: path.join(process.cwd(), 'test/assets/testEmpty.webgmex'),
                    projectName: projectName,
                    branchName: 'master',
                    logger: logger,
                    gmeConfig: gmeConfig
                };

                return testFixture.importProject(storage, importParam);
            })
            .then(function (importResult) {
                project = importResult.project;
                commitHash = importResult.commitHash;
                bc = importResult.blobClient;
                rootHash = importResult.rootHash;
                core = importResult.core;
            })
            .nodeify(done);
    });

    after(function (done) {
        storage.closeDatabase()
            .then(function () {
                return gmeAuth.unload();
            })
            .nodeify(done);
    });

    it('should run plugin and update the branch', function (done) {
        var manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {},
            newHash,
            fileContent = fs.readFileSync(path.join(process.cwd(), 'test/assets/3d_stable.cfg'), 'utf8'),
            context = {
                project: project,
                commitHash: commitHash,
                branchName: 'master',
                activeNode: '/v/W',
            };

        bc.putFile('testConfig.cfg', fileContent)
            .then(function (hash) {
                pluginConfig.configFile = hash;
                return Q.ninvoke(manager, 'executePlugin', pluginName, pluginConfig, context);
            })
            .then(function (result) {
                expect(typeof result).to.equal('object');
                expect(result.success).to.equal(true);

                return project.getBranchHash('master');
            })
            .then(function (hash) {
                expect(hash).to.not.equal(commitHash);
                newHash = hash;
                return testFixture.loadRootNodeFromCommit(project, core, hash);
            })
            .then(function (root) {
                expect(root).not.to.equal(null);

                return core.loadByPath(root, '/v/W');
            })
            .then(function (model) {
                expect(model).not.to.equal(null);
                expect(core.getAttribute(model, 'name')).to.equal('test');
                return core.loadChildren(model);
            })
            .then(function (children) {
                expect(children).not.to.equal(null);
                expect(children).to.have.length(1);
                expect(core.getAttribute(children[0], 'content')).to.equal(fileContent);
                return project.setBranchHash('master', commitHash, newHash);
            })
            .nodeify(done);
    });

    it('should properly import all given configuration file', function (done) {
        this.timeout(3000);
        var manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {},
            directory = path.join(process.cwd(), 'test/assets'),
            files = fs.readdirSync(path.join(process.cwd(), 'test/assets')),
            checking = false,
            checkFile = function (filename) {
                var newHash,
                    fileContent;
                if (path.extname(filename) !== '.cfg') {
                    checking = false;
                    return;
                }

                // console.log(filename);
                fileContent = fs.readFileSync(path.join(directory, filename), 'utf8');
                bc.putFile(filename, fileContent)
                    .then(function (hash) {
                        pluginConfig.configFile = hash;
                        return Q.ninvoke(manager, 'executePlugin', pluginName, pluginConfig, context);
                    })
                    .then(function (result) {
                        expect(typeof result).to.equal('object');
                        expect(result.success).to.equal(true);
                        expect(result.commits).to.have.length(2);
                        newHash = result.commits[1].commitHash;
                        return testFixture.loadRootNodeFromCommit(project, core, newHash);
                    })
                    .then(function (root) {
                        expect(root).not.to.equal(null);

                        return core.loadByPath(root, '/v/W');
                    })
                    .then(function (model) {
                        expect(model).not.to.equal(null);
                        expect(core.getAttribute(model, 'name')).to.equal('test');
                        return core.loadChildren(model);
                    })
                    .then(function (children) {
                        expect(children).not.to.equal(null);
                        expect(children).to.have.length(1);
                        expect(core.getAttribute(children[0], 'content')).to.equal(fileContent);
                        return project.setBranchHash('master', newHash, commitHash);
                    })
                    .then(function () {
                        checking = false;
                    })
                    .catch(done);
            },
            timer,
            fileContent = fs.readFileSync(path.join(process.cwd(), 'test/assets/3d_stable.cfg'), 'utf8'),
            context = {
                project: project,
                commitHash: commitHash,
                activeNode: '/v/W',
            };

        timer = setInterval(function () {
            if (checking === false) {
                if (files.length === 0) {
                    clearInterval(timer);
                    done();
                } else {
                    checking = true;
                    checkFile(files.pop());
                }
            }
        }, 100);
    });
});
