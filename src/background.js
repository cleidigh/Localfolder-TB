// background.js - this kicks off the WindowListener framework
// console.debug('background Start');

// Register all necessary content, Resources, and locales
messenger.WindowListener.registerChromeUrl([
	["content", "localfolder", "chrome/content/"],
	["resource", "localfolder", "chrome/content/"],
	["resource", "localfolder", "chrome/skin/classic/"],
	["locale", "localfolder", "en-US", "chrome/locale/en-US/"],
	["locale", "localfolder", "de", "chrome/locale/de/"],
	["locale", "localfolder", "es-ES", "chrome/locale/es-ES/"],
	["locale", "localfolder", "fr", "chrome/locale/fr/"],
	["locale", "localfolder", "nl", "chrome/locale/nl/"],
	["locale", "localfolder", "hu", "chrome/locale/hu/"],
	["locale", "localfolder", "it", "chrome/locale/it/"],
	["locale", "localfolder", "ja", "chrome/locale/ja/"],
	["locale", "localfolder", "zh", "chrome/locale/zh-CN/"],
	["locale", "localfolder", "pt-BR", "chrome/locale/pt-BR/"],
	["locale", "localfolder", "sv-SE", "chrome/locale/sv-SE/"],
]);


// Register each overlay script Which controls subsequent fragment loading
messenger.WindowListener.registerWindow(
	"chrome://messenger/content/messenger.xhtml",
	"chrome://localfolder/content/messengerOL.js");

messenger.WindowListener.startListening();

// notifyTools Listener



messenger.NotifyTools.onNotifyBackground.addListener(async (info) => {
	let rv;
	switch (info.command) {
		case "notifyToolsEcho":
			return rv;
	}
});

// button menus

await browser.menus.create({id: "addLF", contexts: ["browser_action_menu"], title: browser.i18n.getMessage("addLocalFolder"), onclick: addLocalFolder});
await browser.menus.create({id: "removeLF", contexts: ["browser_action_menu"], title: browser.i18n.getMessage("removeLocalFolder"), onclick: removeLocalFolder});

async function addLocalFolder() {
	let rv = await messenger.NotifyTools.notifyExperiment({ command: "CMD_addLocalFolder" });
}

async function removeLocalFolder() {
	let rv = await messenger.NotifyTools.notifyExperiment({ command: "CMD_removeLocalFolder" });
}

// monitor non account settings tabs to disable button

await browser.tabs.onActivated.addListener(tabListener);
await browser.tabs.onUpdated.addListener(tabListener2);


async function tabListener(activeInfo) {
	let tab = await browser.tabs.get(activeInfo.tabId);
	if (tab.title != "Loading" && tab.url != "about:accountsettings") {
		await browser.browserAction.disable(activeInfo.tabId)
	}
}

async function tabListener2(tabId, changeInfo, tab) {
	if (tab.url == "about:accountsettings") {
		await browser.browserAction.enable(tabId)
	} else{
		await browser.browserAction.disable(tabId)
	}
}
