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

await browser.menus.create({id: "addLF", contexts: ["browser_action_menu"], title: "Add Local Folder", onclick: addLocalFolder});
await browser.menus.create({id: "removeLF", contexts: ["browser_action_menu"], title: "Remove Local Folder", onclick: removeLocalFolder});



async function addLocalFolder() {
	let rv = await messenger.NotifyTools.notifyExperiment({ command: "CMD_addLocalFolder" });
}

async function removeLocalFolder() {
	let rv = await messenger.NotifyTools.notifyExperiment({ command: "CMD_removeLocalFolder" });
}
