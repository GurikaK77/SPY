// Particles (ფონური ნაწილაკები)
function createParticles() {
    const particlesContainer = document.getElementById("particles");
    if(!particlesContainer) return;
    
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

// Global State
let players = [];
let roles = [];
let chosenWord = "";
let currentIndex = 0;
let timerInterval;
let timeLeft = 0;
let isDetectiveMode = false;
let isPointsEnabled = false;
let usedWords = [];

// Helper Questions Array
const helperQuestions = [
    "ცოცხალია?", "ეტევა ხელში?", "რა ფერია?", 
    "სად შეიძლება შეხვდე?", "რა მასალისგანაა?", 
    "იჭმევა?", "მძიმეა?", "ღირს ძვირი?", 
    "გამოიყენება ყოველდღიურად?", "ხმაურობს?",
    "სჭირდება დენი?", "აქვს სუნი?", "დადის?",
    "ბავშვს მისცემდი ხელში?", "საშიშია?", "წყალში იძირება?",
    "შეიძლება საჩუქრად გაცემა?", "ჯიბეში ჩაეტევა?",
    "ხელოსანს სჭირდება?", "სამზარეულოში იპოვი?",
    "სკოლაში გვხვდება?", "ინტერნეტი სჭირდება?",
    "გატყდება რომ დავარდეს?", "რბილია თუ მაგარი?",
    "სჭირდება ელემენტები?", "აქვს ბორბლები?",
    "სჭირდება წყალი?", "იზრდება?", "დაფრინავს?",
    "შეიძლება თუ არა მოპარვა?", "პოლიციას სჭირდება?",
    "ღამით ჩანს?", "ზამთარში გამოიყენება?",
    "აქვს ღილაკები?", "არის თუ არა შენობაში?",
    "გამოსცემს მუსიკას?", "სჭირდება მოვლა?",
    "არის თუ არა ქართული?", "უყვართ ტურისტებს?"
];

// --- SHOP ITEMS ---
const shopItems = [
    { id: 'coffee', name: 'ყავა', icon: '☕', price: 2, desc: 'ენერგია. +1 ქულა.', type: 'instant', effectValue: 1 },
    { id: 'donut', name: 'დონატი', icon: '🍩', price: 4, desc: 'გემრიელი. +2 ქულა.', type: 'instant', effectValue: 2 },
    { id: 'magnifier', name: 'ლუპა', icon: '🔍', price: 8, desc: 'დეტექტივის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'spy_mask', name: 'ნიღაბი', icon: '🎭', price: 10, desc: 'ჯაშუშის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'shield', name: 'ამულეტი', icon: '🛡️', price: 12, desc: 'გიცავს ქულების დაკლებისგან.', type: 'consumable' },
    { id: 'algo', name: 'ალგორითმი', icon: '💾', price: 15, desc: 'სისტემის გატეხვა. +5 ქულა.', type: 'instant', effectValue: 5, hacker: true },
    { id: 'ddos', name: 'DDOS შეტევა', icon: '☠️', price: 20, desc: 'სერვერის დატვირთვა. +8 ქულა.', type: 'instant', effectValue: 8, hacker: true },
    { id: 'bribe', name: 'ქრთამი', icon: '💰', price: 25, desc: '+15 ქულა. ფული წყვეტს ყველაფერს.', type: 'instant', effectValue: 15 },
    { id: 'crown', name: 'გვირგვინი', icon: '👑', price: 50, desc: 'მდიდრების სტატუსი.', type: 'passive' }
];

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "sequential", 
    pointsSystem: "enabled",
    manualEntry: true, 
    selectedCategories: ["mix"]
};

