class CAJConverter {
  constructor() {
    this.installer = new Installer();
    this.pythonPath = this.installer.getPythonPath();
    this.converterPath = this.installer.getConverterPath();
  }

  // 初始化环境
  async initialize() {
    try {
      // 设置Python环境
      await this.installer.setupPython();
      // 检查必要库
      await this.installer.checkLibraries();
      return true;
    } catch (error) {
      console.error('初始化失败:', error);
      return false;
    }
  }

  // 检查文件是否为CAJ格式
  isCAJFile(item) {
    if (!item || !item.isAttachment()) return false;
    const mimeType = item.getFilePath().toLowerCase();
    return mimeType.endsWith('.caj');
  }

  // 获取文件路径
  async getFilePath(item) {
    if (!item.isAttachment()) {
      throw new Error('项目不是附件');
    }
    const path = await item.getFilePathAsync();
    if (!path) {
      throw new Error('无法获取文件路径');
    }
    return path;
  }

  // 转换CAJ文件
  async convertCAJ(item) {
    try {
      const cajPath = await this.getFilePath(item);
      const pdfPath = cajPath.replace('.caj', '.pdf');
      
      // 显示进度条
      this.ui.showProgress(0);
      
      // 执行转换
      const result = await this.runPythonScript(cajPath, pdfPath);
      
      if (result.success) {
        // 添加PDF到Zotero
        await this.attachPDFToItem(item, pdfPath);
        this.ui.showProgress(100);
        this.showNotification('转换成功');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('转换失败:', error);
      this.showNotification(`转换失败: ${error.message}`);
      this.ui.showProgress(0);
    }
  }

  // 执行转换脚本
  async runPythonScript(cajPath, pdfPath) {
    try {
      const process = new Zotero.Process(this.pythonPath);
      const args = [
        this.converterPath,
        'convert',
        cajPath,
        '--output',
        pdfPath
      ];
      
      const result = await process.run(args, {
        env: {
          'PYTHONPATH': this.installer.libDir
        }
      });
      
      if (await Zotero.File.exists(pdfPath)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: '转换失败，未生成PDF文件'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 添加PDF到条目
  async attachPDFToItem(originalItem, pdfPath) {
    const parentItem = await originalItem.getParentItem();
    if (!parentItem) return;

    const attachmentInfo = {
      title: originalItem.getField('title').replace('.caj', '.pdf'),
      path: pdfPath,
      contentType: 'application/pdf',
      parentItemID: parentItem.id
    };

    await Zotero.Attachments.linkFromFile(attachmentInfo);
  }

  // 显示通知
  showNotification(message) {
    Zotero.getMainWindow().ZoteroPane.displayErrorMessage(message);
  }
} 