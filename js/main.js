// main.js - 游戏入口 + 主循环 + 状态机 + 玩家/敌人/场景/子弹系统

// ==================== 游戏状态 ====================
const STATE_INTRO = 0;
const STATE_MENU = 1;
const STATE_PLAYING = 2;
const STATE_HIGH_SCORE = 3;
const STATE_GAME_OVER = 4;
const STATE_PAUSE = 5;

let gameState = STATE_INTRO;
let levelCount = 0;

// ==================== 开场动画 ====================
let introPhase = 12;
let introFrameHold = 3;

// ==================== 菜单 ====================
let menuItem = 1;
let savedLevel = 0;
let topScores = [];
let timeInScores = 0;

// ==================== 玩家 ====================
let player = {
    x: 3, y: 20,
    lives: 3,
    score: 0,
    bonus: 3,
    weapon: WEAPON_MISSILE,
    protection: 50,
};
let playerShootTimer = 0;
let animPulse = 0;

// ==================== 子弹列表 ====================
let shots = [];

// ==================== 敌人列表 ====================
let enemies = [];

// ==================== 场景列表 ====================
let sceneryList = [];
let moveScene = 1;

// ==================== 当前关卡 ====================
let currentLevel = -1;

// ==================== 碰撞检测 ====================
function intersect(pos1, size1, pos2, size2) {
    return !(pos1.x > pos2.x + size2.x - 1 ||
             pos1.y > pos2.y + size2.y - 1 ||
             pos1.x + size1.x - 1 < pos2.x ||
             pos1.y + size1.y - 1 < pos2.y);
}

// ==================== 子弹系统 ====================
function addShot(pos, v, fromPlayer, kind) {
    shots.push({
        x: pos.x, y: pos.y,
        v: v,
        fromPlayer: fromPlayer,
        kind: kind,
        damage: SHOT_DAMAGES[kind],
        size: { x: SHOT_SIZES[kind].x, y: SHOT_SIZES[kind].y },
    });
}

function shotListTick() {
    for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.v;

        let remove = false;

        // 检查是否击中玩家
        if (!s.fromPlayer) {
            if (intersect({ x: s.x, y: s.y }, s.size, { x: player.x, y: player.y }, { x: 10, y: 7 })) {
                if (!player.protection) player.lives--;
                remove = true;
            }
        }

        // 子弹间碰撞
        if (!remove) {
            for (let j = shots.length - 1; j >= 0; j--) {
                if (i === j) continue;
                const other = shots[j];
                if (s.fromPlayer && other.fromPlayer) continue;
                if (intersect({ x: s.x, y: s.y }, s.size, { x: other.x, y: other.y }, other.size)) {
                    s.damage--;
                    other.damage--;
                    if (other.damage <= 0) shots.splice(j, 1);
                    if (j < i) i--;
                    break;
                }
            }
        }

        // 移除条件
        if (s.x < -2 || s.x > 83 || remove || s.damage <= 0) {
            shots.splice(i, 1);
        } else {
            // 绘制子弹
            let objId;
            if (s.kind === WEAPON_STANDARD) objId = G_SHOT;
            else if (s.kind === WEAPON_MISSILE) objId = G_MISSILE_OBJ;
            else if (s.kind === WEAPON_BEAM) objId = G_BEAM_OBJ;
            else objId = G_WALL_OBJ;
            drawObject(pixelMap, getObject(objId), { x: s.x, y: s.y });
        }
    }
}

// ==================== 敌人系统 ====================
function addEnemy(pos, enemyID, moveDir) {
    const type = getEnemyDef(enemyID);
    if (!type) return;
    enemies.push({
        x: pos.x, y: pos.y,
        type: { ...type },
        animState: 0,
        lives: type.lives,
        moveDir: moveDir,
        cooldown: type.shotTime,
    });
}

function getEnemyDef(id) {
    return dynamicEnemyCache[id] || null;
}

