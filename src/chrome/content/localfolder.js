// cleidigh - update for TB 68.*

// v2.0.0 - add option to change store type, empty trash on exit, creation of mail folders


// encapsulation objet
if (!eu) var eu = {};
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

eu.philoux.localfolder.lastFolder = "";

eu.philoux.localfolder.pendingFolders = [];


// We have to manage special folder flags and localized folder names
// There appears to be some quirks with localized names showing up as English

eu.philoux.localfolder.specialFolders = {
    "Inbox": { "localizedFolderName": "inboxFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Inbox) },
    "Sent": { "localizedFolderName": "sentFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.SentMail) },
    "Trash": { "localizedFolderName": "trashFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Trash) },
    "Drafts": { "localizedFolderName": "draftsFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Drafts) },
    "Templates": { "localizedFolderName": "templatesFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Templates) },
    "Archives": { "localizedFolderName": "archivesFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Archive) },
    "Junk": { "localizedFolderName": "junkFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Junk) },
    "Outbox": { "localizedFolderName": "outboxFolderName", "flags": (Ci.nsMsgFolderFlags.Mail | Ci.nsMsgFolderFlags.Queue) }
}

// Extension Information Icons

eu.philoux.localfolder.addAllSpecialFolders = function() {
    const addAllCheckbox = document.getElementById("add_all_folders");
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    if (!!addAllCheckbox.checked) {
        for (let index = 0; index < addFolderElements.length; index++) {
            const element = addFolderElements[index];
            element.checked = true;
        }
    }
}

eu.philoux.localfolder.toggleSpecialFolder = function(specialFolder) {
    // eu.philoux.localfolder.LocalFolderTrace("Toggle special folder's");
    const addAllCheckbox = document.getElementById("add_all_folders");
    const addFolderElement = document.getElementById(`add_folder_${specialFolder}`);

    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    if (!!addAllCheckbox.checked && !addFolderElement.checked) {
        addAllCheckbox.checked = false;
    } else if (!addAllCheckbox.checked && addFolderElements.every(e => e.checked)) {
        addAllCheckbox.checked = true;
    }

}

eu.philoux.localfolder.addSpecialFolders = function(aParentFolder, aParentFolderPath) {

    // eu.philoux.localfolder.LocalFolderTrace("Add special folders : " + aParentFolderPath);
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);

    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        if (!!element.checked) {
            // Add special folder
            const l = element.getAttribute("SpecialFolder");
            const storeID = aParentFolder.server.getCharValue("storeContractID");

            var ll = eu.philoux.localfolder.specialFolders[l].localizedFolderName;
            // eu.philoux.localfolder.LocalFolderTrace('Add special folder: ' + l + '  ' + storeID + "   " + ll);

            // Trash and unsent messages folders are added at account creation
            if (l !== "Trash" && l !== "Outbox") {
                aParentFolder.createSubfolder(l, msgWindow);

                // eu.philoux.localfolder.LocalFolderTrace("Added subfolder : " + l);
                var localizedFolderString = bundle.GetStringFromName(ll);
                var e = aParentFolder.subFolders;

                try {
                    aParentFolder.getChildNamed(localizedFolderString).flags = eu.philoux.localfolder.specialFolders[l].flags;
                    // eu.philoux.localfolder.LocalFolderTrace("child " + localizedFolderString);
                } catch (error) {
                    // eu.philoux.localfolder.LocalFolderTrace("child not found TryEnglish");
                    aParentFolder.getChildNamed(l).flags = eu.philoux.localfolder.specialFolders[l].flags;
                }

                eu.philoux.localfolder.fixupSubfolder(aParentFolderPath, l, false, storeID);
            }

        }

    }
}


eu.philoux.localfolder.urlLoad = function(url) {
    // let tabmail = eu.philoux.localfolder.getMail3Pane();
    // tabmail.openTab("chromeTab", { chromePage: url });

    let service = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService),
        ioservice = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService),
        uri = ioservice.newURI(url, null, null);
        service.loadURI(uri);

}

eu.philoux.localfolder.getMail3Pane = function() {
    var w = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator)
        .getMostRecentWindow("mail:3pane");
    return w;
}

/**
 *	initialisation boite de création de dossier
 */
eu.philoux.localfolder.initDlg = function() {

    // Fix XUL elements that have changed
    eu.philoux.localfolder.xulFixup();

    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    var bundle2 = Services.strings.createBundle("chrome://chat/locale/twitter.properties");

    var localizedHomepageString = bundle2.GetStringFromName("tooltip.url");
    localizedHomepageString = `LocalFolders ${localizedHomepageString}`;
    document.getElementById("localfolder-icon-image").setAttribute("tooltiptext", localizedHomepageString);

    var os = navigator.platform.toLowerCase();
    const addAllCheckboxLabel = document.getElementById("add_all_folders_label");

    // Localize folder names
    let addFolderElements = document.querySelectorAll("[id^='add_folderlabel_']");
    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        var folder = element.getAttribute("value");

        if (os.indexOf("win") > -1) {
            element.previousElementSibling.classList.add("folder-image-win");
        }

        var localizedFolderString = bundle.GetStringFromName(eu.philoux.localfolder.specialFolders[folder].localizedFolderName);
        element.setAttribute("value", localizedFolderString);
    }

    document.getElementById("localfoldernom").focus();
}

eu.philoux.localfolder.xulFixup = function() {

    const versionChecker = Services.vc;
    const currentVersion = Services.appinfo.platformVersion;

    // cleidigh - TB68 groupbox needs hbox/label
    if (versionChecker.compare(currentVersion, "61") >= 0) {
        var captions = document.querySelectorAll("caption");
        for (let i = 0; i < captions.length; i++) {
            captions[i].style.display = "none";
        }
    } else {
        var groupboxtitles = document.querySelectorAll(".groupbox-title");
        for (let i = 0; i < groupboxtitles.length; i++) {
            groupboxtitles[i].style.display = "none";
        }
    }
}


/**
 *	création du dossier local (bouton valider)
 *	@return	true si ok, false si erreur
 */
eu.philoux.localfolder.btCreeDossierLocal = function() {
    try {

        //vérification des paramétres
        var nom = document.getElementById("localfoldernom").value;
        // eu.philoux.localfolder.LocalFolderTrace("Add  folder: " + nom);
        if (nom == "") {
            eu.philoux.localfolder.LocalFolderAfficheMsgId("NomPasRenseigne");
            return false;
        }
        //nom pas déjà utilisé
        var accountmanager = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
        var serveurs = accountmanager.allServers;

        for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
        {
            var srv = serveurs.queryElementAt(i, Ci.nsIMsgIncomingServer); // introduce with TB 20
            if (nom == srv.prettyName) {
                eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierExisteDeja");
                return false;
            }
        }

        var dossier = document.getElementById("localfolderchemin").value;
        if (dossier == "") {
            eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierPasRenseigne");
            return false;
        }

        // cleidigh - handle storage type, empty trash
        var storeID = document.getElementById("server.storeTypeMenulist").value;
        var emptyTrashOnExit = document.getElementById("server.emptyTrashOnExit").checked;

        //création du dossier local
        eu.philoux.localfolder.creeDossierLocal(nom, dossier, storeID, emptyTrashOnExit);
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        window.close();
        return false;
    }
    window.close();
    return true;
}

/**
 *	sélection du chemin d'un nouveau dossier
 *
 *	@return	true si ok, false si erreur
 *
 */
eu.philoux.localfolder.SelectChemin = function() {
    try {

        var nsIFilePicker = Ci.nsIFilePicker;
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        var courant = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        var selection = document.getElementById("localfolderchemin");
        fp.init(window, document.getElementById("localfoldercheminbtsel").getAttribute("localfolderchemin.browsertitle"), nsIFilePicker.modeGetFolder);
        fp.displayDirectory = courant;

        // cleidigh - replace deprecated show with asynchronous open for TB 60.*
        fp.open(function(rv) {
            // eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:" + fp.file.path);

            if (rv !== nsIFilePicker.returnOK) {
                // user canceled
                return false;
            }

            var file = fp.file;
            var path = fp.file.path;
            // work with returned nsILocalFile...

            selection.value = fp.file.path;

            //vérifier que le chemin est valide
            // eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:"+fp.file.path);
            var bValid = eu.philoux.localfolder.ValidRepLocal(fp.file);
            // eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin retour eu.philoux.localfolder.ValidRepLocal bValid:"+bValid);

            if (false == bValid) {
                eu.philoux.localfolder.LocalFolderAfficheMsgId("RepNonValide");
                return false;
            }

            //vérifier que l'emplacement n'est pas déjà utilisé
            var accountmanager = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
            var serveurs = accountmanager.allServers;

            for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
            {
                var srv = serveurs.queryElementAt(i, Ci.nsIMsgIncomingServer); // introduce with TB 20
                var chemin = srv.localPath.nativePath;
                if (fp.file.path.toLowerCase() == chemin.toLowerCase()) {
                    eu.philoux.localfolder.LocalFolderAfficheMsgId("RepertoireDejaUtilise");
                    return false;
                }
                //else alert("'"+chemin+"'!='"+fp.file.path+"'");
            }

            selection.value = fp.file.path;
        });

    } catch (ex) {
        alert(ex);
        return false;
    }

    return true;
}


/**
 *	creation du compte de dossier local
 *
 *	@param nom nom d'affichage du dossier
 *	@param chemin disque du dossier
 *
 *	@return	instance  nsIMsgAccount du compte créé si ok, false si erreur
 *
 *	implémentation : l'appel à cette fonction suppose que l'appelant a vérifier que le compte n'existe pas déjà
 *	nom et chemin pas déjà utilisés
 */
eu.philoux.localfolder.creeDossierLocal = function(nom, chemin, storeID, emptyTrashOnExit) {

    try {
        var accountmanager = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
        var srv = accountmanager.createIncomingServer("nobody", nom, "none");
        var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        filespec.initWithPath(chemin);
        srv.prettyName = nom;
        srv.localPath = filespec;

        let defaultStoreID = Services.prefs.getCharPref("mail.serverDefaultStoreContractID");
        srv.setCharValue("storeContractID", storeID);
        srv.emptyTrashOnExit = emptyTrashOnExit;

        // eu.philoux.localfolder.LocalFolderTrace("CreateLocal  folder: " + chemin + "\neTrash : " + emptyTrashOnExit);

        eu.philoux.localfolder.lastFolder = chemin;

        var account = accountmanager.createAccount();
        account.incomingServer = srv;

        msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);

        // Fix trash and unsent messages subfolders created by createAccount
        // the not usable until empty folders and file are created/deleted based on storage type
        eu.philoux.localfolder.fixupSubfolder(chemin, "Trash", false, storeID);
        eu.philoux.localfolder.fixupSubfolder(chemin, "Unsent Messages", false, storeID);

        // keep track of new folders for subfolder fixes
        eu.philoux.localfolder.pendingFolders.push(chemin);

        eu.philoux.localfolder.addSpecialFolders(srv.rootMsgFolder, chemin);
        // eu.philoux.localfolder.LocalFolderTrace("Add special subfolders");

        var notifyFlags = Ci.nsIFolderListener.added;
        srv.rootMsgFolder.AddFolderListener(FolderListener, notifyFlags);
        // eu.philoux.localfolder.LocalFolderTrace("Added folder listener");

        return account;
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        return false;
    }

    return false;
}


