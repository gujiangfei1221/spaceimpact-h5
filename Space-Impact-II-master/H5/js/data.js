// data.js - 游戏数据：静态精灵 + 动态资源加载器

// 静态对象 ID 常量
const G_NUM0 = 0, G_NUM1 = 1, G_NUM2 = 2, G_NUM3 = 3, G_NUM4 = 4;
const G_NUM5 = 5, G_NUM6 = 6, G_NUM7 = 7, G_NUM8 = 8, G_NUM9 = 9;
const G_SPACE = 10, G_INTRO = 11, G_IMPACT = 12;
const G_SCROLL_MARK = 13, G_DOT_EMPTY = 14, G_DOT_FULL = 15;
const G_LIFE = 16, G_MISSILE_ICON = 17, G_BEAM_ICON = 18, G_WALL_ICON = 19;
const G_SHOT = 20, G_EXPLOSION_A1 = 21, G_EXPLOSION_A2 = 22;

// 动态对象 ID 偏移
const G_PROTECTION_A1 = 256 + 250;
const G_PROTECTION_A2 = 256 + 251;
const G_MISSILE_OBJ = 256 + 252;
const G_BEAM_OBJ = 256 + 253;
const G_WALL_OBJ = 256 + 254;
const G_PLAYER = 256 + 255;

// 武器类型
const WEAPON_STANDARD = 0;
const WEAPON_MISSILE = 1;
const WEAPON_BEAM = 2;
const WEAPON_WALL = 3;

// 武器属性
const SHOT_DAMAGES = [1, 3, 10, 25];
const SHOT_SIZES = [
    { x: 3, y: 1 },  // Standard
    { x: 5, y: 3 },  // Missile
    { x: 84, y: 3 }, // Beam
    { x: 1, y: 43 }, // Wall
];

// 硬编码的像素图数据（移植自 graphics.c）
const pmNum = [
    [1,1,1,1,0,1,1,0,1,1,0,1,1,1,1],
    [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,1,1,0,0,1,1,1,1,1,0,0,1,1,1],
    [1,1,1,0,0,1,1,1,1,0,0,1,1,1,1],
    [1,0,1,1,0,1,1,1,1,0,0,1,0,0,1],
    [1,1,1,1,0,0,1,1,1,0,0,1,1,1,1],
    [1,1,1,1,0,0,1,1,1,1,0,1,1,1,1],
    [1,1,1,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,1,1,1,0,1,1,1,1,0,0,1,1,1,1],
];

const pmScrollMark = [1,1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,0];
const pmDotEmpty = [0,1,1,0,1,0,0,1,0,1,1,0];
const pmDotFull = [0,1,1,0,1,1,1,1,0,1,1,0];
const pmLife = [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0];
const pmMissileIcon = [0,0,0,0,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0];
const pmBeamIcon = [0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0];
const pmWallIcon = [0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0];
const pmShot = [1,1,1];
const pmExplosion = [
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0],
];

// 压缩的大精灵数据
const cmSpace = [15,255,63,248,127,131,252,127,227,255,199,255,159,249,255,143,252,120,0,224,231,15,60,3,192,30,0,56,28,225,207,0,120,3,192,7,3,28,57,
    224,15,0,255,240,255,231,255,60,1,255,143,255,31,248,255,231,0,63,224,3,231,192,28,121,224,15,128,0,124,248,7,143,60,1,240,0,15,31,0,
    241,231,128,62,1,255,227,224,28,56,255,231,255,127,240,248,7,143,7,249,255,12];
const cmIntro = [0,0,0,0,0,0,45,193,128,0,0,14,0,2,244,27,0,0,2,120,0,191,168,240,0,0,62,156,11,219,41,128,0,9,228,242,220,163,192,0,0,224,125,0,1,176,
    0,0,32,19,192,0,96,0,0,0,1,192,0,0,0,0,0,0,2];
