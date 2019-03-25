var documentCache_ = null;
var scriptCache_ = null;
var userCache_ = null;

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Sidebar')
        .addItem('Sidebar', 'showSidebar')
        .addToUi();
}

function showSidebar() {
    var ui = HtmlService.createHtmlOutputFromFile('sidebar')
        .setTitle('Custom sidebar');
    SpreadsheetApp.getUi().showSidebar(ui)
}

function start() {
    GASlibrary.setCacheValue();
}

function getLibrarianCache() {
    GASlibrary.getCacheValue();
}

function setOwnCach() {
    var range = getSelectedRange_();
    var value = range.getValue();
  
    checkCaches_(documentCache_, scriptCache_, userCache_);
    documentCache_.put('key', value);
    scriptCache_.put('key', value);
    userCache_.put('key', value);
}

function getOwnCach() {
    var documentValue = "";
    var scriptValue = "";
    var userValue = "";

    checkCaches_(documentCache_, scriptCache_, userCache_);
    if (documentCache_ != null) {
        documentValue = documentCache_.get('key');
        Logger.log("documentValue: " + documentValue);
    } else {
        Logger.log("documentValue: Can't find value");
    }
    if (scriptCache_ != null) {
        scriptValue = scriptCache_.get('key');
        Logger.log("scriptValue: " + scriptValue);
    } else {
        Logger.log("scriptValue: Can't find value");
    }
    if (userCache_ != null) {
        userValue = userCache_.get('key');
        Logger.log("userValue: " + userValue);
    } else {
        Logger.log("userValue: Can't find value");
    }
    Browser.msgBox(Utilities.formatString('documentValue: %s; scriptValue: %s: userValue: %s', documentValue, scriptValue, userValue));
}
