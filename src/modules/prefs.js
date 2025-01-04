class Preferences {
  static init() {
    this.prefBranch = Services.prefs.getBranch("extensions.caj2pdf.");
    
    // 设置默认值
    if (!this.prefBranch.prefHasUserValue("pythonPath")) {
      this.prefBranch.setStringPref("pythonPath", "");
    }
    if (!this.prefBranch.prefHasUserValue("autoConvert")) {
      this.prefBranch.setBoolPref("autoConvert", true);
    }
    if (!this.prefBranch.prefHasUserValue("keepOriginal")) {
      this.prefBranch.setBoolPref("keepOriginal", true);
    }
  }

  static get(pref) {
    try {
      switch (pref) {
        case "pythonPath":
          return this.prefBranch.getStringPref("pythonPath");
        case "autoConvert":
          return this.prefBranch.getBoolPref("autoConvert");
        case "keepOriginal":
          return this.prefBranch.getBoolPref("keepOriginal");
        default:
          throw new Error("未知的设置项");
      }
    } catch (e) {
      Zotero.debug("CAJ2PDF: 获取设置失败 - " + e.message);
      return null;
    }
  }

  static set(pref, value) {
    try {
      switch (pref) {
        case "pythonPath":
          this.prefBranch.setStringPref("pythonPath", value);
          break;
        case "autoConvert":
          this.prefBranch.setBoolPref("autoConvert", value);
          break;
        case "keepOriginal":
          this.prefBranch.setBoolPref("keepOriginal", value);
          break;
        default:
          throw new Error("未知的设置项");
      }
    } catch (e) {
      Zotero.debug("CAJ2PDF: 保存设置失败 - " + e.message);
    }
  }
} 