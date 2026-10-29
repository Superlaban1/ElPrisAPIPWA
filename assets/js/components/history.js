export function createHistory() {
    const history = document.createElement("main");
    history.className = "history";

    history.innerHTML = `
        <h1>HISTORIK</h1>
        <label for="history-date">Vælg dato</label>
        <input id="history-date" type="date">
        <p id="history-date-label"></p>
        <ul class="history__prices"></ul>
    `;

    const dateInput = history.querySelector("#history-date");
    const dateLabel = history.querySelector("#history-date-label");
    const priceList = history.querySelector(".history__prices");
    const today = new Date();
    dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    function updateDateLabel() {
        if (!dateInput.value) {
            dateLabel.textContent = "";
            return;
        }

        const date = dateInput.value.split("-");
        dateLabel.textContent = `ELPRISERNE D. ${date[2]}-${date[1]}-${date[0]}`;
    }

    async function loadPrices() {
        if (dateInput.value === "") {
            priceList.innerHTML = "<li>Vælg en dato.</li>";
            return;
        }

        const region = document.querySelector("#region");
        if (region === null || region.value === "") {
            priceList.innerHTML = "<li>Vælg region i indstillingerne.</li>";
            return;
        }

        const date = dateInput.value.split("-");
        const zone = region.value === "east" ? "DK2" : "DK1";
        const url = `https://www.elprisenligenu.dk/api/v1/prices/${date[0]}/${date[1]}-${date[2]}_${zone}.json`;
        priceList.innerHTML = "<li>Henter priser...</li>";

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Price request failed: ${response.status}`);
            }

            const prices = await response.json();
            const includeTax = document.querySelector("#include-tax");
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
                    <li class="history__price">
                        <span>kl. ${price.time_start.slice(11, 16)}</span>
                        <span class="price ${level}">${value.toFixed(3)} kr</span>
                    </li>
                `;
            }
        } catch (error) {
            console.error("Could not load history prices:", error);
            priceList.innerHTML = "<li>Kunne ikke hente priserne.</li>";
        }
    }

    dateInput.addEventListener("change", () => {
        updateDateLabel();
        loadPrices();
    });
    history.addEventListener("settingschange", loadPrices);

    updateDateLabel();
    loadPrices();
    return history;
}
