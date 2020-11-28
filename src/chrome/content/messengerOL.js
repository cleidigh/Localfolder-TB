// messengerOL - overlay loader for messenger.xul - Source: mboximport.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

window.lfver = WL.extension.addonData.version;
window.extension = WL.extension;
// console.debug(window.lfver);

Services.scriptloader.loadSubScript("chrome://localfolder/content/tab-monitor.js", window, "UTF-8");
// Services.scriptloader.loadSubScript("chrome://global/content/globalOverlay.js", window, "UTF-8");
// Services.scriptloader.loadSubScript("chrome://messenger/content/AccountManager.js", window, "UTF-8");
// Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", window, "UTF-8");
// Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", window, "UTF-8");

// console.debug('check global');
// window.eu = eu;
// console.debug(window.eu);

function onLoad() {
	// console.debug('account manager OL');
}

function onUnload() {
}