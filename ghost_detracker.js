// User Configurable values
let navigation_cleaning_enabled = true;

//Rule matching Regexes
const cleaners = [
    // __hsfp, __hssc, __hstc, __s
    /&?__(?:hspf|hssc|hstc|s)=[^&]*/g,
    // dclid, fbclid, gclid
    /&?(?:d|fb|g)clid=[^&]*/g,
    // ml_subscriber and ml_subscriber_hash
    /&?ml_subscriber(:?_hash)?=[^&]*/g,
    // oly_anon_id oly_enc_id
    /&?oly_(?:anon|enc)_id=[^&]*/g,
    // vero_conv, vero_id
    /&?vero_(?:conv|id)=[^&]*/g,
    // s_cid, mc_eid, rb_clickid, msclkid, igshid, wickedid, yclid
    /&?(?:s_c|mc_e|rb_click|msclk|igsh|wicked|ycl)id=[^&]*/g,
    // misc
    /&?_hsenc=[^&]*/g,
    /&?_openstat=[^&]*/g,
    /&?hsCtaTracking=[^&]*/g,
    /&?mkt_tok=[^&]*/g
]
const utm_cleaner = /&?utm_[^=&]*=[^&]*/g
const twitter_cleaner = /\?(?:t=[^&]*&)?s=[^&]*/
const final_cleanup = /\/\?&?$/g

function cleanUrl(url, do_log=false) {
    let working_url = url

    // Clean using list from privacytests.org
    if(do_log) { console.log("Cleaning: "+working_url); }
    cleaners.forEach((cleaner) => {
        working_url = working_url.replaceAll(cleaner,"");
        if(do_log) { console.log(working_url); }
        return;
    })

    // Clean off utm_* params
    working_url= working_url.replaceAll(utm_cleaner,"")

    // Clean site specific tracking params
    if(working_url.includes("twitter.com")) {
        working_url = working_url.replace(twitter_cleaner,"")
    }

    // clean up trailing /?& or /? in the url
    working_url = working_url.replace(final_cleanup,"")

    if(do_log) { console.log("After Cleaning: "+working_url); }
    const clean_url = working_url;
    return clean_url
}

function cleanRequestURL(requestDetails) {
    if(!navigation_cleaning_enabled) { return; }
    const log_it = false //requestDetails.url.includes("twitter.com")
    const clean_url = cleanUrl(requestDetails.url, log_it)
    if(clean_url === requestDetails.url) { return; }
    console.log("Original: "+requestDetails.url);
    console.log("Cleaned: "+clean_url);
    return {
        redirectUrl: clean_url
    };
}

browser.webRequest.onBeforeRequest.addListener(
  cleanRequestURL,
  {urls: ["<all_urls>"]},
  // Need blocking requests to intercept urls to clean them
  // before the browser tries following them
  ["blocking"],
);


// Manage Context Menu depending on if the User has allowed clipboard
// permissions. If we are allowed then make a context menu for copying
// a cleaned/trimmed url to clipboard.
let copy_listener = null;
function createContextMenuAndListener() {
    browser.contextMenus.create({
      id: "clean_copy_url",
      title: "Copy Cleaned Up Link",
      contexts: ["link"]
    });
    copy_listener = browser.contextMenus.onClicked.addListener(function(info, tab) {
        if(info.menuItemId === "clean_copy_url") {
            const url = info.linkUrl;
            const clean_url = cleanUrl(url);
            // We can't access/write to clipboard from background script 
            // so we have to run this in content/tab context...
            browser.tabs.executeScript({code: "navigator.clipboard.writeText("+JSON.stringify(clean_url)+");"})
                .then((results) => {
                    console.log("Copied!");
                }).catch((error) => {
                    console.error("Couldn't write to clipboard: "+error);
                });
        }
    });
}
function destroyContextMenuAndListener() {
    browser.contextMenus.remove("clean_copy_url")
        .then(() => { console.log("Removed Context Menu"); })
        .catch((error) => { console.error(error) });
    if(copy_listener != null) {
        browser.contextMenus.onClicked.removeListener(copy_listener);
    }
    copy_listener = null;
}
browser.permissions.onAdded.addListener((permissions) => {
    permissions.permissions.forEach((perm) => {
        if(perm === "clipboardWrite") {
            createContextMenuAndListener();
        }
    });
});

browser.permissions.onRemoved.addListener((permissions) => {
    permissions.permissions.forEach((perm) => {
        if(perm === "clipboardWrite") {
            destroyContextMenuAndListener();
        }
    });
});


// Pull out user options from the storage
// And set up listeners for changes
browser.storage.local.get("enabled").then(
    (data) => {
        if(typeof(data) !== "undefined") {
            navigation_cleaning_enabled = data["enabled"];
        }
    }, 
    (error) => {
        console.error("Couldn't retrieve 'enabled' state from storage: "+error);
    }
);

function handleStorageUpdates(changes, area) {
    if(area == "local") {
        let changedItems = Object.keys(changes);
        for (let item of changedItems) {
            if(item === "enabled") {
                navigation_cleaning_enabled = changes[item].newValue;
            }
        }
    }
}
browser.storage.onChanged.addListener(handleStorageUpdates);
