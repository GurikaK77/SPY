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
let originalPlayerOrder = [];
let usedWords = [];

// --- SHOP ITEMS (განახლებული სია) ---
const shopItems = [
    // 1. იაფი / მყისიერი (Instant)
    { 
        id: 'coffee', 
        name: 'ყავა', 
        icon: '☕', 
        price: 5, 
        desc: 'ენერგიისთვის. გაძლევს +1 ქულას მყისიერად.', 
        type: 'instant', 
        effectValue: 1 
    },
    { 
        id: 'donut', 
        name: 'დონატი', 
        icon: '🍩', 
        price: 8, 
        desc: 'გემრიელია. გაძლევს +2 ქულას მყისიერად.', 
        type: 'instant', 
        effectValue: 2 
    },
    
    // 2. საშუალო / პასიური (Inventory)
    { 
        id: 'magnifier', 
        name: 'ლუპა', 
        icon: '🔍', 
        price: 15, 
        desc: 'დეტექტივის ბონუსი: თუ იპოვი ჯაშუშს, იღებ +3 ქულას.', 
        type: 'passive' 
    },
    { 
        id: 'spy_mask', 
        name: 'ჯაშუშის ნიღაბი', 
        icon: '🎭', 
        price: 20, 
        desc: 'ჯაშუშის ბონუსი: თუ მოიგებ, იღებ +3 ქულას.', 
        type: 'passive' 
    },
    { 
        id: 'shield', 
        name: 'დაცვის ამულეტი', 
        icon: '🛡️', 
        price: 25, 
        desc: 'ერთჯერადი დაცვა ქულების დაკლებისგან (ავტომატური).', 
        type: 'consumable' 
    },

    // 3. ძვირი / VIP
    { 
        id: 'bribe', 
        name: 'ქრთამი', 
        icon: '💰', 
        price: 50, 
        desc: 'მყისიერად იღებ +15 ქულას. ფულით ყველაფერი იყიდება.', 
        type: 'instant',
        effectValue: 15
    },
    { 
        id: 'crown', 
        name: 'მეფის გვირგვინი', 
        icon: '👑', 
        price: 100, 
        desc: 'სტატუსის სიმბოლო. უბრალოდ აჩვენებს რომ მდიდარი ხარ.', 
        type: 'passive' 
    }
];

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "random",
    pointsSystem: "disabled",
    selectedCategories: ["mix"]
};