eu.philoux.localfolder.fixupSubfolder = function(parentName, folderName, removeFileFolder, storeID) {

    // eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder: ${folderName} - remove file folder: ${removeFileFolder}  storeType: ${storeID}`);
    var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    var rf = `${parentName}\\${folderName}`

    filespec.initWithPath(parentName);
    filespec.append(folderName);

    if (removeFileFolder) {
        filespec.initWithPath(parentName);
        filespec.append(folderName);
        filespec.remove(true);
        return;
    }

    // We need to tweak subfolders differently for storage type
    // mbox - remove local directory, create empty mail file
    // maildir - create directory

    if (storeID !== "@mozilla.org/msgstore/maildirstore;1") {
        // eu.philoux.localfolder.LocalFolderTrace(`removing file folder: ${rf}`);
        try {
            filespec.remove(true);
            // eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder - removed folder`);
        } catch (error) {
            // eu.philoux.localfolder.LocalFolderTrace(`no folder found removing file folder: ${rf}`);
        }
    }

    if (storeID === "@mozilla.org/msgstore/maildirstore;1") {
        filespec.create(Ci.nsIFile.DIRECTORY_TYPE, 0755);
        // eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - CREATED DIRECTORY`);

    } else {
        filespec.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0644);
        // eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - create file`);
    }
}

