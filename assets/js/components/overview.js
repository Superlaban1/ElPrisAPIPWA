import { getPriceRange, getTodayDate, loadPrices, renderPriceRows } from "./loadprices.js";

export function createOverview() {
    const overview = document.createElement("main");
    overview.className = "overview";

    overview.innerHTML = `
        <h1>OVERSIGT</h1>
        <section class="overview__summary">
            <div class="overview__stat">
                <p id="lowest-price">Henter...</p>
                <span>LAVESTE PRIS</span>
            </div>
            <div class="overview__stat">
                <p id="highest-price">Henter...</p>
                <span>HØJESTE PRIS</span>
            </div>
        </section>
        <p id="overview-status"></p>
        <ul class="overview__prices"></ul>
    `;

    const lowestPrice = overview.querySelector("#lowest-price");
    const highestPrice = overview.querySelector("#highest-price");
    const status = overview.querySelector("#overview-status");
    const priceList = overview.querySelector(".overview__prices");

    async function updateOverview() {
        const date = getTodayDate();
        const region = document.querySelector("#region");
        const selectedRegion = region === null || region.value === "" ? "west" : region.value;
        status.textContent = "Henter dagens priser...";

        try {
            const prices = await loadPrices(date, selectedRegion);
            if (prices.length === 0) {
                status.textContent = "Der er ingen priser for denne dato.";
                return;
            }

            const includeTax = document.querySelector("#include-tax");
            const addTax = includeTax !== null && includeTax.checked;
            const range = getPriceRange(prices, addTax);

            lowestPrice.textContent = `${range.lowest.toFixed(3)} KR`;
            highestPrice.textContent = `${range.highest.toFixed(3)} KR`;
            lowestPrice.className = "level-1";
            highestPrice.className = range.highest === range.lowest ? "level-1" : "level-8";
            priceList.innerHTML = renderPriceRows(prices, "overview__price", addTax);

            status.textContent = "";
        } catch (error) {
            console.error("Could not load overview prices:", error);
            status.textContent = "Kunne ikke hente priserne.";
        }
    }

    overview.addEventListener("settingschange", updateOverview);
    updateOverview();
    return overview;
}