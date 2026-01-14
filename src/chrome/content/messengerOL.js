// messengerOL - overlay loader for messenger.xul - Source: mboximport.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");


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

	// inject Scripts into account manager content window within tab
	Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", tab.browser.contentWindow.wrappedJSObject, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", tab.browser.contentWindow.wrappedJSObject, "UTF-8");
}

async function onLoad() {
	window.localfolders = {};
	window.localfolders.extension = WL.extension;

	// Setup notifyTools in our namespace

	var ADDON_ID = "localfolder@philoux.eu";

	var { ExtensionParent } = ChromeUtils.importESModule("resource://gre/modules/ExtensionParent.sys.mjs");

	// Get our extension object.
	let extObj = ExtensionParent.GlobalManager.getExtension(ADDON_ID);

	// Load notifyTools into our custom namespace, to prevent clashes with other add-ons.
	Services.scriptloader.loadSubScript(extObj.rootURI.resolve("chrome/content/notifyTools.js"), window.localfolders, "UTF-8");

	tabMonitor.registerTabMonitor();

	// Listen for subfolder additions, have to fixup

	window.localfolders.tmpFolderListener = {
		onFolderAdded: async function (parentFolder, aItem) {
			await new Promise(resolve => window.setTimeout(resolve, 500));

			let storeID = aItem.server.getStringValue("storeContractID");		
			let children = await IOUtils.getChildren(PathUtils.parent(aItem.filePath.path));

			if (storeID == "@mozilla.org/msgstore/berkeleystore;1") {
				if (children.includes(aItem.filePath.path)) {
					console.log("mbox create missing mbox, rmv dir", aItem.name)
					await IOUtils.remove(aItem.filePath.path);
					await IOUtils.write(aItem.filePath.path, new Uint8Array(), { mode: "overwrite" });
				}
			} else {
				if (!children.includes(aItem.filePath.path)) {
					//console.log("maildir create missing", aItem.name)
					await IOUtils.makeDirectory(aItem.filePath.path);
				}
			}
		},

		onMessageAdded() { },
		onFolderRemoved() { },
		onMessageRemoved() { },
		onFolderPropertyChanged() { },
		onFolderIntPropertyChanged() { },
		onFolderBoolPropertyChanged() { },
		onFolderPropertyFlagChanged() { },
		onFolderEvent() { },
	};

}


async function rebuildSummary(folder) {
    let top = Services.wm.getMostRecentWindow("mail:3pane");

    if (folder.locked) {
        folder.throwAlertMsg("operationFailedFolderBusy", top.msgWindow);
        return;
    }
    if (folder.supportsOffline) {
        // Remove the offline store, if any.
        await IOUtils.remove(folder.filePath.path, { recursive: true }).catch(
        );
    }

    // Send a notification that we are triggering a database rebuild.
    MailServices.mfn.notifyFolderReindexTriggered(folder);

    try {
        const msgDB = folder.msgDatabase;
        msgDB.summaryValid = false;
        folder.closeAndBackupFolderDB("");
    } catch (e) {
        // In a failure, proceed anyway since we're dealing with problems
        folder.ForceDBClosed();
    }

    folder.updateFolder(top.msgWindow);

    return;
}


function onUnload() {
	window.localfolders.notifyTools.removeAllListeners();
	if (window.localfolders.listener_id) {
		window.localfolders.listener_id = undefined;
	}
	tabMonitor.unregisterTabMonitor();
}