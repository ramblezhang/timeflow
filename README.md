
# TimeFlow (时间心流) - 部署与开发指南

这是一个基于 React + Vite + TypeScript 构建的 PWA 应用。

## 📁 项目结构说明 (PWA)

为了确保应用在 Cloudflare Pages 等平台部署后能正常安装，以下 PWA 核心文件必须存放在 `public/` 目录下：
- `public/manifest.json`: 应用清单
- `public/sw.js`: Service Worker (离线缓存)
- `public/icon.svg`: 应用图标

*请勿在项目根目录下存放这些文件的副本，以免在开发模式和生产构建之间产生混淆。*

## 🚀 快速开始：如何在本地运行看效果

如果您想在本地电脑上打开应用查看效果，请按照以下步骤操作：

### 1. 准备环境
确保您的电脑上安装了 [Node.js](https://nodejs.org/) (建议版本 18 或更高)。

### 2. 安装依赖 (关键步骤)
打开终端（命令行），进入项目文件夹，运行以下命令下载项目所需的工具（包括 Vite）：
```bash
npm install
```
*注意：如果不运行此命令，后续的 dev 命令会报错。*

### 3. 启动开发服务器 (开发模式)
安装完成后，运行：
```bash
npm run dev
```
运行后，终端会显示一个地址（通常是 `http://localhost:5173`），在浏览器中打开这个链接即可看到效果。

---

## 🏗️ 部署到 Cloudflare Pages

浏览器无法直接运行 `.tsx` 源码。我们需要使用 Vite 将源码打包成浏览器能理解的文件。

### 方式 A：连接 Git 仓库 (推荐 - 自动化)
1. 将项目上传到 GitHub/GitLab。
2. 在 Cloudflare Dashboard 中创建 Pages 应用，连接 Git。
3. **关键配置**：
   - **Framework Preset**: 选择 `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 方式 B：直接上传 (手动)
1. **在本地打包**：
   在终端运行以下命令，这会生成一个 `dist` 文件夹：
   ```bash
   npm run build
   ```
   *注意：此时生成的 `dist` 文件夹里是纯 HTML/CSS/JS 文件，可以直接被浏览器运行。*

2. **本地预览打包结果 (可选)**：
   如果您想在上传前，模拟线上的运行环境（检查打包是否成功），请运行：
   ```bash
   npm run preview
   ```
   然后访问显示的 localhost 地址。

3. **上传到 Cloudflare**：
   - 进入 Cloudflare Pages -> "Direct Upload"。
   - 将生成的 `dist` 文件夹拖进去。

## ❓ 常见问题 / 报错解决

### 🔴 报错：`'vite' 不是内部或外部命令...` (is not recognized as an internal command)
**原因**：您跳过了“安装依赖”的步骤，或者安装失败了。电脑找不到 Vite 这个工具。
**解决**：
1. 确保在项目根目录下。
2. 运行 `npm install`。
3. 等待进度条跑完，出现 `added ... packages` 字样后，再次尝试 `npm run dev`。

### 🔴 部署后没有“安装应用”按钮
**原因**：通常是因为 `manifest.json` 或 `sw.js` 没有被正确打包。
**解决**：本项目已配置将这些文件放在 `public/` 目录下，Vite 会在构建时自动将它们复制到根目录。请确保不要手动在根目录创建这些文件的副本。
