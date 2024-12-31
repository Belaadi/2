import * as fs from "node:fs";

export function getHTMLContent(name: string) {
	const path = process.cwd()+`/src/html/${name}.html`;
	return fs.readFileSync(path).toString('utf8');
}
