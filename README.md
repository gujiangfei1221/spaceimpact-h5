# Game Center

像素风游戏中心 — 经典游戏 H5 重制合集。

## 项目简介

本项目是一个复古像素风格的游戏中心，收录经典手机/掌机游戏的 H5 重制版本。使用原生 JavaScript 开发，无需任何构建工具即可运行。

## 已收录游戏

| 游戏 | 说明 |
|------|------|
| **Space Impact II** | 诺基亚经典横版射击游戏 |

## 项目结构

```
spaceimpact-h5/
├── index.html              # 游戏中心主页
├── center.css              # 游戏中心样式
├── center.js               # 游戏中心逻辑
├── manifest.json           # PWA 配置
├── games/
│   └── space-impact/       # Space Impact II
│       ├── index.html      # 游戏页面
│       ├── css/style.css   # 游戏样式
│       ├── js/             # 游戏逻辑（7 个模块）
│       └── data/           # 游戏资源数据
└── Space-Impact-II-master/ # 原版 C 代码参考
```

## 快速开始

使用任意静态服务器工具启动：

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

然后访问 `http://localhost:8080` 进入游戏中心主页。

## 添加新游戏

1. 在 `games/` 目录下创建新的游戏子目录
2. 编辑 `center.js` 中的 `GAMES` 数组，添加游戏信息
3. 刷新即可看到新游戏卡片

## 技术栈

- 原生 HTML5 Canvas
- 原生 JavaScript (ES6+)
- CSS3（像素风 + 扫描线效果）
- 无外部依赖

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## 许可证

MIT License
