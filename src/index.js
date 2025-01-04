// 插件入口文件
class CAJConverter {
  constructor() {
    this.init();
  }

  async init() {
    // 初始化配置
    this.initPreferences();
    // 注册文件监听
    this.registerFileListener();
  }

  // 监听新增的附件
  registerFileListener() {
    Zotero.Items.addListener('add', async (event) => {
      const item = event.item;
      if (this.isCAJFile(item)) {
        await this.convertCAJ(item);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    const converter = new CAJConverter();
    const ui = new ConverterUI(converter);
    converter.ui = ui;
  }, false);
} 