function enemyListTick() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        let alive = e.lives > 0;
        const inScreen = e.x <= 60;

        // Boss 进场时停止场景滚动
        if (i === enemies.length - 1 && inScreen) {
            moveScene = 0;
        }

        // 上下移动
        if ((e.type.moveUp || e.type.moveDown) && (inScreen || e.type.moveAnyway)) {
            if (e.moveDir === 1 && e.y === e.type.movesBetween.y) {
                e.moveDir = -e.type.moveUp;
            } else if (e.moveDir === -1 && e.y === e.type.movesBetween.x) {
                e.moveDir = e.type.moveDown;
            }
            e.y += e.moveDir;
        }

        // 左移
        if (!e.type.floats || !inScreen) {
            e.x--;
        }

        // 动画
        if (animPulse) {
            e.animState = (e.animState + 1) % e.type.animCount;
        }

        // 被子弹击中检测
        if (alive) {
            let gotHit = false;
            for (let j = shots.length - 1; j >= 0; j--) {
                const s = shots[j];
                if (!s.fromPlayer) continue;
                if (intersect({ x: s.x, y: s.y }, s.size, { x: e.x, y: e.y }, e.type.size)) {
                    gotHit = true;
                    // 奖励物（lives=127）
                    if (e.type.lives === 127) {
                        player.score += s.damage * 5;
                        shots.splice(j, 1);
                    } else {
                        e.lives -= s.damage;
                        player.score += 5;
                        if (e.lives < 0) {
                            s.damage = -e.lives;
                            e.lives = 0;
                        } else {
                            shots.splice(j, 1);
                        }
                        if (e.lives === 0) {
                            player.score += 5;
                            alive = false;
                            e.type.moveUp = 0;
                            e.type.moveDown = 0;
                        }
                    }
                    break;
                }
            }
        }

        // 与玩家碰撞
        if (alive && intersect({ x: player.x, y: player.y }, { x: 10, y: 7 }, { x: e.x, y: e.y }, e.type.size)) {
            alive = false;
            if (e.type.lives === 127) {
                // 奖励物碰撞：给武器
                const newKind = Math.floor(Math.random() * 3) + 1;
                if (newKind !== player.weapon) {
                    player.bonus = 0;
                    player.weapon = newKind;
                }
                player.bonus += 4 - newKind;
                e.lives = -2;
            } else if (player.lives > 0 && !player.protection) {
                player.lives--;
            }
        }

        // 死亡/移出屏幕处理
        if (e.x < -e.type.size.x || !alive) {
            e.lives--;
            if (e.lives <= -3) {
                enemies.splice(i, 1);
                continue;
            } else {
                // 爆炸动画
                const cx = e.x + Math.floor(e.type.size.x / 2);
                const cy = e.y + Math.floor(e.type.size.y / 2);
                const explosionId = G_EXPLOSION_A1 - e.lives - 1;
                drawObject(pixelMap, getStaticObject(explosionId), { x: cx - 3 - e.lives, y: cy - 2 });
            }
        } else {
            // 绘制敌人
            if (e.x < 84) {
                drawObject(pixelMap, getObject(e.type.model + e.animState), { x: e.x, y: e.y });
                // 敌人射击
                if (e.type.shotTime) {
                    e.cooldown--;
                    if (e.cooldown <= 0) {
                        addShot({ x: e.x - 1, y: e.y + Math.floor(e.type.size.y / 2) }, -2, 0, WEAPON_STANDARD);
                        e.cooldown = e.type.shotTime;
                    }
                }
            }
        }
    }

    // 导弹追踪逻辑
    for (const s of shots) {
        if (s.kind === WEAPON_MISSILE && s.fromPlayer) {
            let targetY = s.y;
            for (const e of enemies) {
                if (e.x > 84) break;
                if (e.x > s.x && e.lives > 0) {
                    targetY = e.y;
                    break;
                }
            }
            if (s.y < targetY) s.y++;
            else if (s.y > targetY) s.y--;
        }
    }

    // 移除 Beam 类型子弹（只持续1帧）
    for (let i = shots.length - 1; i >= 0; i--) {
        if (shots[i].kind === WEAPON_BEAM) {
            shots.splice(i, 1);
        }
    }
}

