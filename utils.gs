/**
*
*/
function getSelectedRange_(){
  var result = SpreadsheetApp.getActiveSheet().getActiveRange();
  return result;
}

function checkCaches_(documentCache_, scriptCache_, userCache_){
    if (documentCache_ == null) {
        this.documentCache_ = CacheService.getDocumentCache();
    }
    if (scriptCache_ == null) {
        this.scriptCache_ = CacheService.getScriptCache();
    }
    if (userCache_ == null) {
        this.userCache_ = CacheService.getUserCache();
    }
}