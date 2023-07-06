// messengerOL - overlay loader for messenger.xul - Source: mboximport.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

class TabMonitor {
	constructor(window, tabCallbacks) {
		this.active = false;
		this.messengerTabmail = window.document.getElementById("tabmail");
		this.registeredTabURLs = tabCallbacks;
	}

	onTabClosing(tab) {
		let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
		if (tabMonitorOptions && tabMonitorOptions.onTabClosing) {
			tabMonitorOptions.onTabClosing(tab);
		}
	}

	async onTabOpened(tab) {
		if (tab.browser) {
			if (!tab.pageLoaded) {
				// await a location change if browser is not loaded yet
				await new Promise((resolve) => {
					let reporterListener = {
						QueryInterface: ChromeUtils.generateQI([
							"nsIWebProgressListener",
							"nsISupportsWeakReference",
						]),
						onStateChange() { },
						onProgressChange() { },
						onLocationChange(
					/* in nsIWebProgress*/ aWebProgress,
					/* in nsIRequest*/ aRequest,
					/* in nsIURI*/ aLocation
						) {
							tab.browser.removeProgressListener(reporterListener);
							resolve();
						},
						onStatusChange() { },
						onSecurityChange() { },
						onContentBlockingEvent() { },
					};
					tab.browser.addProgressListener(reporterListener);
				});
			}

			let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
			if (tabMonitorOptions && tabMonitorOptions.onTabOpened) {
				tabMonitorOptions.onTabOpened(tab);
			}
		}
	}

	onTabTitleChanged(tab) {
		if (!tab.browser) {
			return;
		}

		let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
		if (tabMonitorOptions && tabMonitorOptions.onTabTitleChanged) {
			tabMonitorOptions.onTabTitleChanged(tab);
		}
	}

	onTabSwitched(tab) {
		if (!tab.browser) {
			return;
		}
		let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
		if (tabMonitorOptions && tabMonitorOptions.onTabSwitched) {
			tabMonitorOptions.onTabTitleChanged(tab);
		}
	}

	onActivated(tab) {
		if (!tab.browser) {
			return;
		}

		let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
		if (tabMonitorOptions && tabMonitorOptions.onActivated) {
			tabMonitorOptions.onActivated(tab);
		}
	}

	onDeactivated(tab) {
		if (!tab.browser) {
			return;
		}

		let tabMonitorOptions = this.checkRegisteredTabUrl(tab);
		if (tabMonitorOptions && tabMonitorOptions.onDeactivated) {
			tabMonitorOptions.onDeactivated(tab);
		}
	}

	registerTabMonitor() {
		if (this.messengerTabmail && !this.active) {
			this.messengerTabmail.registerTabMonitor(this);
			this.active = true;
		}

		// Check open tabs.
		for (let tab of this.messengerTabmail.tabInfo) {
			this.onActivated(tab);
		}
	}

	unregisterTabMonitor() {
		if (this.messengerTabmail && this.active) {
			this.messengerTabmail.unregisterTabMonitor(this);
			this.active = false;
		}
		// Check open tabs.
		for (let tab of this.messengerTabmail.tabInfo) {
			this.onDeactivated(tab);
		}
	}


	checkRegisteredTabUrl(tab) {
		let tabUrl = tab.browser
			? tab.browser?.contentDocument?.URL
			: "*";

		for (let tabUrlEntry of this.registeredTabURLs) {
			if (tabUrlEntry.tabUrl === tabUrl) {
				return tabUrlEntry;
			}
		};
	}
}

var tabMonitor = new TabMonitor(window, [
	{
		tabUrl: "about:accountsettings",
		onActivated: (tab) => {
			LFInitialization(tab);
		},
		onDeactivated: (tab) => {
			let m = tab.browser.contentDocument.getElementById("accountActionAddLocalFolder");
			if (m) m.remove();
		},
		onTabTitleChanged: (tab) => {
			LFInitialization(tab);
		},
	},
]);


function LFInitialization(tab) {
	if (tab.browser.contentDocument.getElementById("accountActionAddLocalFolder")) {
		return;
	}

	let m = tab.browser.contentWindow.wrappedJSObject.MozXULElement.parseXULToFragment(`
	<menuitem id="accountActionAddLocalFolder"
		label="&eu.philoux.localfolder.btdossier;" 
		oncommand="eu.philoux.localfolder.NewLocalFolder();"		
		accesskey="&eu.philoux.localfolder.btdossier.racc;" />
`, ["chrome://localfolder/locale/localfolder.dtd"]);


	let am = tab.browser.contentDocument.getElementById("accountActionsDropdown");
	am.setAttribute("onpopupshowing", "eu.philoux.localfolder.initAccountActionsButtonsLocalFolder(this);");
	am.insertBefore(m, tab.browser.contentDocument.getElementById("accountActionsDropdownSep1"));

	// handle local folder removal
	let arm = tab.browser.contentDocument.getElementById("accountActionsDropdownRemove");
	arm.setAttribute("oncommand", "eu.philoux.localfolder.onSupprimeCompte(event,window); event.stopPropagation();");

	// inject Scripts into account manager content window within tab
	Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", tab.browser.contentWindow.wrappedJSObject, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", tab.browser.contentWindow.wrappedJSObject, "UTF-8");
}

