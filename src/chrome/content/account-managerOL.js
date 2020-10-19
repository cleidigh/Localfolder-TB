// messengerOL - overlay loader for messenger.xul - Source: mboximport.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');


Services.scriptloader.loadSubScript("chrome://global/content/globalOverlay.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://messenger/content/AccountManager.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", window, "UTF-8");


function onLoad() {
	console.debug('account manager OL');

	// FolderPane Menu
	WL.injectElements(`
		<menuitem id="accountActionAddLocalFolder"
			label="&eu.philoux.localfolder.btdossier;" 
			accesskey="&eu.philoux.localfolder.btdossier.racc;"
			oncommand="eu.philoux.localfolder.NewLocalFolder();"
			insertbefore="accountActionsDropdownSep1"/>
		<menuitem id="accountActionsDropdownRemove" 
			oncommand="eu.philoux.localfolder.onSupprimeCompte(event); event.stopPropagation();"/>

	`, ["chrome://localfolder/locale/localfolder.dtd"]);

	let arm = tab.browser.contentDocument.getElementById("accountActionsDropdownRemove");
	arm.setAttribute("oncommand", "eu.philoux.localfolder.onSupprimeCompte(event,window); event.stopPropagation();");
	
	console.debug(document.getElementById("accountActionsDropdown"));
	
window.lfver = WL.extension.addonData.version;
window.extension = WL.extension;
}

function onUnload() {
}