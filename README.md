# GhostDetracker
Ghost DeTracker is a simple webextension for Firefox meant to clean URLs. Surf the web like a Ghost and ditch those pesky url parameters for increased privacy!

The goal for this extension was to be lightweight and simple with a minimal set of required permissions while still providing the required functionality. 

## How to use
After install and if it is enabled, it will automatically trim request urls before the browser navigates to them. If you encounter a problem following a link you can disable url cleaning from the browser action popup (Click the extension icon on the toolbar for the option).

The extension can also add a menu entry to the context menu when right clicking on links. This menu option will copy a cleaned version of the link to your clipboard. This requires clipboard write permissions.

## How it works
The web extension adds a listener to the `onBeforeRequest` event and replaces any parameter in the url that matches a list of regexes with an empty string.

If it has permission to write to the clipboard then the extension will also add an option in the right-click context menu that will copy a link after cleaning the url with the same list of regexes.

## Parameters blocked
The list of built in regexes can be seen listed in the top level js file. Generally the regexes should find the following url parameters:
- All of the parameters listed on https://privacytests.org/
- Any sort of `utm_` parameter
- For twitter links: the new `t=` parameter being added, especially in the mobile app, as well as the `s=` parameter

NOTE: This is not a comprehensive coverage of all of the currently used tracking parameters out there so if you are looking for more privacy or a more comprehensive list of parameters there are plenty of other more fully featured extensions that can provide this.

## Explanation of Permissions and Optional Permissions
### `webRequest`, `webRequestBlocking`, `<all_urls>`
These are required to intercept browser navigation requests so the extension can edit the URL before the browser follows it.
### `storage`
This is required so that the extension can store some basic configurable state (enabled/disabled) and have it be persistent across browser sessions.
### `activeTab` and `contextMenus`
Theese are required to add custom menu entries to the context menu, although the menu will not show up unless the clipboardWrite permission is provided. Unfortunately `contextMenus` is not available as part of the optional permissions enabled API in Firefox. When that is available this can be moved to be an optional permission.
### `clipboardWrite` (optional)
This is required to allow the extension to write a cleaned url to the user's clipboard in response to the user clicking the "clean url copy" context menu entry. It is not needed for the extension to keep cleaning navigation request URLs and is only there to provide a convenience feature for the user.

## Upcoming features
Allow users to provide custom regexes for parameter matching.