// Word Data
const wordData = {
    "mix": ["ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "საიდუმლო", "ყვავილი", "წიგნი", "ჩანთა", "მთა", "საათი", "ნაყინი", "ფანარი", "წყალი", "ფანჯარა", "კატა", "კარადა", "სკამი", "ტყე", "ხე", "ცხენი"],
    "objects": ["მიკროტალღური ღუმელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "გამათბობელი", "რკინა", "ზმეიკა", "მანქანა", "ჰუდი", "კლავიატურა", "საათი", "ელექტრო ჩაიდანი", "საბუთების უჯრა", "ცეცხლმაქრი", "პლასტმასის ბორბალი", "თხევადი საპონი", "ყავის ფინჯანი", "კომპიუტერის თაგვი", "რბილი დივანი", "ციფრული კამერა", "სკამის საზურგე", "ტელევიზორის ანტენა"],
    "nature": ["ამაზონის ჯუნგლები", "იაგუარი", "შავი პანტერა", "თეთრი ღრუბელი", "ცისფერი პეპელა", "შავი ზღვა", "მწვანე ბალახი", "წყნარი ტბა", "ხის მასალა", "მზის ამოსვლა", "ზაფხულის სეზონი", "ზამთრის პერიოდი", "გაზაფხულის წვიმა", "ოქროს თევზი", "დედამიწის ღერძი", "მბზინავი ქვა"],
    "places": ["დიდი კედელი", "საფოსტო ყუთი", "სამედიცინო ცენტრი", "საფეხმავლო ბილიკი", "სპორტული დარბაზი", "გარდერობის კარი", "ქარის ტურბინა", "პოლიციის მანქანა"]
};

const categoryNames = {
    "mix": "შერეული / მარტივი",
    "objects": "ნივთები",
    "nature": "ბუნება",
    "places": "ადგილები"
};

// --- DATA PERSISTENCE ---
function saveGameState() {
    const activeSection = document.querySelector('.section.active')?.id || 'playerInput';
    const gameState = {
        players,
        roles,
        chosenWord,
        currentIndex,
        timeLeft,
        isDetectiveMode,
        isPointsEnabled,
        configState,
        activeSection,
        timestamp: Date.now()
    };
    localStorage.setItem('spyGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('spyGameState');
    if (!saved) return false;

    try {
        const state = JSON.parse(saved);
        if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('spyGameState');
            return false;
        }

        players = state.players || [];
        roles = state.roles || [];
        chosenWord = state.chosenWord || "";
        currentIndex = state.currentIndex || 0;
        timeLeft = state.timeLeft || 0;
        isDetectiveMode = state.isDetectiveMode;
        isPointsEnabled = state.isPointsEnabled;
        configState = state.configState || configState;

        updatePlayerList();
        
        if (state.activeSection === 'gameSection') {
            document.getElementById("timer").textContent = formatTime(timeLeft);
        }
        if (state.activeSection === 'roleSection') {
            updateTurnDisplay();
        }
        if (state.activeSection === 'resultSection') {
             revealSpies();
        }

        const readyScreen = document.getElementById("readyScreen");
        const mainContent = document.getElementById("mainContent");
        readyScreen.style.display = "none";
        mainContent.style.display = "block";
        mainContent.style.opacity = "1";
        
        setActiveSection(state.activeSection);
        
        document.getElementById('spyCount').value = configState.spyCount;
        document.getElementById('detectiveCount').value = configState.detectiveCount;
        document.getElementById('playerOrder').value = configState.playerOrder;
        document.getElementById('pointsSystem').value = configState.pointsSystem;

        return true;
    } catch (e) {
        console.error("Error loading game state:", e);
        return false;
    }
}

function clearGameState() {
    localStorage.removeItem('spyGameState');
}

// --- SCREEN MANAGEMENT ---
function showReadyScreen() {
    if (loadGameState()) {
        const loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.style.display = "none";
        return;
    }

    const loadingScreen = document.getElementById("loadingScreen");
    const readyScreen = document.getElementById("readyScreen");
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
        loadingScreen.style.display = "none";
        readyScreen.style.display = "flex";
        setTimeout(() => { readyScreen.style.opacity = "1"; }, 50);
    }, 500);
}

function showMainPage() {
    const readyScreen = document.getElementById("readyScreen");
    const mainContent = document.getElementById("mainContent");
    const transitionScreen = document.getElementById("transitionScreen");

    readyScreen.style.opacity = "0";
    setTimeout(() => {
        readyScreen.style.display = "none";
        transitionScreen.style.display = "flex";
        setTimeout(() => { transitionScreen.style.opacity = "1"; }, 50);

        setTimeout(() => {
            transitionScreen.style.opacity = "0";
            setTimeout(() => {
                transitionScreen.style.display = "none";
                mainContent.style.display = "block";
                setTimeout(() => {
                    mainContent.style.opacity = "1";
                    showPlayerInput();
                }, 50);
            }, 500);
        }, 1500);
    }, 500);
}

function setActiveSection(activeId) {
    const sections = ['playerInput', 'configSection', 'shopSection', 'roleSection', 'gameSection', 'findSpySection', 'resultSection'];
    const logoArea = document.getElementById('logoArea');
    const showLogo = ['playerInput', 'configSection', 'shopSection'].includes(activeId);
    
    logoArea.style.display = showLogo ? 'block' : 'none';

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === activeId) {
            section.style.display = "block";
            section.classList.add("active");
        } else {
            section.style.display = "none";
            section.classList.remove("active");
        }
    });

    if(players.length > 0) saveGameState();
}

