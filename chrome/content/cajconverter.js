if (!Zotero.CajConverter) {
  Zotero.CajConverter = new class {
    constructor() {
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return;
      
      await this.initPrefs();
      this.setupUI();
      
      this.initialized = true;
    }

    async initPrefs() {
      // 初始化设置
      this.prefs = {
        pythonPath: "",
        autoConvert: true
      };
      
      // 加载设置
      await Zotero.Prefs.loadPrefs();
    }

    setupUI() {
      // 添加菜单项
      let menuitem = document.createElement('menuitem');
      menuitem.setAttribute('id', 'zotero-itemmenu-cajconverter');
      menuitem.setAttribute('label', '转换为PDF');
      menuitem.addEventListener('command', () => this.convertSelectedItems());
      
      document.getElementById('zotero-itemmenu').appendChild(menuitem);
    }

    async convertSelectedItems() {
      let items = ZoteroPane.getSelectedItems();
      for (let item of items) {
        if (this.isCAJFile(item)) {
          await this.convertCAJ(item);
        }
      }
    }

    isCAJFile(item) {
      if (!item || !item.isAttachment()) return false;
      let file = item.getFilePath();
      return file && file.toLowerCase().endsWith('.caj');
    }

    async convertCAJ(item) {
      try {
        Zotero.debug('开始转换CAJ文件');
        // 获取CAJ文件路径
        const cajPath = item.getFilePath();
        if (!cajPath) {
          throw new Error('无法获取CAJ文件路径');
        }

        // 设置输出PDF路径
        const pdfPath = cajPath.replace(/\.caj$/i, '.pdf');

        // 显示进度通知
        let progressWindow = new Zotero.ProgressWindow();
        progressWindow.changeHeadline('CAJ转换');
        progressWindow.show();
        let progress = new progressWindow.ItemProgress(
          null,
          `正在转换: ${item.getField('title')}`
        );

        // 调用Python脚本进行转换
        const paths = this.getPythonScript();
        const process = new Zotero.Process(paths.python);
        const args = [
          paths.script,
          cajPath,
          '--output',
          pdfPath
        ];

        // 执行转换
        await process.run(args);

        // 检查转换结果
        if (await OS.File.exists(pdfPath)) {
          // 添加PDF附件
          let parentItem = item.parentItem || item;
          await Zotero.Attachments.linkFromFile({
            file: pdfPath,
            parentItemID: parentItem.id,
            contentType: 'application/pdf',
            title: item.getField('title').replace(/\.caj$/i, '.pdf')
          });

          progress.setProgress(100);
          progress.setText('转换完成');
          
          // 显示成功通知
          new Zotero.Notify(
            'success',
            'CAJ转换成功',
            `文件已转换为PDF: ${pdfPath}`
          );
        } else {
          throw new Error('PDF文件未生成');
        }
        Zotero.debug(`转换完成: ${pdfPath}`);
      } catch (e) {
        Zotero.debug(`转换失败: ${e.stack}`);
        throw e;
      }
    }

    // 获取Python脚本路径
    getPythonScript() {
      const scriptDir = OS.Path.dirname(Components.stack.filename);
      const pythonDir = OS.Path.join(scriptDir, 'resources', 'python');
      const venvPython = OS.Path.join(pythonDir, 'venv', 'bin', 'python3');
      
      return {
        python: venvPython,
        script: OS.Path.join(pythonDir, 'converter.py')
      };
    }
  };
} 