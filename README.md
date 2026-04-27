# Fuzhou Pulse｜福州城市文旅推荐平台

## 项目简介

Fuzhou Pulse 是一个基于 HTML、CSS、JavaScript 与本地 C++ HTTP Server 构建的福州城市文旅推荐平台。项目围绕福州景点、美食、城市文化和一日游路线进行内容展示，支持搜索、分类筛选、收藏、详情弹窗和路线推荐等功能，适合作为前端交互、数据驱动渲染与响应式布局的综合练习项目。

项目页面以“有福之州，幸福之城”为主题，结合福州古厝、闽商文化、榕树精神和地方美食内容，呈现一个轻量但完整的城市文旅展示体验。

## 在线预览

项目已通过 GitHub Pages 部署，可在线访问：

👉 https://jijie616.github.io/fuzhou-pulse/

## 项目预览

> 首页截图：待补充

> 推荐卡片截图：待补充

> 详情弹窗截图：待补充

> 移动端截图：待补充

## 核心功能

- 城市首页 Hero 展示
- 福州景点 / 美食 / 文化卡片展示
- 数据驱动动态渲染
- 分类筛选
- 关键词搜索
- 收藏功能
- localStorage 本地持久化
- 我的收藏筛选
- 详情弹窗 Modal
- 福州一日游路线推荐
- 响应式移动端适配

## 技术栈

- HTML5
- CSS3
- JavaScript
- DOM 操作
- localStorage
- 响应式布局
- 模块化数据管理
- C++ Socket / Winsock2
- 原生 HTTP 静态资源服务

## 项目结构

```text
fuzhou-pulse/
├─ src/
│  └─ server.cpp
├─ web/
│  ├─ index.html
│  ├─ css/
│  │  └─ style.css
│  ├─ js/
│  │  ├─ data.js
│  │  └─ main.js
│  └─ assets/
│     └─ images/
│        ├─ alley.png
│        ├─ banyan.png
│        ├─ flavor.png
│        ├─ fotiaoqiang.png
│        ├─ fuzhou_cover.jpg
│        ├─ fuzhou_cover.png
│        ├─ linzexu.png
│        ├─ rouyan.png
│        ├─ sanfang.jpg
│        ├─ sanfang.png
│        ├─ shangxiahang.jpg
│        ├─ shangxiahang.png
│        ├─ yantaishan.png
│        ├─ yushan.png
│        ├─ yuwan.jpg
│        ├─ yuwan.png
│        └─ zhongzhoudao.png
├─ build.ps1
├─ run.ps1
├─ restart.ps1
├─ status.ps1
├─ stop.ps1
├─ start_cloudflare_tunnel.ps1
├─ start_cpolar_tunnel.ps1
├─ start_public_server.ps1
├─ .gitignore
├─ README.md

# 以下为本地运行时生成文件，已加入 .gitignore，不建议上传：
# server.exe
# server_port.txt
# server_stdout.txt
# server_stderr.txt
# web/count.txt
```

## 本地运行方式

项目当前通过本地 C++ HTTP Server 运行，服务器会从 `web/` 目录读取页面和静态资源。

1. 在项目根目录启动本地服务：

```powershell
.\run.ps1
```

2. 浏览器访问：

```text
http://localhost:8081
```

3. 如果端口不同，请以脚本或终端实际输出为准。

常用维护命令：

```powershell
.\status.ps1
.\restart.ps1
.\stop.ps1
```

如需手动编译服务器，可执行：

```powershell
.\build.ps1
```

## 项目亮点

- 使用 `data.js` 对页面内容进行结构化管理，实现数据与视图分离；
- 基于 JavaScript 动态渲染推荐卡片，提高页面可维护性；
- 实现分类筛选与关键词搜索联动，优化内容检索体验；
- 使用 localStorage 实现收藏状态持久化，刷新页面后仍可保留收藏；
- 增加“我的收藏”筛选视图，让用户快速查看已收藏内容；
- 通过 Modal 弹窗展示景点、美食和文化卡片详情，提升用户交互体验；
- 设计一日游路线推荐模块，增强项目业务完整度；
- 使用 CSS Grid、Flexbox 与媒体查询完成移动端适配，提升跨设备访问体验；
- 使用 C++ Socket 实现本地静态资源服务，补充底层网络编程实践。

## 后续优化方向

- 接入真实天气 API；
- 增加地图路线导航；
- 增加后端接口；
- 增加用户登录系统；
- 部署到 GitHub Pages / Vercel；
- 增加更多福州景点和美食数据；
- 增加图片懒加载与性能优化；
- 增加自动化端到端测试。

## 简历描述参考

福州城市文旅推荐平台：基于 HTML、CSS 和 JavaScript 开发的城市文旅推荐项目，围绕福州景点、美食和城市文化进行内容展示。项目采用 `data.js` 管理结构化数据，通过 DOM 动态渲染卡片内容，实现分类筛选、关键词搜索、详情弹窗、收藏持久化和一日游路线推荐等功能，并完成响应式适配，提升跨端浏览体验。同时使用 C++ Socket 实现本地静态 HTTP 服务，具备前端交互与基础网络服务开发的综合实践价值。
