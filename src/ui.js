class ConverterUI {
  constructor(converter) {
    this.converter = converter;
    this.initUI();
  }

  initUI() {
    this.addToolbarButton();
    this.addContextMenu();
    this.createProgressBar();
  }

  createProgressBar() {
    const progressBox = document.createElement('progressmeter');
    progressBox.setAttribute('id', 'caj-progress-box');
    progressBox.setAttribute('mode', 'determined');
    progressBox.setAttribute('value', '0');
    progressBox.style.display = 'none';
    
    const statusBar = document.getElementById('zotero-status-bar');
    statusBar.appendChild(progressBox);
  }

  async onToolbarButtonClick() {
    const items = ZoteroPane.getSelectedItems();
    for (const item of items) {
      if (this.converter.isCAJFile(item)) {
        await this.converter.convertCAJ(item);
      }
    }
  }

  addContextMenu() {
    const menu = document.createElement('menupopup');
    menu.setAttribute('id', 'caj-context-menu');
    
    const convertItem = document.createElement('menuitem');
    convertItem.setAttribute('label', '转换为PDF');
    convertItem.addEventListener('command', () => this.onToolbarButtonClick());
    
    menu.appendChild(convertItem);
  }

  showProgress(progress) {
    const progressBox = document.getElementById('caj-progress-box');
    if (progress > 0 && progress < 100) {
      progressBox.style.display = 'block';
    } else {
      progressBox.style.display = 'none';
    }
    progressBox.setAttribute('value', progress);
  }
} 