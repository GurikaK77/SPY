// state.js

const state = {
    players: [],
    roles: [],
    chosenWordObj: { w: "", h: "" },
    chameleonWordObj: { w: "", h: "" },
    currentIndex: 0,
    timerInterval: null,
    timeLeft: 0,
    wakeLock: null,
    isDetectiveMode: false,
    isPointsEnabled: false,
    usedWords: [],
    dailyChallenges: [],
    soundEnabled: true,
    musicEnabled: true,
    sfxVolume: 0.8,
    musicVolume: 0.35,
    savedManualPlayers: [],

    config: {
        spyCount: 1,
        detectiveCount: 0,
        assassinCount: 0,
        doctorCount: 0,
        jokerCount: 0,
        syndicateCount: 0,
        hackerCount: 0,
        doubleAgentCount: 0,
        theme: "standard",
        playerOrder: "sequential",
        pointsSystem: "disabled",
        manualEntry: false,
        selectedCategories: ["mix"],
        customWordsList: "",
        gameVariant: "standard",
        modifierInfection: false,
        modifierBlackout: false,
        blackoutAllowedRoles: ['Detective', 'Assassin', 'Doctor', 'Joker', 'Syndicate', 'Hacker', 'DoubleAgent'],
        timePerRound: 120,
        spyHintEnabled: false,
        roleRevealMode: 'standard'
    },

    gameStats: {
        totalGames: 0,
        spyWins: 0,
        civilianWins: 0,
        totalPoints: 0,
        favoriteWords: {},
        achievements: []
    },

    audio: {
        sounds: {
            click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
            reveal: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3'),
            timerEnd: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'),
            purchase: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3'),
            victory: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
            whoosh: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3'),
            glitch: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-static-whoosh-1076.mp3'),
            tick: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3')
        },

        music: {
            menu: new Audio('https://assets.mixkit.co/music/preview/mixkit-futuristic-technology-ambient-257.mp3'),
            game: new Audio('https://assets.mixkit.co/music/preview/mixkit-cyberpunk-moonlight-sonata-141.mp3')
        },

        currentMusicKey: null,
        unlocked: false,

        init() {
            Object.values(this.music).forEach(a => {
                a.loop = true;
                a.preload = 'auto';
            });

            Object.values(this.sounds).forEach(a => {
                a.preload = 'auto';
            });

            this.applyVolumes();

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) this.pauseMusic();
                else this.resumeMusic();
            });
        },

        unlock() {
            if (this.unlocked) return;
            this.unlocked = true;

            const warm = (audio) => {
                try {
                    const oldVolume = audio.volume;
                    audio.volume = 0.0001;
                    const p = audio.play();
                    if (p && p.then) {
                        p.then(() => {
                            audio.pause();
                            audio.currentTime = 0;
                            audio.volume = oldVolume;
                        }).catch(() => {
                            audio.volume = oldVolume;
                        });
                    }
                } catch (e) {}
            };

            warm(this.sounds.click);
            warm(this.music.menu);
        },

        applyVolumes() {
            Object.values(this.sounds).forEach(a => {
                a.volume = Math.max(0, Math.min(1, state.sfxVolume));
            });

            Object.values(this.music).forEach(a => {
                a.volume = Math.max(0, Math.min(1, state.musicVolume));
            });
        },

        setSfxVolume(value) {
            state.sfxVolume = Math.max(0, Math.min(1, parseFloat(value) || 0));
            this.applyVolumes();
            state.saveGame();
        },

        setMusicVolume(value) {
            state.musicVolume = Math.max(0, Math.min(1, parseFloat(value) || 0));
            this.applyVolumes();
            state.saveGame();
        },

        playSound(name) {
            if (!state.soundEnabled) return;
            const s = this.sounds[name];
            if (!s) return;
            try {
                s.currentTime = 0;
                s.play().catch(() => {});
            } catch (e) {}
        },

        fadeTo(audioEl, targetVolume, duration = 450) {
            if (!audioEl) return;
            const startVolume = audioEl.volume;
            const startTime = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - startTime) / duration);
                audioEl.volume = startVolume + (targetVolume - startVolume) * t;
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        },

        setMusicContext(key) {
            if (!state.musicEnabled) {
                this.stopMusic();
                return;
            }
            if (!this.unlocked) return;
            if (this.currentMusicKey === key) return;

            const next = this.music[key];
            const previous = this.currentMusicKey ? this.music[this.currentMusicKey] : null;
            if (!next) return;

            this.currentMusicKey = key;

            try {
                next.currentTime = Math.min(next.currentTime || 0, 2);
                next.volume = 0.0001;
                next.play().catch(() => {});
                this.fadeTo(next, Math.max(0, Math.min(1, state.musicVolume)), 500);

                if (previous) {
                    this.fadeTo(previous, 0.0001, 350);
                    setTimeout(() => {
                        try { previous.pause(); } catch (e) {}
                    }, 380);
                }
            } catch (e) {}
        },

        pauseMusic() {
            if (!this.currentMusicKey) return;
            try { this.music[this.currentMusicKey].pause(); } catch (e) {}
        },

        resumeMusic() {
            if (!state.musicEnabled || !this.currentMusicKey) return;
            try { this.music[this.currentMusicKey].play().catch(() => {}); } catch (e) {}
        },

        stopMusic() {
            this.currentMusicKey = null;
            Object.values(this.music).forEach(a => {
                try {
                    a.pause();
                    a.currentTime = 0;
                } catch (e) {}
            });
        }
    },

    saveGame() {
        const activeSection = document.querySelector('.section.active')?.id || 'playerInput';
        const gameState = {
            players: this.players,
            savedManualPlayers: this.savedManualPlayers,
            roles: this.roles,
            chosenWordObj: this.chosenWordObj,
            chameleonWordObj: this.chameleonWordObj,
            currentIndex: this.currentIndex,
            timeLeft: this.timeLeft,
            isDetectiveMode: this.isDetectiveMode,
            isPointsEnabled: this.isPointsEnabled,
            config: this.config,
            activeSection,
            gameStats: this.gameStats,
            dailyChallenges: this.dailyChallenges,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            timestamp: Date.now()
        };
        localStorage.setItem('spyGameState', JSON.stringify(gameState));
    },

    loadGame() {
        const saved = localStorage.getItem('spyGameState');
        if (!saved) return false;

        try {
            const s = JSON.parse(saved);
            if (Date.now() - s.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('spyGameState');
                return false;
            }

            this.players = s.players || [];
            this.savedManualPlayers = s.savedManualPlayers || [];
            this.roles = s.roles || [];
            this.chosenWordObj = s.chosenWordObj || { w: "", h: "" };
            this.chameleonWordObj = s.chameleonWordObj || { w: "", h: "" };
            this.currentIndex = s.currentIndex || 0;
            this.timeLeft = s.timeLeft || 0;
            this.isDetectiveMode = !!s.isDetectiveMode;
            this.isPointsEnabled = !!s.isPointsEnabled;
            this.config = { ...this.config, ...(s.config || {}) };

            if (!this.config.blackoutAllowedRoles) this.config.blackoutAllowedRoles = [];

            this.gameStats = s.gameStats || this.gameStats;
            this.dailyChallenges = s.dailyChallenges || [];
            this.soundEnabled = s.soundEnabled !== undefined ? s.soundEnabled : true;
            this.musicEnabled = s.musicEnabled !== undefined ? s.musicEnabled : true;
            this.sfxVolume = typeof s.sfxVolume === 'number' ? s.sfxVolume : 0.8;
            this.musicVolume = typeof s.musicVolume === 'number' ? s.musicVolume : 0.35;

            this.audio.applyVolumes();
            return true;
        } catch (e) {
            return false;
        }
    },

    clearGameState() {
        localStorage.removeItem('spyGameState');
    },

    clearAllData() {
        if (confirm("დარწმუნებული ხართ? მონაცემები წაიშლება.")) {
            localStorage.clear();
            location.reload();
        }
    },

    updateConfig(key, value) {
        if (['spyCount', 'detectiveCount', 'assassinCount', 'doctorCount', 'jokerCount', 'syndicateCount', 'hackerCount', 'doubleAgentCount', 'timePerRound'].includes(key)) {
            value = parseInt(value) || 0;
        }
        if (['spyHintEnabled', 'modifierInfection', 'modifierBlackout'].includes(key)) value = !!value;

        this.config[key] = value;
        if (key === 'theme') ui.updateTheme();

        this.saveGame();
        ui.showToast("✅ შენახულია");
    },

    toggleBlackoutRole(role, isEnabled) {
        if (!this.config.blackoutAllowedRoles) {
            this.config.blackoutAllowedRoles = [];
        }
        if (isEnabled) {
            if (!this.config.blackoutAllowedRoles.includes(role)) this.config.blackoutAllowedRoles.push(role);
        } else {
            this.config.blackoutAllowedRoles = this.config.blackoutAllowedRoles.filter(r => r !== role);
        }
        this.saveGame();
    },

    setGameVariant(variant) {
        state.audio.playSound('click');
        state.config.gameVariant = variant;
        this.updateConfig('gameVariant', variant);

        document.querySelectorAll('.game-mode-card-mini').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById(variant === 'standard' ? 'modeStandard' : 'modeChameleon');
        if (activeCard) activeCard.classList.add('active');

        ui.showToast(`არჩეულია რეჟიმი: ${variant === 'standard' ? 'კლასიკური' : 'ქამელეონი'}`);
    },

    checkAchievements() {
        if (typeof globalAchievements === 'undefined') return;
        let unlocked = false;
        globalAchievements.forEach(ach => {
            if (!this.gameStats.achievements) this.gameStats.achievements = [];
            if (!this.gameStats.achievements.includes(ach.id)) {
                let conditionMet = false;
                if (ach.type === 'games' && this.gameStats.totalGames >= ach.target) conditionMet = true;
                if (ach.type === 'spy_wins' && this.gameStats.spyWins >= ach.target) conditionMet = true;
                if (ach.type === 'civ_wins' && this.gameStats.civilianWins >= ach.target) conditionMet = true;

                if (conditionMet) {
                    this.gameStats.achievements.push(ach.id);
                    ui.showToast(`🏆 ახალი მიღწევა: ${ach.name}!`);
                    unlocked = true;
                }
            }
        });
        if (unlocked) this.saveGame();
    }
};

try { state.audio.init(); } catch (e) {}
