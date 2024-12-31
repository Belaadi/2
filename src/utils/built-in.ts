type Entry<T> = [keyof T, T[keyof T]];
type ReturnType<T> = Entry<T>[];

type OBJ<T> = { [k in keyof T]: T[k] };

export function entries<T extends OBJ<T>>(object: T): ReturnType<T> {
    return Object.entries(object) as ReturnType<T>;
}


export function fromEntries<T>(entries: Entry<T>[]): {[k in keyof T]: T[k]} {
    // @ts-ignore
    return Object.fromEntries(entries) as {[k in keyof T]: T[keyof T]};
}
