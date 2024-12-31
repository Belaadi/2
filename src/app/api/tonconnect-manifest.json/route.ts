import {NextRequest} from "next/server";
import {promises} from "fs";
import Path from "path";
import {BotConfigType} from "@/bot/classes/types/dodo";
import {getBotConfig} from "@/bot/classes/CustomTelegraf";

export async function GET(req: NextRequest) {
	const {bot} = Object.fromEntries(req.nextUrl.searchParams.entries());
	const config = await getBotConfig(+(bot+"") || -100);



	let defaultManifest = await getDefaultManifest();



	return new Response(JSON.stringify({
		...defaultManifest,
		...config.manifest || {}
	}), {
		headers: {
			'content-type': "application/json"
		}
	})
}

export async function getDefaultManifest() {
	const path = Path.join(process.cwd(),'public/tonconnect-manifest.json');
	const defaultManifestT = await promises.readFile(path).then(e=>e.toString('utf-8'));

	try {
		return JSON.parse(defaultManifestT) as BotConfigType['manifest'];
	} catch (e) {
		console.warn('fail to parse default manifest file!',e);
		return {};
	}
}

export async function POST(req: any) {
	return await GET(req);
}
export async function PUT(req: any) {
	return await GET(req);
}