const cmImpact = [31,31,135,207,252,63,193,254,127,241,225,252,252,255,231,254,127,231,255,30,31,255,204,30,225,231,128,7,131,225,255,249,193,206,28,
    240,0,240,62,63,255,156,24,225,207,0,15,3,195,206,241,255,159,252,240,0,240,60,60,207,31,241,255,206,0,15,3,195,192,227,192,28,121,
    224,1,224,60,120,14,60,3,199,158,0,30,7,135,129,227,192,60,121,224,1,224,120,120,30,60,3,199,31,252,30,15,143,1,231,128,120,240,127,
    131,192];

// 解压后的大精灵
let pmSpaceData, pmIntroData, pmImpactData;

function uncompressStaticObjects() {
    pmSpaceData = uncompressPixelMap(new Uint8Array(cmSpace), 804, cmSpace.length);
    pmIntroData = uncompressPixelMap(new Uint8Array(cmIntro), 531, cmIntro.length);
    pmImpactData = uncompressPixelMap(new Uint8Array(cmImpact), 912, cmImpact.length);
}

// 静态对象表
function getStaticObject(id) {
    if (id >= 0 && id <= 9) return { w: 3, h: 5, samples: new Uint8Array(pmNum[id]) };
    switch (id) {
        case G_SPACE: return { w: 67, h: 12, samples: pmSpaceData };
        case G_INTRO: return { w: 59, h: 9, samples: pmIntroData };
        case G_IMPACT: return { w: 76, h: 12, samples: pmImpactData };
        case G_SCROLL_MARK: return { w: 3, h: 7, samples: new Uint8Array(pmScrollMark) };
        case G_DOT_EMPTY: return { w: 4, h: 3, samples: new Uint8Array(pmDotEmpty) };
        case G_DOT_FULL: return { w: 4, h: 3, samples: new Uint8Array(pmDotFull) };
        case G_LIFE: return { w: 5, h: 5, samples: new Uint8Array(pmLife) };
        case G_MISSILE_ICON: return { w: 5, h: 5, samples: new Uint8Array(pmMissileIcon) };
        case G_BEAM_ICON: return { w: 5, h: 5, samples: new Uint8Array(pmBeamIcon) };
        case G_WALL_ICON: return { w: 5, h: 5, samples: new Uint8Array(pmWallIcon) };
        case G_SHOT: return { w: 3, h: 1, samples: new Uint8Array(pmShot) };
        case G_EXPLOSION_A1: return { w: 5, h: 5, samples: new Uint8Array(pmExplosion[0]) };
        case G_EXPLOSION_A2: return { w: 5, h: 5, samples: new Uint8Array(pmExplosion[1]) };
        default: return null;
    }
}

// 动态对象缓存
const dynamicObjectCache = {};

// 数据基础路径
let dataBasePath = 'data/';

// 加载动态对象（从 .dat 文件）
async function loadDynamicObject(objectID) {
    const localID = objectID % 256;
    if (dynamicObjectCache[localID]) return dynamicObjectCache[localID];

    try {
        const resp = await fetch(dataBasePath + 'objects/' + localID + '.dat');
        if (!resp.ok) return { w: 0, h: 0, samples: new Uint8Array(0) };
        const buf = new Uint8Array(await resp.arrayBuffer());
        const w = buf[0];
        const h = buf[1];
        const pixels = w * h;
        const bytes = Math.ceil(pixels / 8);
        const compressed = buf.slice(2, 2 + bytes);
        const samples = uncompressPixelMap(compressed, pixels, bytes);
        const obj = { w, h, samples };
        dynamicObjectCache[localID] = obj;
        return obj;
    } catch (e) {
        return { w: 0, h: 0, samples: new Uint8Array(0) };
    }
}

// 获取对象（同步，需要预加载）
function getObject(objectID) {
    if (objectID < 256) return getStaticObject(objectID);
    const localID = objectID % 256;
    if (dynamicObjectCache[localID]) return dynamicObjectCache[localID];
    return { w: 0, h: 0, samples: new Uint8Array(0) };
}

// 动态敌人缓存
const dynamicEnemyCache = {};

