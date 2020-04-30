const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const request = require('superagent');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const serverURLGEN = (server_url = 'http://localhost:8021') =>
    (path) => `${process.env.SERVER_URL !== undefined ? process.env.SERVER_URL : server_url}/${path}`;

const createRuleContract = (ruleMeta, ruleData, ruleDependencyUUID) => ({
    ruleDependencyUUID: ruleDependencyUUID,
    type: ruleMeta.type,
    entity: {uuid: ruleMeta.entityUUID, type: ruleMeta.entityType},
    data: ruleData.metadata,
    uuid: ruleData.uuid,
    name: ruleData.name,
    fnName: ruleData.fnName || ruleData.fn.name,
    executionOrder: ruleData.executionOrder
});

const createRules = (userName, server_url, token = "", rules) =>
    request.post(serverURLGEN(server_url)("rules"), rules)
        .set("USER-NAME", userName)
        .set("AUTH-TOKEN", token)
        .on('error', console.log)
        .then(() => rules.forEach(rule => console.log(`Created Rule: ${rule.name} ${rule.fnName}`)));

const postAllRules = (userName, ruleFilePath, server_url = 'http://localhost:8021', token = "") => {
    const compiler = webpack({
        target: 'web',
        entry: {
            rules: ruleFilePath
        },
        output: {
            filename: '[name].bundle.js',
            libraryTarget: 'var',
            library: 'rulesConfig',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            new UglifyJsPlugin({
                test: /\.js$/,
                exclude: /(node_modules)/,
                uglifyOptions: {
                    ecma: 5,
                    warnings: false,
                    compress: true,
                    mangle: true,
                    keep_fnames: true,
                    keep_classnames: true,
                    output: {comments: false, beautify: false}
                }
            })
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": [
                                [
                                    "env"
                                ]
                            ],
                            "plugins": [
                                "transform-class-properties",
                                "transform-export-extensions",
                                "transform-decorators-legacy",
                                "transform-es2015-destructuring"
                            ]
                        }
                    }
                }
            ]
        }
    });
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            var rulesConfig = undefined;
            const rulesContent = String(fs.readFileSync(path.resolve(__dirname, 'dist') + '/rules.bundle.js'));
            eval(rulesContent);
            const rules = rulesConfig;
            const serverURL = serverURLGEN(server_url);
            request
                .post(serverURL("ruleDependency"), {
                    code: rulesContent,
                    hash: stats.hash
                })
                .set("USER-NAME", userName)
                .set("AUTH-TOKEN", token)
                .then((response) => {
                    console.log(`Created Rule Dependency with UUID: ${response.text}`);
                    const registry = rules[Object.keys(rules).find(r => rules[r].registry !== undefined)].registry;
                    const rulesContracts = registry.getAll()
                        .reduce((acc, [ruleMeta, rulesData]) =>
                                acc.concat(
                                    rulesData
                                        .map(ruleData =>
                                            createRuleContract(ruleMeta, ruleData, response.text))),
                            []);
                    return createRules(userName, server_url, token, rulesContracts).then(resolve);
                })
                .catch((err) => {
                    const info = (err && err.response && err.response.text) || err;
                    console.log(`Rule Dependency creation failed: ${info}`);
                    reject(err);
                });
        });
    });
};

const postRulesWithoutDependency = (userName, rules) => {
    rules.forEach(([ruleKey, rulesData]) => {
        rulesData.map(ruleData => createRules(userName, ruleKey.formUUID, ruleKey.type, ruleData));
    })
};

module.exports = {postAllRules, postRulesWithoutDependency};
