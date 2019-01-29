// encapsulation objet
if (!eu) var eu={};
if (!eu.philoux) eu.philoux={};
if (!eu.philoux.localfolder) eu.philoux.localfolder={};

//liste des chaines localfolder.properties
eu.philoux.localfolder.g_messages_localfolder=null;

//code dernière erreur
eu.philoux.localfolder.g_CodeErreur=0;
//message dernière erreur
eu.philoux.localfolder.g_MSGERREUR="";


eu.philoux.localfolder.ChargeMessagesLocalFolder = function(){
	eu.philoux.localfolder.g_messages_localfolder=Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
	eu.philoux.localfolder.g_messages_localfolder=eu.philoux.localfolder.g_messages_localfolder.createBundle("chrome://localfolder/locale/localfolder.properties");
}
eu.philoux.localfolder.ChargeMessagesLocalFolder();

/**
*	Retourne une chaîne de message à partir de son identifiant dans le fichie localfolder.properties
*/
eu.philoux.localfolder.LocalFolderMessageFromId = function(msgid){
	return eu.philoux.localfolder.g_messages_localfolder.GetStringFromName(msgid);
}

/**
*	Affichage d'un message à partir de l'identifiant dans localfolder.properties
*	@param msgid identifiant du message
*/
eu.philoux.localfolder.LocalFolderAfficheMsgId = function(msgid){
	var msg=eu.philoux.localfolder.LocalFolderMessageFromId(msgid);
	var promptService=Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
 	promptService.alert(window, "", msg);
}

/**
*	Affichage d'un message à partir de l'identifiant dans localfolder.properties
*	@param msgid identifiant du message
*	@param msg2 message additionnel affiché sur nouvelle ligne (optionnel)
*/
eu.philoux.localfolder.LocalFolderAfficheMsgId2 = function(msgid,msg2){
	var msg=eu.philoux.localfolder.LocalFolderMessageFromId(msgid);
	if (null!=msg2) msg+="\n"+msg2;
	var promptService=Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
 	promptService.alert(window, "", msg);
}

/**
*	Affichage d'un message à partir de l'identifiant dans localfolder.properties
*	ajoute code et message erreur globale
*	@param msgid identifiant du message
*/
eu.philoux.localfolder.LocalFolderAfficheMsgIdGlobalErr = function(msgid){
	var msg=eu.philoux.localfolder.LocalFolderMessageFromId(msgid);
	msg+="\nCode:"+eu.philoux.localfolder.g_CodeErreur;
	msg+="\nMessage:"+eu.philoux.localfolder.g_MSGERREUR;
	var promptService=Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
 	promptService.alert(window, "", msg);
}



/**
*	Génération de traces
*/
eu.philoux.localfolder.gLocalFolderConsole=null;
eu.philoux.localfolder.LocalFolderInitTrace = function(){
		eu.philoux.localfolder.gLocalFolderConsole=Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
}
eu.philoux.localfolder.LocalFolderInitTrace();
eu.philoux.localfolder.LocalFolderTrace = function(msg){
	if (eu.philoux.localfolder.gLocalFolderConsole) eu.philoux.localfolder.gLocalFolderConsole.logStringMessage("localfolder "+msg);
}
