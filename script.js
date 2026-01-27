// Particles Generation
function createParticles() {
    const particlesContainer = document.getElementById("particles");
    if(!particlesContainer) return;
    
    // Clean up existing particles if any
    particlesContainer.innerHTML = '';
    
    const isMobile = window.innerWidth < 600;
    const particleCount = isMobile ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        const size = Math.random() * 3 + 1;
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

// Initialize Daily Challenges Logic
function initDailyChallenges() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('challengeDate');
    
    if (storedDate !== today) {
        // Reset challenges for new day
        state.dailyChallenges = [
            {
                id: 1,
                type: 'spy_win',
                description: "გაიმარჯვე როგორც ჯაშუში",
                target: 1,
                progress: 0,
                completed: false
            },
            {
                id: 2,
                type: 'play_games',
                description: "ითამაშე 2 თამაში",
                target: 2,
                progress: 0,
                completed: false
            }
        ];
        localStorage.setItem('dailyChallenges', JSON.stringify(state.dailyChallenges));
        localStorage.setItem('challengeDate', today);
    } else {
        // Load existing challenges
        const saved = localStorage.getItem('dailyChallenges');
        if (saved) {
            state.dailyChallenges = JSON.parse(saved);
        }
    }
}

// Main Initialization
window.onload = function() {
    // 1. Visual Effects
    createParticles();
    
    // 2. Logic Initialization
    initDailyChallenges();
    
    // 3. Check for saved game state
    const hasSavedGame = state.loadGame();
    
    // 4. Handle Loading Screen Transition
    setTimeout(() => {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) loadingScreen.style.display = "none";
        
        if (hasSavedGame) {
            // Restore last active section
            document.getElementById("mainContent").style.display = "block";
            
            // Ensure UI reflects state
            ui.updatePlayerList();
            
            // If we are in Game Section, restart timer visually (logic handles interval)
            if (state.timeLeft > 0 && document.getElementById("gameSection").style.display === "block") {
                game.startTimer();
            }

            // Restore active section visibility
            ui.setActiveSection(state.activeSection || 'playerInput');
            
            // Ensure input mode UI matches config
            ui.updateInputMode(false); 

        } else {
            // Show "Ready?" screen for fresh start
            document.getElementById("readyScreen").style.display = "flex";
        }
    }, 800); // Slight delay for loading effect
};

// Disable context menu for "App-like" feel
document.addEventListener('contextmenu', e => e.preventDefault());

// Re-register Service Worker if needed (remains from original)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
    });
}
