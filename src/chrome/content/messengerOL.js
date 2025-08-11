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

var fl = {
	onFolderAdded: async function (parentFolder, aItem) {
		console.log("88")
	},
	onMessageAdded() { },
	onFolderRemoved() { },
	onMessageRemoved() { },
	onFolderPropertyChanged() { },
	onFolderIntPropertyChanged() { },
	onFolderBoolPropertyChanged() { },
	onFolderPropertyFlagChanged() { },
	onFolderEvent() { },
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
			console.log("tmpfl folderadd", parentFolder.name, aItem.name)
			console.log(parentFolder.filePath.path)
			console.log(aItem.filePath.path)

		},
		OnItemAdded: async function (parentFolder, aItem) {
			// eu.philoux.localfolder.LocalFolderTrace(`FolderListener item added : ${parentFolder.filePath.path} ${parentFolder.flags}`);
			console.log("tmpfl b", aItem.name)
			return

			// We seem to get to events first without folder
			if (!(aItem instanceof Ci.nsIMsgFolder)) {
				// eu.philoux.localfolder.LocalFolderTrace(`NotFolder  ${aItem.name}   ${parentFolder.name}`);
				return;
			}
			eu.philoux.localfolder.LocalFolderTrace(`${aItem.name}    ${aItem.flags} ${eu.philoux.localfolder.pendingFolders[0]}`);

			var rf = `${aItem.filePath.path}`;
			rf = rf.replace(`\\${aItem.name}`, "");

			if (eu.philoux.localfolder.pendingFolders.includes(`${rf}`) && (aItem.flags & 0x000004)) {
				var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
				await eu.philoux.localfolder.fixupSubfolder(eu.philoux.localfolder.pendingFolders[0], aItem.name, false, aItem.server.getStringValue("storeContractID"));

				if (aItem.name in eu.philoux.localfolder.specialFolders) {
					var sf = eu.philoux.localfolder.specialFolders[aItem.name].flags
					eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} get flags ${aItem.flags}`);
					aItem.setFlag(sf);
					eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} set flags (${sf} : ${aItem.flags}`);
				}

			}
		},

		OnItemRemoved() { },
		OnItemPropertyChanged() { },
		OnItemIntPropertyChanged() { },
		OnItemBoolPropertyChanged() { },
		OnItemUnicharPropertyChanged() { },
		OnItemPropertyFlagChanged() { },
		OnItemEvent() { },

		onMessageAdded() { },
		onFolderRemoved() { },
		onMessageRemoved() { },
		onFolderPropertyChanged() { },
		onFolderIntPropertyChanged() { },
		onFolderBoolPropertyChanged() { },
		onFolderPropertyFlagChanged() { },
		onFolderEvent() { },

	};


	// Just avoid initialising the pane. We won't be using it. The folder
	// listener is still required, because it does other things too.
	/*
	MailServices.mailSession.AddFolderListener(
		fl,
		Ci.nsIFolderListener.added
	);
*/
}

function onUnload() {
	window.localfolders.notifyTools.removeAllListeners();
	if (window.localfolders.listener_id) {
		window.localfolders.listener_id = undefined;
	}
	tabMonitor.unregisterTabMonitor();
}