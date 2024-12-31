import Handler from "@backend/modules/Handler";
import {promises,existsSync} from "fs";
import Path from "path";

export default class Proxy extends Handler {
	async handler(method: string): Promise<any> {
		const data = Object.fromEntries(this.request.nextUrl.searchParams.entries());
		const templatePath = Path.join(process.cwd(),'public','downloaded-templates',data.key);
		const metadata = await promises.readFile(
			Path.join(templatePath,'metadata.json')
		).then(e=>JSON.parse(e.toString('utf-8'))).catch(()=>({}));

		const url = metadata.url;
		if (!url) throw("URL DOESN'T SET");

		const finalUrl = new URL(url);
		finalUrl.pathname = Path.join(finalUrl.pathname,data.path);
		data.path = finalUrl.pathname;

		try {
			const existsPath = Path.join(templatePath,data.path);
			if (existsSync(existsPath)) {
				return new Response(await promises.readFile(existsPath));
			}

			console.log('downloading',data.path, "TO", existsPath);

			const dl = finalUrl.toString();

			const res = await fetch(dl, {
				method,
				headers: this.request.headers,
				body: this.requestCloned.body
			});

			const content = await res.arrayBuffer();

			await promises.writeFile(
				existsPath,
				content as any
			).catch(console.error);

			return new Response(content, res);
		} catch (e) {
			console.error(e);
			return new Response(null);
		}
	}
}
