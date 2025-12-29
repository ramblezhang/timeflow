# TimeFlow (液态时间) - 部署与开发指南

这是一个基于 React + Vite + TypeScript 构建的 PWA 应用。

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

### 🔴 报错：`MIME type ... is not a supported stylesheet`
**原因**：这通常是因为您直接上传了源码(`.tsx`)到服务器，而不是上传构建后的 `dist` 文件夹。
**解决**：请参考“部署到 Cloudflare Pages”中的步骤，先运行 `npm run build`，然后只上传生成的 `dist` 文件夹。
