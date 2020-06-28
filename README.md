**NodeJS SpigotMC Plugin/Resource Updater/Scrapper**

**Introduction**

A Simple Nodejs script to auto update plugins from Spigot (Bypassing cloudflare protection)
It is recommended to run this script once per day or a few hours gap.

**Instructions**
1. Clone the repo
2. Install npm packages via `npm i`
3. Change `plugins.json` as per your needs
4. Run `node index.js` to execute the script

**Screenshot**

![A sample of plugin updation](https://i.imgur.com/HyTbMhQ.png)

**Config File**

```
[
	{
		"name":  "Action Bar Health",
		"resource_id":  2661,
		"auto_update":  true,
		"path":  "plugins/ActionHealth.jar"
	},
	{
		"name":  "APortalGun",
		"resource_id":  75519,
		"auto_update":  true,
		"path":  "plugins/APortalGun.jar"
	},
	{
		"name":  "Telegram Reporter Reborn",
		"resource_id":  80768,
		"auto_update":  true,
		"path":  "plugins/TelegramReporterReborn.jar"
	}

]
```
Name can be anything you wish
Resource ID can be found in the Plugin's URL, *after the last dot(.)*
![Resource ID](https://i.imgur.com/9DkXuZO.png)
Path is the location where the jar file will be stored

**Result**

![Output](https://i.imgur.com/8ED4g9B.png)

**Debugging**

Try setting `{  headless:  false }` in `index.js` inside `bypassCloudFlare` function and see what's going on behind the scenes.