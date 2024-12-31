import {useEffect, useState} from "react";

export type Unknown<T extends any = any> = ({
    [K in keyof T]?: ((
         T[K] extends ((...args: any[]) => any)
              ? Unknown<T[K]>
              : T[K] extends T
                   ? Unknown<T[K]>
                   : { [K2 in keyof any]?: Unknown }
         ));
} & { [K2 in keyof any]?: Unknown });

export type safeSet<T> = {
	[K in keyof T]: T[K]
}

export function useSafe<T = any>(init: Unknown<T> = {}): ([
	Unknown<T>,
		((obj: safeSet<T>) => void) | ((obj: ((obj: Unknown<T>) => void)) => void)
]) {
	const [T, setT] = useState<Unknown<T>>(init);

	return [
		T,
		setT as any // FIXED IN RETURN TYPE :)
	]
}


export function useInit(func: ()=>(()=>void) | void, deps: any[] = []) {
	const [init, setInit] = useState(false);

	useEffect(()=>{
		setInit(true);
	}, [])

	useEffect(() => {
		if (init) return func();
	}, [init,...deps]);
}
