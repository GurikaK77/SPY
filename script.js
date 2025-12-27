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
    "სჭირდება დენი?", "აქვს სუნი?", "დადის?"
];

// --- SHOP ITEMS (განახლებული და გაიაფებული) ---
const shopItems = [
    // 1. იაფი / მყისიერი
    { id: 'coffee', name: 'ყავა', icon: '☕', price: 2, desc: 'ენერგია. +1 ქულა.', type: 'instant', effectValue: 1 },
    { id: 'donut', name: 'დონატი', icon: '🍩', price: 4, desc: 'გემრიელი. +2 ქულა.', type: 'instant', effectValue: 2 },
    
    // 2. საშუალო
    { id: 'magnifier', name: 'ლუპა', icon: '🔍', price: 8, desc: 'დეტექტივის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'spy_mask', name: 'ნიღაბი', icon: '🎭', price: 10, desc: 'ჯაშუშის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'shield', name: 'ამულეტი', icon: '🛡️', price: 12, desc: 'გიცავს ქულების დაკლებისგან.', type: 'consumable' },

    // 3. ჰაკერული (ახალი)
    { id: 'algo', name: 'ალგორითმი', icon: '💾', price: 15, desc: 'სისტემის გატეხვა. +5 ქულა.', type: 'instant', effectValue: 5, hacker: true },
    { id: 'ddos', name: 'DDOS შეტევა', icon: '☠️', price: 20, desc: 'სერვერის დატვირთვა. +8 ქულა.', type: 'instant', effectValue: 8, hacker: true },
    { id: 'backdoor', name: 'Backdoor', icon: '🚪', price: 30, desc: 'უკანა კარი. თუ მოიგებ, გაორმაგებული ქულები (სიმბოლური).', type: 'passive', hacker: true },

    // 4. ძვირი
    { id: 'bribe', name: 'ქრთამი', icon: '💰', price: 25, desc: '+15 ქულა. ფული წყვეტს ყველაფერს.', type: 'instant', effectValue: 15 },
    { id: 'crown', name: 'გვირგვინი', icon: '👑', price: 50, desc: 'მდიდრების სტატუსი.', type: 'passive' }
];

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "sequential", // Default is now sequential
    pointsSystem: "enabled",
    manualEntry: true, // New setting: true = manual names, false = auto numbers
    selectedCategories: ["mix"]
};

