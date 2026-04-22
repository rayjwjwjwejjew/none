# 盛开在谎言之上 / Soul Returns VN

一个用 `React + Vite + TypeScript` 写的悬疑向视觉小说项目。  
重点是把“剧情演出”和“本地资源管理”结合起来：可以边写剧情，边在浏览器里上传和替换背景、立绘、BGM、SFX、CG（含视频）。

## 在线体验

- GitHub Pages: [https://rayjwjwjwejjew.github.io/none/](https://rayjwjwjwejjew.github.io/none/)

## 当前功能

- 标题页、章节开场、结尾页的完整流程
- 对话框打字机效果、自动播放、跳过、历史回看
- 已读文本加速（避免二刷重复等待）
- 本地存档与继续上次（带进度信息和缩略图）
- 资源管理面板（上传、预览、重命名、删除、清空）
- 资源类型支持：`bg` 背景、`sprite` 立绘、`bgm` 背景音乐、`sfx` 音效、`cg` 图片 CG / 视频 CG
- 场景背景覆盖：可以给某个场景单独绑定背景资源
- 场景转场、雨幕/灰尘等氛围层、CG 弹出演出
- 低性能模式自动降级，提升中低配设备流畅度

## 操作方式

- `空格 / Enter`：下一句（标题页可直接开始）
- `Backspace`：回上一句
- `L`：开关历史记录
- `S`：快速存档
- `Esc`：关闭面板 / 弹层

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：

- `http://localhost:5173/`（端口被占用时 Vite 会自动切换）

## 构建与校验

```bash
npm run check   # 剧情跳转/外链资源校验
npm run build   # 生产构建
npm run preview # 预览构建结果
```

## 项目结构（主工程）

```text
src/
  App.tsx                   # 主流程与状态管理
  engine.ts                 # 场景/角色/演出解析
  script.ts                 # 剧情脚本章节
  components/
    TitleScreen.tsx
    CreditsScreen.tsx
    SettingsPanel.tsx
    AssetsPanel.tsx
  lib/
    manifest.ts             # 资源清单结构
    background.ts           # 场景背景覆盖
    storage.ts              # localStorage 读写
    settings.ts             # 设置项默认值
    sfx.ts                  # UI 音效
  db.ts                     # IndexedDB 资源存取
scripts/
  validate-vn.mjs           # 剧情与资源检查脚本
```

## 数据存储说明

- 资源文件（背景/BGM/CG 等）存储在浏览器 `IndexedDB`
- 设定、存档、阅读进度存储在 `localStorage`
- 清理浏览器站点数据会导致本地资源与存档丢失

## GitHub Pages 部署

仓库已配置 Actions 自动部署（`main` 分支推送后自动构建并发布）：

- workflow: `.github/workflows/deploy-pages.yml`

## 说明

这个仓库除了主工程外，还包含一些实验目录与历史文件。  
主视觉小说工程以根目录的 `src/`、`scripts/`、`package.json` 为准。
