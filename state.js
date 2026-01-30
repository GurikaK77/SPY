// js/state.js

const GAME_MODES = {
    normal: { name: "ნორმალური", time: 120, spies: 1, detectives: 0, pointsMultiplier: 1 },
    blitz: { name: "ბლიცი", time: 60, spies: 2, detectives: 0, pointsMultiplier: 1.5 },
    hardcore: { name: "რთული", time: 180, spies: 1, detectives: 1, pointsMultiplier: 2 }
};

const state = {
    players: [],
    roles: [],
    chosenWordObj: { w: "", h: "" },
    currentIndex: 0,
    timerInterval: null,
    timeLeft: 0,
    isDetectiveMode: false,
    isPointsEnabled: false,
    usedWords: [],
    currentGameMode: "normal",
    dailyChallenges: [],
    soundEnabled: true,
    wakeLock: null,
    
    config: {
        spyCount: 1,
        detectiveCount: 0,
        playerOrder: "sequential", 
        pointsSystem: "disabled", 
        manualEntry: true, 
        selectedCategories: ["mix"],
        gameMode: "normal",
        timePerRound: 120,
        spyHintEnabled: true
    },

    gameStats: {
        totalGames: 0,
        spyWins: 0,
        civilianWins: 0,
        totalPoints: 0,
        favoriteWords: {}
    },

    audio: {
        sounds: {
            click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
            reveal: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3'),
            timerEnd: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'),
            purchase: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3'),
            victory: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
        },
        playSound(name) {
            if (!state.soundEnabled) return;
            const s = this.sounds[name];
            if (s) { s.currentTime = 0; s.play().catch(e => {}); }
        }
    },

    saveGame() {
        const activeSection = document.querySelector('.section.active')?.id || 'playerInput';
        const gameState = {
            players: this.players,
            roles: this.roles,
            chosenWordObj: this.chosenWordObj,
            currentIndex: this.currentIndex,
            timeLeft: this.timeLeft,
            isDetectiveMode: this.isDetectiveMode,
            isPointsEnabled: this.isPointsEnabled,
            config: this.config,
            activeSection: activeSection,
            gameStats: this.gameStats,
            dailyChallenges: this.dailyChallenges,
            currentGameMode: this.currentGameMode,
            soundEnabled: this.soundEnabled,
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
            this.roles = s.roles || [];
            this.chosenWordObj = s.chosenWordObj || { w: "", h: "" };
            this.currentIndex = s.currentIndex || 0;
            this.timeLeft = s.timeLeft || 0;
            this.isDetectiveMode = s.isDetectiveMode;
            this.isPointsEnabled = s.isPointsEnabled;
            this.config = s.config || this.config;
            this.gameStats = s.gameStats || this.gameStats;
            this.dailyChallenges = s.dailyChallenges || [];
            this.currentGameMode = s.currentGameMode || "normal";
            this.soundEnabled = s.soundEnabled !== undefined ? s.soundEnabled : true;
            return true;
        } catch (e) { return false; }
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

    // განახლებული: ინახავს მომენტალურად, ხმისა და გადამისამართების გარეშე
    saveConfig() {
        const spyCount = document.getElementById("spyCountConfig");
        if (spyCount) this.config.spyCount = parseInt(spyCount.value);
        
        const detectiveCount = document.getElementById("detectiveCount");
        if (detectiveCount) this.config.detectiveCount = parseInt(detectiveCount.value);
        
        const playerOrder = document.getElementById("playerOrder");
        if (playerOrder) this.config.playerOrder = playerOrder.value;
        
        const timeConfig = document.getElementById("timeConfig");
        if (timeConfig) this.config.timePerRound = parseInt(timeConfig.value) || 120;
        
        const pointsSystem = document.getElementById("pointsSystem");
        if (pointsSystem) this.config.pointsSystem = pointsSystem.value;

        const spyHintToggle = document.getElementById("spyHintToggle");
        if (spyHintToggle) this.config.spyHintEnabled = spyHintToggle.checked;

        // Categories
        const checkboxes = document.querySelectorAll("#categoriesContainer input[type='checkbox']");
        const selected = [];
        checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
        if (selected.length === 0) selected.push("mix");
        this.config.selectedCategories = selected;

        // უბრალოდ ჩუმად ვინახავთ
        this.saveGame();
    },
    
    setGameMode(mode) {
        state.audio.playSound('click');
        state.currentGameMode = mode;
        state.config.gameMode = mode;
        const conf = GAME_MODES[mode];
        
        state.config.spyCount = conf.spies;
        state.config.detectiveCount = conf.detectives;
        state.config.timePerRound = conf.time;
        
        document.getElementById("spyCountConfig").value = conf.spies;
        document.getElementById("detectiveCount").value = conf.detectives;
        document.getElementById("timeConfig").value = conf.time;

        document.querySelectorAll('.game-mode-card-mini').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById(mode === 'normal' ? 'modeNormal' : mode === 'blitz' ? 'modeBlitz' : 'modeHardcore');
        if(activeCard) activeCard.classList.add('active');
        
        // რეჟიმის შეცვლაც მომენტალურად ინახავს
        this.saveConfig();
        ui.showToast(`არჩეულია: ${conf.name}`);
    }
};
