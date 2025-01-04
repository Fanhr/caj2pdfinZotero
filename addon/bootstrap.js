var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

function install(data, reason) {}

function uninstall(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  // 等待Zotero加载完成
  await waitForZotero();
  
  // 注册资源
  registerResources(rootURI);
  
  // 加载主脚本
  Services.scriptloader.loadSubScript(
    `${rootURI}/chrome/content/scripts/index.js`,
    { addon: { data: { env: "production" } } }
  );

  // 初始化插件
  await Zotero.CajConverter.init();
}

function shutdown(data, reason) {
  // 清理资源
  if (reason === APP_SHUTDOWN) return;
  
  Zotero.CajConverter.cleanup();
  unregisterResources();
}

// 注册资源目录
function registerResources(rootURI) {
  const resourceAlias = "cajconverter";
  const resourceName = `${resourceAlias}-resources`;
  
  Services.io.getProtocolHandler("resource")
    .QueryInterface(Ci.nsIResProtocolHandler)
    .setSubstitution(
      resourceName,
      Services.io.newURI(`${rootURI}/chrome/content/resources/`)
    );
}

// 取消注册资源
function unregisterResources() {
  Services.io.getProtocolHandler("resource")
    .QueryInterface(Ci.nsIResProtocolHandler)
    .setSubstitution("cajconverter-resources", null);
}

// 等待Zotero加载
async function waitForZotero() {
  let tries = 0;
  while (typeof Zotero === "undefined" || !Zotero.initialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (++tries > 100) throw new Error("Zotero未能加载");
  }
} 