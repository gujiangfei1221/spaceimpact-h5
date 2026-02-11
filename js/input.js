// input.js - 输入管理（键盘 + 触屏虚拟按键）

const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    special: false,
    enter: false,
    escape: false,
    // 单次触发（按下瞬间为 true，读取后清除）
    enterPressed: false,
    escapePressed: false,
    upPressed: false,
    downPressed: false,
};

function initInput() {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        switch (e.code) {
            case 'ArrowUp': input.up = true; input.upPressed = true; break;
            case 'ArrowDown': input.down = true; input.downPressed = true; break;
            case 'ArrowLeft': input.left = true; break;
            case 'ArrowRight': input.right = true; break;
            case 'Space': input.fire = true; break;
            case 'ControlLeft': case 'ControlRight': input.special = true; break;
            case 'Enter': input.enter = true; input.enterPressed = true; break;
            case 'Escape': input.escape = true; input.escapePressed = true; break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'ArrowUp': input.up = false; break;
            case 'ArrowDown': input.down = false; break;
            case 'ArrowLeft': input.left = false; break;
            case 'ArrowRight': input.right = false; break;
            case 'Space': input.fire = false; break;
            case 'ControlLeft': case 'ControlRight': input.special = false; break;
            case 'Enter': input.enter = false; break;
            case 'Escape': input.escape = false; break;
        }
    });

    // 触屏事件
    setupTouchButton('btn-up', 'up');
    setupTouchButton('btn-down', 'down');
    setupTouchButton('btn-left', 'left');
    setupTouchButton('btn-right', 'right');
    setupTouchButton('btn-fire', 'fire');
    setupTouchButton('btn-special', 'special');
    setupTouchButton('btn-enter', 'enter');
}

function setupTouchButton(elementId, inputKey) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const pressedKey = inputKey + 'Pressed';

    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        input[inputKey] = true;
        if (pressedKey in input) input[pressedKey] = true;
        el.classList.add('active');
        // 初始化音频上下文（浏览器要求用户交互后才能播放音频）
        if (typeof initAudioOnInteraction === 'function') initAudioOnInteraction();
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
        e.preventDefault();
        input[inputKey] = false;
        el.classList.remove('active');
    }, { passive: false });

    el.addEventListener('touchcancel', (e) => {
        input[inputKey] = false;
        el.classList.remove('active');
    });

    // 鼠标支持（PC 调试）
    el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input[inputKey] = true;
        if (pressedKey in input) input[pressedKey] = true;
        el.classList.add('active');
        if (typeof initAudioOnInteraction === 'function') initAudioOnInteraction();
    });

    el.addEventListener('mouseup', (e) => {
        input[inputKey] = false;
        el.classList.remove('active');
    });

    el.addEventListener('mouseleave', (e) => {
        input[inputKey] = false;
        el.classList.remove('active');
    });
}

// 清除单次触发标记
function clearPressedFlags() {
    input.enterPressed = false;
    input.escapePressed = false;
    input.upPressed = false;
    input.downPressed = false;
}
