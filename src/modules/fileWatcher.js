class FileWatcher {
  constructor(converter) {
    this.converter = converter;
  }

  async init() {
    // 扫描现有CAJ文件
    await this.scanExistingItems();
    
    // 监听新添加的附件
    this.registerListeners();
  }

  async scanExistingItems() {
    const items = await Zotero.Items.getAll();
    for (const item of items) {
      if (this.converter.isCAJFile(item)) {
        await this.handleCAJFile(item);
      }
    }
  }

  registerListeners() {
    // 监听新添加的附件
    Zotero.Items.addListener('add', async (data) => {
      const items = data.items || [];
      for (const item of items) {
        if (this.converter.isCAJFile(item)) {
          await this.handleCAJFile(item);
        }
      }
    });
  }

  async handleCAJFile(item) {
    try {
      await this.converter.convertCAJ(item);
    } catch (error) {
      Zotero.debug(`CAJ2PDF: 转换失败 - ${error.message}`);
    }
  }
} 