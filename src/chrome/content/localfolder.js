// cleidigh - update for TB 60.*
// const { folderpane } = ChromeUtils.import("chrome://localfolder/content/folderpane.js");


// encapsulation objet
if (!eu) var eu = {};
if (!eu.philoux) eu.philoux = {};
if (!eu.philoux.localfolder) eu.philoux.localfolder = {};

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

eu.philoux.localfolder.lastFolder = "";

const SEND_FOLDER_FLAGS = 0x200;
const DRAFTS_FOLDER_FLAGS = 0x400;
const TEMPLATES_FOLDER_FLAGS = 0x400000;
const ARCHIVES_FOLDER_FLAGS = 0x4000;
const JUNK_FOLDER_FLAGS = 0x40000000;


eu.philoux.localfolder.specialFolders = {
    "Inbox": { "directoryName": "Inbox", "flags": SEND_FOLDER_FLAGS },
    "Sent": { "directoryName": "Sent", "flags": SEND_FOLDER_FLAGS },
    "Drafts": { "directoryName": "Drafts", "flags": DRAFTS_FOLDER_FLAGS },
    "Templates": { "directoryName": "Templates", "flags": TEMPLATES_FOLDER_FLAGS },
    "Archives": { "directoryName": "Archives", "flags": ARCHIVES_FOLDER_FLAGS },
    "Junk": { "directoryName": "Junk", "flags": JUNK_FOLDER_FLAGS }
}

// Extension Information Icons

eu.philoux.localfolder.addAllSpecialFolders = function () {
    eu.philoux.localfolder.LocalFolderTrace('HadSpecial ');
    const addAllCheckbox = document.getElementById("add_all_folders");
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    eu.philoux.localfolder.LocalFolderTrace('HadSpecial ' + addFolderElements.length);

    if (!!addAllCheckbox.checked) {
        // addFolderElements.checked 
        for (let index = 0; index < addFolderElements.length; index++) {
            const element = addFolderElements[index];
            console.debug('element ' + element.getAttribute("label"));
            element.checked = true;
            // element.disabled = !!addAllCheckbox;
        }
    }
}

eu.philoux.localfolder.toggleSpecialFolders = function (specialFolder) {
    eu.philoux.localfolder.LocalFolderTrace('HadSpecial '+ specialFolder);
    const addAllCheckbox = document.getElementById("add_all_folders");
    const addFolderElement = document.getElementById(`add_folder_${specialFolder}`);
    
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");

    eu.philoux.localfolder.LocalFolderTrace('HadSpecial ' + addFolderElements.length);

    if (!!addAllCheckbox.checked && !addFolderElement.checked) {
        addAllCheckbox.checked = false;
        console.debug('toggle wall');
    } else if (!addAllCheckbox.checked && addFolderElements.every(e => e.checked)) {
        addAllCheckbox.checked = true;
    }

}

    eu.philoux.localfolder.addSpecialFolders = function (aParentFolder) {
    
    eu.philoux.localfolder.LocalFolderTrace("Add special folder's");
    let addFolderElements = document.querySelectorAll("[id^='add_folder_']");
    // var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);

    for (let index = 0; index < addFolderElements.length; index++) {
        const element = addFolderElements[index];
        if (!!element.checked) {
            // Add special folder
            const l = element.getAttribute("SpecialFolder");
            eu.philoux.localfolder.LocalFolderTrace('A folder: ' + l);
            if (l !== "Trash" && l !== "Unsent Messages") {
                eu.philoux.localfolder.LocalFolderTrace('AddSubfolder folder: ' + l);
                let sf = aParentFolder.addSubfolder(l);
                sf.setFlag(eu.philoux.localfolder.specialFolders[l].flags)
        
            }
            
        }
    }
}

eu.philoux.localfolder.urlLoad = function (url) {
    let tabmail = eu.philoux.localfolder.getMail3Pane();
    // const ref = "https://thdoan.github.io/strftime/";
    tabmail.openTab("chromeTab", { chromePage: url });
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
    eu.philoux.localfolder.LocalFolderTrace("Init dialog");
          
    eu.philoux.localfolder.xulFixup();
    document.getElementById("localfoldernom").focus();
}

eu.philoux.localfolder.xulFixup = function () {

	const versionChecker = Services.vc;
	const currentVersion = Services.appinfo.platformVersion;

	// cleidigh - TB68 groupbox needs hbox/label
	if (versionChecker.compare(currentVersion, "61") >= 0) {
        eu.philoux.localfolder.LocalFolderTrace("68 captions except");
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
eu.philoux.localfolder.btCreeDossierLocal = function () {
    try {

        
        //vérification des paramétres
        var nom = document.getElementById("localfoldernom").value;
        eu.philoux.localfolder.LocalFolderTrace("Add  folder: "+nom);
        if (nom == "") {
            eu.philoux.localfolder.LocalFolderAfficheMsgId("NomPasRenseigne");
            return false;
        }
        //nom pas déjà utilisé
        var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
        var serveurs = accountmanager.allServers;

        for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
        {
            var srv = serveurs.queryElementAt(i, Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
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
        //création du dossier local
        eu.philoux.localfolder.creeDossierLocal(nom, dossier);
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

        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        var courant = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        var selection = document.getElementById("localfolderchemin");
        fp.init(window, document.getElementById("localfoldercheminbtsel").getAttribute("localfolderchemin.browsertitle"), nsIFilePicker.modeGetFolder);
        fp.displayDirectory = courant;

        // cleidigh - replace deprecated show with asynchronous open for TB 60.*
        fp.open(function (rv) {
            eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:" + fp.file.path);

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
            var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
            var serveurs = accountmanager.allServers;

            for (var i = 0; i < serveurs.length; i++) // introduce with TB 20
            {
                var srv = serveurs.queryElementAt(i, Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
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
eu.philoux.localfolder.creeDossierLocal = function (nom, chemin) {

    try {
        var accountmanager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
        var srv = accountmanager.createIncomingServer("nobody", nom, "none");
        var filespec = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        filespec.initWithPath(chemin);
        srv.prettyName = nom;
        srv.localPath = filespec;
        eu.philoux.localfolder.LocalFolderTrace("CreateLocal  folder: "+ chemin);
        eu.philoux.localfolder.lastFolder = chemin;
        eu.philoux.localfolder.addSpecialFolders(srv.rootFolder);

        var account = accountmanager.createAccount();
        account.incomingServer = srv;

        // srv.rootFolder.deleteSubFolders(["Trash"], null);
        // eu.philoux.localfolder.LocalFolderTrace('folder method '+ folderpane.p1);
        // eu.philoux.localfolder.LocalFolderTrace('folder trash ');
        // folderpane.refresh();

        eu.philoux.localfolder.LocalFolderTrace('folder names ' + chemin + '   ' + eu.philoux.localfolder.lastFolder);

        return account;
    } catch (ex) {
        eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier", ex);
        return false;
    }

    return false;
}

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
            item = item.QueryInterface(Components.interfaces.nsIFile);
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


// window.addEventListener("load", function(event) {
//     eu.philoux.localfolder.LocalFolderTrace("load event before");
//     eu.philoux.localfolder.initDlg();
//     eu.philoux.localfolder.LocalFolderTrace("load event after");
// });

