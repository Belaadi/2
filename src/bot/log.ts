import { Log } from 'ts-tiny-log';

/**
 * You can replace or extend the log, but it should implement LogInterface
 * 	from ts-tiny-log
 */
export const log: Log = new Log({

});

const func = (type: keyof typeof console, out: keyof typeof log)=>{
	// eslint-disable-next-line no-console
	const pre = console[type];
	return (...args: never[]) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		// eslint-disable-next-line no-console
		console[type] = pre;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		log[out](...args);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		// eslint-disable-next-line no-console
		console[type] = func(type, out);
	};
};

// eslint-disable-next-line no-console
console.log = func('log', 'info');
// eslint-disable-next-line no-console
console.error = func('error', 'error');
