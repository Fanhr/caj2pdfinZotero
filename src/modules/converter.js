class CAJConverter {
  constructor() {
    this.installer = new Installer();
  }

  async initialize() {
    return this.installer.init();
  }

  isCAJFile(item) {
    if (!item || !item.isAttachment()) return false;
    const path = item.getFilePath();
    return path && path.toLowerCase().endsWith('.caj');
  }

  async convertCAJ(item) {
    const progressWindow = new Zotero.ProgressWindow();
    progressWindow.changeHeadline('CAJ2PDF 转换');
    progressWindow.show();

    try {
      const cajPath = item.getFilePath();
      const pdfPath = cajPath.replace('.caj', '.pdf');

      progressWindow.addProgress();
      
      // 执行转换
      const process = await Zotero.Utilities.Internal.exec(
        this.installer.pythonPath,
        [
          '-m',
          'caj2pdf',
          'convert',
          cajPath,
          '--output',
          pdfPath
        ]
      );

      if (process.exitCode === 0) {
        // 添加PDF附件
        const parentItem = await item.getParentItem();
        await Zotero.Attachments.linkFromFile({
          file: pdfPath,
          parentItemID: parentItem.id,
          contentType: 'application/pdf'
        });

        progressWindow.addDescription('转换成功');
      } else {
        throw new Error(process.stderr);
      }
    } catch (error) {
      progressWindow.addDescription(`转换失败: ${error.message}`, 'error');
      Zotero.debug(`CAJ2PDF: 转换失败 - ${error.message}`);
    } finally {
      progressWindow.startCloseTimer(3000);
    }
  }
} 