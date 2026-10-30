import { getPriceLevel, getPriceRange, getPriceValue, getTodayDate, loadPrices } from "./loadprices.js";

export function createRightNow() {
    const rightNow = document.createElement("main");
    rightNow.className = "rightnow";

    rightNow.innerHTML = `
        <h1>ELPRISEN LIGE NU</h1>
        <p id="rightnow-status">Henter dagens priser...</p>
        <div class="rightnow__circle">
            <div>
                <span id="current-price">-</span>
                <span>PR. KWH</span>
            </div>
        </div>
        <p id="current-time"></p>
    `;

    const status = rightNow.querySelector("#rightnow-status");
    const currentPrice = rightNow.querySelector("#current-price");
    const currentTime = rightNow.querySelector("#current-time");

    async function updateRightNow() {
        const region = document.querySelector("#region");
        if (region === null || region.value === "") {
            status.textContent = "Vælg region i indstillingerne.";
            return;
        }

        const date = getTodayDate();
        status.textContent = "Henter dagens priser...";

        try {
            const prices = await loadPrices(date, region.value);
            if (prices.length === 0) {
                status.textContent = "Der er ingen priser for i dag.";
                return;
            }

            const now = new Date();
            let current = null;

            for (const price of prices) {
                if (now >= new Date(price.time_start) && now < new Date(price.time_end)) {
                    current = price;
                    break;
                }
            }

            if (current === null) {
                status.textContent = "Der er ingen aktuel pris tilgængelig.";
                return;
            }

            const includeTax = document.querySelector("#include-tax");
            const addTax = includeTax !== null && includeTax.checked;
            const value = getPriceValue(current, addTax);
            const level = getPriceLevel(value, getPriceRange(prices, addTax));

            currentPrice.textContent = `${value.toFixed(3)} KR`;
            currentPrice.className = `level-${level}`;
            currentTime.textContent = `${current.time_start.slice(11, 16)} - ${current.time_end.slice(11, 16)}`;
            status.textContent = "";
        } catch (error) {
            console.error("Could not load current price:", error);
            status.textContent = "Kunne ikke hente prisen.";
        }
    }

    rightNow.addEventListener("settingschange", updateRightNow);
    updateRightNow();
    return rightNow;
}