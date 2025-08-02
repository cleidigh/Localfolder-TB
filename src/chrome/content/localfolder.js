// cleidigh - update for TB 68.*

// v2.0.0 - add option to change store type, empty trash on exit, creation of mail folders


// encapsulation objet
if (!eu) var eu = {};
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

var { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");

console.log(window)

eu.philoux.localfolder.lastFolder = "";

eu.philoux.localfolder.pendingFolders = [];
eu.philoux.localfolder.existingSpecialFolders = [];
eu.philoux.localfolder.existingFolders = [];

eu.philoux.localfolder.getThunderbirdVersion = function () {
    let parts = Services.appinfo.version.split(".");
    return {
        major: parseInt(parts[0]),
        minor: parseInt(parts[1]),
        revision: parts.length > 2 ? parseInt(parts[2]) : 0,
    }
}

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

eu.philoux.localfolder.addAllSpecialFolders = function () {
    const addAllCheckbox = document.getElementById("add_all_folders");
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    if (!!addAllCheckbox.checked) {
        for (let index = 0; index < addFolderElements.length; index++) {
            const element = addFolderElements[index];
            element.checked = true;
        }
    }
}

eu.philoux.localfolder.toggleSpecialFolder = function (specialFolder) {
    // eu.philoux.localfolder.LocalFolderTrace("Toggle special folder's");
    const addAllCheckbox = document.getElementById("add_all_folders");
    const addFolderElement = document.getElementById(`add_folder_${specialFolder}`);

    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    if (!!addAllCheckbox.checked && !addFolderElement.checked) {
        addAllCheckbox.checked = false;
    } else if (!addAllCheckbox.checked && [...addFolderElements].every(e => e.checked)) {
        addAllCheckbox.checked = true;
    }

}

eu.philoux.localfolder.addSpecialFolders = async function (aParentFolder, aParentFolderPath) {

    // eu.philoux.localfolder.LocalFolderTrace("Add special folders : " + aParentFolderPath);
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);

    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        if (!!element.checked) {
            // Add special folder
            const l = element.getAttribute("SpecialFolder");
            const storeID = aParentFolder.server.getStringValue("storeContractID");

            var ll = eu.philoux.localfolder.specialFolders[l].localizedFolderName;
            //eu.philoux.localfolder.LocalFolderTrace('Add special folder: ' + l + '  ' + storeID + "   " + ll);

            // Trash and unsent messages folders are added at account creation
            if (l !== "Trash" && l !== "Outbox" && !eu.philoux.localfolder.existingSpecialFolders.includes(l)) {

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

                await eu.philoux.localfolder.fixupSubfolder(aParentFolderPath, l, false, storeID);

            }

        }

    }
}

eu.philoux.localfolder.addExistingFolders = function (rootMsgFolder, storeID) {
    //eu.philoux.localfolder.LocalFolderTrace(`add existing ${eu.philoux.localfolder.existingFolders}`);

    eu.philoux.localfolder.existingFolders.forEach(folder => {
        if (folder == "Trash" || folder == "Unsent Messages") {
            return;
        }

        // This is the magic sequence to add an existing folder
        // addSubfolder imports the folder to the database including 
        // a recursive search below so we need only add the top folders 
        // we have to create storage and all folders will be indexed
        // however, maildir requires a rebuildSummary 

        rootMsgFolder.addSubfolder(folder);
        //eu.philoux.localfolder.LocalFolderTrace(`added existing ${folder}`)
        var newFolder;
        var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");

        if (eu.philoux.localfolder.existingSpecialFolders.includes(folder)) {
            var localizedFolder = eu.philoux.localfolder.specialFolders[folder].localizedFolderName;
            var localizedFolderString = bundle.GetStringFromName(localizedFolder);

            try {
                newFolder = rootMsgFolder.getChildNamed(localizedFolderString);
            } catch (ex) {
                newFolder = rootMsgFolder.getChildNamed(folder);
            }
        } else {
            newFolder = rootMsgFolder.getChildNamed(folder);
        }

        // This is synchronous for LocalFolders so no listener required
        newFolder.createStorageIfMissing(null);
        if (storeID == "@mozilla.org/msgstore/maildirstore;1") {
            eu.philoux.localfolder.rebuildSummary(newFolder)
        }
        rootMsgFolder.notifyFolderAdded(newFolder);
    });

}

