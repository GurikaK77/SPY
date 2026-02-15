// script.js

// Particles Generation based on Theme
function createParticles() {
    const particlesContainer = document.getElementById("particles");
    if(!particlesContainer) return;
    
    // Clean up existing particles if any
    particlesContainer.innerHTML = '';
    
    const isMobile = window.innerWidth < 600;
    const particleCount = isMobile ? 15 : 30;
    
    // Determine shape/color based on theme
    const theme = state.config.theme;
    let particleClass = 'particle'; 
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add(particleClass);
        
        if(theme === 'christmas') particle.classList.add('snow');
        if(theme === 'halloween') particle.classList.add('ghost-particle');

        const size = Math.random() * 3 + 2; 
        const posX = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 15 + Math.random() * 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        particlesContainer.appendChild(particle);
    }
}

function initDailyChallenges() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('challengeDate');
    
    if (storedDate !== today) {
        state.dailyChallenges = [
            { id: 1, type: 'play_games', description: "ითამაშე 2 თამაში", target: 2, progress: 0, completed: false },
            { id: 2, type: 'win_spy', description: "მოიგე ჯაშუშად", target: 1, progress: 0, completed: false },
            { id: 3, type: 'win_civilian', description: "მოიგე მოქალაქედ", target: 1, progress: 0, completed: false }
        ];
        localStorage.setItem('dailyChallenges', JSON.stringify(state.dailyChallenges));
        localStorage.setItem('challengeDate', today);
    } else {
        const saved = localStorage.getItem('dailyChallenges');
        if (saved) state.dailyChallenges = JSON.parse(saved);
    }
}

window.onload = function() {
    initDailyChallenges();
    const hasSavedGame = state.loadGame();
    
    ui.updateTheme();
    createParticles();
    
    setTimeout(() => {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) loadingScreen.style.display = "none";
        
        if (hasSavedGame) {
            document.getElementById("mainContent").style.display = "block";
            ui.updatePlayerList();
            
            if (state.timeLeft > 0 && document.getElementById("gameSection").style.display === "block") {
                game.startTimer();
            }
            
            ui.setActiveSection(state.activeSection || 'playerInput');
            
            const manualToggle = document.getElementById("manualEntryToggle");
            if(manualToggle) {
                manualToggle.checked = state.config.manualEntry;
            }
            
            ui.updateInputMode(false); 
        } else {
            // თუ პირველად შედის (ან წაშალა მონაცემები), 
            // დარწმუნდი რომ ავტომატური სია შევსებულია
            if (!state.config.manualEntry && state.players.length === 0) {
                for (let i = 1; i <= 5; i++) {
                     state.players.push({ 
                        name: `Player ${i}`, 
                        points: 0, coins: 10, inventory: [], level: 1, xp: 0 
                    });
                }
            }
            document.getElementById("readyScreen").style.display = "flex";
        }
    }, 800);
};

document.addEventListener('contextmenu', e => e.preventDefault());

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
    });
}
