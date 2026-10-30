import { createHistory } from "./components/history.js";
import { createOverview } from "./components/overview.js";
import { createRightNow } from "./components/rightnow.js";
import { createSettings } from "./components/settings.js";

function createSite() {
    const appContainer = document.getElementById("appID");

    const navheader = document.createElement("header");
    navheader.id = "app-header";
    navheader.innerHTML = `
        <div id="brand">
            <img src="assets/img/appIcons/mainIcon.svg" alt="">
        </div>
        <nav id="heading">
            <button type="button" data-view="overview">OVERSIGT</button>
            <button type="button" data-view="rightnow">LIGE NU</button>
            <button type="button" data-view="history">HISTORIK</button>
        </nav>
        <section id="setting">
            <button id="settings-toggle" type="button">
                <img src="assets/img/miscICONS/gear-solid-full.svg" alt="">
            </button>
        </section>
    `;
    const settingsButton = navheader.querySelector("#settings-toggle");
    const navigationButtons = navheader.querySelectorAll("#heading button");
    const footer = document.createElement("footer");
    footer.innerHTML = `
        <p>Priserne er <span class="highlighted" id="tax-status">ex. moms</span> og afgifter</p>
        <p>Du vises lige nu priserne for <span class="highlighted" id="region-status">Vælg region</span></p>
    `;

    const taxStatus = footer.querySelector("#tax-status");
    const regionStatus = footer.querySelector("#region-status");

    function updateFooter() {
        const includeTax = appContainer.querySelector("#include-tax");
        if (includeTax) {
            if (includeTax.checked) {
                taxStatus.textContent = "inkl. moms";
            } else {
                taxStatus.textContent = "ex. moms";
            }
        }

        const region = appContainer.querySelector("#region");
        if (region) {
            if (region.value === "east") {
                regionStatus.textContent = "Øst Danmark";
            } else if (region.value === "west") {
                regionStatus.textContent = "Vest Danmark";
            } else {
                regionStatus.textContent = "Vælg region";
            }
        }
    }

    const settingsPage = document.createElement("main");
    settingsPage.className = "settings-page";
    settingsPage.hidden = true;
    const settings = createSettings();
    settingsPage.appendChild(settings);

    appContainer.append(navheader, settingsPage);

    const overview = createOverview();
    const rightNow = createRightNow();
    const history = createHistory();

    const views = {
        overview: overview,
        rightnow: rightNow,
        history: history,
        settings: settingsPage
    };
    let previousView = "overview";

    function showView(name) {
        for (const viewName in views) {
            views[viewName].hidden = viewName !== name;
        }

        for (const button of navigationButtons) {
            button.classList.toggle("active", button.dataset.view === (name === "settings" ? previousView : name));
        }

        if (name !== "settings") {
            previousView = name;
        }
    }

    appContainer.append(overview, rightNow, history, footer);

    for (const button of navigationButtons) {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
        });
    }

    appContainer.addEventListener("change", (event) => {
        updateFooter();
        if (event.target.id === "region" || event.target.id === "include-tax") {
            for (const view of [overview, rightNow, history]) {
                view.dispatchEvent(new Event("settingschange"));
            }
        }
    });

    settingsButton.addEventListener("click", () => {
        showView(settingsPage.hidden ? "settings" : previousView);
        updateFooter();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !settingsPage.hidden) {
            showView(previousView);
        }
    });

    showView("overview");
    updateFooter();
}
createSite();