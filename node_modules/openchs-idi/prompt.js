const readline = require('readline');

const question =
    "[$ENV] You're trying to deploy reference-data/metadata to '$environment' env. To proceed enter '$ENV'\n" +
    "[$ENV] To Cancel enter any other character or press Ctrl+C\n" +
    "[$ENV] ";
const confirmation =
    "[$ENV] Continuing to deploy...\n";

const rejection =
    "[$ENV] Declined to deploy.\n";

module.exports = function (env, proceed, cancel) {
    const ENV = env.slice(0, 4).toUpperCase();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(question.replace(/\$ENV/g, ENV).replace('$environment', env), function (answer) {
        if (answer.trim() === ENV) {
            console.log(confirmation.replace(/\$ENV/g, ENV));
            proceed();
        } else {
            console.log(rejection.replace(/\$ENV/g, ENV));
            cancel();
        }
        rl.close();
    });
};
