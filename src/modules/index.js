if (!Zotero.CAJ2PDF) {
  Zotero.CAJ2PDF = {};
}

Zotero.CAJ2PDF = Object.assign(Zotero.CAJ2PDF, {
  // 初始化插件
  async init() {
    await this.installer.init();
    await this.fileWatcher.init();
    
    // 扫描现有CAJ文件
    await this.scanExistingItems();
  },

  // 打开设置
  openPreferences() {
    const win = Services.wm.getMostRecentWindow("navigator:browser");
    win.openDialog(
      "chrome://caj2pdf/content/preferences.xhtml",
      "caj2pdf-preferences",
      "chrome,titlebar,toolbar,centerscreen"
    );
  },

  // 转换选中的条目
  async convertSelected() {
    const items = ZoteroPane.getSelectedItems();
    for (const item of items) {
      if (this.converter.isCAJFile(item)) {
        await this.converter.convertCAJ(item);
      }
    }
  },

  // 扫描现有条目
  async scanExistingItems() {
    const items = await Zotero.Items.getAll();
    for (const item of items) {
      if (this.converter.isCAJFile(item)) {
        await this.converter.convertCAJ(item);
      }
    }
  },

  // 通知回调
  notifierCallback: {
    notify(event, type, ids, extraData) {
      if (type === 'item' && event === 'add') {
        for (const id of ids) {
          const item = Zotero.Items.get(id);
          if (Zotero.CAJ2PDF.converter.isCAJFile(item)) {
            Zotero.CAJ2PDF.converter.convertCAJ(item);
          }
        }
      }
    }
  }
}); 