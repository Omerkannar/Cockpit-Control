// Function to get value by key
export function getValueByKey<T>(key: keyof T, obj?: T): any {
    return obj?.[key];
}

export const getObjectEntries = (obj: Record<string, any>) => {
    const result: { key: string, value: any }[] = [];

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result.push({ key, value: obj[key] });
        }
    }
    return result;
}

export const linearInterpolation = (data: any, x: number): number => {
    const res = getObjectEntries(data.conversion)
    //console.log(res)
    if (res.length < 2) {
        return res[0].value;
    } else {
        let x0 = -1, x1 = -1, y0 = -1, y1 = -1;
        for (let v: number = 1; v < res.length; v++) {
            if (x <= Number(res[v].key) && x >= Number(res[v - 1].key)) {
                x0 = Number(res[v - 1].key)
                y0 = Number(res[v - 1].value)
                x1 = Number(res[v].key)
                y1 = Number(res[v].value)
                return ((y1 - y0) / (x1 - x0)) * (x - x0) + y0;
            }
        }
        return 0;
    }
}


export function readDigits(str: string, dig: number): (string)[] {
    // Ensure the string has exactly 4 digits by padding it with empty spaces (or zeros)
    const paddedStr = str.padStart(dig); // Pads with spaces if the string has less than 4 digits

    // Read the digits (using [] notation) and return them as an array
    return [
        paddedStr[0], // Thousands place
        paddedStr[1], // Hundreds place
        paddedStr[2], // Tens place
        paddedStr[3]  // Ones place
    ];
}
