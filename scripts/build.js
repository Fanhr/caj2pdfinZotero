const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

async function setupPythonEnv() {
  const pythonDir = path.join('build', 'chrome/content/resources/python');
  
  // 创建虚拟环境
  await exec(`cd ${pythonDir} && python3 -m venv venv`);
  
  // 安装依赖
  await exec(`cd ${pythonDir} && source venv/bin/activate && pip install -r requirements.txt`);
}

async function build() {
  try {
    // 清理构建目录
    await fs.remove('build');
    await fs.ensureDir('build');
    
    // 复制基本文件
    const files = ['manifest.json', 'bootstrap.js', 'chrome.manifest'];
    for (const file of files) {
      await fs.copy(file, `build/${file}`);
    }
    
    // 复制chrome目录
    await fs.copy('chrome', 'build/chrome');
    
    // 复制defaults目录
    await fs.copy('defaults', 'build/defaults');
    
    // 设置Python环境
    await setupPythonEnv();
    
    // 创建XPI
    await createXPI();
    
    console.log('构建完成');
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

async function createXPI() {
  return new Promise((resolve, reject) => {
    exec(
      'cd build && zip -r ../cajconverter.xpi *',
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
}

build(); 