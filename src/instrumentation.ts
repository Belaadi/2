import { getDefaultBotConfig } from "./bot/classes/CustomTelegraf";

export async function register() {
	if (process.env.NODE_ENV === 'production') {
		const defaultConfig = getDefaultBotConfig();
		fetch(new URL(process.env['WEB_ORIGIN']+"" || defaultConfig.WEB_ORIGIN).origin)
			.catch(console.error);
	} else {
		fetch("http://localhost:3000")
			.catch(console.error);
	}
}