// Listen for subfolder additions, have to fixup
var FolderListener = {
    OnItemAdded: function(parentFolder, aItem) {
        // eu.philoux.localfolder.LocalFolderTrace(`FolderListener item added : ${parentFolder.filePath.path} ${parentFolder.flags}`);
        
        // We seem to get to events first without folder
        if (!(aItem instanceof Ci.nsIMsgFolder)) {
            // eu.philoux.localfolder.LocalFolderTrace(`NotFolder  ${aItem.name}   ${parentFolder.name}`);
			return;
		}
        // eu.philoux.localfolder.LocalFolderTrace(`${aItem.name}    ${aItem.flags} ${eu.philoux.localfolder.pendingFolders[0]}`);

        var rf = `${aItem.filePath.path}`;
        rf = rf.replace(`\\${aItem.name}`, "");

        if (eu.philoux.localfolder.pendingFolders.includes(`${rf}`) && (aItem.flags & 0x000004)) {
            var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
            eu.philoux.localfolder.fixupSubfolder(eu.philoux.localfolder.pendingFolders[0], aItem.name, false, aItem.server.getCharValue("storeContractID"));

            if (aItem.name in eu.philoux.localfolder.specialFolders) {
                var sf = eu.philoux.localfolder.specialFolders[aItem.name].flags
                    // eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} get flags ${aItem.flags}`);
                aItem.setFlag(sf);
                // eu.philoux.localfolder.LocalFolderTrace(`${aItem.name} set flags (${sf} : ${aItem.flags}`);
            }

        }
    },

    OnItemRemoved() {},
    OnItemPropertyChanged() {},
    OnItemIntPropertyChanged() {},
    OnItemBoolPropertyChanged() {},
    OnItemUnicharPropertyChanged() {},
    OnItemPropertyFlagChanged() {},
    OnItemEvent() {},
};



/**
 *	test si un répertoire est valide pour créer un dossier local
 *	@param rep instance nsIFile
 *	@return true si valid, sinon false 
 *	implémentation : true si vide ou contient un ou plus ficher .msf
 *	
 */
eu.philoux.localfolder.ValidRepLocal = function(rep) {
    try {
        var bValid = true;
        var item = null;
        var iter = rep.directoryEntries;
        while (iter.hasMoreElements()) {
            bValid = false;
            item = iter.getNext();
            item = item.QueryInterface(Ci.nsIFile);
            if (item.isDirectory()) {
                bValid = eu.philoux.localfolder.ValidRepLocal(item);
                if (bValid) {
                    break;
                }
            } else if (item.isFile()) {
                var tab = item.leafName.split(".");
                if (tab.length) {
                    if ("msf" == tab[tab.length - 1]) {
                        bValid = true;
                        break;
                    }
                }
            }
        }
        return bValid;
    } catch (ex) {
        return false;
    }
    return false;
}