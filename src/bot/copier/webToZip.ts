import {promises as fs} from "fs"
import AdmZip from 'adm-zip';
import Path from "path";

export class WebToZip {
	static async copyRequest(url: string | URL, renameAssets = false,saveStructure = false, alternativeAlgorithm = false,mobileVersion = false) {
		console.log(`Copy request ${url}`);
		return await fetch("https://copier.saveweb2zip.com/api/copySite", {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
				"content-type": "application/json",
				"priority": "u=1, i",
				'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
			},
			"body": JSON.stringify({
				url: url.toString(),
				renameAssets,
				saveStructure,
				alternativeAlgorithm,
				mobileVersion
			}),
			"method": "POST",
			"cache": "no-store"
		}).then(e=>e.json()).then(e => {
			console.log("copy req", e);
			return e;
		}) as {
			"md5": "5c47c38003b848c5d82854a206c3e9ac_1727993402152",
			"isFinished": false,
			"success": false,
			"errorText": "",
			"errorCode": 0,
			"startedAt": "1727993402152",
			"copiedFilesAmount": 0,
			"url": "https://google.com"
		};
	}

	static async checkStatus(md5: string) {
		console.log(`Checking status of ${md5}`)
		return await fetch(`https://copier.saveweb2zip.com/api/getStatus/${md5}?${new Date().getTime()}`, {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
				"content-type": "application/x-www-form-urlencoded",
				"priority": "u=1, i",
				'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
			},
			"method": "GET",
			next: {
				revalidate: 0
			}
		}).then(e=>e.json()).then(e => {
			if (e.errorText) throw(e.errorText);

			return e;
		}) as {
			"md5": "5c47c38003b848c5d82854a206c3e9ac_1727993402152",
			"isFinished": false,
			"success": false,
			"errorText": "",
			"errorCode": 0,
			"startedAt": "1727993402152",
			"copiedFilesAmount": 0,
			"url": "https://google.com"
		};
	}

	static async download(md5: string, extractTo: string, metadata: Record<string, any> = {
		name: extractTo.replace("/","\\").split("\\").at(-1)+""
	}) {
		try {
			console.log(`Downloading ${md5} to ${extractTo}`);
			const res = await fetch(`https://copier.saveweb2zip.com/api/downloadArchive/${md5}`, {
				"headers": {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
					'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
				},
				"method": "GET",
				"cache": "no-store"
			});

			if (!res.ok) throw(`fail to download GET/${res.status}`);

			const buffer = await res.arrayBuffer();

			const zip = new AdmZip(Buffer.from(buffer));
			zip.extractAllTo(extractTo, true);

			await fs.writeFile(Path.join(extractTo,'metadata.json'), JSON.stringify(metadata))

			return true;
		} catch (e) {
			console.error(`FAIL TO DOWNLOAD`,e);
		}

		return false;
	}

	static async copyWebsite(url: string, extractTo: string = '', metadata: Record<string, any>) {
		const req = await WebToZip.copyRequest(url);
		console.log("Request sent");
		let status = false;
		do {
			console.log('checking status...');
			const st = await WebToZip.checkStatus(req.md5);
			status = st.isFinished;
			if (!status) await new Promise(r => setTimeout(r,5000));
		} while (!status)

		console.log('downloading...');
		await WebToZip.download(req.md5,extractTo, metadata)
		console.log('downloaded');
	}

}