// ==================== 场景系统 ====================
function handleScenery(level) {
    if (level < 0 || level >= SCENERY_DATA.length) return;
    const sd = SCENERY_DATA[level];

    // 移动和绘制现有场景元素
    let lastX = 0;
    for (let i = sceneryList.length - 1; i >= 0; i--) {
        const sc = sceneryList[i];
        if (moveScene) sc.x--;
        const model = getObject(sc.model);
        if (!model || model.w === 0) {
            sceneryList.splice(i, 1);
            continue;
        }

        // 场景与玩家碰撞（关2除外 - 云层关）
        if (level !== 1 && intersect({ x: sc.x, y: sc.y }, { x: model.w, y: model.h },
            { x: player.x, y: player.y }, { x: 10, y: 7 })) {
            player.lives--;
        }

        if (sc.x < -model.w) {
            sceneryList.splice(i, 1);
        } else {
            lastX = Math.max(lastX, sc.x + model.w);
            drawObject(pixelMap, model, { x: sc.x, y: sc.y });
        }
    }

    // 补充新的场景元素
    if (level > 0 && sd.objects > 0) {
        while (lastX < 84) {
            const modelId = sd.firstObject + Math.floor(Math.random() * sd.objects);
            const model = getObject(modelId);
            if (!model || model.w === 0) break;
            const y = sd.upper ? 0 : 48 - model.h;
            sceneryList.push({ model: modelId, x: lastX, y: y });
            lastX += model.w;
        }
    }
}

// ==================== 关卡加载 ====================
async function loadAndStartLevel(levelNum) {
    const levelData = await loadLevel(levelNum);
    if (!levelData) return;

    await preloadLevelResources(levelData);
    await preloadSceneryResources(levelNum);

    enemies = [];
    for (const e of levelData) {
        addEnemy({ x: e.posX, y: e.posY }, e.enemyID, e.moveDir);
    }
}

// ==================== 数字转字符串（用于显示） ====================
function numToStr(n) {
    return Math.max(0, Math.floor(n)).toString();
}

