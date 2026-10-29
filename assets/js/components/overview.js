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

    async function loadPrices() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const date = `${year}-${month}-${day}`;
        const region = document.querySelector("#region");
        let zone = "DK1";

        if (region !== null && region.value === "") {
            zone = "DK1";
        } else if (region !== null && region.value === "east") {
            zone = "DK2";
        }

        const url = `https://www.elprisenligenu.dk/api/v1/prices/${year}/${month}-${day}_${zone}.json`;
        status.textContent = "Henter dagens priser...";

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Price request failed: ${response.status}`);
            }

            const prices = await response.json();
            if (prices.length === 0) {
                status.textContent = "Der er ingen priser for denne dato.";
                return;
            }

            const includeTax = document.querySelector("#include-tax");
            let lowest = prices[0].DKK_per_kWh;
            let highest = prices[0].DKK_per_kWh;

            for (const price of prices) {
                if (price.DKK_per_kWh < lowest) {
                    lowest = price.DKK_per_kWh;
                }
                if (price.DKK_per_kWh > highest) {
                    highest = price.DKK_per_kWh;
                }
            }

            if (includeTax !== null && includeTax.checked) {
                lowest *= 1.25;
                highest *= 1.25;
            }

            lowestPrice.textContent = `${lowest.toFixed(3)} KR`;
            highestPrice.textContent = `${highest.toFixed(3)} KR`;
            priceList.innerHTML = "";

            for (const price of prices) {
                let value = price.DKK_per_kWh;
                if (includeTax !== null && includeTax.checked) {
                    value *= 1.25;
                }

                let level = "high";
                if (value < 0.3) {
                    level = "low";
                } else if (value < 0.5) {
                    level = "medium";
                }

                priceList.innerHTML += `
                    <li class="overview__price">
                        <span>kl. ${price.time_start.slice(11, 16)}</span>
                        <span class="price ${level}">${value.toFixed(3)} kr</span>
                    </li>
                `;
            }

            status.textContent = "";
        } catch (error) {
            console.error("Could not load overview prices:", error);
            status.textContent = "Kunne ikke hente priserne.";
        }
    }

    overview.addEventListener("settingschange", loadPrices);
    loadPrices();
    return overview;
}