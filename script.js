// script.js

function createParticles() {
    const particlesContainer = document.getElementById("particles");
    if(!particlesContainer) return;
    
    particlesContainer.innerHTML = '';
    
    const isMobile = window.innerWidth < 600;
    const particleCount = isMobile ? 15 : 30;
    
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
    
    if(storedDate !== today || !state.dailyChallenges || state.dailyChallenges.length === 0) {
        state.dailyChallenges = [
            { id: 'c1', description: 'ითამაშე 3 რაუნდი', target: 3, progress: 0, completed: false },
            { id: 'c2', description: 'მოიგე ჯაშუშით', target: 1, progress: 0, completed: false },
            { id: 'c3', description: 'გამოიყენე მაღაზია', target: 1, progress: 0, completed: false }
        ];
        localStorage.setItem('challengeDate', today);
        state.saveGame();
    }
}

window.onload = () => {
    initDailyChallenges();
    const hasSavedGame = state.loadGame();
    ui.updateTheme();
    
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        
        // ამოწმებს უნახავს თუ არა უკვე წესების ფანჯარა
        if (!localStorage.getItem('hasSeenRulesModal')) {
            document.getElementById("welcomeModal").style.display = "flex";
        }

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
            if (!state.config.manualEntry && state.players.length === 0) {
                for (let i = 1; i <= 5; i++) {
                     state.players.push({ 
                        name: `Player ${i}`, 
                        points: 0, coins: 10, inventory: [], level: 1, xp: 0, avatar: '👤' 
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
