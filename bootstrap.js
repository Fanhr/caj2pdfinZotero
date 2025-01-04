"use strict";

var Services = ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI = resourceURI.spec }, reason) {
  // 等待 Zotero 完全加载
  await new Promise((resolve) => {
    if (typeof Zotero === 'undefined') {
      const loadObserver = (subject, topic) => {
        if (topic === "zotero-loaded") {
          Services.obs.removeObserver(loadObserver, "zotero-loaded");
          resolve();
        }
      };
      Services.obs.addObserver(loadObserver, "zotero-loaded");
    } else {
      resolve();
    }
  });

  // 等待 Zotero 初始化完成
  await Zotero.initializationPromise;

  // 注册 chrome URLs
  const chromeHandle = Services.io.getProtocolHandler("chrome")
    .QueryInterface(Components.interfaces.nsIChromium);
  chromeHandle.addMapping("caj2pdf", resourceURI);

  // 加载设置
  Services.scriptloader.loadSubScript(
    `${rootURI}chrome/content/modules/prefs.js`,
    { Zotero }
  );
  Preferences.init();

  // 加载主要脚本
  const scripts = [
    "installer",
    "converter",
    "fileWatcher",
  ];

  for (const script of scripts) {
    Services.scriptloader.loadSubScript(
      `${rootURI}chrome/content/modules/${script}.js`,
      { Zotero }
    );
  }

  // 初始化插件
  await Zotero.CAJ2PDF.init();

  // 注册右键菜单
  if (!Zotero.CAJ2PDF.notifierID) {
    Zotero.CAJ2PDF.notifierID = Zotero.Notifier.registerObserver(
      Zotero.CAJ2PDF.notifierCallback,
      ['item']
    );
  }
}

function shutdown({ id, version, resourceURI, rootURI = resourceURI.spec }, reason) {
  if (reason === APP_SHUTDOWN) return;

  // 取消注册观察者
  if (Zotero.CAJ2PDF.notifierID) {
    Zotero.Notifier.unregisterObserver(Zotero.CAJ2PDF.notifierID);
  }

  // 清理插件资源
  const scripts = [
    "prefs",
    "installer",
    "converter", 
    "fileWatcher"
  ];

  for (const script of scripts) {
    Components.utils.unload(`${rootURI}chrome/content/modules/${script}.js`);
  }

  // 移除 chrome URLs
  const chromeHandle = Services.io.getProtocolHandler("chrome")
    .QueryInterface(Components.interfaces.nsIChromium);
  chromeHandle.removeMapping("caj2pdf");

  // 刷新缓存
  Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}

function uninstall(data, reason) {} 