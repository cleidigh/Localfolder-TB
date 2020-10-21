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
	["locale", "localfolder", "zh-CN", "chrome/locale/zh-CN/"],
	
]);

// ["content", "localfolder/skin", "chrome/skin/classic/"],

/* 
["locale", "localfolder", "ca", "chrome/locale/ca/"],
["locale", "localfolder", "da", "chrome/locale/da/"],
["locale", "localfolder", "de", "chrome/locale/de/"],
["locale", "localfolder", "es-ES", "chrome/locale/es-ES/"],
["locale", "localfolder", "fr", "chrome/locale/fr/"],
["locale", "localfolder", "gl-ES", "chrome/locale/gl-ES/"],
["locale", "localfolder", "hu-HU", "chrome/locale/hu-HU/"],
["locale", "localfolder", "hu-HG", "chrome/locale/hu-HG/"],
["locale", "localfolder", "hy-AM", "chrome/locale/hy-AM/"],
["locale", "localfolder", "it", "chrome/locale/it/"],
["locale", "localfolder", "ja", "chrome/locale/ja/"],
["locale", "localfolder", "ko-KR", "chrome/locale/ko-KR/"],
["locale", "localfolder", "nl", "chrome/locale/nl/"],
["locale", "localfolder", "pl", "chrome/locale/pl/"],
["locale", "localfolder", "pt-PT", "chrome/locale/pt-PT/"],
["locale", "localfolder", "ru", "chrome/locale/ru/"],
["locale", "localfolder", "sk-SK", "chrome/locale/sk-SK/"],
["locale", "localfolder", "sl-SI", "chrome/locale/sl-SI/"],
["locale", "localfolder", "sv-SE", "chrome/locale/sv-SE/"],
["locale", "localfolder", "zh-CN", "chrome/locale/zh-CN/"],
["locale", "localfolder", "el", "chrome/locale/el/"],
 */
// messenger.WindowListener.registerOptionsPage("chrome://localfolder/content/localfolder/localfolderOptions.xhtml");

// Register each overlay script Which controls subsequent fragment loading

messenger.WindowListener.registerWindow(
	"chrome://messenger/content/AccountManager.xul",
	"chrome://localfolder/content/account-managerOL.js");

messenger.WindowListener.registerWindow(
	"chrome://messenger/content/AccountManager.xhtml",
	"chrome://localfolder/content/account-managerOL.js");
	
		console.debug('TabListen');
		  
		//   browser.tabs.onCreated.addListener(handleCreated);
		//   browser.tabs.onUpdated.addListener(handleUpdated);

		// messenger.tabs.onCreated.addListener(async (tab) => {
		// 	console.debug(" Tab CREATED id: "+tab.id+" url: "+tab.url+" status: "+tab.status+" title: "+tab.title);
		// 	console.debug(tab);
		//   });
  
		//   messenger.tabs.onUpdated.addListener(async (tab) => {
		// 	//   console.debug(messenger.tabs.Tab(tab.id));
		// 	console.debug(" Tab updated id: "+tab.id+" url: "+tab.url+" status: "+tab.status+" title: "+tab.title);
		// 	console.debug(tab);

		//   });
  
		// browser.tabs.onCreated.addListener(async (tab) => {
		// 	console.debug(" Tab CREATED id: "+tab.id+" url: "+tab.url+" status: "+tab.status+" title: "+tab.title);
		// });

		
messenger.WindowListener.registerWindow(
	"chrome://messenger/content/messenger.xhtml",
	"chrome://localfolder/content/messengerOL.js");


messenger.WindowListener.startListening();

