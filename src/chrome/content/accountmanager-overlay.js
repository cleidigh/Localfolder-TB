// encapsulation objet
if (!eu) var eu = {};
// console.debug('overlay start');
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

// this makes it work
window.eu = eu;

eu.lfver = window.lfver;

//initialisation du gestionnaire de compte
//déplace le bouton "Ajouter un dossier local" au dessous "Ajouter un autre compte"
eu.philoux.localfolder.OnInitLocalFolder = function () {
	try {
		var elem = document.getElementById("accountActionsDropdownSep1");
		//bouton nouveau dossier
		var bt = document.getElementById("accountActionAddLocalFolder");
		elem.parentNode.insertBefore(bt, elem);

	}
	catch (ex) {
		eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurAppelLocalFolder", ex);
	}
}


eu.philoux.localfolder.getSelectedAccount = function (page, account) {
	let tree = document.getElementById("accounttree");

    let node = tree.view.getItemAtIndex(tree.currentIndex);
    account = "_account" in node ? node._account : null;

	return account;
	// onAccountTreeSelect(page, account);
}

eu.philoux.localfolder.onAccountSelect = function (page, account) {
	let tree = document.getElementById("accounttree");

//   if (!changeView) {
//     if (tree.view.selection.count < 1) {
//       return false;
//     }

    let node = tree.view.getItemAtIndex(tree.currentIndex);
    account = "_account" in node ? node._account : null;

	return account;
	// onAccountTreeSelect(page, account);
}

/**
 * permet de déterminer s'il s'agit d'un dossier local
 */

eu.philoux.localfolder.isLocalFolder = function () {

	// let account = getCurrentAccount();
	let account = eu.philoux.localfolder.getSelectedAccount();
	if (account) { // if not, it's a SMTP account
		let server = account.incomingServer;
		if (server.type == "none") { // it's a local folder
			let am = Components.classes["@mozilla.org/messenger/account-manager;1"]
				.getService(Components.interfaces.nsIMsgAccountManager);
			let localfolder = am.localFoldersServer;
			if (localfolder != server)
				return true;
		}
	}
	return false;

}

/**
 * permet la suppression des dossiers locaux autres que celui par défaut
 */

eu.philoux.localfolder.initAccountActionsButtonsLocalFolder = function (menupopup) {

	// on lance la fonction originale
	// initAccountActionsButtons(menupopup);
	if (eu.philoux.localfolder.isLocalFolder()) {
		document.getElementById("accountActionsDropdownRemove").removeAttribute("disabled");
	}
}


/**
 *	gére le bouton de suppression de compte original
 *	@return si succes retourne true / si erreur retourne false 
 *	implémentation : appelle la fonction originale onRemoveAccount
 */
eu.philoux.localfolder.onSupprimeCompte = async function (e, amWindow) {
	try {
		if (!eu.philoux.localfolder.isLocalFolder()) { // on utilise la fonction par défaut pour les autres comptes
			onRemoveAccount(e);
		} else { // pour les dossiers locaux on utilise une fonction personnalisée
			var account = eu.philoux.localfolder.getSelectedAccount();
			var server = account.incomingServer;
			var type = server.type;
			var prettyName = server.prettyName;

			var bundle = Services.strings.createBundle("chrome://localfolder/locale/localfolder.properties");
			var confirmTitle = bundle.GetStringFromName("ConfirmRemoveTitle");
			var confirmRemoveAccount = bundle.formatStringFromName("ConfirmRemoveFolder", [prettyName], 1);

			var removeData = {value: false};
			let review = Services.prompt.confirmCheck(window, confirmTitle, confirmRemoveAccount, "Delete All Subfolders and Data", removeData);

			eu.philoux.localfolder.LocalFolderTrace(confirmRemoveAccount +' '+ review);

			if (!review) {
				return;
			}

			try {
				// clear cached data out of the account array
				amWindow.currentAccount = amWindow.currentPageId = null;

				const f = server.localPath.path;

				var serverId = server.serverURI;
				await Components.classes["@mozilla.org/messenger/account-manager;1"]
					.getService(Components.interfaces.nsIMsgAccountManager)
					.removeAccount(account);
				
				if (serverId in amWindow.accountArray) {
					delete amWindow.accountArray[serverId];
				}

				selectServer(null, null);

				var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);

				if (removeData.value) {
					filespec.initWithPath(f);
					filespec.remove(true);
					eu.philoux.localfolder.LocalFolderTrace("after o raw");
				
				}
			}
			catch (ex) {
				dump("failure to remove account: " + ex + "\n");
				// cleidigh
				// var alertText = bundle.GetStringFromName("failedRemoveAccount");
				// alert('remove failure')
				var alertText = 'Remove failure'
				Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService)
					.alert(window, null, alertText);;
			}
		}
	}
	catch (ex) {
		eu.philoux.localfolder.LocalFolderAfficheMsgId2("LocalFolderMajErreurEffCompte", ex);
		return false;
	}
	return true;
}

/**
 *	clic sur le bouton localfolder.btdossier -> appelle la bo�te d'ajout d'un nouveau dossier
 */
eu.philoux.localfolder.NewLocalFolder = function () {
	// console.debug('NewLocalFolder');
	
	const versionChecker = Services.vc;
    const currentVersion = Services.appinfo.platformVersion;


	var w = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator)
		.getMostRecentWindow("mail:3pane");

		w.lfver = eu.lfver;
	// console.debug(w.lfver);
	// console.debug(w.extension.version);

	if (versionChecker.compare(currentVersion, "78") >= 0) {
		w.openDialog("chrome://localfolder/content/localfolder.xhtml", "", "chrome,modal,centerscreen,titlebar,resizable=yes");
	} else {
		w.openDialog("chrome://localfolder/content/localfolder.xul", "", "chrome,modal,centerscreen,titlebar,resizable=yes");
	}
	window.focus();
	return true;
}

//positionnement des boutons au d�marrage
// Safewindow.addEventListener("load", eu.philoux.localfolder.OnInitLocalFolder, false);

