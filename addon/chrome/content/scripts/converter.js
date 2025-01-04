class CAJConverter {
  constructor() {
    this.initialized = false;
    this.watching = false;
  }

  async init() {
    if (this.initialized) return;
    
    // 初始化文件监听器
    await this.initializeFileWatcher();
    // 初始化caj2pdf转换工具
    await this.initializeConverter();
    
    this.initialized = true;
  }

  async initializeFileWatcher() {
    // 监听Zotero的附件目录
    const attachmentDir = Zotero.getStorageDirectory().path;
    
    // 设置文件变化监听器
    Zotero.File.addFileWatcher(attachmentDir, (event, file) => {
      if (file.endsWith('.caj')) {
        this.handleNewCAJFile(file);
      }
    });
  }

  async handleNewCAJFile(filePath) {
    try {
      // 获取文件所属的Zotero条目
      const attachment = await this.getZoteroAttachment(filePath);
      if (!attachment) return;

      // 转换文件
      const pdfPath = await this.convertToPDF(filePath);
      
      // 将PDF添加到Zotero
      await this.addPDFToZotero(pdfPath, attachment.parentItemID);
      
      // 显示通知
      new Zotero.Notify('success', 'CAJ文件已成功转换为PDF');
    } catch (error) {
      Zotero.debug(`CAJ转换失败: ${error.message}`);
      new Zotero.Notify('error', '转换失败，请查看错误日志');
    }
  }

  async convertToPDF(cajPath) {
    // 调用caj2pdf进行转换
    // 这里需要实现与caj2pdf的集成
    // TODO: 实现实际的转换逻辑
    return cajPath.replace('.caj', '.pdf');
  }
}

// 创建全局实例
if (typeof window.cajConverter === 'undefined') {
  window.cajConverter = new CAJConverter();
} 