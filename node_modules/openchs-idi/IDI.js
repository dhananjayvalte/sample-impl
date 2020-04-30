const HttpClient = require('./httpClient');
const prompt = require('./prompt');

class IDI {
    constructor() {
    }

    req(asUser, method, api) {
        return {
            asUser,
            run: (files, user) => this.requestMany(method, api, files, user)
        }
    }

    postRules(asUser) {
        const run = (files, user) => {
            if (!files.length) {
                this.logger(`-- SKIP: rules`);
                return Promise.resolve();
            }
            return HttpClient.getToken(user)
                .then(token => this.rulesConfig.postAllRules(user, files[0], this.serverUrl, token));
        };
        return {asUser, run};
    }

    configure(grunt, conf, rulesConfig) {
        const req = this.req.bind(this);
        this.grunt = grunt;
        this.conf = Object.assign({}, conf);
        if (this.conf.secrets) {
            console.assert('string' === typeof this.conf.secrets, "IDI configuration error: 'secrets' should be a filepath type String");
            this.conf.secrets = this.grunt.file.readJSON(this.conf.secrets);
        }
        this.rulesConfig = rulesConfig;
        HttpClient.load(this.conf.secrets, this.env);
        grunt.initConfig({
            deploy: {
                organisation: req('chs-admin', 'POST', 'organisation'),
                adminUsers: req('chs-admin', 'POST', 'users'),
                forms: req('org-admin', 'POST', 'forms'),
                formDeletions: req('org-admin', 'DELETE', 'forms'),
                formAdditions: req('org-admin', 'PATCH', 'forms'),
                formMappings: req('org-admin', 'POST', 'formMappings'),
                catchments: req('org-admin', 'POST', 'catchments'),
                facilities: req('org-admin', 'POST', 'facilities'),
                checklistDetails: req('org-admin', 'POST', 'checklistDetail'),
                concepts: req('org-admin', 'POST', 'concepts'),
                locations: req('org-admin', 'POST', 'locations'),
                genders: req('org-admin', 'POST', 'genders'),
                subjectTypes: req('org-admin', 'POST', 'subjectTypes'),
                addressLevelTypes: req('org-admin', 'POST', 'addressLevelTypes'),
                programs: req('org-admin', 'POST', 'programs'),
                encounterTypes: req('org-admin', 'POST', 'encounterTypes'),
                operationalEncounterTypes: req('org-admin', 'POST', 'operationalEncounterTypes'),
                operationalPrograms: req('org-admin', 'POST', 'operationalPrograms'),
                operationalSubjectTypes: req('org-admin', 'POST', 'operationalSubjectTypes'),
                adolescentConfig: req('org-admin', 'POST', 'adolescent/config'),
                motherConfig: req('org-admin', 'POST', 'mother/config'),
                users: req('org-admin', 'POST', 'users'),
                videos: req('org-admin', 'POST', 'videos'),
                identifierSource: req('org-admin', 'POST', 'identifierSource '),
                identifierUserAssignments: req('org-admin', 'POST', 'identifierUserAssignments'),
                translations: req('org-admin', 'POST', 'translation'),
                organisationConfig: req('org-admin', 'POST', 'organisationConfig'),
                platformTranslation: req('org-admin', 'POST', 'platformTranslation'),
                rules: this.postRules('org-admin'),
                all: '',
            }
        });

        IDI.ENVs.forEach((env) => {
            grunt.registerTask(env, `Use env: ${env.toUpperCase()}`, () => grunt.option('target', env));
        });

        const idi = this;
        const deploy = (target, done) => {
            if (target === 'all') {
                idi.logger(`Target Environment: ${idi.env}`);
                idi.deployAll().then(done, done);
            } else {
                idi.logger(`Target Environment: ${idi.env}`);
                idi.deploy(target).then(done, done);
            }
        };
        grunt.registerMultiTask('deploy', "Everything happens here.", function () {
            const done = this.async();
            if (idi.env !== 'dev') {
                prompt(idi.env, () => deploy(this.target, done), () => idi.logger(`Exiting w/o deployment`));
                return;
            }
            deploy(this.target, done);
        });

        grunt.registerTask('default', 'grunt --help\n', grunt.help.display);
    }

    get env() {
        return this.grunt.option('target') || 'dev';
    }

    get serverUrl() {
        return this.conf.secrets[this.env].serverUrl || 'http://localhost:8021';
    }

    url(endpoint) {
        return this.serverUrl + '/' + endpoint;
    }

    get logger() {
        return this.grunt.log.writeln;
    }

    requestMany(method, endpoint, filepaths, user) {
        const logger = this.logger;
        if (!filepaths.length) {
            logger(`++ SKIP: ${endpoint}`);
            return Promise.resolve();
        }
        logger(`++ START: ${endpoint}`);
        const url = this.url(endpoint);
        const requestSeq = filepaths.reduce((requestSeq, filepath) => {
            const body = this.grunt.file.read(filepath);
            return requestSeq
                .then(_ => HttpClient.req(method, url, body, user))
                .then(_ => logger(`-- DONE: ${filepath}`))
                .catch(e => {
                    logger(`-- FAIL: ${filepath}`);
                    throw e; // do not continue on any failure
                });
        }, Promise.resolve());

        return requestSeq
            .then((res) => {
                res && res.data && logger(res.data);
            })
            .catch((err) => {
                logger(err);
                const errMessage = err.response && err.response.data && (err.response.data.message ?
                    err.response.data.message : err.response.data);
                logger(errMessage);
                logger(`++ FAIL: Failed`);
                throw err;
            });
    }

    deploy(taskName) {
        const taskDef = this.grunt.config.get(`deploy.${taskName}`);
        const fileInfo = this.conf.files[taskName];
        const files = this.grunt.util.kindOf(fileInfo) === 'object' ? fileInfo[this.env] : fileInfo;
        const userInfo = this.conf[taskDef.asUser];
        const user = this.grunt.util.kindOf(userInfo) === 'object' ? userInfo[this.env] : userInfo;
        return taskDef.run(files || [], user);
    }

    deployAll() {
        return IDI.allTasks.reduce((taskSeq, taskName) => {
            return taskSeq
                .then(_ => this.deploy(taskName))
                .then(_ => this.logger(`++`))
                .catch(e => {
                    this.logger(`++`);
                    throw e; // do not continue on any failure
                });
        }, Promise.resolve());
    }

    static configure(configuration, rulesConfig) {
        const idi = new IDI();
        return function (grunt) {
            idi.configure(grunt, configuration, rulesConfig);
        }
    }

    static get allTasks() {
        return [
            'organisation',
            'adminUsers',
            'organisationConfig',
            'addressLevelTypes',
            'locations',
            'catchments',
            'facilities',
            'users',
            'concepts',
            'genders',
            'subjectTypes',
            'programs',
            'encounterTypes',
            'operationalEncounterTypes',
            'operationalPrograms',
            'operationalSubjectTypes',
            'adolescentConfig',
            'motherConfig',
            'forms',
            'formDeletions',
            'formAdditions',
            'formMappings',
            'checklistDetails',
            'videos',
            'identifierSource',
            'identifierUserAssignments',
            'translations',
            'platformTranslation',
            'rules',
        ]
    }

    static get ENVs() {
        return [
            'dev',
            'staging',
            'uat',
            'prerelease',
            'prod',
        ];
    }
}

module.exports = IDI;