// render.js - 渲染引擎：84×48 像素图操作 + 解压算法 + 绘制函数

const SCREEN_W = 84;
const SCREEN_H = 48;
const BG_COLOR = '#c7f0d8';  // Nokia 亮色背景
const FG_COLOR = '#43523d';  // Nokia 深色前景

// 像素图（84×48 的 Uint8Array，0=背景，1=前景）
let pixelMap = new Uint8Array(SCREEN_W * SCREEN_H);
let oldPixelMap = new Uint8Array(SCREEN_W * SCREEN_H);

// Canvas 相关
let canvas, ctx, scale;

function initRender() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // 初始化 oldPixelMap 为全1，强制首帧全刷新
    oldPixelMap.fill(1);
}

function resizeCanvas() {
    const totalW = window.innerWidth;
    const totalH = window.innerHeight;
    // 竖屏：游戏画面在上，控制区在下；控制区至少占 40% 高度
    const isLandscape = window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
    let maxW, maxH;
    if (isLandscape) {
        maxW = totalW * 0.6;
        maxH = totalH;
    } else {
        maxW = totalW;
        maxH = totalH * 0.45; // 游戏画面最多占 45%
    }
    const scaleX = Math.floor(maxW / SCREEN_W);
    const scaleY = Math.floor(maxH / SCREEN_H);
    scale = Math.max(1, Math.min(scaleX, scaleY));
    canvas.style.width = (SCREEN_W * scale) + 'px';
    canvas.style.height = (SCREEN_H * scale) + 'px';
}

// 清空像素图
function clearPixelMap() {
    pixelMap.fill(0);
}

// 绘制对象到像素图
function drawObject(pm, obj, pos) {
    if (!obj || !obj.samples) return;
    const ex = pos.x + obj.w;
    const ey = pos.y + obj.h;
    for (let px = pos.x; px < ex; px++) {
        for (let py = pos.y; py < ey; py++) {
            if (obj.samples[(py - pos.y) * obj.w + (px - pos.x)]) {
                if (px >= 0 && px < 84 && py >= 0 && py < 48) {
                    pm[py * 84 + px] = 1;
                }
            }
        }
    }
}

// 绘制带轮廓的对象（先用背景色画轮廓，再画对象）
function drawOutlinedObject(pm, obj, pos) {
    if (!obj || !obj.samples) return;
    const ex = pos.x + obj.w;
    const ey = pos.y + obj.h;
    // 第一步：轮廓（周围像素设为0）
    for (let px = pos.x; px < ex; px++) {
        for (let py = pos.y; py < ey; py++) {
            if (obj.samples[(py - pos.y) * obj.w + (px - pos.x)]) {
                if (px >= 0 && px < 84 && py >= 0 && py < 48) {
                    const p = py * 84 + px;
                    if (py > 0) {
                        if (px > 0) pm[p - 85] = 0;
                        pm[p - 84] = 0;
                        if (px < 83) pm[p - 83] = 0;
                    }
                    if (px > 0) pm[p - 1] = 0;
                    if (px < 83) pm[p + 1] = 0;
                    if (py < 47) {
                        if (px > 0) pm[p + 83] = 0;
                        pm[p + 84] = 0;
                        if (px < 83) pm[p + 85] = 0;
                    }
                }
            }
        }
    }
    // 第二步：绘制对象本身
    drawObject(pm, obj, pos);
}

// 绘制小数字（从右到左，带前导零）
function drawSmallNumber(pm, num, digits, lastDigitPos) {
    let x = lastDigitPos.x;
    const y = lastDigitPos.y;
    while (digits-- > 0) {
        drawObject(pm, getStaticObject(num % 10), { x, y });
        num = Math.floor(num / 10);
        x -= 4;
    }
}

// 绘制文本
function drawText(pm, text, pos, lineHeight) {
    let x = pos.x;
    const startX = pos.x;
    let y = pos.y;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            x = startX;
            y += lineHeight;
        } else {
            const code = text.charCodeAt(i);
            if (fontData[code]) {
                drawObject(pm, { w: 5, h: 8, samples: fontData[code] }, { x, y });
            }
            x += 6;
        }
    }
}

// 绘制滚动条
function drawScrollBar(pm, percent) {
    const row = Math.floor(percent / 4) + 6;
    for (let i = 6 * 84 + 81; i < 39 * 84 + 81; i += 84) {
        pm[i] = 1;
    }
    invertScreenPart(pm, { x: 81, y: row + 1 }, { x: 81, y: row + 5 });
    drawObject(pm, getStaticObject(G_SCROLL_MARK), { x: 81, y: Math.floor(percent / 4) + 6 });
}

// 全屏反转
function invertScreen(pm) {
    for (let i = 0; i < 4032; i++) {
        pm[i] = 1 - pm[i];
    }
}

// 部分反转
function invertScreenPart(pm, from, to) {
    for (let x = from.x; x <= to.x; x++) {
        for (let y = from.y; y <= to.y; y++) {
            if (x >= 0 && x < 84 && y >= 0 && y < 48) {
                const idx = y * 84 + x;
                pm[idx] = 1 - pm[idx];
            }
        }
    }
}

// 解压像素图（位展开算法，精确移植自 C 版 UncompressPixelMap）
// C 版是就地展开：从最后一个字节开始，逐位展开到 PixelMap[Bytes*8+Bits]
function uncompressPixelMap(data, pixels, bytes) {
    const pm = new Uint8Array(pixels);
    // 先把压缩数据拷贝到 pm 前 bytes 个位置
    for (let i = 0; i < bytes; i++) {
        pm[i] = data[i];
    }
    let bits = pixels % 8;
    if (bits === 0) bits = 8;
    let b = bytes;
    while (b-- > 0) {
        while (bits-- > 0) {
            pm[b * 8 + bits] = pm[b] % 2;
            if (b !== 0 || bits !== 0) {
                pm[b] >>= 1;
            }
        }
        bits = 8;
    }
    return pm;
}

// 将像素图渲染到 Canvas
function renderToCanvas() {
    const imageData = ctx.getImageData(0, 0, SCREEN_W, SCREEN_H);
    const d = imageData.data;
    // 背景色 RGB
    const bgR = 0xc7, bgG = 0xf0, bgB = 0xd8;
    // 前景色 RGB
    const fgR = 0x43, fgG = 0x52, fgB = 0x3d;

    for (let i = 0; i < SCREEN_W * SCREEN_H; i++) {
        const idx = i * 4;
        if (pixelMap[i]) {
            d[idx] = fgR; d[idx + 1] = fgG; d[idx + 2] = fgB; d[idx + 3] = 255;
        } else {
            d[idx] = bgR; d[idx + 1] = bgG; d[idx + 2] = bgB; d[idx + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    // 更新 oldPixelMap
    oldPixelMap.set(pixelMap);
}
