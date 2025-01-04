Zotero.CAJConverter.Preferences = {
  init() {
    this.updateUI();
  },

  updateUI() {
    // 更新首选项UI
    document.getElementById('autoConvert').checked = 
      Zotero.Prefs.get('cajconverter.autoConvert', true);
  },

  toggleAutoConvert(checkbox) {
    Zotero.Prefs.set('cajconverter.autoConvert', checkbox.checked);
  }
}; 