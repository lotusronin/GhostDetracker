document.querySelector("#activeCleanUrls").addEventListener("click",handleClickEvent);

function handleClickEvent(evt) {
  const el = evt.target;
  const clean_intercepted_urls = !(el.getAttribute("aria-checked") == "true");
  browser.storage.local.set({ enabled: clean_intercepted_urls });
  evt.preventDefault();
}

function updateEnabledButton(enabled) {
    const elem = document.querySelector("#activeCleanUrls");
    elem.setAttribute("aria-checked",enabled.toString());
}

browser.storage.local.get("enabled").then(
    (data) => {
        let enabled = true;
        if(typeof(data) !== "undefined") {
            enabled = data.enabled;
        }
        updateEnabledButton(enabled);
    }, 
    (error) => {
        console.error("Couldn't retrieve 'enabled' state from storage: "+error);
    }
);
function handleStorageUpdatesAction(changes, area) {
    if(area == "local") {
        let enabled = true;
        try { enabled = changes["enabled"].newValue; } catch { }
        updateEnabledButton(enabled);
    }
}
browser.storage.onChanged.addListener(handleStorageUpdatesAction);
