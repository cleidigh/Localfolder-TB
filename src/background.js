// background.js - this kicks off the WindowListener framework
// console.debug('background Start');

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
	"chrome://messenger/content/messenger.xhtml",
	"chrome://localfolder/content/messengerOL2.js");
	

messenger.WindowListener.registerTabUrl(
	"about:accountsettings",
	"chrome://localfolder/content/tabmanager.js",
	"tabEventHandler"
	);

	messenger.WindowListener.startListening();

