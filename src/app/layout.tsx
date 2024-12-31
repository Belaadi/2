import './globals.css'

declare global {
	var init: boolean;
}

const Layout = (props: any) => {
	return props.children
};

let init = global.init || false;
if (!init) {
	import("../bot/init").then(e => {
		e.initializeBot().catch(console.error);
		console.log("INIT FROM PRODUCTION")
		init = true;
		global.init = true;
	});
	console.log("MOD INIT")
}

export default Layout;
