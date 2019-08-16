// encapsulation objet
if (!eu) var eu = {};
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

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

/**
 * permet de déterminer s'il s'agit d'un dossier local
 */

eu.philoux.localfolder.isLocalFolder = function () {

	let account = getCurrentAccount();
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
	initAccountActionsButtons(menupopup);
	if (eu.philoux.localfolder.isLocalFolder())
		document.getElementById("accountActionsDropdownRemove").removeAttribute("disabled");
}


/**
 *	gére le bouton de suppression de compte original
 *	@return si succes retourne true / si erreur retourne false 
 *	implémentation : appelle la fonction originale onRemoveAccount
 */
eu.philoux.localfolder.onSupprimeCompte = function (e) {
	try {
		if (!eu.philoux.localfolder.isLocalFolder()) { // on utilise la fonction par défaut pour les autres comptes
			onRemoveAccount(e);
		} else { // pour les dossiers locaux on utilise une fonction personnalisée

			var account = currentAccount;
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
				currentAccount = currentPageId = null;

				const f = server.localPath.path;

				var serverId = server.serverURI;
				Components.classes["@mozilla.org/messenger/account-manager;1"]
					.getService(Components.interfaces.nsIMsgAccountManager)
					.removeAccount(account);

				if (serverId in accountArray) {
					delete accountArray[serverId];
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
	window.openDialog("chrome://localfolder/content/localfolder.xul", "", "chrome,modal,centerscreen,titlebar,resizable=yes");

	return true;
}

//positionnement des boutons au d�marrage
window.addEventListener("load", eu.philoux.localfolder.OnInitLocalFolder, false);

