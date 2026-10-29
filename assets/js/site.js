import { createHistory } from "./components/history.js";
import { createOverview } from "./components/overview.js";
import { createRightNow } from "./components/rightnow.js";
import { createSettings } from "./components/settings.js";

async function fetchdata() {
	try {
		const response = await fetch("https://www.elprisenligenu.dk");
		const result = await response;
		let myData = await result.json();
		console.log(myData);
		catagoryrecieved(myData);
	} catch (caught) {
		console.log("dummy");
	} finally {
		console.log("hello :D");
	}
}


function readerStatic(appID) {
	const appContainer = document.getElementById(appID);
	appContainer.innerHTML = "";

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

    appContainer.appendChild(navheader);
    const settingsPage = document.createElement("main");
    settingsPage.id = "settings-page";
    settingsPage.className = "settings-page";
    settingsPage.hidden = true;
    const settings = createSettings();
    const closeButton = document.createElement("button");
    closeButton.id = "settings-close";
    closeButton.type = "button";
    closeButton.innerHTML = '<img src="assets/img/miscICONS/circle-xmark-regular-full.svg" alt="">';
    closeButton.addEventListener("click", () => {
        showView(previousView);
    });
    settings.appendChild(closeButton);
    settingsPage.appendChild(settings);
    appContainer.appendChild(settingsPage);

    const overview = createOverview();
    const rightNow = createRightNow();
    const history = createHistory();

    appContainer.append(overview, rightNow, history);
    appContainer.appendChild(footer);
    appContainer.insertBefore(settingsPage, footer);

    const views = {
        overview: overview,
        rightnow: rightNow,
        history: history,
        settings: settingsPage
    };
    let previousView = "overview";

    let activeView = "overview";

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
        activeView = name;
    }

    for (const button of navigationButtons) {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
        });
    }

    appContainer.addEventListener("change", (event) => {
        updateFooter();
        if (event.target.id === "region" || event.target.id === "include-tax") {
            overview.dispatchEvent(new Event("settingschange"));
            rightNow.dispatchEvent(new Event("settingschange"));
            history.dispatchEvent(new Event("settingschange"));
        }
    });

    settingsButton.addEventListener("click", () => {
        showView(activeView === "settings" ? previousView : "settings");
        updateFooter();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && activeView === "settings") {
            showView(previousView);
        }
    });

    showView("overview");
    updateFooter();
}
readerStatic("appID");