function showPlayerInput() {
    setActiveSection('playerInput');
    updatePlayerList();
    loadConfigFromUI();
}

function showConfig() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";
    Object.keys(wordData).forEach(key => {
        const div = document.createElement("div");
        div.classList.add("category-option");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = key;
        checkbox.id = `cat_${key}`;
        if (configState.selectedCategories.includes(key)) { checkbox.checked = true; }
        const label = document.createElement("label");
        label.htmlFor = `cat_${key}`;
        label.textContent = categoryNames[key];
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
    document.getElementById('spyCount').value = configState.spyCount;
    document.getElementById('detectiveCount').value = configState.detectiveCount;
    document.getElementById('playerOrder').value = configState.playerOrder;
    document.getElementById('pointsSystem').value = configState.pointsSystem;
    setActiveSection('configSection');
}

function saveConfig() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.pointsSystem = document.getElementById("pointsSystem").value;
    const checkboxes = document.querySelectorAll("#categoriesContainer input[type='checkbox']");
    const selected = [];
    checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
    
    if (selected.length === 0) { alert("აირჩიეთ მინიმუმ ერთი კატეგორია!"); return; }
    
    configState.selectedCategories = selected;
    alert("კონფიგურაცია შენახულია!");
    saveGameState();
    showPlayerInput();
}

// --- SHOP LOGIC (განახლებული) ---
function showShop() {
    setActiveSection('shopSection');
    const select = document.getElementById("shopPlayerSelect");
    select.innerHTML = "";
    if (players.length === 0) {
        let opt = document.createElement("option");
        opt.textContent = "ჯერ დაამატეთ მოთამაშეები";
        select.appendChild(opt);
        document.getElementById("shopItemsGrid").innerHTML = "";
        return;
    }
    players.forEach((p, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.textContent = p.name;
        select.appendChild(opt);
    });
    renderShopItems();
}

function renderShopItems() {
    const playerIndex = document.getElementById("shopPlayerSelect").value;
    const player = players[playerIndex];
    const grid = document.getElementById("shopItemsGrid");
    
    if (!player) return;

    document.getElementById("shopBalance").textContent = player.coins;
    grid.innerHTML = "";

    shopItems.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("shop-item-card");
        
        card.onclick = function() { this.classList.toggle('show-desc'); };
        
        const ownsItem = player.inventory.some(i => i.id === item.id);
        
        // ლოგიკა: instant ტიპის ნივთების (ყავა, ქრთამი) ყიდვა სულ შეიძლება
        let canBuy = false;
        if (item.type === 'instant') {
            canBuy = player.coins >= item.price;
        } else {
            canBuy = player.coins >= item.price && !ownsItem;
        }
        
        let btnText = 'ყიდვა';
        if (item.type !== 'instant' && ownsItem) {
            btnText = 'ნაყიდია';
        } else if (player.coins < item.price) {
            btnText = 'არასაკმარისი ქოინი';
        }
        
        card.innerHTML = `
            <div class="shop-info-icon"><i class="fas fa-info"></i></div>
            <div class="shop-item-desc-overlay">${item.desc}</div>
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-title">${item.name}</div>
            <div class="shop-item-price">${item.price} <i class="fas fa-coins coin-gold"></i></div>
            <button class="btn btn-buy" ${canBuy ? '' : 'disabled'} onclick="event.stopPropagation(); buyItem('${item.id}', ${playerIndex})">
                ${btnText}
            </button>
        `;
        grid.appendChild(card);
    });
}