eu.philoux.localfolder.rebuildSummary = async function (folder) {

    if (folder.locked) {
        folder.throwAlertMsg("operationFailedFolderBusy", window.msgWindow);
        return;
    }
    if (folder.supportsOffline) {
        // Remove the offline store, if any.
        await IOUtils.remove(folder.filePath.path, { recursive: true }).catch(
            console.error
        );
    }

    // Send a notification that we are triggering a database rebuild.
    MailServices.mfn.notifyFolderReindexTriggered(folder);

    folder.msgDatabase.summaryValid = false;

    const msgDB = folder.msgDatabase;
    msgDB.summaryValid = false;
    try {
        folder.closeAndBackupFolderDB("");
    } catch (e) {
        // In a failure, proceed anyway since we're dealing with problems
        folder.ForceDBClosed();
    }

    // we can use this for parseFolder
    var dbDone;
    // @implements {nsIUrlListener}
    let urlListener = {
        OnStartRunningUrl(url) {
            dbDone = false;
        },
        OnStopRunningUrl(url, status) {
            dbDone = true;
        }
    };


    var msgLocalFolder = folder.QueryInterface(Ci.nsIMsgLocalMailFolder);
    msgLocalFolder.parseFolder(window.msgWindow, urlListener);
    while (!dbDone) {
        await new Promise(r => window.setTimeout(r, 100));
    }

    // things we do to get folder to be included in global  search
    // toggling global search inclusion works, but throws
    // async tracker errors
    // we won't do these automatically for now

    //this._toggleGlobalSearchEnable(folder);
    //await this._touchCopyFolderMsg(folder);
    return;
}

eu.philoux.localfolder.urlLoad = function (url) {
    // let tabmail = eu.philoux.localfolder.getMail3Pane();
    // tabmail.openTab("chromeTab", { chromePage: url });

    let service = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService),
        ioservice = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService),
        uri = ioservice.newURI(url, null, null);
    service.loadURI(uri);

}

eu.philoux.localfolder.getMail3Pane = function () {
    var w = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator)
        .getMostRecentWindow("mail:3pane");
    return w;
}

/**
 *	initialisation boite de création de dossier
 */
