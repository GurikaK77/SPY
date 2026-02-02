// state.js

const state = {
    players: [],
    roles: [],
    chosenWordObj: { w: "", h: "" },
    chameleonWordObj: { w: "", h: "" }, // Stores the fake word for Chameleon mode
    currentIndex: 0,
    timerInterval: null,
    timeLeft: 0,
    isDetectiveMode: false,
    isPointsEnabled: false,
    usedWords: [],
    dailyChallenges: [],
    soundEnabled: true,
    
    config: {
        spyCount: 1,
        detectiveCount: 0,
        assassinCount: 0,
        doctorCount: 0,
        psychicCount: 0,
        jokerCount: 0,
        
        theme: "standard", 
        
        playerOrder: "sequential", 
        pointsSystem: "disabled", 
        manualEntry: true, 
        selectedCategories: ["mix"],
        gameVariant: "standard", // 'standard' or 'chameleon'
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
            chameleonWordObj: this.chameleonWordObj,
            currentIndex: this.currentIndex,
            timeLeft: this.timeLeft,
            isDetectiveMode: this.isDetectiveMode,
            isPointsEnabled: this.isPointsEnabled,
            config: this.config,
            activeSection: activeSection,
            gameStats: this.gameStats,
            dailyChallenges: this.dailyChallenges,
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
            this.chameleonWordObj = s.chameleonWordObj || { w: "", h: "" };
            this.currentIndex = s.currentIndex || 0;
            this.timeLeft = s.timeLeft || 0;
            this.isDetectiveMode = s.isDetectiveMode;
            this.isPointsEnabled = s.isPointsEnabled;
            this.config = { ...this.config, ...s.config }; 
            this.gameStats = s.gameStats || this.gameStats;
            this.dailyChallenges = s.dailyChallenges || [];
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

    updateConfig(key, value) {
        // Convert numbers
        if (['spyCount', 'detectiveCount', 'assassinCount', 'doctorCount', 'psychicCount', 'jokerCount', 'timePerRound'].includes(key)) {
            value = parseInt(value) || 0;
        }
        
        // Convert boolean
        if (key === 'spyHintEnabled') value = !!value;
        
        // Update checkbox categories specially if needed, but for single inputs:
        this.config[key] = value;
        
        // Special logic for Theme
        if (key === 'theme') {
            ui.updateTheme();
        }

        this.saveGame();
        ui.showToast("✅ შენახულია");
    },
    
    setGameVariant(variant) {
        state.audio.playSound('click');
        state.config.gameVariant = variant;
        state.updateConfig('gameVariant', variant);
        
        document.querySelectorAll('.game-mode-card-mini').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById(variant === 'standard' ? 'modeStandard' : 'modeChameleon');
        if(activeCard) activeCard.classList.add('active');
        
        const desc = document.getElementById("modeDescription");
        if(desc) {
            if(variant === 'standard') {
                desc.textContent = "სტანდარტული რეჟიმი. ჯაშუშმა იცის რომ ჯაშუშია.";
            } else {
                desc.textContent = "ქამელეონი: ჯაშუშს ეწერება სხვა სიტყვა და არ იცის რომ ჯაშუშია.";
            }
        }
        
        ui.showToast(`არჩეულია რეჟიმი: ${variant === 'standard' ? 'კლასიკური' : 'ქამელეონი'}`);
    }
};