function buyItem(itemId, playerIndex) {
    const player = players[playerIndex];
    const item = shopItems.find(i => i.id === itemId);
    
    if (player.coins >= item.price) {
        player.coins -= item.price;
        
        // თუ მყისიერია (მაგ: ყავა), პირდაპირ ქულას ვუმატებთ
        if (item.type === 'instant') {
            player.points += item.effectValue;
            alert(`${player.name}-მა მიიღო +${item.effectValue} ქულა!`);
        } else {
            player.inventory.push(item);
        }
        
        if (navigator.vibrate) navigator.vibrate(50);
        renderShopItems();
        saveGameState();
    }
}

// --- GAME LOGIC (სტანდარტული) ---
function loadConfigFromUI() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.pointsSystem = document.getElementById("pointsSystem").value;
}

function addPlayer() {
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some((p) => p.name === name)) {
        players.push({ name: name, points: 0, coins: 0, inventory: [] });
        updatePlayerList();
        document.getElementById("playerName").value = "";
        saveGameState();
    } else if (players.some((p) => p.name === name)) {
        alert("მოთამაშე ამ სახელით უკვე დამატებულია!");
    }
}

function updatePlayerList() {
    let list = document.getElementById("playerList");
    if(!list) return;
    list.innerHTML = "";
    if (players.length === 0) { list.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-muted);">მოთამაშეები არ არიან</div>'; return; }
    const currentPointsEnabled = configState.pointsSystem === "enabled";

    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");
        let playerInfo = document.createElement("div");
        playerInfo.style.flex = "1";
        let nameDiv = document.createElement("div");
        nameDiv.classList.add("player-name");
        nameDiv.textContent = p.name;
        playerInfo.appendChild(nameDiv);

        if (currentPointsEnabled) {
            let statsDiv = document.createElement("div");
            statsDiv.classList.add("player-stats");
            statsDiv.innerHTML = `<div class="stat-points"><i class="fas fa-trophy"></i> ${p.points}</div><div class="stat-coins"><i class="fas fa-coins"></i> ${p.coins}</div>`;
            if (p.inventory && p.inventory.length > 0) {
                p.inventory.forEach(invItem => {
                    let iconSpan = document.createElement("span");
                    iconSpan.classList.add("inventory-icon");
                    iconSpan.textContent = invItem.icon;
                    statsDiv.appendChild(iconSpan);
                });
            }
            playerInfo.appendChild(statsDiv);
        }
        let removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-btn");
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = function () { players.splice(index, 1); updatePlayerList(); saveGameState(); };
        item.appendChild(playerInfo);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

function getRandomWord() {
    let pool = [];
    configState.selectedCategories.forEach(cat => { if (wordData[cat]) pool = pool.concat(wordData[cat]); });
    if (pool.length === 0) pool = wordData['mix'];
    const availableWords = pool.filter(word => !usedWords.includes(word));
    let word;
    if (availableWords.length === 0) { usedWords = []; word = pool[Math.floor(Math.random() * pool.length)]; } 
    else { word = availableWords[Math.floor(Math.random() * availableWords.length)]; }
    usedWords.push(word);
    return word;
}

function startGame() {
    if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე უნდა იყოს!"); return; }
    let spyCount = configState.spyCount;
    let detectiveCount = configState.detectiveCount;
    isDetectiveMode = detectiveCount > 0;
    isPointsEnabled = configState.pointsSystem === "enabled";
    
    if (spyCount + detectiveCount >= players.length) { alert("ჯაშუშების და დეტექტივების რაოდენობა უნდა იყოს ნაკლები მოთამაშეების რაოდენობაზე!"); return; }
    chosenWord = getRandomWord();
    roles = Array(players.length).fill("Civilian");

    if (configState.playerOrder === "random") { players.sort(() => Math.random() - 0.5); }

    let indices = [...Array(players.length).keys()];
    let spyIndices = [];
    
    for (let i = 0; i < spyCount; i++) {
        let availableIndices = indices.filter(idx => !spyIndices.includes(idx));
        let randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        spyIndices.push(randomIndex);
        roles[randomIndex] = "Spy";
    }
    if (isDetectiveMode) {
        let availableIndices = indices.filter(idx => !spyIndices.includes(idx));
        for (let i = 0; i < detectiveCount; i++) {
            if (availableIndices.length > 0) {
                let randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                roles[randomIndex] = "Detective";
                availableIndices = availableIndices.filter(idx => idx !== randomIndex);
            }
        }
    }
    if (isPointsEnabled) { document.getElementById("showPointsBtn").style.display = "inline-flex"; } 
    else { document.getElementById("showPointsBtn").style.display = "none"; }

    currentIndex = 0;
    setActiveSection('roleSection');
    updateTurnDisplay();
    saveGameState();
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").textContent = `${players[currentIndex].name}`;
    document.getElementById("currentPlayer").textContent = `${currentIndex + 1} / ${players.length}`;
    const roleCard = document.getElementById("roleCard");
    roleCard.classList.remove("flipped");
    document.getElementById("nextPlayerBtn").style.display = "none";
    document.getElementById("roleCardFront").innerHTML = `<div class="role-icon"><i class="fas fa-fingerprint"></i></div><div class="role-text" style="font-size:1rem; margin-top:10px">დააჭირე როლის სანახავად</div>`;
}

function revealRole() {
    const roleCard = document.getElementById("roleCard");
    const role = roles[currentIndex];
    if (navigator.vibrate) { if (role === "Spy") navigator.vibrate([100, 50, 100, 50, 500]); else navigator.vibrate(50); }
    roleCard.classList.add("flipped");
    const roleCardBack = document.getElementById("roleCardBack");
    if (role === "Spy") {
        roleCardBack.innerHTML = `<div class="role-icon"><i class="fas fa-user-secret"></i></div><div class="role-text spy-text">ჯაშუში</div>`;
    } else if (role === "Detective") {
        roleCardBack.innerHTML = `<div class="role-icon"><i class="fas fa-search"></i></div><div class="role-text detektivi">დეტექტივი</div><div style="margin-top: 10px; font-size: 0.9rem; color:#aaa">იპოვე ჯაშუში!</div>`;
    } else {
        roleCardBack.innerHTML = `<div class="role-icon"><i class="fas fa-user"></i></div><div class="role-text">სიტყვა: <span class="sityva">${chosenWord}</span></div>`;
    }
    document.getElementById("nextPlayerBtn").style.display = "block";
}

function nextPlayer() {
    currentIndex++;
    if (currentIndex < players.length) { updateTurnDisplay(); saveGameState(); } 
    else {
        setActiveSection('gameSection');
        if (isPointsEnabled) { document.getElementById("pointsDisplay").style.display = "block"; updatePointsDisplay(); } 
        else { document.getElementById("pointsDisplay").style.display = "none"; }
        document.getElementById("startTimerBtn").style.display = "block";
        saveGameState();
    }
}

function startTimer() {
    document.getElementById("startTimerBtn").style.display = "none";
    timeLeft = 120;
    updateTimerDisplay(timeLeft);
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) { clearInterval(timerInterval); showTimerEndSignal(); }
        if(timeLeft % 5 === 0) saveGameState(); 
    }, 1000);
}

