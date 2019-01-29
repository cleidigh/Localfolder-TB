// encapsulation objet
if (!eu) var eu={};
if (!eu.philoux) eu.philoux={};
if (!eu.philoux.localfolder) eu.philoux.localfolder={};

/**
*	initialisation boite de création de dossier
*/
eu.philoux.localfolder.initDlg = function(){
	document.getElementById("localfoldernom").focus();
}

/**
*	création du dossier local (bouton valider)
*	@return	true si ok, false si erreur
*/
eu.philoux.localfolder.btCreeDossierLocal = function(){
	try{
		//vérification des paramétres
		var nom=document.getElementById("localfoldernom").value;
		if (nom==""){
	    eu.philoux.localfolder.LocalFolderAfficheMsgId("NomPasRenseigne");
			return false;
		}
		//nom pas déjà utilisé
		var accountmanager=Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    var serveurs=accountmanager.allServers;
    //for (var i=0;i<serveurs.Count();i++) deprecated with TB 20
    for (var i=0;i<serveurs.length;i++) // introduce with TB 20
    {
    	// var srv=serveurs.GetElementAt(i).QueryInterface(Components.interfaces.nsIMsgIncomingServer); deprecated with TB 20
    	var srv=serveurs.queryElementAt(i,Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
      if (nom==srv.prettyName)
      {
        eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierExisteDeja");
        return false;
      }
    }
    
		var dossier=document.getElementById("localfolderchemin").value;
		if (dossier==""){
	    eu.philoux.localfolder.LocalFolderAfficheMsgId("DossierPasRenseigne");
			return false;
		}
		//création du dossier local
		eu.philoux.localfolder.creeDossierLocal(nom,dossier);
	}
	catch(ex){
	 	eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier",ex);
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
eu.philoux.localfolder.SelectChemin = function(){
	try{
		var fp=Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		var courant=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
		var selection=document.getElementById("localfolderchemin");
//		if (selection.value) courant.initWithPath(selection.value);
		fp.init(window, document.getElementById("localfoldercheminbtsel").getAttribute("localfolderchemin.browsertitle"), Components.interfaces.nsIFilePicker.modeGetFolder);
		fp.displayDirectory=courant;

	  var ret=fp.show();
	
	  if (ret==Components.interfaces.nsIFilePicker.returnOK) 
	  {
		selection.value=fp.file.path;
	  	
	  	//vérifier que le chemin est valide
	  	//eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin appel eu.philoux.localfolder.ValidRepLocal:"+fp.file.path);
	  	var bValid=eu.philoux.localfolder.ValidRepLocal(fp.file);
	  	//eu.philoux.localfolder.LocalFolderTrace("eu.philoux.localfolder.SelectChemin retour eu.philoux.localfolder.ValidRepLocal bValid:"+bValid);
	  	
	  	if (false==bValid){
        eu.philoux.localfolder.LocalFolderAfficheMsgId("RepNonValide");
        return false;
	  	}
	  	
	  	//vérifier que l'emplacement n'est pas déjà utilisé
	  	var accountmanager=Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
	    var serveurs=accountmanager.allServers;
    	//for (var i=0;i<serveurs.Count();i++) deprecated with TB 20
	    for (var i=0;i<serveurs.length;i++) // introduce with TB 20
  	    {
	    	// var srv=serveurs.GetElementAt(i).QueryInterface(Components.interfaces.nsIMsgIncomingServer); deprecated with TB 20
    		var srv=serveurs.queryElementAt(i,Components.interfaces.nsIMsgIncomingServer); // introduce with TB 20
	      var chemin=srv.localPath.nativePath ;
	      if (fp.file.path.toLowerCase()==chemin.toLowerCase())
	      {
	        eu.philoux.localfolder.LocalFolderAfficheMsgId("RepertoireDejaUtilise");
	        return false;
	      }
	    	//else alert("'"+chemin+"'!='"+fp.file.path+"'");
	    }
	  	
	  	selection.value=fp.file.path;
		}
	}
	catch(ex){
		//alert(ex);
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
eu.philoux.localfolder.creeDossierLocal = function (nom,chemin){
	
	try{
		var accountmanager=Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
		var srv=accountmanager.createIncomingServer("nobody",nom,"none");
		var filespec=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
		filespec.initWithPath(chemin);
		srv.prettyName=nom;
		srv.localPath=filespec;
		var account=accountmanager.createAccount();
		account.incomingServer=srv;
//		srv.name=nom;
		return account;
	}
	catch(ex){
		eu.philoux.localfolder.LocalFolderAfficheMsgId2("ErreurCreationDossier",ex);
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
eu.philoux.localfolder.ValidRepLocal = function(rep){
	try{
		var bValid=true;
		var item=null;
		var iter=rep.directoryEntries;
		while (iter.hasMoreElements()){
			bValid=false;
			item=iter.getNext();
			item=item.QueryInterface(Components.interfaces.nsIFile);
			if (item.isDirectory()){
				bValid=eu.philoux.localfolder.ValidRepLocal(item);
				if (bValid){
					break;
				}
			}
			else if (item.isFile()){
				var tab=item.leafName.split(".");
				if (tab.length){
					if ("msf"==tab[tab.length-1]){
						bValid=true;
						break;
					}
				}
			}
		}
		return bValid;
	}
	catch(ex){
		return false;
	}
	return false;
}
