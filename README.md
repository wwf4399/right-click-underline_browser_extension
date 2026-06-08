# 项目名称

该项目基于 **WXT** + **Vue 3** 框架构建。

## 🛠️ 推荐的集成开发环境（IDE）设置

*	**编辑器**: [VS Code](https://code.visualstudio.com/)
*	**插件**: [Volar (Vue-Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

---

## 🚀 快速开始

### 1. 安装项目依赖
```bash
pnpm install
```

### 2. 开发模式与编译打包

#### 	开发调试
```bash
pnpm dev
```

#### 	正式打包
```bash
pnpm build
```

> 💡 **打包产物提示**：
> 编译后的文件将生成在 `.output/chrome-mv3` 目录下。

如果需要在chrome://中运行，浏览器需要开启某种模式，两个启动参数
	"C:\Program Files\Google\Chrome\Application\chrome.exe" --extensions-on-chrome-urls --disable-features=DisableExtensionsOnChromeUrlsSwitch