function formatTime(time) {
    let minutes = String(Math.floor(time / 60)).padStart(2, "0");
    let seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}
function updateTimerDisplay(time) { document.getElementById("timer").textContent = formatTime(time); }

function showTimerEndSignal() {
    const signal = document.getElementById("timerEndSignal");
    signal.style.display = "flex";
    const alarmSound = document.getElementById("alarmSound");
    if (alarmSound) alarmSound.play().catch(e => console.log("Audio play failed"));
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    setTimeout(() => { signal.style.display = "none"; showFindSpySection(); }, 3000);
}

function updatePointsDisplay() {
    let pointsHtml = "";
    players.forEach((p) => {
        let itemsHtml = p.inventory ? p.inventory.map(i => i.icon).join('') : '';
        pointsHtml += `<span>${p.name}: ${p.points} ${itemsHtml}</span> | `;
    });
    document.getElementById("pointsDisplay").innerHTML = pointsHtml.slice(0, -2);
}

function endGame() { clearInterval(timerInterval); showFindSpySection(); }

function showFindSpySection() {
    setActiveSection('findSpySection'); saveGameState();
    let select = document.getElementById("findSpySelect"); select.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.value = ""; defaultOption.textContent = "აირჩიეთ"; defaultOption.selected = true; defaultOption.disabled = true;
    select.appendChild(defaultOption);
    
    if (isDetectiveMode) {
        let detectives = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Detective");
        if (detectives.length > 0) {
            document.getElementById("findSpySelect").innerHTML = `<option value="" selected disabled>აირჩიეთ ჯაშუში</option>${players.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}`;
            let detectiveNames = detectives.map(d => players[d.index].name).join(", ");
            document.querySelector("#findSpySection .result-title").textContent = "დეტექტივი, ეძებე ჯაშუში!";
            document.querySelector("#findSpySection p").innerHTML = `<strong>${detectiveNames}</strong> - დეტექტივმა აირჩიოს ჯაშუში:`;
        }
    } else {
        players.forEach((p, i) => { let option = document.createElement("option"); option.value = i; option.textContent = p.name; select.appendChild(option); });
        document.querySelector("#findSpySection .result-title").textContent = "მოთამაშეები ეძებენ ჯაშუშს";
        document.querySelector("#findSpySection p").textContent = "ვინ არის ჯაშუში?";
    }
}