// 加载敌人定义
async function loadEnemyDef(id) {
    if (dynamicEnemyCache[id]) return dynamicEnemyCache[id];

    try {
        const resp = await fetch(dataBasePath + 'enemies/' + id + '.dat');
        if (!resp.ok) return null;
        const buf = new Uint8Array(await resp.arrayBuffer());
        const modelID = buf[0];
        const enemy = {
            model: modelID + 256,
            animCount: buf[1],
            lives: buf[2],  // 作为 Sint8 处理
            floats: buf[3],
            shotTime: buf[4],
            moveUp: buf[5],
            moveDown: buf[6],
            moveAnyway: buf[7],
            movesBetween: { x: buf[8], y: buf[9] },
            size: { x: 0, y: 0 },
        };

        // 预加载所有动画帧并确定最大尺寸
        for (let i = modelID; i < modelID + enemy.animCount; i++) {
            const obj = await loadDynamicObject(i + 256);
            if (obj.w > enemy.size.x) enemy.size.x = obj.w;
            if (obj.h > enemy.size.y) enemy.size.y = obj.h;
        }

        dynamicEnemyCache[id] = enemy;
        return enemy;
    } catch (e) {
        return null;
    }
}

// 加载关卡数据
async function loadLevel(levelNum) {
    try {
        const resp = await fetch(dataBasePath + 'levels/' + levelNum + '.dat');
        if (!resp.ok) return null;
        const buf = new Uint8Array(await resp.arrayBuffer());
        const enemyCount = buf[0];
        const enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const offset = 1 + i * 5;
            const posX = buf[offset] * 256 + buf[offset + 1];
            const posY = buf[offset + 2];
            const enemyID = buf[offset + 3];
            const moveDir = buf[offset + 4] - 1; // 转为 Sint8（原版存储时+1）
            enemies.push({ posX, posY, enemyID, moveDir });
        }
        return enemies;
    } catch (e) {
        return null;
    }
}

// 预加载关卡所需的所有资源
async function preloadLevelResources(levelData) {
    if (!levelData) return;
    const enemyIDs = new Set();
    for (const e of levelData) {
        enemyIDs.add(e.enemyID);
    }
    // 加载奖励物（ID 255）
    enemyIDs.add(255);

    for (const id of enemyIDs) {
        await loadEnemyDef(id);
    }
}

// 预加载玩家和通用资源
async function preloadCommonResources() {
    // 玩家、保护罩、武器对象
    await loadDynamicObject(G_PLAYER);
    await loadDynamicObject(G_PROTECTION_A1);
    await loadDynamicObject(G_PROTECTION_A2);
    await loadDynamicObject(G_MISSILE_OBJ);
    await loadDynamicObject(G_BEAM_OBJ);
    await loadDynamicObject(G_WALL_OBJ);

    // 奖励物精灵
    await loadDynamicObject(256 + 50);
    await loadDynamicObject(256 + 51);
}

// 获取总关卡数
async function getLevelCount() {
    let count = 0;
    while (true) {
        try {
            const resp = await fetch(dataBasePath + 'levels/' + count + '.dat', { method: 'HEAD' });
            if (!resp.ok) break;
            count++;
        } catch (e) {
            break;
        }
    }
    return count;
}

// 场景数据（移植自 scenery.c 的 ScData）
const SCENERY_DATA = [
    { firstObject: 0, objects: 0, upper: 0 },         // 关1：无地形
    { firstObject: 256 + 0, objects: 2, upper: 0 },   // 关2
    { firstObject: 256 + 2, objects: 6, upper: 0 },   // 关3
    { firstObject: 256 + 8, objects: 6, upper: 0 },   // 关4
    { firstObject: 256 + 14, objects: 4, upper: 1 },   // 关5
    { firstObject: 256 + 14, objects: 4, upper: 1 },   // 关6
];

// 预加载场景资源
async function preloadSceneryResources(level) {
    if (level < 0 || level >= SCENERY_DATA.length) return;
    const sd = SCENERY_DATA[level];
    if (sd.objects === 0) return;
    for (let i = 0; i < sd.objects; i++) {
        await loadDynamicObject(sd.firstObject + i);
    }
}
