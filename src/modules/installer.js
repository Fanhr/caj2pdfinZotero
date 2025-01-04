class Installer {
  constructor() {
    this.pythonPath = '';
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true;
    
    try {
      await this.setupPython();
      await this.installDependencies();
      this.initialized = true;
      return true;
    } catch (error) {
      Zotero.debug(`CAJ2PDF: 初始化失败 - ${error.message}`);
      this.showError('初始化失败', error.message);
      return false;
    }
  }

  async setupPython() {
    // 检测Python环境
    const pythonPaths = [
      'python3',
      'python',
      '/usr/bin/python3',
      'C:\\Python39\\python.exe'
    ];

    for (const path of pythonPaths) {
      try {
        const process = Zotero.Utilities.Internal.exec(path, ['-V']);
        if (process.exitCode === 0) {
          this.pythonPath = path;
          return;
        }
      } catch (e) {
        continue;
      }
    }
    
    throw new Error('未找到Python环境，请安装Python 3.x');
  }

  async installDependencies() {
    const requirementsPath = this.getRequirementsPath();
    
    try {
      // 使用pip安装依赖
      const process = await Zotero.Utilities.Internal.exec(this.pythonPath, [
        '-m',
        'pip',
        'install',
        '-r',
        requirementsPath
      ]);

      if (process.exitCode !== 0) {
        throw new Error(`安装依赖失败: ${process.stderr}`);
      }
    } catch (error) {
      throw new Error(`安装依赖出错: ${error.message}`);
    }
  }

  getRequirementsPath() {
    return Zotero.getMainWindow().extension.rootURI.resolve(
      'chrome/content/resources/python/requirements.txt'
    );
  }

  showError(title, message) {
    new Zotero.ProgressWindow()
      .changeHeadline('CAJ2PDF')
      .addDescription(`${title}: ${message}`)
      .show();
  }
} 