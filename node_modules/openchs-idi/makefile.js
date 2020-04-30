const IDI = require('./IDI');
const fs = require('fs');

const makefileTemplate = fs.readFileSync('./template.mk').toString();

const tasks = ['all'].concat(IDI.allTasks);

const defineTaskForENV = (env, task) =>
    `deploy-${env}-${task}:; grunt deploy:${task} --target=${env}`;

const taskDefinitionsPerENV = IDI.ENVs.map(env => tasks.map(task =>
    defineTaskForENV(env, task)).join('\n')).join('\n\n');

const makefile = makefileTemplate
    .replace('#{taskDefinitionsPerENV}', taskDefinitionsPerENV)
    .replace(/deploy-dev-all:\s*(.+)/, 'deploy-dev-all: create_org $1');

fs.writeFileSync('./Makefile', makefile);
