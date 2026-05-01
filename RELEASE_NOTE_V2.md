# Fuzhou Pulse｜福州城市文旅推荐平台 V2.0 beta

## 在线体验链接

V2.0 前后端 + AI 体验版：

https://fuzhou-pulse-v2.onrender.com

V1.0 静态展示版：

https://jijie616.github.io/fuzhou-pulse/

GitHub 仓库：

https://github.com/jijie616/fuzhou-pulse

dev-v2 分支：

https://github.com/jijie616/fuzhou-pulse/tree/dev-v2

## 体验提示

- V2.0 部署在 Render 免费服务上。
- 第一次打开可能会因为冷启动等待几十秒。
- 如果页面一开始样式或图片加载慢，可以稍等后刷新。
- AI 行程推荐会调用 DeepSeek API，可能受网络、额度和服务状态影响。
- 留言功能是学习实践版，目前使用 JSON 文件保存，不是正式数据库。
- 这是 V2.0 beta 学习实践版本，重点是展示完整功能链路，不是商业级生产系统。

## V2.0 已实现功能

- 福州文旅卡片展示。
- 21 张景点 / 美食 / 文化推荐卡片。
- 分类筛选。
- 关键词搜索。
- 收藏与我的收藏。
- 详情弹窗。
- 一日游路线推荐。
- 游客留言。
- JSON 文件留言持久化。
- DeepSeek AI 行程推荐。
- 用户自由输入补充需求。
- AI 推荐结合项目已有文旅数据。
- AI 推荐参考地点可点击打开详情。
- 后端状态自检接口 `/api/status`。

## 技术栈

前端：

- HTML
- CSS
- JavaScript

后端：

- Node.js
- Express
- dotenv
- OpenAI SDK

AI：

- DeepSeek V4

部署：

- GitHub Pages
- Render

## 可以直接发给别人的简短文案

这是我最近做的一个福州文旅推荐项目，名字叫 Fuzhou Pulse。它从一个静态网页升级到了 V2.0 beta，现在可以看福州景点、美食和文化卡片，也支持搜索、筛选、收藏、路线推荐、留言和 AI 行程推荐。AI 部分接入了 DeepSeek，会根据游玩天数、兴趣和补充需求生成建议。体验链接是：https://fuzhou-pulse-v2.onrender.com 。第一次打开如果比较慢，是 Render 免费服务冷启动，稍等一下就好。

## 较正式的展示文案

Fuzhou Pulse 是一个以福州城市文旅为主题的学习型全栈实践项目。V1.0 版本主要完成静态前端展示、文旅卡片、搜索筛选、收藏、详情弹窗和路线推荐；V2.0 beta 在此基础上加入 Node.js + Express 后端、JSON 留言持久化、DeepSeek AI 行程推荐、AI 参考地点联动详情，以及线上状态自检接口。项目通过 GitHub Pages 保留静态展示版，同时使用 Render 部署前后端体验版，适合作为前端交互、后端 API、AI 接入和部署流程的综合练习作品。

## 后续优化方向

- 接入正式数据库。
- 增加用户登录。
- 增加留言管理。
- 使用更稳定的后端部署和持久化存储。
- 继续优化 AI Prompt，让推荐更稳定、更贴合项目数据。
- 做图片压缩与性能优化。
- 继续打磨移动端体验。