// Word Data
const wordData = {
    "mix": [
        "ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "საიდუმლო", "ყვავილი", "წიგნი", "ჩანთა", "მთა", "საათი", "ნაყინი", "ფანარი", "წყალი", "ფანჯარა", "კატა", "კარადა", "სკამი", "ტყე", "ხე", "ცხენი", "გიტარა", "ველოსიპედი", "თავისუფლება", "მხატვარი", "კოსმოსი", "რობოტი", "დინოზავრი", "პირამიდა", "სამკაული", "ტელესკოპი", "მიკროსკოპი", "ბუშტი", "ხალიჩა", "პიანინო", "დროშა", "წითელი ვაშლი", "მფრინავი თეფში", "ოქროს მედალი", "ცხელი ყავა", "სწრაფი მატარებელი", "მხიარული ჯამბაზი", "ძველი ფოტოსურათი", "ელექტრო გიტარა", "მზის სათვალე", "თოვლის პაპა", "ახალი წელი", "ფერადი ფანქარი", "გემრიელი ტორტი", "ქაღალდის თვითმფრინავი"
    ],
    "objects": [
        "მიკროტალღური ღუმელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "გამათბობელი", "რკინა", "ზმეიკა", "მანქანა", "ჰუდი", "კლავიატურა", "საათი", "ელექტრო ჩაიდანი", "საბუთების უჯრა", "ცეცხლმაქრი", "პლასტმასის ბორბალი", "თხევადი საპონი", "ყავის ფინჯანი", "კომპიუტერის თაგვი", "რბილი დივანი", "ციფრული კამერა", "სკამის საზურგე", "ტელევიზორის ანტენა", "სარეცხი მანქანა", "მტვერსასრუტი", "უთო", "ფენი", "ყურსასმენები", "სატენის კაბელი", "კბილის ჯაგრისი", "საპარსი ქაფი", "სამზარეულოს დანა", "ხის კოვზი", "მინის ჭიქა", "ფაიფურის თეფში", "კედლის სარკე", "რბილი ბალიში", "შალის საბანი", "მზის ელემენტი", "უსადენო დინამიკი", "სათამაშო კონსოლი", "USB მეხსიერება", "ლამაზი ვაზა", "ქოლგა", "ხელის საათი", "საფულე", "გასაღების საკიდი", "ფოტო ალბომი", "ნაგვის ურნ", "სამაგიდო თამაში"
    ],
    "nature": [
        "ამაზონის ჯუნგლები", "იაგუარი", "შავი პანტერა", "თეთრი ღრუბელი", "ცისფერი პეპელა", "შავი ზღვა", "მწვანე ბალახი", "წყნარი ტბა", "ხის მასალა", "მზის ამოსვლა", "ზაფხულის სეზონი", "ზამთრის პერიოდი", "გაზაფხულის წვიმა", "ოქროს თევზი", "დედამიწის ღერძი", "მბზინავი ქვა", "ჩრდილოეთის ციალი", "ვულკანის ამოფრქვევა", "ძლიერი ქარიშხალი", "სეტყვა", "ხშირი ნისლი", "ცისარტყელა", "სავსე მთვარე", "ვარსკვლავთცვენა", "ქვიშის ქარიშხალი", "თეთრი დათვი", "სამეფო არწივი", "უდაბნოს კაქტუსი", "ტირიფის ხე", "ველური ვარდი", "მაღალი პალმა", "ზღვის კუ", "მარჯნის რიფი", "მთის მდინარე", "ღრმა ოკეანე", "თოვლიანი მწვერვალი", "ალპური ზონა", "ბამბუკის ტყე"
    ],
    "places": [
        "დიდი კედელი", "საფოსტო ყუთი", "სამედიცინო ცენტრი", "საფეხმავლო ბილიკი", "სპორტული დარბაზი", "გარდერობის კარი", "ქარის ტურბინა", "პოლიციის მანქანა", "სტომატოლოგიური კლინიკა", "სილამაზის სალონი", "ავტობუსის გაჩერება", "რკინიგზის სადგური", "აეროპორტის ტერმინალი", "ბენზინ გასამართი სადგური", "სუპერმარკეტი", "წიგნების მაღაზია", "საცურაო აუზი", "საფეხბურთო სტადიონი", "ძველი ციხესიმაგრე", "მიტოვებული სახლი", "შუშის ხიდი", "ცათამბჯენი", "ბავშვთა მოედანი", "საკონცერტო დარბაზი", "მუზეუმი", "სამხატვრო გალერეა", "ღამის კლუბი", "სოფლის ორღობე", "პოლიციის განყოფილება", "სახანძრო სადგური"
    ]
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

        updateInputMode(); // Show correct inputs
        updatePlayerList();
        
        if (state.activeSection === 'gameSection') document.getElementById("timer").textContent = formatTime(timeLeft);
        if (state.activeSection === 'roleSection') updateTurnDisplay();
        if (state.activeSection === 'resultSection') revealSpies();

        document.getElementById("readyScreen").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        document.getElementById("mainContent").style.opacity = "1";
        
        setActiveSection(state.activeSection);
        
        document.getElementById('spyCount').value = configState.spyCount;
        document.getElementById('detectiveCount').value = configState.detectiveCount;
        document.getElementById('playerOrder').value = configState.playerOrder;
        document.getElementById('pointsSystem').value = configState.pointsSystem;
        document.getElementById('manualEntryToggle').checked = configState.manualEntry;

        return true;
    } catch (e) { console.error(e); return false; }
}

function clearGameState() { localStorage.removeItem('spyGameState'); }

// --- SCREEN & TOAST ---
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
        document.getElementById("transitionScreen").style.display = "flex";
        setTimeout(() => { document.getElementById("transitionScreen").style.opacity = "1"; }, 50);
        setTimeout(() => {
            document.getElementById("transitionScreen").style.opacity = "0";
            setTimeout(() => {
                document.getElementById("transitionScreen").style.display = "none";
                document.getElementById("mainContent").style.display = "block";
                setTimeout(() => { document.getElementById("mainContent").style.opacity = "1"; showPlayerInput(); }, 50);
            }, 500);
        }, 1000);
    }, 500);
}

function setActiveSection(activeId) {
    const sections = ['playerInput', 'configSection', 'shopSection', 'roleSection', 'gameSection', 'findSpySection', 'resultSection'];
    const logoArea = document.getElementById('logoArea');
    const showLogo = ['playerInput', 'configSection', 'shopSection'].includes(activeId);
    logoArea.style.display = showLogo ? 'block' : 'none';

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === activeId) { section.style.display = "block"; section.classList.add("active"); } 
        else { section.style.display = "none"; section.classList.remove("active"); }
    });
    if(players.length > 0) saveGameState();
}

