class CAJ2PDFPlugin {
  constructor() {
    this.initialized = false;
    this.converter = null;
    this.fileWatcher = null;
  }

  async init() {
    if (this.initialized) return;

    try {
      // 初始化转换器
      this.converter = new CAJConverter();
      const ready = await this.converter.initialize();
      
      if (!ready) {
        throw new Error('转换器初始化失败');
      }

      // 初始化文件监视器
      this.fileWatcher = new FileWatcher(this.converter);
      await this.fileWatcher.init();

      // 注册右键菜单
      this.registerContextMenu();

      this.initialized = true;
      Zotero.debug('CAJ2PDF: 插件初始化成功');
    } catch (error) {
      Zotero.debug(`CAJ2PDF: 插件初始化失败 - ${error.message}`);
      throw error;
    }
  }

  registerContextMenu() {
    // 不需要手动创建菜单项，由overlay.xul处理
    this.convertSelected = async () => {
      const items = ZoteroPane.getSelectedItems();
      for (const item of items) {
        if (this.converter.isCAJFile(item)) {
          await this.converter.convertCAJ(item);
        }
      }
    };
    
    // 将插件实例暴露给window对象
    window.CAJ2PDFPlugin = this;
  }
}

// 初始化插件
window.addEventListener('load', async () => {
  try {
    const plugin = new CAJ2PDFPlugin();
    await plugin.init();
  } catch (error) {
    Zotero.debug(`CAJ2PDF: 加载失败 - ${error.message}`);
  }
}, false); 