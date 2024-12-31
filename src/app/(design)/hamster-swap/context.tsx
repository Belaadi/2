'use client';

import {THEME, TonConnectUIProvider} from "@tonconnect/ui-react";

function Context(props: any) {

	const manifest =
		typeof window !== 'undefined' ?
			window.location.search.includes("manifest=true") ?
				`${window.location.origin}/api/tonconnect-manifest.json${window.location.search}` :
				`${window.location.origin}/tonconnect-manifest.json`:
			'/tonconnect-manifest.json'

	return (
		<TonConnectUIProvider manifestUrl={props.url || manifest} uiPreferences={{
			theme: THEME.LIGHT
		}} language={'en'}>
			{props.children}
		</TonConnectUIProvider>
	);
}

export default Context;