// Word Data
const wordData = {
    "mix": ["ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "საიდუმლო", "ყვავილი", "ხინკალი", "ჩურჩხელა", "მეტრო", "მარშრუტკა", "თამადა", "ყანწი", "ქვევრი"],
    "objects": ["მიკროტალღური ღუმელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "კლავიატურა", "საათი", "ტაფა", "ქვაბი", "ჩანგალი", "მაკრატელი", "ყულაბა"],
    "nature": ["ამაზონის ჯუნგლები", "იაგუარი", "შავი ზღვა", "ცისარტყელა", "სოკო", "ობობა", "მორიელი", "გველი", "ჩანჩქერი"],
    "places": ["აეროპორტის ტერმინალი", "ბენზინ გასამართი სადგური", "სუპერმარკეტი", "ციხე", "პარლამენტი", "მერია", "სხვენი", "სარდაფი"]
};

const categoryNames = { "mix": "შერეული", "objects": "ნივთები", "nature": "ბუნება", "places": "ადგილები" };

// --- DATA PERSISTENCE ---
function saveGameState() {
    const activeSection = document.querySelector('.section.active')?.id || 'playerInput';
    const gameState = {
        players, roles, chosenWord, currentIndex, timeLeft,
        isDetectiveMode, isPointsEnabled, configState, activeSection,
        timestamp: Date.now()
    };
    localStorage.setItem('spyGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('spyGameState');
    if (!saved) return false;
    try {
        const state = JSON.parse(saved);
        if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) { localStorage.removeItem('spyGameState'); return false; }
        players = state.players || [];
        roles = state.roles || [];
        chosenWord = state.chosenWord || "";
        currentIndex = state.currentIndex || 0;
        timeLeft = state.timeLeft || 0;
        isDetectiveMode = state.isDetectiveMode;
        isPointsEnabled = state.isPointsEnabled;
        configState = state.configState || configState;
        updateInputMode();
        updatePlayerList();
        if (state.activeSection === 'gameSection') {
            document.getElementById("timer").textContent = formatTime(timeLeft);
            if(timeLeft > 0) startTimer();
        }
        if (state.activeSection === 'roleSection') updateTurnDisplay();
        if (state.activeSection === 'resultSection') revealSpies();
        document.getElementById("readyScreen").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        document.getElementById("mainContent").style.opacity = "1";
        setActiveSection(state.activeSection);
        return true;
    } catch (e) { return false; }
}

function clearGameState() { localStorage.removeItem('spyGameState'); }

// --- UI HELPERS ---
function showToast(message) {
    const toast = document.getElementById("toastMessage");
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.classList.add("show");
    if(navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => { toast.classList.remove("show"); }, 2000);
}

function showReadyScreen() {
    if (loadGameState()) { document.getElementById("loadingScreen").style.display = "none"; return; }
    document.getElementById("loadingScreen").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("readyScreen").style.display = "flex";
        setTimeout(() => { document.getElementById("readyScreen").style.opacity = "1"; }, 50);
    }, 500);
}

function showMainPage() {
    document.getElementById("readyScreen").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("readyScreen").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        setTimeout(() => { document.getElementById("mainContent").style.opacity = "1"; showPlayerInput(); }, 50);
    }, 500);
}

function setActiveSection(activeId) {
    const sections = ['playerInput', 'configSection', 'shopSection', 'roleSection', 'gameSection', 'findSpySection', 'resultSection'];
    const logoArea = document.getElementById('logoArea');
    logoArea.style.display = ['playerInput', 'configSection', 'shopSection'].includes(activeId) ? 'block' : 'none';

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === activeId) { section.style.display = "block"; section.classList.add("active"); } 
        else { section.style.display = "none"; section.classList.remove("active"); }
    });
    if(players.length > 0) saveGameState();
}

// --- PLAYER MANAGEMENT ---
function showPlayerInput() {
    setActiveSection('playerInput');
    updateInputMode();
}

function updateInputMode() {
    const manualToggle = document.getElementById("manualEntryToggle");
    configState.manualEntry = manualToggle.checked;
    document.getElementById("manualInputContainer").style.display = configState.manualEntry ? "block" : "none";
    document.getElementById("autoInputContainer").style.display = configState.manualEntry ? "none" : "block";
    updatePlayerList();
}

function addPlayer() {
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some((p) => p.name === name)) {
        // დავამატე საწყისი 10 ქოინი მაღაზიისთვის
        players.push({ name: name, points: 0, coins: 10, inventory: [] });
        updatePlayerList();
        document.getElementById("playerName").value = "";
        saveGameState();
    }
}

