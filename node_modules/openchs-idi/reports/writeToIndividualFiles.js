const fs = require('fs');

function main() {
    const content = fs.readFileSync('./tmp/out.json').toString();
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.log(content);
        return;
    }
    Object.keys(json).forEach((key) => {
        fs.writeFileSync(`./tmp/${key.replace(/[^\w-]/g, '')}.sql`, json[key]);
    });
}

main();
