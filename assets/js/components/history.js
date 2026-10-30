import { getTodayDate, loadPrices, renderPriceRows } from "./loadprices.js";

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
    dateInput.value = getTodayDate();

    function updateDateLabel() {
        if (!dateInput.value) {
            dateLabel.textContent = "";
            return;
        }

        const date = dateInput.value.split("-");
        dateLabel.textContent = `ELPRISERNE D. ${date[2]}-${date[1]}-${date[0]}`;
    }

    async function updateHistory() {
        if (dateInput.value === "") {
            priceList.innerHTML = "<li>Vælg en dato.</li>";
            return;
        }

        const region = document.querySelector("#region");
        if (region === null || region.value === "") {
            priceList.innerHTML = "<li>Vælg region i indstillingerne.</li>";
            return;
        }

        priceList.innerHTML = "<li>Henter priser...</li>";

        try {
            const prices = await loadPrices(dateInput.value, region.value);
            const includeTax = document.querySelector("#include-tax");
            const addTax = includeTax !== null && includeTax.checked;
            priceList.innerHTML = renderPriceRows(prices, "history__price", addTax);
        } catch (error) {
            console.error("Could not load history prices:", error);
            priceList.innerHTML = "<li>Kunne ikke hente priserne.</li>";
        }
    }

    dateInput.addEventListener("change", () => {
        updateDateLabel();
        updateHistory();
    });
    history.addEventListener("settingschange", updateHistory);

    updateDateLabel();
    updateHistory();
    return history;
}