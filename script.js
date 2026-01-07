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

// Shop Items
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

// Configuration
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "sequential", 
    pointsSystem: "enabled",
    manualEntry: true, 
    selectedCategories: ["mix"]
};

const wordData = {
    "mix": ["ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "საიდუმლო", "ყვავილი", "ხინკალი", "ჩურჩხელა", "მეტრო", "მარშრუტკა", "თამადა", "ყანწი", "ქვევრი"],
    "objects": ["მიკროტალღური ღუმელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "კლავიატურა", "საათი", "ტაფა", "ქვაბი", "ჩანგალი", "მაკრატელი", "ყულაბა"],
    "nature": ["ამაზონის ჯუნგლები", "იაგუარი", "შავი ზღვა", "ცისარტყელა", "სოკო", "ობობა", "მორიელი", "გველი", "ჩანჩქერი"],
    "places": ["აეროპორტის ტერმინალი", "ბენზინ გასამართი სადგური", "სუპერმარკეტი", "ციხე", "პარლამენტი", "მერია", "სხვენი", "სარდაფი"]
};

// --- ფუნქციების სრული აღდგენა ---

function saveGameState() {
    const gameState = { players, roles, chosenWord, currentIndex, isDetectiveMode, isPointsEnabled, configState, timestamp: Date.now() };
    localStorage.setItem('spyGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('spyGameState');
    if (!saved) return false;
    const state = JSON.parse(saved);
    players = state.players;
    roles = state.roles;
    chosenWord = state.chosenWord;
    configState = state.configState;
    updatePlayerList();
    return true;
}

function showPlayerInput() { setActiveSection('playerInput'); updateInputMode(); }

function updateInputMode() {
    const manualToggle = document.getElementById("manualEntryToggle");
    configState.manualEntry = manualToggle.checked;
    document.getElementById("manualInputContainer").style.display = configState.manualEntry ? "block" : "none";
    document.getElementById("autoInputContainer").style.display = configState.manualEntry ? "none" : "block";
    updatePlayerList();
}

function addPlayer() {
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some(p => p.name === name)) {
        players.push({ name, points: 0, coins: 10, inventory: [] });
        updatePlayerList();
        document.getElementById("playerName").value = "";
        saveGameState();
    }
}

function updatePlayerList() {
    let list = document.getElementById("playerList");
    if(!list) return;
    list.innerHTML = "";
    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");
        item.innerHTML = `
            <div style="flex: 1">
                <div class="player-name">${p.name}</div>
                <div class="player-stats">
                    <span><i class="fas fa-trophy"></i> ${p.points}</span>
                    <span style="margin-left:10px"><i class="fas fa-coins"></i> ${p.coins}</span>
                </div>
            </div>
            <button class="remove-btn" onclick="players.splice(${index}, 1); updatePlayerList(); saveGameState();"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(item);
    });
}

function startGame() {
    if (players.length < 3 && configState.manualEntry) { alert("მინიმუმ 3 მოთამაშე!"); return; }
    
    // კატეგორიიდან სიტყვის არჩევა
    const cat = configState.selectedCategories[0] || "mix";
    chosenWord = wordData[cat][Math.floor(Math.random() * wordData[cat].length)];
    
    roles = Array(players.length).fill("Civilian");
    let indices = [...Array(players.length).keys()].sort(() => Math.random() - 0.5);
    
    let spyCount = parseInt(document.getElementById("spyCount").value);
    for(let i=0; i<spyCount; i++) roles[indices.pop()] = "Spy";
    
    isDetectiveMode = parseInt(document.getElementById("detectiveCount").value) > 0;
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
    
    if (role === "Spy") cardBack.innerHTML = '<div class="role-text spy-text">ჯაშუში</div>';
    else if (role === "Detective") cardBack.innerHTML = '<div class="role-text detektivi">დეტექტივი</div>';
    else cardBack.innerHTML = `<div class="role-text">სიტყვა: <span class="sityva">${chosenWord}</span></div>`;
    
    document.getElementById("nextPlayerBtn").style.display = "block";
}

function nextPlayer() {
    currentIndex++;
    if (currentIndex < players.length) updateTurnDisplay();
    else { setActiveSection('gameSection'); startTimer(); }
}

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
    select.innerHTML = '<option value="" disabled selected>ვინ არის ჯაშუში?</option>';
    players.forEach((p, i) => select.innerHTML += `<option value="${i}">${p.name}</option>`);
}

// --- ქულების დარიცხვის ლოგიკა ---
function handleDetectiveGuess(guessIndex) {
    const spyFound = roles[guessIndex] === "Spy";
    players.forEach((p, i) => {
        if (spyFound) {
            if (roles[i] === "Detective") { p.points += 15; p.coins += 10; }
            if (roles[i] === "Civilian") { p.points += 5; p.coins += 5; }
        } else {
            if (roles[i] === "Spy") { p.points += 20; p.coins += 15; }
        }
    });
    document.getElementById("resultText").textContent = spyFound ? "დეტექტივმა იპოვა ჯაშუში!" : "ჯაშუშმა გაიმარჯვა!";
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    const spyFound = roles[guessIndex] === "Spy";
    players.forEach((p, i) => {
        if (spyFound) {
            if (roles[i] === "Civilian") { p.points += 10; p.coins += 5; }
        } else {
            if (roles[i] === "Spy") { p.points += 15; p.coins += 10; }
        }
    });
    document.getElementById("resultText").textContent = spyFound ? "ჯაშუში დამარცხდა!" : "ჯაშუშმა მოგატყუათ!";
    revealSpies();
}

function makePlayerGuess() {
    let idx = parseInt(document.getElementById("findSpySelect").value);
    if (isNaN(idx)) return;
    if (isDetectiveMode) handleDetectiveGuess(idx); else handleRegularGuess(idx);
}

function revealSpies() {
    let spyNames = players.filter((_,i) => roles[i]==="Spy").map(p => p.name).join(", ");
    document.getElementById("resultDisplay").innerHTML = `ჯაშუში იყო: <strong>${spyNames}</strong>`;
    document.getElementById("wordDisplay").textContent = `სიტყვა იყო: ${chosenWord}`;
    setActiveSection('resultSection');
    saveGameState();
}

function setActiveSection(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function showFinalPoints() {
    const modal = document.getElementById("finalPointsModal");
    const content = document.getElementById("finalPointsContent");
    content.innerHTML = "";
    players.sort((a,b) => b.points - a.points).forEach(p => {
        content.innerHTML += `<div class="player-score-item">${p.name}: ${p.points} ქულა (${p.coins} 🪙)</div>`;
    });
    modal.style.display = "flex";
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

function restartGame(sameConfig) {
    clearInterval(timerInterval);
    if (sameConfig) startGame(); else showPlayerInput();
}

function toggleCategory(cat) {
    const idx = configState.selectedCategories.indexOf(cat);
    if (idx > -1) configState.selectedCategories.splice(idx, 1);
    else configState.selectedCategories.push(cat);
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', configState.selectedCategories.includes(btn.dataset.category));
    });
}

// Shop Logic
function openShop() { setActiveSection('shopSection'); renderShop(); }
function renderShop() {
    const container = document.getElementById("shopItemsContainer");
    container.innerHTML = "";
    shopItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "shop-item";
        div.innerHTML = `<div>${item.icon} ${item.name} (${item.price} 🪙)</div><button onclick="buyItem('${item.id}')">ყიდვა</button>`;
        container.appendChild(div);
    });
}

function buyItem(itemId) {
    // აქ შეგიძლიათ დაამატოთ ყიდვის ლოგიკა (მაგ: players[0]-სთვის ტესტად)
    alert("ნივთი არჩეულია! (საჭიროებს მოთამაშის შერჩევას)");
}

window.onload = () => { createParticles(); showPlayerInput(); };
