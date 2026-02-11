// saves.js - 存档系统（localStorage 替代文件读写）

function readSavedLevel() {
    try {
        const val = localStorage.getItem('spaceImpact_savedLevel');
        return val !== null ? parseInt(val, 10) : 0;
    } catch (e) {
        return 0;
    }
}

function saveLevel(level) {
    try {
        localStorage.setItem('spaceImpact_savedLevel', level.toString());
    } catch (e) {}
}

function readTopScores() {
    try {
        const val = localStorage.getItem('spaceImpact_topScores');
        if (val) {
            const arr = JSON.parse(val);
            if (Array.isArray(arr) && arr.length === 10) return arr;
        }
    } catch (e) {}
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function placeTopScore(scores, entry) {
    for (let i = 0; i < 10; i++) {
        if (scores[i] < entry) {
            // 后移
            for (let j = 9; j > i; j--) {
                scores[j] = scores[j - 1];
            }
            scores[i] = entry;
            break;
        }
    }
    try {
        localStorage.setItem('spaceImpact_topScores', JSON.stringify(scores));
    } catch (e) {}
}
