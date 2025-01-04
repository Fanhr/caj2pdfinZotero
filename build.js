const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

async function build(isRelease = false) {
  try {
    // 清理构建目录
    await fs.emptyDir('./build');

    // 复制插件文件
    await fs.copy('./addon', './build');
    
    // 复制源码到正确位置
    await fs.copy('./src/modules', './build/chrome/content/modules');

    // 读取配置
    const packageJson = require('./package.json');
    const { addonName, addonID, addonRef, releasePage } = packageJson.config;

    // 更新 manifest.json
    const manifestPath = './build/manifest.json';
    const manifest = require(manifestPath);
    manifest.version = packageJson.version;
    manifest.applications.zotero.id = addonID;
    await fs.writeJSON(manifestPath, manifest, { spaces: 2 });

    // 创建 XPI
    const zip = new AdmZip();
    zip.addLocalFolder('./build');
    
    const xpiName = isRelease 
      ? `${addonRef}-${packageJson.version}.xpi`
      : `${addonRef}.xpi`;
      
    zip.writeZip(path.join('build', xpiName));
    console.log(`构建成功: ${xpiName}`);
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

const isRelease = process.argv.includes('--release');
build(isRelease); 