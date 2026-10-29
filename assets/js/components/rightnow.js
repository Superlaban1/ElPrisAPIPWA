export function createRightNow() {
    const rightNow = document.createElement("main");
    rightNow.className = "rightnow";

    rightNow.innerHTML = `
        <h1>ELPRISEN LIGE NU</h1>
        <p id="rightnow-status">Henter dagens priser...</p>
        <div class="rightnow__circle">
            <div>
                <strong id="current-price">-</strong>
                <span>PR. KWH</span>
            </div>
        </div>
        <p id="current-time"></p>
    `;

    const status = rightNow.querySelector("#rightnow-status");
    const currentPrice = rightNow.querySelector("#current-price");
    const currentTime = rightNow.querySelector("#current-time");

    async function loadPrice() {
        const region = document.querySelector("#region");
        let zone = "DK1";

        if (region === null || region.value === "") {
            status.textContent = "Vælg region i indstillingerne.";
            return;
        } else if (region.value === "east") {
            zone = "DK2";
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const url = `https://www.elprisenligenu.dk/api/v1/prices/${year}/${month}-${day}_${zone}.json`;
        status.textContent = "Henter dagens priser...";

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Price request failed: ${response.status}`);
            }

            const prices = await response.json();
            if (prices.length === 0) {
                status.textContent = "Der er ingen priser for i dag.";
                return;
            }

            const now = new Date();
            let current = null;

            for (const price of prices) {
                if (now >= new Date(price.time_start) && now < new Date(price.time_end)) {
                    current = price;
                }
            }

            if (current === null) {
                status.textContent = "Der er ingen aktuel pris tilgængelig.";
                return;
            }

            let value = current.DKK_per_kWh;
            const includeTax = document.querySelector("#include-tax");
            if (includeTax !== null && includeTax.checked) {
                value *= 1.25;
            }

            let level = "high";
            if (value < 0.3) {
                level = "low";
            } else if (value < 0.5) {
                level = "medium";
            }

            currentPrice.textContent = `${value.toFixed(3)} KR`;
            currentPrice.className = level;
            currentTime.textContent = `${current.time_start.slice(11, 16)} - ${current.time_end.slice(11, 16)}`;
            status.textContent = "";
        } catch (error) {
            console.error("Could not load current price:", error);
            status.textContent = "Kunne ikke hente prisen.";
        }
    }

    rightNow.addEventListener("settingschange", loadPrice);
    loadPrice();
    return rightNow;
}