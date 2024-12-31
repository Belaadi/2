import SuperJSON from "superjson";


export function getRandomNumber(min: number, max: number) {
    if (min >= max) {
        return min;
    }

    // Calculate and return the random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function arabicToEnglishNumber(arabicString: any) {
    const arabicToEnglishMap = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9'
    };

    // @ts-ignore
    return (arabicString+"").replace(/[٠١٢٣٤٥٦٧٨٩]/g, match => arabicToEnglishMap[match]);
}

export function ssrOptimize<T>(obj: T) {
    try {
        return SuperJSON.parse(SuperJSON.stringify(obj)) as T;
    } catch (e) {
        return obj;
    }
}


export function formDataToJson(formData: FormData) {
    let json: {[key: string]: FormDataEntryValue} = {};
    formData.forEach((value, key)=>json[key] = value)
    return json;
}
