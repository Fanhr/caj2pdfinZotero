class Installer {
  constructor() {
    this.pythonDir = this.getResourcePath('python');
    this.libDir = this.getResourcePath('python/lib');
  }

  // 获取插件资源目录
  getResourcePath(relativePath) {
    const addonID = 'cajconverter@example.com';
    return OS.Path.join(
      OS.Constants.Path.profileDir,
      'extensions',
      addonID,
      'chrome',
      'content',
      'resources',
      relativePath
    );
  }

  // 检查并安装便携式Python环境
  async setupPython() {
    try {
      // 检查是否已存在便携式Python
      if (await this.isPortablePythonInstalled()) {
        return true;
      }

      // 下载便携式Python
      await this.downloadPortablePython();
      
      // 解压并配置Python环境
      await this.extractPython();
      
      // 配置Python路径
      await this.configurePythonPath();

      return true;
    } catch (error) {
      console.error('Python环境设置失败:', error);
      return false;
    }
  }

  // 检查必要的库
  async checkLibraries() {
    const requiredLibs = ['PyPDF2', 'mutool'];
    for (const lib of requiredLibs) {
      if (!await this.isLibraryInstalled(lib)) {
        await this.installLibrary(lib);
      }
    }
  }

  // 获取Python解释器路径
  getPythonPath() {
    return OS.Path.join(this.pythonDir, 'python');
  }

  // 获取转换脚本路径
  getConverterPath() {
    return OS.Path.join(this.pythonDir, 'converter.py');
  }
} 