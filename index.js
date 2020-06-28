const fs = require('fs')
const fetch = require('node-fetch')
const streamPipeline = require('util').promisify(require('stream').pipeline)
const chalk = require('chalk');
const cheerio = require('cheerio');
const log = console.log;


const SPIGOT_VERSION = 'https://www.spigotmc.org/resources/{resource_id}/'
var CLOUDFLARE_COOKIES = ''
var CLOUDFLARE_USERAGENT = ''

async function bypassCloudFlare(url) {
    return new Promise(async (resolve, reject) => {
        const puppeteer = require('puppeteer-extra')
        const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
        StealthPlugin.onBrowser = () => { };
        puppeteer.use(StealthPlugin);
        puppeteer.launch({ headless: true }).then(async browser => {
            log(chalk.blue('Getting Cloudflare cookies...'))
            const page = await browser.newPage()
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36');
            await page.goto(url)
            await page.waitFor(20000)
            CLOUDFLARE_USERAGENT = await page.evaluate(() => navigator.userAgent);
            log(chalk.blue(`Useragent: ${CLOUDFLARE_USERAGENT}`))
            log(chalk.green(`Success!✨`))
            resolve(await page.cookies())
            await browser.close()
        }).catch(e => { console.log(e); reject('No cookies') })
    })
}

function getPlugins() {
    if (!fs.existsSync('plugins.json')) {
        fs.writeFileSync('plugins.json', '[{ "name": "", "resource_id": 0, "auto_update": true }]')
        console.error("Please fill the plugins.json")
        process.exit(0)
    }
    return JSON.parse(fs.readFileSync('plugins.json'))
}

async function getPluginInfo(resource_id) {
    const $ = cheerio.load(await (await fetch(SPIGOT_VERSION.replace('{resource_id}', resource_id))).text())
    return { headline: $('.resourceInfo>h1').text(), version: $('.resourceInfo>h1>span.muted').text(), tagline: $('.resourceInfo>p.tagLine').text(), downloadLink: 'https://www.spigotmc.org/' + $('.resourceInfo a').attr('href') }
}

function formatCookies(cookieJson) {
    var cookie_str = ''
    for (var i = 0; i < cookieJson.length; i++)
        cookie_str += `${cookieJson[i].name}=${cookieJson[i].value}; `
    return cookie_str
}

async function downloadPlugin(downloadLink, path) {
    if (!CLOUDFLARE_COOKIES) {
        CLOUDFLARE_COOKIES = formatCookies(await bypassCloudFlare(downloadLink))
        log(chalk.redBright("Cloudflare Bypassed!"))
    }
    log(chalk.magenta("⏬ Downloading ⏬"));
    console.log(CLOUDFLARE_COOKIES)
    var response = await fetch(downloadLink, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent": CLOUDFLARE_USERAGENT,
            "cookie": CLOUDFLARE_COOKIES
        },
        "referrer": downloadLink,
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    if (!response.ok) throw new Error(`Unexpected response ${await response.statusText}`)
    await streamPipeline(response.body, fs.createWriteStream(path))

}


(async () => {
    var plugins = getPlugins()
    for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i]
        log(chalk.greenBright('---------------------------------------'))
        log(chalk.green('Processing => ') + chalk.yellowBright(plugin.name))
        log(chalk.cyan('Getting Plugin Info...'))
        var plugin_info = await getPluginInfo(plugin.resource_id)
        log(chalk.blue(plugin_info.headline))
        log(chalk.blue(plugin_info.tagline))
        log(chalk.magenta("Latest Version: " + chalk.red(plugin_info.version)))
        log(chalk.yellow("Downloading to " + plugin.path))
        await downloadPlugin(plugin_info.downloadLink, plugin.path)
    }
    log(chalk.greenBright('---------------------------------------'))
})()