function makePlayerGuess() {
    let guessIndex = parseInt(document.getElementById("findSpySelect").value);
    if (isNaN(guessIndex)) {
        document.getElementById("resultText").textContent = "გამარჯვებული არ გამოვლენილა!";
        document.getElementById("itemEffectText").textContent = "";
        revealSpies();
        return;
    }
    if (isDetectiveMode) handleDetectiveGuess(guessIndex); else handleRegularGuess(guessIndex);
}

function adjustPoints(playerIndex, amount, reason) {
    let player = players[playerIndex];
    let actualAmount = amount;
    let effectMsg = "";
    if (amount < 0) {
        const shieldIndex = player.inventory.findIndex(i => i.id === 'shield');
        if (shieldIndex !== -1) { actualAmount = 0; player.inventory.splice(shieldIndex, 1); effectMsg = `${player.name}-მა გამოიყენა დაცვის ამულეტი! `; }
    } else if (amount > 0) {
        if (roles[playerIndex] === "Spy") {
             const maskIndex = player.inventory.findIndex(i => i.id === 'spy_mask');
             if (maskIndex !== -1) { actualAmount += 2; effectMsg = `${player.name}-მა გამოიყენა ჯაშუშის ნიღაბი (+2)! `; }
        }
        if (roles[playerIndex] === "Detective") {
             const magIndex = player.inventory.findIndex(i => i.id === 'magnifier');
             if (magIndex !== -1) { actualAmount += 3; effectMsg = `${player.name}-მა გამოიყენა ლუპა (+3)! `; }
        }
    }
    player.points += actualAmount;
    if (actualAmount > 0) player.coins += actualAmount;
    return effectMsg;
}

function handleDetectiveGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let detectives = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Detective");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = ""; let effectsText = "";

    if (isPointsEnabled) {
        if (isGuessCorrect) {
            detectives.forEach(det => { effectsText += adjustPoints(det.index, 4, "win"); });
            spies.forEach(spy => { effectsText += adjustPoints(spy.index, -1, "loss"); });
            resultText = "დეტექტივმა მოიგო! სწორად იპოვეთ ჯაშუში!";
        } else {
            detectives.forEach(det => { effectsText += adjustPoints(det.index, -1, "loss"); });
            spies.forEach(spy => { effectsText += adjustPoints(spy.index, 3, "win"); });
            resultText = "ჯაშუშებმა მოიგეს! დეტექტივმა ვერ იპოვა ჯაშუში.";
        }
    } else { resultText = isGuessCorrect ? "დეტექტივმა მოიგო!" : "ჯაშუშებმა მოიგეს!"; }
    document.getElementById("resultText").textContent = resultText;
    document.getElementById("itemEffectText").textContent = effectsText;
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = ""; let effectsText = "";
    if (isPointsEnabled) {
        if (isGuessCorrect) {
            spies.forEach(spy => { effectsText += adjustPoints(spy.index, -1, "loss"); });
            resultText = "მოქალაქეებმა მოიგეს! ჯაშუში ნაპოვნია!";
        } else {
            spies.forEach(spy => { effectsText += adjustPoints(spy.index, 3, "win"); });
            resultText = "ჯაშუშმა მოიგო! ვერ იპოვეთ ჯაშუში.";
        }
    } else { resultText = isGuessCorrect ? "წააგო ჯაშუშმა" : "მოიგო ჯაშუშმა!"; }
    document.getElementById("resultText").textContent = resultText;
    document.getElementById("itemEffectText").textContent = effectsText;
    revealSpies();
}

function revealSpies() {
    let spies = roles.map((r, i) => (r === "Spy" ? players[i].name : null)).filter(Boolean);
    let detectives = roles.map((r, i) => (r === "Detective" ? players[i].name : null)).filter(Boolean);
    let spiesText = spies.join(", ");
    let detectiveText = detectives.length > 0 ? ` (დეტექტივები: ${detectives.join(", ")})` : "";

    const resultDisplay = document.getElementById("resultDisplay");
    resultDisplay.innerHTML = `
        <div class="spy-reveal-container">
            <div class="spy-label">ჯაშუში არის</div>
            <div class="spy-name-big">${spiesText}</div>
        </div>
        ${detectives.length > 0 ? `<div style="margin-top:20px; color:#aaa">${detectiveText}</div>` : ''}
    `;
    document.getElementById("wordDisplay").textContent = `საიდუმლო სიტყვა: ${chosenWord}`;
    setActiveSection('resultSection');
    saveGameState(); 
}

function showFinalPoints() {
    if (!isPointsEnabled) return;
    let modal = document.getElementById("finalPointsModal");
    let content = document.getElementById("finalPointsContent");
    content.innerHTML = "";
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    sortedPlayers.forEach((p) => {
        let item = document.createElement("div");
        item.classList.add("player-score-item");
        let invIcons = p.inventory ? p.inventory.map(i => i.icon).join(' ') : '';
        item.innerHTML = `<span class="name">${p.name} ${invIcons}:</span> <div><span style="margin-right:10px; color:var(--neon-blue)">${p.points} ქულა</span><span style="color:var(--gold)">${p.coins} <i class="fas fa-coins"></i></span></div>`;
        content.appendChild(item);
    });
    modal.style.display = "flex";
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

function restartGame(sameConfig) {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "02:00";
    clearGameState();
    if (sameConfig) {
        if (configState.playerOrder === "sequential" && players.length > 0) {
            let firstPlayer = players.shift(); players.push(firstPlayer);
        }
        startGame();
    } else { showPlayerInput(); saveGameState(); }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(r => console.log('SW Reg')).catch(e => console.log('SW Fail', e));
    });
}

// --- WAKE LOCK (ეკრანის არ ჩაქრობა) ---
function preventScreenOff() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        const requestWakeLock = async () => { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} };
        requestWakeLock();
        document.addEventListener('visibilitychange', async () => { if (document.visibilityState === 'visible' && wakeLock === null) { requestWakeLock(); } });
    }
}

window.onload = function () { 
    createParticles(); 
    loadGameState(); // აღვადგენთ სეივს
    preventScreenOff(); // ვრთავთ ეკრანის დაცვას
    setTimeout(showReadyScreen, 1000); 
};

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
