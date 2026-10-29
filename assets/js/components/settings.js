export function createSettings() {
    const settings = document.createElement("main");
    settings.className = "settings";
    settings.innerHTML = `
        <h1 id="settings-title">INDSTILLINGER</h1>
        <div class="settings__options">
            <label class="settings__row" for="include-tax">
                <span>PRISER INKL. MOMS</span>
                <span class="settings__switch">
                    <input id="include-tax" type="checkbox">
                    <span></span>
                </span>
            </label>
            <label class="settings__row" for="lowest-price-alarm">
                <span>LAVESTE PRIS ALARM</span>
                <span class="settings__switch">
                    <input id="lowest-price-alarm" type="checkbox" checked>
                    <span></span>
                </span>
            </label>
            <label class="settings__row" for="region">
                <span>VÆLG REGION</span>
                <select class="settings__region" id="region" name="region">
                    <option value="" selected disabled>VÆLG REGION</option>
                    <option value="east">REGION ØST</option>
                    <option value="west">REGION VEST</option>
                </select>
            </label>
        </div>
    `;

    const region = settings.querySelector("#region");
    const includeTax = settings.querySelector("#include-tax");
    region.value = localStorage.getItem("region") || "";
    includeTax.checked = localStorage.getItem("includeTax") === "true";

    region.addEventListener("change", () => {
        localStorage.setItem("region", region.value);
    });
    includeTax.addEventListener("change", () => {
        localStorage.setItem("includeTax", includeTax.checked);
    });

    return settings;
}