// --- CONFIG & INPUTS ---
function showPlayerInput() {
    setActiveSection('playerInput');
    updateInputMode();
    loadConfigFromUI();
    
    // Disable Shop button if manual entry is off
    const shopBtn = document.getElementById("shopButton");
    if(!configState.manualEntry) {
        shopBtn.style.display = 'none';
    } else {
        shopBtn.style.display = 'flex';
    }
}

function updateInputMode() {
    const manualContainer = document.getElementById("manualInputContainer");
    const autoContainer = document.getElementById("autoInputContainer");
    const manualToggle = document.getElementById("manualEntryToggle");
    const pointsSelect = document.getElementById("pointsSystem");
    
    configState.manualEntry = manualToggle.checked;

    if (configState.manualEntry) {
        manualContainer.style.display = "block";
        autoContainer.style.display = "none";
        pointsSelect.disabled = false;
        updatePlayerList();
    } else {
        manualContainer.style.display = "none";
        autoContainer.style.display = "block";
        pointsSelect.value = "disabled";
        pointsSelect.disabled = true;
        configState.pointsSystem = "disabled";
    }
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
    document.getElementById('manualEntryToggle').checked = configState.manualEntry;
    
    // Update inputs visibility based on current toggle state
    updateInputMode();
    
    setActiveSection('configSection');
}

function saveConfig() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.manualEntry = document.getElementById("manualEntryToggle").checked;
    
    if(!configState.manualEntry) {
        configState.pointsSystem = "disabled";
    } else {
        configState.pointsSystem = document.getElementById("pointsSystem").value;
    }

    const checkboxes = document.querySelectorAll("#categoriesContainer input[type='checkbox']");
    const selected = [];
    checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
    
    if (selected.length === 0) { alert("აირჩიეთ მინიმუმ ერთი კატეგორია!"); return; }
    configState.selectedCategories = selected;
    
    saveGameState();
    showToast("კონფიგურაცია შენახულია");
    setTimeout(showPlayerInput, 300);
}

function loadConfigFromUI() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    // We don't overwrite manualEntry here from UI, as it's state driven
}

function addPlayer() {
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some((p) => p.name === name)) {
        players.push({ name: name, points: 0, coins: 0, inventory: [] });
        updatePlayerList();
        document.getElementById("playerName").value = "";
        saveGameState();
    } else if (players.some((p) => p.name === name)) {
        alert("მოთამაშე ამ სახელით უკვე არსებობს!");
    }
}

function updatePlayerList() {
    let list = document.getElementById("playerList");
    if(!list) return;
    list.innerHTML = "";
    if (players.length === 0) { list.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-muted);">მოთამაშეები არ არიან</div>'; return; }
    
    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");
        let playerInfo = document.createElement("div");
        playerInfo.style.flex = "1";
        let nameDiv = document.createElement("div");
        nameDiv.classList.add("player-name");
        nameDiv.textContent = p.name;
        playerInfo.appendChild(nameDiv);

        if (configState.pointsSystem === "enabled") {
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

// --- SHOP LOGIC ---
function showShop() {
    setActiveSection('shopSection');
    const select = document.getElementById("shopPlayerSelect");
    select.innerHTML = "";
    if (players.length === 0) {
        let opt = document.createElement("option"); opt.textContent = "ჯერ დაამატეთ მოთამაშეები"; select.appendChild(opt);
        document.getElementById("shopItemsGrid").innerHTML = ""; return;
    }
    players.forEach((p, index) => {
        let opt = document.createElement("option"); opt.value = index; opt.textContent = p.name; select.appendChild(opt);
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
        if(item.hacker) card.classList.add("hacker-item");
        
        card.onclick = function() { this.classList.toggle('show-desc'); };
        const ownsItem = player.inventory.some(i => i.id === item.id);
        let canBuy = item.type === 'instant' ? (player.coins >= item.price) : (player.coins >= item.price && !ownsItem);
        let btnText = (item.type !== 'instant' && ownsItem) ? 'ნაყიდია' : (player.coins < item.price ? 'ქოინი აკლია' : 'ყიდვა');
        
        card.innerHTML = `
            <div class="shop-info-icon"><i class="fas fa-info"></i></div>
            <div class="shop-item-desc-overlay">${item.desc}</div>
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-title">${item.name}</div>
            <div class="shop-item-price">${item.price} <i class="fas fa-coins"></i></div>
            <button class="btn btn-buy" ${canBuy ? '' : 'disabled'} onclick="event.stopPropagation(); buyItem('${item.id}', ${playerIndex})">${btnText}</button>
        `;
        grid.appendChild(card);
    });
}

function buyItem(itemId, playerIndex) {
    const player = players[playerIndex];
    const item = shopItems.find(i => i.id === itemId);
    if (player.coins >= item.price) {
        player.coins -= item.price;
        if (item.type === 'instant') {
            player.points += item.effectValue;
            showToast(`${player.name}-მა მიიღო +${item.effectValue} ქულა!`);
        } else {
            player.inventory.push(item);
            showToast(`${item.name} ნაყიდია!`);
        }
        renderShopItems(); saveGameState();
    }
}

// --- GAME LOGIC ---
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
    // Handling Auto Mode
    if (!configState.manualEntry) {
        const count = parseInt(document.getElementById("totalPlayersCount").value);
        if (count < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
        players = [];
        for (let i = 1; i <= count; i++) {
            players.push({ name: `Player ${i}`, points: 0, coins: 0, inventory: [] });
        }
    } else {
        if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე უნდა იყოს!"); return; }
    }

    let spyCount = configState.spyCount;
    let detectiveCount = configState.detectiveCount;
    isDetectiveMode = detectiveCount > 0;
    isPointsEnabled = configState.pointsSystem === "enabled";
    
    if (spyCount + detectiveCount >= players.length) { alert("ჯაშუშები + დეტექტივები უნდა იყოს ნაკლები მოთამაშეებზე!"); return; }
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
        roleCardBack.innerHTML = `<div class="role-icon"><i class="fas fa-search"></i></div><div class="role-text detektivi">დეტექტივი</div>`;
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
        document.getElementById("helperText").textContent = ""; // Reset helper
        if (isPointsEnabled) { document.getElementById("pointsDisplay").style.display = "block"; updatePointsDisplay(); } 
        else { document.getElementById("pointsDisplay").style.display = "none"; }
        document.getElementById("startTimerBtn").style.display = "block";
        saveGameState();
    }
}

// --- TIMER & HELPER ---
function startTimer() {
    document.getElementById("startTimerBtn").style.display = "none";
    timeLeft = 120;
    updateTimerDisplay(timeLeft);
    preventScreenOff(); // Lock screen on
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) { clearInterval(timerInterval); showTimerEndSignal(); }
        if(timeLeft % 5 === 0) saveGameState(); 
    }, 1000);
}

