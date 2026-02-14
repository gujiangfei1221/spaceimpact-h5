// audio.js - Web Audio API 程序化音效（移植自 C 版 audio.c）

let audioCtx = null;
let audioInitialized = false;

const SAMPLE_RATE = 44100;
const FRAMERATE = 20;
const VOLUME = 0.12; // Web Audio 音量（0-1）

// 音效频率（移植自 audio.h）
const BUTTON_FREQ = 1000;
const SHOT_FREQ_DISTORT = 1500;
const SHOT_FREQ_CONTINOUS = 6000;
const DEATH_FREQ_DISTORT = 4200;
const DEATH_FREQ_CONTINOUS = 5200;
const BONUS_FREQ_DISTORT = 4900;
const BONUS_FREQ_CONTINOUS = 5250;

function initAudioOnInteraction() {
    if (audioInitialized) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioInitialized = true;
    } catch (e) {
        console.warn('Web Audio not available');
    }
}

// 生成双频合成音效（移植原版 FillStream 算法）
function playSound(freqDistort, freqSine, durationFrames) {
    if (!audioCtx) return;

    const duration = durationFrames / FRAMERATE;
    const sampleCount = Math.floor(SAMPLE_RATE * duration);
    const buffer = audioCtx.createBuffer(1, sampleCount, SAMPLE_RATE);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
        const playrem = sampleCount - i;
        let sample = 0;
        if (freqDistort > 0) {
            // 失真分量：sin(playrem * i / (sampleRate * 2π * freq))
            sample += Math.sin(playrem * i / (SAMPLE_RATE * 2 * Math.PI * freqDistort));
        }
        if (freqSine > 0) {
            // 正弦分量：sin(playrem / (sampleRate * 2π * freq))
            sample += Math.sin(playrem / (SAMPLE_RATE * 2 * Math.PI * freqSine));
        }
        data[i] = sample * VOLUME;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}

// 音效接口
function playShotSound() {
    playSound(SHOT_FREQ_DISTORT, SHOT_FREQ_CONTINOUS, 3);
}

function playDeathSound() {
    playSound(DEATH_FREQ_DISTORT, DEATH_FREQ_CONTINOUS, 6);
}

function playBonusSound() {
    playSound(BONUS_FREQ_DISTORT, BONUS_FREQ_CONTINOUS, 4);
}

function playMenuSound() {
    playSound(0, BUTTON_FREQ, 2);
}
