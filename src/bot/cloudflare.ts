import {BotConfigType} from "@/bot/classes/types/dodo";

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';


interface BlockIPResponse {
	success: boolean;
	errors: Array<{ code: number; message: string }>;
	messages: string[];
	result: any;
}

export async function cloudflareChallengeIp(API_TOKEN: string, ZONE_ID: string, ip: string, mode: "challenge" | "block" = 'challenge') {
	try {
		const response = await fetch(`${CLOUDFLARE_API_URL}/zones/${ZONE_ID}/firewall/access_rules/rules`,

			{
				headers: {
					Authorization: `Bearer ${API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					mode, // Action: block, challenge, whitelist, etc.
					configuration: {
						target: 'ip', // You can also block countries or other targets
						value: ip,    // The IP address to block
					},
					notes: 'Challenge due to spam', // Optional note for why you're blocking
				}),
				method: "POST"
			}
		);

		const json = await response.json() as BlockIPResponse;
		const ok = json?.success;

		if (ok)
			console.warn(`ip ${ip} has been blocked due to spam`);
		else
			console.error(`fail to block ip: ${ip}`, json, response.status,response.statusText);

		return ok;
	} catch (error: any) {
		console.log(error)
		console.error('Request failed:', error);
	}

	return false;
}

const MAX_REQUEST = 10;
const MAX_SEC = 1;

let data: {
	[ip: string]: {
		last: Date,
		count: number,
		blocked: boolean
	}
} = {}
export async function checkSpam(config: BotConfigType, ip: string) {
	if (!config || !config.cloudflare?.enabled) return;

	let {last = new Date(), count = 0,blocked = false} = data[ip] || {}
	if (blocked) {
		return;
	}

	count = count + 1;

	const ex = new Date(last);
	ex.setSeconds(ex.getSeconds() + MAX_SEC);
	if (ex.getTime() < new Date().getTime()) {
		last = new Date();
		count = 0;
	} else if (count > MAX_REQUEST && ip !== 'unknown') {
		await cloudflareChallengeIp(config.cloudflare.globalApi, config.cloudflare.zone, ip, config.cloudflare.mode || "challenge");
		blocked = true;
	}

	data[ip] = {
		last,
		count,
		blocked
	}
}