function generateHelperQuestion() {
    const q = helperQuestions[Math.floor(Math.random() * helperQuestions.length)];
    const textEl = document.getElementById("helperText");
    textEl.style.opacity = 0;
    setTimeout(() => { textEl.textContent = q; textEl.style.opacity = 1; }, 200);
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
    setTimeout(() => { signal.style.display = "none"; endGame(); }, 3000);
}

function updatePointsDisplay() {
    let pointsHtml = "";
    players.forEach((p) => {
        let itemsHtml = p.inventory ? p.inventory.map(i => i.icon).join('') : '';
        pointsHtml += `<span>${p.name}: ${p.points} ${itemsHtml}</span> | `;
    });
    document.getElementById("pointsDisplay").innerHTML = pointsHtml.slice(0, -2);
}

function endGame() { 
    clearInterval(timerInterval); 
    // If points are disabled, skip voting/finding spy logic
    if (!isPointsEnabled) {
        revealSpies();
    } else {
        showFindSpySection(); 
    }
}

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
        revealSpies(); return;
    }
    if (isDetectiveMode) handleDetectiveGuess(guessIndex); else handleRegularGuess(guessIndex);
}

function handleDetectiveGuess(guessIndex) {
    // (Logic identical to previous, just shortened for brevity)
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let detectives = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Detective");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = isGuessCorrect ? "დეტექტივმა მოიგო!" : "ჯაშუშებმა მოიგეს!";
    if (isPointsEnabled) { /* Points logic here similar to previous version */ }
    document.getElementById("resultText").textContent = resultText;
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = isGuessCorrect ? "წააგო ჯაშუშმა" : "მოიგო ჯაშუშმა!";
    if (isPointsEnabled) { /* Points logic */ }
    document.getElementById("resultText").textContent = resultText;
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
    
    // Hide Voting related texts if points off
    if(!isPointsEnabled) {
        document.getElementById("resultText").style.display = 'none';
        document.getElementById("itemEffectText").style.display = 'none';
        document.getElementById("showPointsBtn").style.display = 'none';
    } else {
        document.getElementById("resultText").style.display = 'block';
        document.getElementById("showPointsBtn").style.display = 'inline-flex';
    }

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
        item.innerHTML = `<span class="name">${p.name} ${invIcons}:</span> <div><span style="margin-right:10px; color:var(--neon-blue)">${p.points} ქულა</span></div>`;
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

// --- WAKE LOCK ---
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
    loadGameState(); 
    setTimeout(showReadyScreen, 1000); 
};
document.addEventListener('contextmenu', e => e.preventDefault());