eu.philoux.localfolder.initDlg = function () {

    let tbmajversion = this.getThunderbirdVersion().major;
    if (tbmajversion >= 102) {
        document.getElementById("localfolder").setAttribute("iconstyle", "new")
    } else {
        document.getElementById("localfolder").setAttribute("iconstyle", "classic")
    }
    win = eu.philoux.localfolder.getMail3Pane();

    var LFVersion = win.localfolders.extension.addonData.version;

    let title = document.getElementById("localfolder").getAttribute("title");

    document.getElementById("localfolder").setAttribute("title", `${title} - v${LFVersion}`);

    var bundle = Services.strings.createBundle("chrome://messenger/locale/messenger.properties");
    var bundle2 = Services.strings.createBundle("chrome://chat/locale/twitter.properties");

    // var localizedHomepageString = bundle2.GetStringFromName("tooltip.url");
    var localizedHomepageString = "tooltip";
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

eu.philoux.localfolder.xulFixup = function () {

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
eu.philoux.localfolder.btCreeDossierLocal = async function () {
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
            var srv;
            try {
                srv = serveurs.queryElementAt(i, Ci.nsIMsgIncomingServer); // introduce with TB 20
            } catch {
                srv = serveurs[i];
            }
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

        // new folder contents check
        // we need to track existing special and user folders

        var folderContents = await IOUtils.getChildren(dossier);

        for (const folderItem of folderContents) {
            let fileName = PathUtils.filename(folderItem);
            let folderItemStat = await IOUtils.stat(folderItem);

            if (storeID == "@mozilla.org/msgstore/maildirstore;1") {
                if (folderItemStat.type == "directory" && !fileName.includes(".")) {
                    eu.philoux.localfolder.existingFolders.push(fileName);
                }
                continue;
            }
            if (!fileName.includes(".")) {
                if (folderItemStat.size == 0 || (await eu.philoux.localfolder.isMboxFile(folderItem))) {
                    eu.philoux.localfolder.existingFolders.push(fileName);
                }
            }
        }

        folderContentsNames = folderContents.map(path => PathUtils.filename(path));

        if (folderContentsNames.length > 0) {
            let msg = eu.philoux.localfolder.LocalFolderMessageFromId("confirmDirNotEmpty");
            let specialFolderNames = Object.keys(eu.philoux.localfolder.specialFolders);
            specialFolderNames += "Unsent Messages"

            eu.philoux.localfolder.existingSpecialFolders = folderContentsNames.filter(fname => {
                if (specialFolderNames.includes(fname)) {
                    return true;
                }
            });

            eu.philoux.localfolder.existingSpecialFolders.forEach(spFolder => {
                msg += `   ${spFolder}\n`
            });
            msg += eu.philoux.localfolder.LocalFolderMessageFromId("confirmRetained");

            let result = Services.prompt.confirm(window, "", msg);
            if (!result) {
                return false;
            }
        }

        //création du dossier local
        await eu.philoux.localfolder.creeDossierLocal(nom, dossier, storeID, emptyTrashOnExit);
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
eu.philoux.localfolder.SelectChemin = function () {
    try {

        let winCtx = window;
        const tbVersion = this.getThunderbirdVersion();
        if (tbVersion.major >= 120) {
            winCtx = window.browsingContext;
        }
        var nsIFilePicker = Ci.nsIFilePicker;
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        var courant = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        var selection = document.getElementById("localfolderchemin");
        fp.init(winCtx, document.getElementById("localfoldercheminbtsel").getAttribute("localfolderchemin.browsertitle"), nsIFilePicker.modeGetFolder);
        fp.displayDirectory = courant;

        // cleidigh - replace deprecated show with asynchronous open for TB 60.*
        fp.open(function (rv) {
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
                var srv;
                try {
                    srv = serveurs.queryElementAt(i, Ci.nsIMsgIncomingServer); // introduce with TB 20
                } catch {
                    srv = serveurs[i];
                }

                var chemin = srv.localPath.path;
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
eu.philoux.localfolder.creeDossierLocal = async function (nom, chemin, storeID, emptyTrashOnExit) {

    try {
        var accountmanager = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
        let tempNom = nom.replace(' ', '0')
        var srv = accountmanager.createIncomingServer("nobody", tempNom, "none");
        var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        filespec.initWithPath(chemin);
        srv.prettyName = nom;
        srv.localPath = filespec;

        let defaultStoreID = Services.prefs.getCharPref("mail.serverDefaultStoreContractID");
        srv.setStringValue("storeContractID", storeID);
        srv.emptyTrashOnExit = emptyTrashOnExit;

        //eu.philoux.localfolder.LocalFolderTrace("CreateLocal  folder: " + chemin + "\neTrash : " + emptyTrashOnExit);

        eu.philoux.localfolder.lastFolder = chemin;

        // maildir will not setup without Trash & Unsent Messages being removed, mbox op is non issue
        await IOUtils.remove(PathUtils.join(chemin, "Trash"), { ignoreAbsent: true, recursive: true });
        await IOUtils.remove(PathUtils.join(chemin, "Unsent Messages"), { ignoreAbsent: true, recursive: true });

        var account = accountmanager.createAccount();
        account.incomingServer = srv;

        msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance(Ci.nsIMsgWindow);


        // Fix trash and unsent messages subfolders created by createAccount
        // the not usable until empty folders and file are created/deleted based on storage type
        await eu.philoux.localfolder.fixupSubfolder(chemin, "Trash", false, storeID);
        await eu.philoux.localfolder.fixupSubfolder(chemin, "Unsent Messages", false, storeID);

        // keep track of new folders for subfolder fixes
        eu.philoux.localfolder.pendingFolders.push(chemin);

        await eu.philoux.localfolder.addSpecialFolders(srv.rootMsgFolder, chemin);
        // eu.philoux.localfolder.LocalFolderTrace("Add special subfolders");

        var notifyFlags = Ci.nsIFolderListener.added;
        srv.rootMsgFolder.AddFolderListener(FolderListener, notifyFlags);
        // eu.philoux.localfolder.LocalFolderTrace("Added folder listener");

        // "import"/index all existing folders
        eu.philoux.localfolder.addExistingFolders(srv.rootMsgFolder, storeID);

        return account;
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        return false;
    }

    return false;
}


eu.philoux.localfolder.fixupSubfolder = async function (parentName, folderName, removeFileFolder, storeID) {

    // eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder: ${folderName} - remove file folder: ${removeFileFolder}  storeType: ${storeID}`);
    var filespec = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    var rf = `${parentName}\\${folderName}`

    filespec.initWithPath(parentName);
    filespec.append(folderName);

    if (removeFileFolder) {
        let fullPath = PathUtils.join(parentName, folderName);
        if (await IOUtils.exists(fullPath)) {
            await IOUtils.remove(fullPath);
            return;
        }
    }

    // We need to tweak subfolders differently for storage type
    // mbox - remove local directory, create empty mail file
    // maildir - create directory

    if (storeID !== "@mozilla.org/msgstore/maildirstore;1") {
        //eu.philoux.localfolder.LocalFolderTrace(`removing file folder: ${rf}`);
        try {
            filespec.remove(true);
            //eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder - removed folder`);
        } catch (error) {
            //eu.philoux.localfolder.LocalFolderTrace(`no folder found removing file folder: ${rf}`);
        }
    }

    if (storeID === "@mozilla.org/msgstore/maildirstore;1") {
        filespec.create(Ci.nsIFile.DIRECTORY_TYPE, 0755);
        //eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - CREATED DIRECTORY`);

    } else {
        filespec.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0644);
        //eu.philoux.localfolder.LocalFolderTrace(`fixupSubfolder done - create file`);
    }
}

// Listen for subfolder additions, have to fixup
var FolderListener = {
    OnItemAdded: async function (parentFolder, aItem) {
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
};



/**
 *	test si un répertoire est valide pour créer un dossier local
 *	@param rep instance nsIFile
 *	@return true si valid, sinon false 
 *	implémentation : true si vide ou contient un ou plus ficher .msf
 *	
 */
eu.philoux.localfolder.ValidRepLocal = function (rep) {
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

eu.philoux.localfolder.isMboxFile = async function (filePath) {

    if ((await IOUtils.stat(filePath)).size == 0) {
        return true;
    }

    let fromRegx = /^(From (?:.*?)(?:\r|\n|\r\n))[\x21-\x7E]+:/gm;

    // Read chunk as uint8
    var rawBytes = await IOUtils.read(filePath, { offset: 0, maxBytes: 500 });
    // convert to faster String for regex etc
    let strBuffer = rawBytes.reduce(function (str, b) {
        return str + String.fromCharCode(b);
    }, "");
    let rv = fromRegx.test(strBuffer);
    return rv;
}
