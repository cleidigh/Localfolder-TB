console.debug('TabMonitor');
var tabmail = document.getElementById("tabmail");
monitor = {
  onTabClosing: function(tab)
  {
    console.debug('closing ' + tab.url);
  },
  onTabOpened: function(tab)
  {
	console.debug('open ' + tab);
	try {
		console.debug(tab);
		console.debug(tabmail.tabInfo[tab]);
		console.debug(tab.browser.contentDocument.URL);
	
	} catch (error) {
	}
  },
  onTabTitleChanged: function(tab) {
	  console.debug('TitleChange');
	console.debug(tab.browser.contentDocument.URL);
	
	if (tab.browser.contentWindow && !tab.browser.contentWindow.wrappedJSObject) {
		console.debug('no content yet');
		return;
	}
	
	if (tab.browser.contentDocument.URL !== "about:accountsettings") {
		return;
	}

	if (tab.browser.contentDocument.getElementById("accountActionAddLocalFolder")) {
		console.debug('menu added already');
		return;
	}
	
	if (tab.browser.contentDocument.URL === "about:accountsettings") {
		console.debug('inject script URL');
		console.debug(tab.tabInfo);
		console.debug(tab.browser);
	}
	console.debug('MenuA');
	// <menupopup id="accountActionsDropdown" onpopupshowing="eu.philoux.localfolder.initAccountActionsButtonsLocalFolder(this)">

	let m = tab.browser.contentWindow.wrappedJSObject.MozXULElement.parseXULToFragment(`
		<menuitem id="accountActionAddLocalFolder"
			label="&eu.philoux.localfolder.btdossier;" 
			accesskey="&eu.philoux.localfolder.btdossier.racc;"
			oncommand="eu.philoux.localfolder.NewLocalFolder();"/>
	`, ["chrome://localfolder/locale/localfolder.dtd"]);

	let am = tab.browser.contentDocument.getElementById("accountActionsDropdown");
	// am.appendChild(m);
	am.setAttribute("onpopupshowing","eu.philoux.localfolder.initAccountActionsButtonsLocalFolder(this);");
	am.insertBefore(m, tab.browser.contentDocument.getElementById("accountActionsDropdownSep1"));
	
	// let rm = tab.browser.contentWindow.wrappedJSObject.MozXULElement.parseXULToFragment(`
	// 	<menuitem id="accountActionsDropdownRemove" 
	// 		oncommand="eu.philoux.localfolder.onSupprimeCompte(event); event.stopPropagation();"/>
	// `, ["chrome://localfolder/locale/localfolder.dtd"]);

	let arm = tab.browser.contentDocument.getElementById("accountActionsDropdownRemove");
	arm.setAttribute("oncommand", "eu.philoux.localfolder.onSupprimeCompte(event,window); event.stopPropagation();");
	
	let amtree = tab.browser.contentDocument.getElementById("accounttree");
	let onselect = amtree.getAttribute("onselect");
	// amtree.setAttribute("onselect", `${onselect} eu.philoux.localfolder.onAccountSelect(null, null);`);
	
	// console.debug(tab.browser.contentDocument.getElementById("accountActionsButton").outerHTML);


	Services.scriptloader.loadSubScript("chrome://global/content/globalOverlay.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://messenger/content/AccountManager.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/accountmanager-overlay.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://localfolder/content/trace.js", tab.browser.contentWindow.wrappedJSObject.MozXULElement, "UTF-8");
	
},
  onTabSwitched: function(tab) {},

};
tabmail.registerTabMonitor(monitor);

