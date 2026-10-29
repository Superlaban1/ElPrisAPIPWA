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
        <section id="heading">
            <button type="button" data-view="overview">OVERSIGT</button>
            <button type="button" data-view="rightnow">LIGE NU</button>
            <button type="button" data-view="history">HISTORIK</button>
        </section>
        <section id="setting">
            <button id="settings-toggle" type="button" aria-controls="settings-modal">
                <img src="assets/img/miscICONS/gear-solid-full.svg" alt="">
            </button>
            <div id="settings-modal" class="settings-modal" hidden></div>
        </section>
    `;
    const settingsButton = navheader.querySelector("#settings-toggle");
    const settingsModal = navheader.querySelector("#settings-modal");
    const navigationButtons = navheader.querySelectorAll("#heading button");
    const mobileView = window.matchMedia("(max-width: 760px)");

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

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !settingsModal.hidden) {
            settingsModal.hidden = true;
        }
    });

    appContainer.appendChild(navheader);
    const overview = createOverview();
    appContainer.appendChild(overview);
    const rightNow = createRightNow();
    appContainer.appendChild(rightNow);
    const history = createHistory();
    appContainer.appendChild(history);

    const settingsPage = document.createElement("main");
    settingsPage.className = "settings-page";
    settingsPage.hidden = true;
    const settings = createSettings();
    const closeButton = document.createElement("button");
    closeButton.id = "settings-close";
    closeButton.type = "button";
    closeButton.innerHTML = '<img src="assets/img/miscICONS/circle-xmark-regular-full.svg" alt="">';
    closeButton.addEventListener("click", () => {
        settingsModal.hidden = true;
    });
    settings.appendChild(closeButton);
    settingsModal.appendChild(settings);
    appContainer.appendChild(settingsPage);
    appContainer.appendChild(footer);

    const views = {
        overview: overview,
        rightnow: rightNow,
        history: history,
        settings: settingsPage
    };
    let previousView = "overview";

    function showMobileView(name) {
        for (const viewName in views) {
            views[viewName].hidden = viewName !== name;
        }

        for (const button of navigationButtons) {
            button.classList.toggle("active", button.dataset.view === name);
        }
    }

    for (const button of navigationButtons) {
        button.addEventListener("click", () => {
            if (mobileView.matches) {
                showMobileView(button.dataset.view);
            }
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

    let currentMobileView = null;
    mobileQueryChange();
    mobileView.addEventListener("change", mobileQueryChange);
    window.addEventListener("resize", mobileQueryChange);

    function mobileQueryChange() {
        if (currentMobileView === mobileView.matches) {
            return;
        }

        currentMobileView = mobileView.matches;
        if (mobileView.matches) {
            showMobileView("overview");
        } else {
            for (const viewName in views) {
                views[viewName].hidden = viewName === "settings";
            }
            for (const button of navigationButtons) {
                button.classList.remove("active");
            }
        }
    }

    settingsButton.addEventListener("click", () => {
        if (mobileView.matches) {
            if (settingsPage.hidden) {
                previousView = Object.keys(views).find((name) => !views[name].hidden) || "overview";
                settingsPage.appendChild(settings);
                settingsModal.hidden = true;
                showMobileView("settings");
            } else {
                showMobileView(previousView);
            }
        } else {
            settingsModal.appendChild(settings);
            for (const viewName in views) {
                views[viewName].hidden = viewName === "settings";
            }
            settingsModal.hidden = !settingsModal.hidden;
        }
        updateFooter();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileView.matches && !settingsPage.hidden) {
            showMobileView(previousView);
        }
    });

    updateFooter();
}
readerStatic("appID");
