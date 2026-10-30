export function getTodayDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}

export function getPriceValue(price, includeTax) {
    if (includeTax) {
        return price.DKK_per_kWh * 1.25;
    }

    return price.DKK_per_kWh;
}

export function getPriceRange(prices, includeTax) {
    let lowest = getPriceValue(prices[0], includeTax);
    let highest = lowest;

    for (const price of prices) {
        const value = getPriceValue(price, includeTax);
        if (value < lowest) {
            lowest = value;
        }
        if (value > highest) {
            highest = value;
        }
    }

    return { lowest: lowest, highest: highest };
}

export function getPriceLevel(value, range) {
    const difference = range.highest - range.lowest;
    if (difference === 0) {
        return 1;
    }

    return Math.min(8, Math.floor(((value - range.lowest) / difference) * 8) + 1);
}

export function renderPriceRows(prices, className, includeTax) {
    if (prices.length === 0) {
        return "";
    }

    let rows = "";
    const range = getPriceRange(prices, includeTax);

    for (const price of prices) {
        const value = getPriceValue(price, includeTax);
        const level = getPriceLevel(value, range);
        rows += `
            <li class="${className}">
                <span>kl. ${price.time_start.slice(11, 16)}</span>
                <span class="price level-${level}">${value.toFixed(3)} kr</span>
            </li>
        `;
    }

    return rows;
}

export async function loadPrices(date, region) {
    const zone = region === "east" ? "DK2" : region === "west" ? "DK1" : "";
    if (zone === "") {
        throw new Error("A valid region is required to load prices.");
    }

    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    const url = `https://www.elprisenligenu.dk/api/v1/prices/${year}/${month}-${day}_${zone}.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Price request failed: ${response.status}`);
    }

    return response.json();
}