async function onLoad() {
	window.localfolders = {};
	window.localfolders.extension = WL.extension;

	// Setup notifyTools in our namespace

	var ADDON_ID = "localfolder@philoux.eu";

	var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");

	// Get our extension object.
	let extObj = ExtensionParent.GlobalManager.getExtension(ADDON_ID);

	// Load notifyTools into our custom namespace, to prevent clashes with other add-ons.
	Services.scriptloader.loadSubScript(extObj.rootURI.resolve("chrome/content/notifyTools.js"), window.localfolders, "UTF-8");

	tabMonitor.registerTabMonitor();


	// No button for now
	/*
	let ctxMenu =
		`<menupopup>
			<menuitem id="ptng-button-print3" label="New Local Folder" />
			<menuitem id="ptng-button-print2" label="Show all Local Folders" />
		</menupopup>`;

	let dtdFiles = ["chrome://printingtoolsng/locale/printingtoolsng.dtd", "chrome://messenger/locale/messenger.dtd"];

	addTBbuttonMainFuncOrCtxMenu(ADDON_ID, "unified-toolbar-button", null, ctxMenu, []);


}


function addTBbuttonMainFuncOrCtxMenu(addOnId, toolbarClass, mainButtFunc, buttCtxMenu, ctxMenuDTDs) {
	// width of ucarret dropdown area in px
	const dropdownTargetWidth = 21;
	// we need tabmail for its tabMonitor
	var tabmail = document.getElementById("tabmail");

	if (!mainButtFunc && !buttCtxMenu) {
		// can't operate on ziltch
		return false;
	}

	// The toolbar buttons are added in a lazy fashion. They do not get
	// placed in the toolbar DOM at install or startup, instead they 
	// get added the fist time either the 3Pane or a messageDisplay tab
	// is focused. We therefore use a tabmonitor to listen when we have
	// our button we can add the listener. We then remove the tabmonitor.

	var tabMonitor = {
		monitorName: "tbButtonListenerMonitor",

		onTabTitleChanged() { },
		onTabOpened() { },
		onTabPersist() { },
		onTabRestored() { },
		onTabClosing() { },

		async onTabSwitched(newTabInfo, oldTabInfo) {
			// console.log(newTabInfo.mode?.name)
			if (newTabInfo.mode?.name == "mail3PaneTab" || newTabInfo.mode?.name == "mailMessageTab") {
				await setup();
			}
		}
	}

	// register tabmonitor for setting up listener
	tabmail.registerTabMonitor(tabMonitor);
	return true;

	// Setup parent div listener according to parameters.
	// Wait until button is installed to add listener.

	async function setup() {
		var tbExtButton;
		for (var index = 0; index < 100; index++) {
			tbExtButton = document.querySelector(`button.${toolbarClass}[extension="${addOnId}"]`);
			if (tbExtButton) {
				break;
			}
			await new Promise(resolve => window.setTimeout(resolve, 1));
		}

		if (!tbExtButton) {
			console("Exception: Extension button not found on toolbar")
			return;
		}
		// get parent div for listener
		let listenerTarget = tbExtButton.parentElement;
		let listenerTargetId = `tbButtonParentListenerDiv_${addOnId}`;
		listenerTarget.setAttribute("id", listenerTargetId);

		// setup for context menu if requested
		if (buttCtxMenu) {
			let ctxMenuXML = `<div id="${listenerTargetId}"> ${buttCtxMenu} </div>`;
			try {
				WL.injectElements(ctxMenuXML, ctxMenuDTDs);
			} catch (e) {
				console.log("Exception adding context menu:", e);
				return;
			}
		}

		// we setup our listener on the button container parent div
		// key is to use the capture phase mode, this follows the propagation from the
		// top of the DOM down and proceeds the bubbling phase where our listener would 
		// be blocked by the normal button listener 
		listenerTarget.addEventListener('click', listenerFunc, true);
		tabmail.unregisterTabMonitor(tabMonitor);
	}

	// Listener function called when on mail type tabs, however we need
	// to poll for button. Not ideal, but given it's not instant no
	// beter way. Setup according to call params. Kill unnecessary tabmonitor.

	function listenerFunc(e) {
		e.stopImmediatePropagation();
		e.stopPropagation();

		if (e.target.nodeName == "menuitem") {
			return;
		}
		if (mainButtFunc && !buttCtxMenu) {
			// only a main click action
			mainButtFunc();
			return;
		}

		let tbExtButton = document.querySelector(`button.${toolbarClass}[extension="${addOnId}"]`);
		// get click location and determine if in dropdown window if split button
		let targetDivBRect = tbExtButton.getBoundingClientRect();
		let inTargetWindow = e.clientX > (targetDivBRect.x + targetDivBRect.width - dropdownTargetWidth);
		// open context menu if configure
		console.log("check")
		if ((buttCtxMenu && !mainButtFunc) || (buttCtxMenu && inTargetWindow)) {
			tbExtButton.nextElementSibling.openPopup(tbExtButton, "after_start", 0, 0, false, false);
		} else {
			mainButtFunc();
		}
	};
*/
}


	function onUnload() {
		tabMonitor.unregisterTabMonitor();
	}