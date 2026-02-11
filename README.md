# Space Impact II

Space Impact II - 诺基亚经典游戏 H5 重制版。

## 项目简介

本项目是经典手机游戏 Space Impact 的现代 H5 重制版本，使用原生 JavaScript 开发，无需任何构建工具即可运行。

## 功能特性

- 经典横版射击游戏玩法
- 响应式设计，支持移动端和桌面端
- 支持 PWA（渐进式 Web 应用）
- 虚拟按键控制（方向键 + 动作键）
- 分数存档系统

## 项目结构

```
spaceimpact-h5/
├── index.html          # 游戏主页面
├── manifest.json       # PWA 配置
├── css/
│   └── style.css       # 样式文件
├── js/                 # 游戏逻辑
│   ├── font.js         # 字体渲染
│   ├── render.js       # 画面渲染
│   ├── data.js         # 游戏数据
│   ├── input.js        # 输入处理
│   ├── audio.js        # 音频系统
│   ├── saves.js        # 存档管理
│   └── main.js         # 主逻辑
└── data/               # 游戏资源数据
```

## 快速开始

### 方法一：直接打开

在浏览器中直接打开 `index.html` 文件即可运行游戏。

### 方法二：本地服务器

使用任意静态服务器工具：

```bash
# Python 3
python -m http.server 8080

# Node.js (需安装 serve)
npx serve .

# PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

## 操作说明

### 桌面端
- **方向键**: 上下左右移动
- **A 键**: 射击
- **B 键**: 特殊技能
- **Enter**: 确认/开始

### 移动端
使用屏幕下方的虚拟按键进行操作。

## 技术栈

- 原生 HTML5 Canvas
- 原生 JavaScript (ES6+)
- CSS3
- 无外部依赖

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## 许可证

MIT License
