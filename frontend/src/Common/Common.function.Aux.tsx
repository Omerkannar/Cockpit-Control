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
    const res = getObjectEntries(data.conversion).map(entry => ({
        key: Number(entry.key),
        value: entry.value
    }));

    if (res.length === 0) {
        throw new Error("Conversion data is empty.");
    }

    if (res.length === 1) {
        return res[0].value;
    }

    // Sort array in ascending order
    res.sort((a, b) => a.key - b.key);

    // Out-of-bounds cases
    if (x <= res[0].key) {
        return res[0].value; // Lowest boundary value
    }
    if (x >= res[res.length - 1].key) {
        return res[res.length - 1].value; // Highest boundary value
    }

    // Find the two closest points (x0, y0) and (x1, y1)
    for (let v = 1; v < res.length; v++) {
        if (x <= res[v].key) {
            const x0 = res[v - 1].key;
            const y0 = res[v - 1].value;
            const x1 = res[v].key;
            const y1 = res[v].value;

            // linear interpolation
            return y0 + ((y1 - y0) / (x1 - x0)) * (x - x0);
        }
    }

    throw new Error("Unexpected case in interpolation.");
};


export function readDigits(str: string, dig: number): (string)[] {
    // Ensure the string has exactly 5 digits by padding it with empty spaces (or zeros)
    const paddedStr = str.padStart(dig); // Pads with spaces if the string has less than 5 digits

    // Read the digits (using [] notation) and return them as an array
    return [
        paddedStr[0], // Ten Thousands place
        paddedStr[1], // Thousands place
        paddedStr[2], // Hundreds place
        paddedStr[3], // Tens place
        paddedStr[4]  // Ones place
    ];
}