function updatePlayerList() {
    let list = document.getElementById("playerList");
    if(!list) return;
    list.innerHTML = players.length === 0 ? '<div style="padding: 15px; text-align: center; color: var(--text-muted);">მოთამაშეები არ არიან</div>' : "";
    
    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");
        item.innerHTML = `
            <div style="flex: 1">
                <div class="player-name">${p.name}</div>
                <div class="player-stats">
                    <div class="stat-points"><i class="fas fa-trophy"></i> ${p.points}</div>
                    <div class="stat-coins"><i class="fas fa-coins"></i> ${p.coins}</div>
                </div>
            </div>
            <button class="remove-btn" onclick="players.splice(${index}, 1); updatePlayerList(); saveGameState();"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(item);
    });
}

// --- CORE GAME LOGIC ---
function startGame() {
    if (configState.manualEntry) {
        if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
    } else {
        const count = parseInt(document.getElementById("totalPlayersCount").value);
        players = Array.from({length: count}, (_, i) => ({ name: `მოთამაშე ${i+1}`, points: 0, coins: 10, inventory: [] }));
    }

    isDetectiveMode = parseInt(document.getElementById("detectiveCount").value) > 0;
    isPointsEnabled = document.getElementById("pointsSystem").value === "enabled";
    chosenWord = wordData[configState.selectedCategories[0]][Math.floor(Math.random() * wordData[configState.selectedCategories[0]].length)];
    
    roles = Array(players.length).fill("Civilian");
    let indices = [...Array(players.length).keys()].sort(() => Math.random() - 0.5);
    
    for(let i=0; i<parseInt(document.getElementById("spyCount").value); i++) roles[indices.pop()] = "Spy";
    if(isDetectiveMode) roles[indices.pop()] = "Detective";

    currentIndex = 0;
    setActiveSection('roleSection');
    updateTurnDisplay();
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").textContent = players[currentIndex].name;
    document.getElementById("roleCard").classList.remove("flipped");
    document.getElementById("nextPlayerBtn").style.display = "none";
}

function revealRole() {
    const cardBack = document.getElementById("roleCardBack");
    const role = roles[currentIndex];
    document.getElementById("roleCard").classList.add("flipped");
    
    if (role === "Spy") cardBack.innerHTML = '<div class="role-icon"><i class="fas fa-user-secret"></i></div><div class="role-text spy-text">ჯაშუში</div>';
    else if (role === "Detective") cardBack.innerHTML = '<div class="role-icon"><i class="fas fa-search"></i></div><div class="role-text detektivi">დეტექტივი</div>';
    else cardBack.innerHTML = `<div class="role-icon"><i class="fas fa-user"></i></div><div class="role-text">სიტყვა: <span class="sityva">${chosenWord}</span></div>`;
    
    document.getElementById("nextPlayerBtn").style.display = "block";
}

function nextPlayer() {
    currentIndex++;
    if (currentIndex < players.length) updateTurnDisplay();
    else { setActiveSection('gameSection'); startTimer(); }
}

// --- SCORING SYSTEM (განახლებული) ---
function handleDetectiveGuess(guessIndex) {
    const spyFound = roles[guessIndex] === "Spy";
    
    players.forEach((p, i) => {
        if (spyFound) {
            if (roles[i] === "Detective") { p.points += 15; p.coins += 10; } // დეტექტივის ბონუსი
            if (roles[i] === "Civilian") { p.points += 5; p.coins += 5; }
        } else {
            if (roles[i] === "Spy") { p.points += 20; p.coins += 15; } // ჯაშუშის მოგება
        }
    });
    
    document.getElementById("resultText").textContent = spyFound ? "დეტექტივმა ჯაშუში გამოიჭირა!" : "ჯაშუშმა დეტექტივი გააცურა!";
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    const spyFound = roles[guessIndex] === "Spy";
    
    players.forEach((p, i) => {
        if (spyFound) {
            if (roles[i] === "Civilian") { p.points += 10; p.coins += 8; }
        } else {
            if (roles[i] === "Spy") { p.points += 15; p.coins += 12; }
        }
    });

    document.getElementById("resultText").textContent = spyFound ? "ჯაშუში გამოვლენილია!" : "ჯაშუშმა მოგიგოთ!";
    revealSpies();
}

// --- REST OF FUNCTIONS (Shop, Timer, etc.) ---
function startTimer() {
    timeLeft = 120;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = formatTime(timeLeft);
        if (timeLeft <= 0) { clearInterval(timerInterval); endGame(); }
    }, 1000);
}

function formatTime(t) { return `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`; }

function endGame() { setActiveSection('findSpySection'); showFindSpySection(); }

function showFindSpySection() {
    let select = document.getElementById("findSpySelect");
    select.innerHTML = '<option value="" disabled selected>აირჩიეთ მოთამაშე</option>';
    players.forEach((p, i) => select.innerHTML += `<option value="${i}">${p.name}</option>`);
}

function makePlayerGuess() {
    let idx = parseInt(document.getElementById("findSpySelect").value);
    if (isNaN(idx)) return;
    if (isDetectiveMode) handleDetectiveGuess(idx); else handleRegularGuess(idx);
}

function revealSpies() {
    let spies = players.filter((_,i) => roles[i]==="Spy").map(p => p.name).join(", ");
    document.getElementById("resultDisplay").innerHTML = `<div class="spy-reveal-container"><div class="spy-label">ჯაშუში იყო:</div><div class="spy-name-big">${spies}</div></div>`;
    document.getElementById("wordDisplay").textContent = `სიტყვა: ${chosenWord}`;
    setActiveSection('resultSection');
}

function restartGame(same) {
    if(!same) players = [];
    showPlayerInput();
}

window.onload = () => { createParticles(); showReadyScreen(); };
