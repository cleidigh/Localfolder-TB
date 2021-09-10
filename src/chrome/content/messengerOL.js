// messengerOL - overlay loader for messenger.xul - Source: mboximport.xul

// Load all scripts from original overlay file - creates common scope
// onLoad() installs each overlay xul fragment
// Menus - Folder, messages, Tools

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');


function onLoad() {
	// console.debug('messenger OL');
	
	// inject extension object into private context
	window.localfolders = {};
	window.localfolders.extension = WL.extension;

}

function onUnload() {
}