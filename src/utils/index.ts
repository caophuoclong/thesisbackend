// add toString to bigint

export function convertBigintToNumber(data: Object | Array<Object> | null) {
    if (data === null) {
        return null;
    }
    if (Array.isArray(data)) {
        return data.map((item) => {
            const keys = Object.keys(item);
            keys.forEach((key) => {
                if (typeof item[key] === "bigint") {
                    item[key] = Number(item[key]);
                }
            });
        });
    } else {
        const keys = Object.keys(data);
        keys.forEach((key) => {
            if (typeof data[key] === "bigint") {
                data[key] = Number(data[key].toString());
            }
        });
    }
    return data;
}
