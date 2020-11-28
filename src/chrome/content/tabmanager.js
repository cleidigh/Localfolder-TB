var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

function onTabManagerLoad() {
	// console.debug('TabManager: onTabManagerLoad');
}

function onTabEvent(tabEvent, tab) {
	// console.debug('TabManager: onTabEvent');
	// console.debug(tabEvent);

	switch (tabEvent) {
		case 'onTabTitleChanged':

			if (tab.browser.contentDocument.URL === "about:accountsettings") {
				LFInitialization(tab);
			}
			break;

		default:
			break;
	}
}

function LFInitialization(tab) {

	// console.debug('LFInitialization start');
	if (tab.browser.contentDocument.getElementById("accountActionAddLocalFolder")) {
		// console.debug('menu added already');
		return;
	}

	if (tab.browser.contentDocument.URL === "about:accountsettings") {
		// console.debug('inject script URL');
	}

	// console.debug('LF Add menus');

	let m = tab.browser.contentWindow.wrappedJSObject.MozXULElement.parseXULToFragment(`
	<menuitem id="accountActionAddLocalFolder"
		label="&eu.philoux.localfolder.btdossier;" 
		accesskey="&eu.philoux.localfolder.btdossier.racc;"
		oncommand="eu.philoux.localfolder.NewLocalFolder();"/>
`, ["chrome://localfolder/locale/localfolder.dtd"]);

	let am = tab.browser.contentDocument.getElementById("accountActionsDropdown");
	am.setAttribute("onpopupshowing", "eu.philoux.localfolder.initAccountActionsButtonsLocalFolder(this);");
	am.insertBefore(m, tab.browser.contentDocument.getElementById("accountActionsDropdownSep1"));

	// handle local folder removal
	let arm = tab.browser.contentDocument.getElementById("accountActionsDropdownRemove");
	arm.setAttribute("oncommand", "eu.philoux.localfolder.onSupprimeCompte(event,window); event.stopPropagation();");

	// inject Scripts into account manager content window within tab
	Services.scriptloader.loadSubScript("chrome://global/content/globalOverlay.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	// console.debug('LF initialization done');
}