// ==================== 游戏帧更新 ====================
function gameFrame() {
    clearPixelMap();

    // ---- 开场动画 ----
    if (gameState === STATE_INTRO) {
        drawObject(pixelMap, getStaticObject(G_SPACE), { x: 8, y: 12 - introPhase });
        drawObject(pixelMap, getStaticObject(G_IMPACT), { x: 4, y: 24 + introPhase });
        drawOutlinedObject(pixelMap, getStaticObject(G_INTRO), { x: 56 - introPhase * 4, y: 20 });

        if (introFrameHold > 0) {
            introFrameHold--;
            if (introFrameHold === 0) {
                introPhase--;
                if (introPhase <= 1) {
                    introFrameHold = GAME_FRAMERATE;
                } else {
                    introFrameHold = 2;
                }
            }
        }
        if (introPhase <= 0) {
            gameState = STATE_MENU;
        }

        // 任意键跳过
        if (input.enterPressed || input.fire || input.escapePressed ||
            input.upPressed || input.downPressed) {
            introPhase = 0;
            gameState = STATE_MENU;
            playMenuSound();
        }
    }

    // ---- 游戏结束屏 ----
    else if (gameState === STATE_GAME_OVER) {
        const scoreText = numToStr(player.score);
        drawText(pixelMap, "Game over\nYour score:", { x: 1, y: 1 }, 9);
        drawText(pixelMap, scoreText, { x: 1, y: 19 }, 0);

        if (input.enterPressed || input.escapePressed) {
            gameState = STATE_MENU;
            playMenuSound();
        }
    }

    // ---- 记录屏 ----
    else if (gameState === STATE_HIGH_SCORE) {
        // Top 10 列表模式
        let pos = { x: 3, y: 3 };
        for (let i = 0; i < 10; i++) {
            if (i === 5) pos = { x: 47, y: 3 };
            drawSmallNumber(pixelMap, i + 1, i === 9 ? 2 : 1, { x: pos.x, y: pos.y });
            drawObject(pixelMap, getStaticObject(G_SHOT), { x: pos.x + 4, y: pos.y + 2 });
            drawSmallNumber(pixelMap, topScores[i], 5, { x: pos.x + 24, y: pos.y });
            pos.y += 9;
        }

        if (input.enterPressed || input.escapePressed) {
            gameState = STATE_MENU;
            playMenuSound();
        }
    }

    // ---- 主菜单 ----
    else if (gameState === STATE_MENU) {
        // 菜单项编号显示 (8-2-N)
        drawSmallNumber(pixelMap, 8, 1, { x: 65, y: 0 });
        drawObject(pixelMap, getStaticObject(G_SHOT), { x: 69, y: 2 });
        drawSmallNumber(pixelMap, 2, 1, { x: 73, y: 0 });
        drawObject(pixelMap, getStaticObject(G_SHOT), { x: 77, y: 2 });
        drawSmallNumber(pixelMap, menuItem, 1, { x: 81, y: 0 });

        // 菜单文本
        const menuText = savedLevel ?
            "Continue\nNew game\nTop score" :
            "New game\nTop score";
        drawText(pixelMap, menuText, { x: 1, y: 7 }, 11);

        // 高亮选中项
        invertScreenPart(pixelMap, { x: 0, y: menuItem * 11 - 5 }, { x: 76, y: menuItem * 11 + 5 });

        // "Select" 文本
        drawText(pixelMap, "Select", { x: 24, y: 40 }, 0);

        // 滚动条
        drawScrollBar(pixelMap, (menuItem - 1) * (savedLevel ? 50 : 100));

        // 输入处理
        if (input.enterPressed) {
            let item = menuItem;
            if (savedLevel === 0) item++;
            if (item === 3) {
                gameState = STATE_HIGH_SCORE;
                timeInScores = 0;
                if (savedLevel === 0) menuItem = 2;
            } else {
                if (item === 1) {
                    currentLevel = savedLevel;
                } else {
                    currentLevel = 0;
                }
                // 初始化玩家
                shots = [];
                player.lives = 3;
                player.score = 0;
                player.bonus = 3;
                player.weapon = WEAPON_MISSILE;
                player.x = 3; player.y = 20;
                player.protection = 50;
                playerShootTimer = 0;
                sceneryList = [];
                moveScene = 1;
                gameState = STATE_PLAYING;
                loadAndStartLevel(currentLevel);
            }
            playMenuSound();
        } else if (input.escapePressed) {
            // 无操作（网页不能退出）
        } else if (input.upPressed) {
            const maxItem = savedLevel ? 3 : 2;
            menuItem = menuItem === 1 ? maxItem : menuItem - 1;
            playMenuSound();
        } else if (input.downPressed) {
            const maxItem = savedLevel ? 3 : 2;
            menuItem = menuItem % maxItem + 1;
            playMenuSound();
        }
    }

    // ---- 游戏进行中 ----
    else if (gameState === STATE_PLAYING) {
        const nonInverseLevel = currentLevel < 4 || currentLevel > 5;
        const barTop = nonInverseLevel ? 0 : 43;
        const startLives = player.lives;

        // 状态栏
        const livesDisplay = player.lives;
        for (let i = 0; i < livesDisplay; i++) {
            drawObject(pixelMap, getStaticObject(G_LIFE), { x: i * 6, y: barTop });
        }
        // 武器图标
        const weaponIcon = G_LIFE + player.weapon;
        drawObject(pixelMap, getStaticObject(weaponIcon), { x: 33, y: barTop });
        // 剩余弹药
        drawSmallNumber(pixelMap, player.bonus, 2, { x: 43, y: barTop });
        // 分数
        drawSmallNumber(pixelMap, player.score, 5, { x: 71, y: barTop });

        // 子弹处理
        shotListTick();

        // 玩家移动
        if (enemies.length > 0) {
            if (input.left && player.x > (player.protection ? 2 : 0)) player.x--;
            if (input.right && player.x < 74) player.x++;
            if (input.up && player.y > (nonInverseLevel ? 5 : 0) + (player.protection ? 2 : 0)) player.y--;
            if (input.down && player.y < 36 + (nonInverseLevel ? 5 : 0) - (player.protection ? 2 : 0)) player.y++;
        } else {
            // 关卡结束动画
            shots = [];
            if (player.x > 84) {
                // 加载下一关
                player.x = 3; player.y = 20;
                playerShootTimer = 0;
                currentLevel++;
                if (currentLevel >= levelCount) {
                    placeTopScore(topScores, player.score);
                    savedLevel = 0;
                    saveLevel(savedLevel);
                    gameState = STATE_GAME_OVER;
                } else {
                    sceneryList = [];
                    moveScene = 1;
                    loadAndStartLevel(currentLevel);
                }
            } else {
                const outPos = nonInverseLevel ? 10 : 31;
                if (player.y < outPos) player.y++;
                else if (player.y > outPos) player.y--;
                else player.x += 3;
            }
        }

        // 绘制玩家
        if (player.protection) {
            const protObj = getObject(G_PROTECTION_A1 + (Math.floor(player.protection / 2)) % 2);
            drawObject(pixelMap, protObj, { x: player.x - 2, y: player.y - 2 });
        } else {
            drawObject(pixelMap, getObject(G_PLAYER), { x: player.x, y: player.y });
        }

        // 射击
        if (playerShootTimer > 0) playerShootTimer--;
        if (input.fire && playerShootTimer === 0 && enemies.length > 0) {
            addShot({ x: player.x + 9, y: player.y + 3 }, 2, 1, WEAPON_STANDARD);
            playerShootTimer = 4;
            playShotSound();
        }

        // 特殊武器
        if (input.special && player.bonus > 0 && enemies.length > 0) {
            const wx = player.x + 9;
            const wy = player.weapon === WEAPON_WALL ? 5 : player.y + 2;
            const wv = player.weapon === WEAPON_BEAM ? 0 : 2;
            addShot({ x: wx, y: wy }, wv, 1, player.weapon);
            player.bonus--;
            input.special = false; // 单次触发
            playBonusSound();
        }

        // 动画脉冲
        animPulse = 1 - animPulse;

        // 敌人处理
        enemyListTick();

        // 场景处理
        handleScenery(currentLevel);

        // 某些关卡反转画面
        if (currentLevel === 0 || !nonInverseLevel) {
            invertScreen(pixelMap);
        }

        // 保护罩递减
        if (player.protection > 0) player.protection--;

        // 玩家死亡
        if (player.lives <= 0) {
            placeTopScore(topScores, player.score);
            savedLevel = 0;
            saveLevel(savedLevel);
            gameState = STATE_GAME_OVER;
            playDeathSound();
        } else if (player.lives !== startLives) {
            // 受伤重置
            player.x = 3; player.y = 20;
            player.protection = 50;
            playDeathSound();
        }

        // ESC 或 OK 按钮暂停/退出到菜单（手机端没有 ESC 键）
        if (input.escapePressed || input.enterPressed) {
            savedLevel = currentLevel;
            saveLevel(currentLevel);
            gameState = STATE_MENU;
            menuItem = 1;
        }
    }

    // 渲染到 Canvas
    renderToCanvas();

    // 清除单次触发标记
    clearPressedFlags();
}

// ==================== 游戏循环（20fps 节流） ====================
const GAME_FRAMERATE = 20;
const FRAME_INTERVAL = 1000 / GAME_FRAMERATE;
let lastFrameTime = 0;

function gameLoop(timestamp) {
    if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = timestamp - ((timestamp - lastFrameTime) % FRAME_INTERVAL);
        gameFrame();
    }
    requestAnimationFrame(gameLoop);
}

// ==================== 初始化 ====================
async function init() {
    try {
        // 初始化渲染
        initRender();

        // 解压字体
        uncompressFont();

        // 解压静态对象
        uncompressStaticObjects();

        // 初始化输入
        initInput();

        // 读取存档
        savedLevel = readSavedLevel();
        topScores = readTopScores();

        // 获取关卡数
        levelCount = await getLevelCount();
        console.log('Level count:', levelCount);

        // 预加载通用资源
        await preloadCommonResources();
        console.log('Common resources loaded');

        // 隐藏加载画面
        document.getElementById('loading').classList.add('hidden');

        // 启动游戏循环
        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error('Init error:', e);
        document.getElementById('loading').textContent = 'Error: ' + e.message;
    }
}

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', init);
