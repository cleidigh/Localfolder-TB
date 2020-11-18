// background.js - this kicks off the WindowListener framework

function handleCreated(tab) {
	console.log(tab.id);
	console.log(tab.url);
  }

  async function handleUpdated(tabId, changes, tab) {
	  console.debug('HandleUpdated ' + tabId);
	  console.debug(tab);
	console.log(changes);
	let tabInfo = await browser.tabs.get(tabId);
	console.log(tabInfo);
	if (changes.title === "Account Settings" && tab.status === "complete") {
		console.debug('settings loaded');
		addMenu(tabId);
	}
	console.debug('updated done');
  }

function addMenu(tabId) {
	console.debug(window.title);
	console.debug(document.getElementById("accountActionsDropdown"));
	// browser.tabs.executeScript(tabId, {file: "chrome://localfolder/content/account-managerOL.js"});
	// browser.tabs.executeScript(tabId, {file: "/chrome/content/account-managerOL.js"});
	browser.tabs.executeScript(tabId, {code: `console.debug('gobbledygookSwitzerland');`});
	// browser.tabs.executeScript(tabId, {file: "chrome://content/account-managerOL.js"});
	// browser.tabs.executeScript(tabId, {file: "chrome://localfolder/account-managerOL.js"});
	console.debug('after injection');

}
console.debug('background Start');

messenger.WindowListener.registerDefaultPrefs("defaults/preferences/prefs.js");

// Register all necessary content, Resources, and locales

messenger.WindowListener.registerChromeUrl([
	["content", "localfolder", "chrome/content/"],
	["resource", "localfolder", "chrome/content/"],
	["resource", "localfolder", "chrome/skin/classic/"],
	["locale", "localfolder", "en-US", "chrome/locale/en-US/"],
	["locale", "localfolder", "de", "chrome/locale/de/"],
	["locale", "localfolder", "es-ES", "chrome/locale/es-ES/"],
	["locale", "localfolder", "fr", "chrome/locale/fr/"],
	["locale", "localfolder", "hu", "chrome/locale/hu/"],
	["locale", "localfolder", "it", "chrome/locale/it/"],
	["locale", "localfolder", "ja", "chrome/locale/ja/"],
	["locale", "localfolder", "zh", "chrome/locale/zh-CN/"],
	["locale", "localfolder", "pt-BR", "chrome/locale/pt-BR/"],
	["locale", "localfolder", "sv-SE", "chrome/locale/sv-SE/"],
	
]);


// Register each overlay script Which controls subsequent fragment loading

messenger.WindowListener.registerWindow(
	"chrome://messenger/content/AccountManager.xul",
	"chrome://localfolder/content/account-managerOL.js");

messenger.WindowListener.registerWindow(
	"chrome://messenger/content/AccountManager.xhtml",
	"chrome://localfolder/content/account-managerOL.js");
	

messenger.WindowListener.registerTabUrl(
	"about:accountsettings",
	"chrome://localfolder/content/tabmanager.js",
	"tabEventHandler"
	);

	messenger.WindowListener.startListening();

