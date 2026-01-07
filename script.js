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
let currentGameMode = "normal"; // 'normal', 'blitz', 'hardcore'
let dailyChallenges = [];
let completedChallenges = [];
let gameStats = {
    totalGames: 0,
    spyWins: 0,
    civilianWins: 0,
    totalPoints: 0,
    favoriteWords: {}
};
let soundEnabled = true;

// Audio System
const audioSystem = {
    sounds: {
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
        reveal: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3'),
        timerEnd: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'),
        purchase: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3'),
        victory: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
    },
    backgroundMusic: null,
    
    playSound(soundName) {
        if (!soundEnabled) return;
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Sound play failed:", e));
        }
    },
    
    toggleSound() {
        soundEnabled = !soundEnabled;
        return soundEnabled;
    }
};

// Helper Questions Array (გაფართოებული)
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

// --- DAILY CHALLENGES ---
const CHALLENGE_TYPES = {
    SPY_WIN: 'spy_win',
    CIVILIAN_WIN: 'civilian_win',
    DETECTIVE_WIN: 'detective_win',
    USE_HELPER: 'use_helper',
    BUY_ITEM: 'buy_item',
    PLAY_GAMES: 'play_games'
};

function generateDailyChallenges() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('challengeDate');
    
    if (storedDate !== today) {
        dailyChallenges = [
            {
                id: 1,
                type: CHALLENGE_TYPES.SPY_WIN,
                description: "გაიმარჯვე როგორც ჯაშუში",
                target: 1,
                progress: 0,
                reward: { coins: 5, points: 0 },
                completed: false
            },
            {
                id: 2,
                type: CHALLENGE_TYPES.USE_HELPER,
                description: "დაუსვი დამხმარე კითხვა",
                target: 3,
                progress: 0,
                reward: { coins: 3, points: 0 },
                completed: false
            },
            {
                id: 3,
                type: CHALLENGE_TYPES.PLAY_GAMES,
                description: "ითამაშე 2 თამაში",
                target: 2,
                progress: 0,
                reward: { coins: 0, points: 10 },
                completed: false
            }
        ];
        localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges));
        localStorage.setItem('challengeDate', today);
    } else {
        const saved = localStorage.getItem('dailyChallenges');
        dailyChallenges = saved ? JSON.parse(saved) : [];
    }
}

function updateChallenge(type, amount = 1) {
    dailyChallenges.forEach(challenge => {
        if (challenge.type === type && !challenge.completed) {
            challenge.progress += amount;
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                completeChallenge(challenge);
            }
        }
    });
    localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges));
    updateChallengesDisplay();
}

function completeChallenge(challenge) {
    const playerIndex = 0; // Reward first player for now
    if (playerIndex < players.length) {
        const player = players[playerIndex];
        player.coins += challenge.reward.coins;
        player.points += challenge.reward.points;
        
        showToast(`🎉 დავალება შესრულდა! +${challenge.reward.coins} მონეტა, +${challenge.reward.points} ქულა`);
        audioSystem.playSound('victory');
    }
    saveGameState();
}

function updateChallengesDisplay() {
    const container = document.getElementById('challengesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    dailyChallenges.forEach(challenge => {
        const div = document.createElement('div');
        div.className = 'challenge-item';
        div.innerHTML = `
            <div class="challenge-text">${challenge.description}</div>
            <div class="challenge-progress">${challenge.progress}/${challenge.target}</div>
            <div class="challenge-reward">${challenge.reward.coins > 0 ? '🪙' + challenge.reward.coins : ''} 
                                         ${challenge.reward.points > 0 ? '🏆' + challenge.reward.points : ''}</div>
            ${challenge.completed ? '<div class="challenge-completed">✓</div>' : ''}
        `;
        container.appendChild(div);
    });
}

// --- GAME MODES ---
const GAME_MODES = {
    normal: { name: "ნორმალური", time: 120, spies: 1, detectives: 0, pointsMultiplier: 1 },
    blitz: { name: "ბლიცი", time: 60, spies: 2, detectives: 0, pointsMultiplier: 1.5 },
    hardcore: { name: "რთული", time: 180, spies: 1, detectives: 1, pointsMultiplier: 2 }
};

// --- SHOP ITEMS (გაფართოებული) ---
const shopItems = [
    // 1. იაფი / მყისიერი
    { id: 'coffee', name: 'ყავა', icon: '☕', price: 2, desc: 'ენერგია. +1 ქულა.', type: 'instant', effectValue: 1 },
    { id: 'donut', name: 'დონატი', icon: '🍩', price: 4, desc: 'გემრიელი. +2 ქულა.', type: 'instant', effectValue: 2 },
    
    // 2. საშუალო
    { id: 'magnifier', name: 'ლუპა', icon: '🔍', price: 8, desc: 'დეტექტივის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'spy_mask', name: 'ნიღაბი', icon: '🎭', price: 10, desc: 'ჯაშუშის ბონუსი: +3 ქულა მოგებაზე.', type: 'passive' },
    { id: 'shield', name: 'ამულეტი', icon: '🛡️', price: 12, desc: 'გიცავს ქულების დაკლებისგან.', type: 'consumable' },

    // 3. ჰაკერული
    { id: 'algo', name: 'ალგორითმი', icon: '💾', price: 15, desc: 'სისტემის გატეხვა. +5 ქულა.', type: 'instant', effectValue: 5, hacker: true },
    { id: 'ddos', name: 'DDOS შეტევა', icon: '☠️', price: 20, desc: 'სერვერის დატვირთვა. +8 ქულა.', type: 'instant', effectValue: 8, hacker: true },
    { id: 'backdoor', name: 'Backdoor', icon: '🚪', price: 30, desc: 'უკანა კარი. თუ მოიგებ, გაორმაგებული ქულები.', type: 'passive', hacker: true },

    // 4. ძვირი
    { id: 'bribe', name: 'ქრთამი', icon: '💰', price: 25, desc: '+15 ქულა. ფული წყვეტს ყველაფერს.', type: 'instant', effectValue: 15 },
    
    // 5. კოსმეტიკური
    { id: 'golden_frame', name: 'ოქროს ჩარჩო', icon: '🖼️', price: 30, desc: 'ოქროს ჩარჩო პროფილისთვის.', type: 'cosmetic' },
    { id: 'rainbow_name', name: 'ცისარტყელა სახელი', icon: '🌈', price: 25, desc: 'ფერადი სახელი თამაშში.', type: 'cosmetic' },
    { id: 'sparkle_effect', name: 'ბზინვარე ეფექტი', icon: '✨', price: 35, desc: 'ბზინვარე ეფექტი ქულების დამატებისას.', type: 'cosmetic' },
    
    // 6. გეიმფლეი
    { id: 'time_plus', name: 'დროის დამატება', icon: '⏱️', price: 20, desc: '+30 წამი დროის.', type: 'consumable' },
    { id: 'extra_hint', name: 'დამატებითი მინიშნება', icon: '💡', price: 15, desc: 'გამოიყენე დამატებითი მინიშნება.', type: 'consumable' }
];

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "sequential", 
    pointsSystem: "enabled",
    manualEntry: true, 
    selectedCategories: ["mix"],
    gameMode: "normal"
};

// Word Data (გაფართოებული)
const wordData = {
    "mix": [
        "ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "საიდუმლო", "ყვავილი", 
        "წიგნი", "ჩანთა", "მთა", "საათი", "ნაყინი", "ფანარი", "წყალი", "ფანჯარა", "კატა", "კარადა", 
        "სკამი", "ტყე", "ხე", "ცხენი", "გიტარა", "ველოსიპედი", "თავისუფლება", "მხატვარი", "კოსმოსი", "რობოტი", 
        "დინოზავრი", "პირამიდა", "სამკაული", "ტელესკოპი", "მიკროსკოპი", "ბუშტი", "ხალიჩა", "პიანინო", "დროშა", 
        "წითელი ვაშლი", "მფრინავი თეფში", "ოქროს მედალი", "ცხელი ყავა", "სწრაფი მატარებელი", "მხიარული ჯამბაზი", 
        "ძველი ფოტოსურათი", "ელექტრო გიტარა", "მზის სათვალე", "თოვლის პაპა", "ახალი წელი", "ფერადი ფანქარი", 
        "გემრიელი ტორტი", "ქაღალდის თვითმფრინავი", "ხინკალი", "ჩურჩხელა", "მეტრო", "მარშრუტკა", "პასპორტი",
        "სიგარეტი", "ბანკომატი", "საფულე", "ლიფტი", "აივანი", "მეზობელი", "თამადა", "ყანწი", "ქვევრი"
    ],
    "objects": [
        "მიკროტალღური ღუმელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "გამათბობელი", "რკინა", "ელვა შესაკრავი", 
        "მანქანა", "ჰუდი", "კლავიატურა", "საათი", "ელექტრო ჩაიდანი", "საბუთების უჯრა", "ცეცხლმაქრი", 
        "პლასტმასის ბორბალი", "თხევადი საპონი", "ყავის ფინჯანი", "კომპიუტერის თაგვი", "რბილი დივანი", 
        "ციფრული კამერა", "სკამის საზურგე", "ტელევიზორის ანტენა", "სარეცხი მანქანა", "მტვერსასრუტი", "უთო", 
        "ფენი", "ყურსასმენები", "სატენის კაბელი", "კბილის ჯაგრისი", "საპარსი ქაფი", "სამზარეულოს დანა", 
        "ხის კოვზი", "მინის ჭიქა", "ფაიფურის თეფში", "კედლის სარკე", "რბილი ბალიში", "შალის საბანი", 
        "მზის ელემენტი", "უსადენო დინამიკი", "სათამაშო კონსოლი", "USB მეხსიერება", "ლამაზი ვაზა", "ქოლგა", 
        "ხელის საათი", "საფულე", "გასაღების საკიდი", "ფოტო ალბომი", "ნაგვის ურნა", "სამაგიდო თამაში",
        "სავარცხელი", "პომადა", "სუნამო", "სანთებელა", "სათვალე", "ხელთათმანი", "წინდა", "ქამარი",
        "ტაფა", "ქვაბი", "ჩანგალი", "მაკრატელი", "წებო", "სახაზავი", "ფანქარი", "კალამი", "რვეული",
        "წიგნების თარო", "კედლის საათი", "ფარდა", "ხალიჩა", "პულტი", "კონდიციონერი", "დამტენი", "ყულაბა"
    ],
    "nature": [
        "ამაზონის ჯუნგლები", "იაგუარი", "შავი პანტერა", "თეთრი ღრუბელი", "ცისფერი პეპელა", "შავი ზღვა", 
        "მწვანე ბალახი", "წყნარი ტბა", "ხის მასალა", "მზის ამოსვლა", "ზაფხულის სეზონი", "ზამთრის პერიოდი", 
        "გაზაფხულის წვიმა", "ოქროს თევზი", "დედამიწის ღერძი", "მბზინავი ქვა", "ჩრდილოეთის ციალი", 
        "ვულკანის ამოფრქვევა", "ძლიერი ქარიშხალი", "სეტყვა", "ხშირი ნისლი", "ცისარტყელა", "სავსე მთვარე", 
        "ვარსკვლავთცვენა", "ქვიშის ქარიშხალი", "თეთრი დათვი", "სამეფო არწივი", "უდაბნოს კაქტუსი", "ტირიფის ხე", 
        "ველური ვარდი", "მაღალი პალმა", "ზღვის კუ", "მარჯნის რიფი", "მთის მდინარე", "ღრმა ოკეანე", 
        "თოვლიანი მწვერვალი", "ალპური ზონა", "ბამბუკის ტყე", "სოკო", "ობობა", "მორიელი", "გველი",
        "არწივი", "ლომი", "ვეფხვი", "სპილო", "ჟირაფი", "ზებრა", "ნიანგი", "ზვიგენი", "დელფინი",
        "ვარდი", "იები", "გვირილა", "მუხა", "ნაძვი", "ჩანჩქერი", "გამოქვაბული", "კლდე", "ტალახი"
    ],
    "places": [
        "დიდი კედელი", "საფოსტო ყუთი", "სამედიცინო ცენტრი", "საფეხმავლო ბილიკი", "სპორტული დარბაზი", 
        "გარდერობის კარი", "ქარის ტურბინა", "პოლიციის მანქანა", "სტომატოლოგიური კლინიკა", "სილამაზის სალონი", 
        "ავტობუსის გაჩერება", "რკინიგზის სადგური", "აეროპორტის ტერმინალი", "ბენზინ გასამართი სადგური", 
        "სუპერმარკეტი", "წიგნების მაღაზია", "საცურაო აუზი", "საფეხბურთო სტადიონი", "ძველი ციხესიმაგრე", 
        "მიტოვებული სახლი", "შუშის ხიდი", "ცათამბჯენი", "ბავშვთა მოედანი", "საკონცერტო დარბაზი", "მუზეუმი", 
        "სამხატვრო გალერეა", "ღამის კლუბი", "სოფლის ორღობე", "პოლიციის განყოფილება", "სახანძრო სადგური",
        "საავადმყოფო", "სკოლა", "უნივერსიტეტი", "ბაღი", "ბანკი", "აფთიაქი", "თონე", "ბაზარი",
        "ეკლესია", "სასაფლაო", "კინოთეატრი", "ცირკი", "ზოოპარკი", "პლაჟი", "მთა", "ტყე", "უდაბნო",
        "ციხე", "პარლამენტი", "მერია", "სასაფლასი", "ბიბლიოთეკა", "სასტუმრო", "რესტორანი", "კაფე",
        "საუნა", "ავტოფარეხი", "სხვენი", "სარდაფი", "ლიფტი", "ტუალეტი", "სამზარეულო"
    ]
};

const categoryNames = { "mix": "შერეული", "objects": "ნივთები", "nature": "ბუნება", "places": "ადგილები" };

// --- DATA PERSISTENCE ---
function saveGameState() {
    const activeSection = document.querySelector('.section.active')?.id || 'playerInput';
    const gameState = {
        players, roles, chosenWord, currentIndex, timeLeft,
        isDetectiveMode, isPointsEnabled, configState, activeSection,
        gameStats, dailyChallenges, currentGameMode, soundEnabled,
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
        gameStats = state.gameStats || gameStats;
        dailyChallenges = state.dailyChallenges || dailyChallenges;
        currentGameMode = state.currentGameMode || "normal";
        soundEnabled = state.soundEnabled !== undefined ? state.soundEnabled : true;

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
    generateDailyChallenges();
    if (loadGameState()) { 
        document.getElementById("loadingScreen").style.display = "none"; 
        return; 
    }
    document.getElementById("loadingScreen").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("readyScreen").style.display = "flex";
        setTimeout(() => { document.getElementById("readyScreen").style.opacity = "1"; }, 50);
    }, 500);
}

function showMainPage() {
    audioSystem.playSound('click');
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
                setTimeout(() => { 
                    document.getElementById("mainContent").style.opacity = "1"; 
                    showPlayerInput(); 
                }, 50);
            }, 500);
        }, 1000);
    }, 500);
}

function setActiveSection(activeId) {
    const sections = ['playerInput', 'configSection', 'shopSection', 'roleSection', 
                     'gameSection', 'findSpySection', 'resultSection', 'statsSection',
                     'challengesSection'];
    const logoArea = document.getElementById('logoArea');
    const showLogo = ['playerInput', 'configSection', 'shopSection', 'statsSection', 'challengesSection'].includes(activeId);
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
    
    if (activeId === 'statsSection') updateStatsDisplay();
    if (activeId === 'challengesSection') updateChallengesDisplay();
    
    if(players.length > 0) saveGameState();
}

// --- CONFIG & INPUTS ---
function showPlayerInput() {
    setActiveSection('playerInput');
    updateInputMode();
    loadConfigFromUI();
    
    const shopBtn = document.getElementById("shopButton");
    const statsBtn = document.getElementById("statsButton");
    const challengesBtn = document.getElementById("challengesButton");
    
    if(!configState.manualEntry) {
        shopBtn.style.display = 'none';
        statsBtn.style.display = 'none';
        challengesBtn.style.display = 'none';
    } else {
        shopBtn.style.display = 'flex';
        statsBtn.style.display = 'flex';
        challengesBtn.style.display = 'flex';
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
    audioSystem.playSound('click');
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
    
    // Add game mode selection
    const gameModeContainer = document.getElementById("gameModeContainer");
    if (!gameModeContainer) {
        const inputGroup = document.createElement("div");
        inputGroup.className = "input-group";
        inputGroup.innerHTML = `
            <label class="form-label"><i class="fas fa-gamepad"></i> თამაშის რეჟიმი:</label>
            <select id="gameModeSelect">
                <option value="normal">ნორმალური (2 წთ, 1 ჯაშუში)</option>
                <option value="blitz">ბლიცი (1 წთ, 2 ჯაშუში)</option>
                <option value="hardcore">რთული (3 წთ, 1 ჯაშუში + 1 დეტექტივი)</option>
            </select>
        `;
        document.querySelector('#configSection .input-group:last-child').after(inputGroup);
    }
    
    document.getElementById('spyCount').value = configState.spyCount;
    document.getElementById('detectiveCount').value = configState.detectiveCount;
    document.getElementById('playerOrder').value = configState.playerOrder;
    document.getElementById('pointsSystem').value = configState.pointsSystem;
    document.getElementById('manualEntryToggle').checked = configState.manualEntry;
    document.getElementById('gameModeSelect').value = configState.gameMode || "normal";
    
    updateInputMode();
    setActiveSection('configSection');
}

function saveConfig() {
    audioSystem.playSound('click');
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.manualEntry = document.getElementById("manualEntryToggle").checked;
    configState.gameMode = document.getElementById("gameModeSelect").value;
    currentGameMode = configState.gameMode;
    
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
    setTimeout(() => showPlayerInput(), 300);
}

function loadConfigFromUI() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
}

function addPlayer() {
    audioSystem.playSound('click');
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some((p) => p.name === name)) {
        players.push({ 
            name: name, 
            points: 0, 
            coins: 10, 
            inventory: [],
            level: 1,
            xp: 0,
            cosmetics: []
        });
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
    if (players.length === 0) { 
        list.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-muted);">მოთამაშეები არ არიან</div>'; 
        return; 
    }
    
    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");
        
        // Apply cosmetic effects
        if (p.cosmetics && p.cosmetics.includes('rainbow_name')) {
            item.style.background = 'linear-gradient(45deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #9900ff)';
            item.style.backgroundSize = '400% 400%';
            item.style.animation = 'rainbow 3s ease infinite';
        }
        
        let playerInfo = document.createElement("div");
        playerInfo.style.flex = "1";
        let nameDiv = document.createElement("div");
        nameDiv.classList.add("player-name");
        nameDiv.textContent = p.name;
        
        // Add level badge
        let levelBadge = document.createElement("span");
        levelBadge.className = "level-badge";
        levelBadge.textContent = `დონე ${p.level}`;
        levelBadge.style.marginLeft = "10px";
        levelBadge.style.fontSize = "0.8rem";
        levelBadge.style.background = "var(--neon-purple)";
        levelBadge.style.padding = "2px 8px";
        levelBadge.style.borderRadius = "10px";
        
        playerInfo.appendChild(nameDiv);
        playerInfo.appendChild(levelBadge);

        if (configState.pointsSystem === "enabled") {
            let statsDiv = document.createElement("div");
            statsDiv.classList.add("player-stats");
            statsDiv.innerHTML = `
                <div class="stat-points"><i class="fas fa-trophy"></i> ${p.points}</div>
                <div class="stat-coins"><i class="fas fa-coins"></i> ${p.coins}</div>
                <div class="stat-xp"><i class="fas fa-chart-line"></i> ${p.xp}/100</div>
            `;
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
        removeBtn.onclick = function () { 
            audioSystem.playSound('click');
            players.splice(index, 1); 
            updatePlayerList(); 
            saveGameState(); 
        };
        item.appendChild(playerInfo);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

// --- STATISTICS ---
function showStats() {
    audioSystem.playSound('click');
    setActiveSection('statsSection');
}

function updateStatsDisplay() {
    const container = document.getElementById('statsContent');
    if (!container) return;
    
    // Calculate favorite word
    let favoriteWord = "არ არის";
    let maxCount = 0;
    for (const [word, count] of Object.entries(gameStats.favoriteWords)) {
        if (count > maxCount) {
            maxCount = count;
            favoriteWord = word;
        }
    }
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-value">${gameStats.totalGames}</div>
                <div class="stat-label">სულ თამაში</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🕵️</div>
                <div class="stat-value">${gameStats.spyWins}</div>
                <div class="stat-label">ჯაშუშის მოგება</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👨‍⚖️</div>
                <div class="stat-value">${gameStats.civilianWins}</div>
                <div class="stat-label">მოქალაქის მოგება</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-value">${gameStats.totalPoints}</div>
                <div class="stat-label">სულ ქულა</div>
            </div>
        </div>
        
        <div class="stats-details">
            <h4><i class="fas fa-star"></i> სტატისტიკის დეტალები</h4>
            <div class="stat-detail">
                <span>საყვარელი სიტყვა:</span>
                <span class="stat-highlight">${favoriteWord}</span>
            </div>
            <div class="stat-detail">
                <span>მოგების რეიტი:</span>
                <span class="stat-highlight">${gameStats.totalGames > 0 ? 
                    Math.round((gameStats.spyWins + gameStats.civilianWins) / gameStats.totalGames * 100) : 0}%</span>
            </div>
            <div class="stat-detail">
                <span>საშუალო ქულა თამაშზე:</span>
                <span class="stat-highlight">${gameStats.totalGames > 0 ? 
                    Math.round(gameStats.totalPoints / gameStats.totalGames) : 0}</span>
            </div>
        </div>
    `;
}

function updateStats(outcome, word) {
    gameStats.totalGames++;
    
    if (outcome === 'spy') {
        gameStats.spyWins++;
    } else if (outcome === 'civilian') {
        gameStats.civilianWins++;
    }
    
    // Update favorite words
    if (!gameStats.favoriteWords[word]) {
        gameStats.favoriteWords[word] = 0;
    }
    gameStats.favoriteWords[word]++;
    
    // Give XP to players
    players.forEach(player => {
        player.xp += 10;
        if (player.xp >= 100) {
            player.xp = 0;
            player.level++;
            player.coins += 5; // Bonus coins for level up
            showToast(`🎉 ${player.name} ახალ დონეზე გადავიდა! დონე ${player.level}`);
        }
    });
    
    saveGameState();
}

// --- CHALLENGES ---
function showChallenges() {
    audioSystem.playSound('click');
    setActiveSection('challengesSection');
}

// --- SHOP LOGIC ---
function showShop() {
    audioSystem.playSound('click');
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
        if(item.hacker) card.classList.add("hacker-item");
        if(item.type === 'cosmetic') card.classList.add("cosmetic-item");
        
        card.onclick = function() { this.classList.toggle('show-desc'); };
        const ownsItem = player.inventory.some(i => i.id === item.id) || 
                         (player.cosmetics && player.cosmetics.includes(item.id));
        let canBuy = item.type === 'instant' ? (player.coins >= item.price) : 
                     (player.coins >= item.price && !ownsItem);
        let btnText = ownsItem ? 'ნაყიდია' : 
                     (player.coins < item.price ? 'ქოინი აკლია' : 'ყიდვა');
        
        card.innerHTML = `
            <div class="shop-info-icon"><i class="fas fa-info"></i></div>
            <div class="shop-item-desc-overlay">${item.desc}</div>
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-title">${item.name}</div>
            <div class="shop-item-price">${item.price} <i class="fas fa-coins"></i></div>
            <button class="btn btn-buy" ${canBuy && !ownsItem ? '' : 'disabled'} 
                    onclick="event.stopPropagation(); buyItem('${item.id}', ${playerIndex})">
                ${btnText}
            </button>
        `;
        grid.appendChild(card);
    });
}

function buyItem(itemId, playerIndex) {
    audioSystem.playSound('purchase');
    const player = players[playerIndex];
    const item = shopItems.find(i => i.id === itemId);
    if (player.coins >= item.price) {
        player.coins -= item.price;
        if (item.type === 'instant') {
            player.points += item.effectValue;
            showToast(`${player.name}-მა მიიღო +${item.effectValue} ქულა!`);
        } else if (item.type === 'cosmetic') {
            if (!player.cosmetics) player.cosmetics = [];
            player.cosmetics.push(item.id);
            showToast(`${item.name} ნაყიდია! ახლა გაქვს ${item.desc}`);
        } else {
            player.inventory.push(item);
            showToast(`${item.name} ნაყიდია!`);
        }
        
        // Update challenge
        updateChallenge(CHALLENGE_TYPES.BUY_ITEM);
        
        renderShopItems(); 
        updatePlayerList();
        saveGameState();
    }
}

// --- GAME LOGIC ---
function getRandomWord() {
    let pool = [];
    configState.selectedCategories.forEach(cat => { 
        if (wordData[cat]) pool = pool.concat(wordData[cat]); 
    });
    if (pool.length === 0) pool = wordData['mix'];
    const availableWords = pool.filter(word => !usedWords.includes(word));
    let word;
    if (availableWords.length === 0) { 
        usedWords = []; 
        word = pool[Math.floor(Math.random() * pool.length)]; 
    } else { 
        word = availableWords[Math.floor(Math.random() * availableWords.length)]; 
    }
    usedWords.push(word);
    return word;
}

function startGame() {
    audioSystem.playSound('click');
    
    // Handling Auto Mode
    if (!configState.manualEntry) {
        const count = parseInt(document.getElementById("totalPlayersCount").value);
        if (count < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
        players = [];
        for (let i = 1; i <= count; i++) {
            players.push({ 
                name: `მოთამაშე ${i}`, 
                points: 0, 
                coins: 10, 
                inventory: [],
                level: 1,
                xp: 0,
                cosmetics: []
            });
        }
    } else {
        if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე უნდა იყოს!"); return; }
    }

    // Get game mode settings
    const mode = GAME_MODES[currentGameMode];
    let spyCount = mode.spies;
    let detectiveCount = mode.detectives;
    isDetectiveMode = detectiveCount > 0;
    isPointsEnabled = configState.pointsSystem === "enabled";
    
    if (spyCount + detectiveCount >= players.length) { 
        alert("ჯაშუშები + დეტექტივები უნდა იყოს ნაკლები მოთამაშეებზე!"); 
        return; 
    }
    
    chosenWord = getRandomWord();
    roles = Array(players.length).fill("Civilian");

    if (configState.playerOrder === "random") { 
        players.sort(() => Math.random() - 0.5); 
    }

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
    
    // Update challenge
    updateChallenge(CHALLENGE_TYPES.PLAY_GAMES);
    
    saveGameState();
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").textContent = `${players[currentIndex].name}`;
    document.getElementById("currentPlayer").textContent = `${currentIndex + 1} / ${players.length}`;
    const roleCard = document.getElementById("roleCard");
    roleCard.classList.remove("flipped");
    document.getElementById("nextPlayerBtn").style.display = "none";
    document.getElementById("roleCardFront").innerHTML = `
        <div class="role-icon"><i class="fas fa-fingerprint"></i></div>
        <div class="role-text" style="font-size:1rem; margin-top:10px">დააჭირე როლის სანახავად</div>
    `;
}

function revealRole() {
    audioSystem.playSound('reveal');
    const roleCard = document.getElementById("roleCard");
    const role = roles[currentIndex];
    if (navigator.vibrate) { 
        if (role === "Spy") navigator.vibrate([100, 50, 100, 50, 500]); 
        else navigator.vibrate(50); 
    }
    roleCard.classList.add("flipped");
    const roleCardBack = document.getElementById("roleCardBack");
    if (role === "Spy") {
        roleCardBack.innerHTML = `
            <div class="role-icon"><i class="fas fa-user-secret"></i></div>
            <div class="role-text spy-text">ჯაშუში</div>
        `;
    } else if (role === "Detective") {
        roleCardBack.innerHTML = `
            <div class="role-icon"><i class="fas fa-search"></i></div>
            <div class="role-text detektivi">დეტექტივი</div>
        `;
    } else {
        roleCardBack.innerHTML = `
            <div class="role-icon"><i class="fas fa-user"></i></div>
            <div class="role-text">სიტყვა: <span class="sityva">${chosenWord}</span></div>
        `;
    }
    document.getElementById("nextPlayerBtn").style.display = "block";
}

function nextPlayer() {
    audioSystem.playSound('click');
    currentIndex++;
    if (currentIndex < players.length) { 
        updateTurnDisplay(); 
        saveGameState(); 
    } else {
        setActiveSection('gameSection');
        document.getElementById("helperText").textContent = "";
        if (isPointsEnabled) { 
            document.getElementById("pointsDisplay").style.display = "block"; 
            updatePointsDisplay(); 
        } else { 
            document.getElementById("pointsDisplay").style.display = "none"; 
        }
        
        // Set timer based on game mode
        const mode = GAME_MODES[currentGameMode];
        timeLeft = mode.time;
        startTimer();
        saveGameState();
    }
}

// --- TIMER & HELPER ---
function startTimer() {
    timeLeft = GAME_MODES[currentGameMode].time;
    updateTimerDisplay(timeLeft);
    preventScreenOff();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            showTimerEndSignal(); 
        }
        if(timeLeft % 5 === 0) saveGameState(); 
    }, 1000);
}

function generateHelperQuestion() {
    audioSystem.playSound('click');
    updateChallenge(CHALLENGE_TYPES.USE_HELPER);
    const q = helperQuestions[Math.floor(Math.random() * helperQuestions.length)];
    const textEl = document.getElementById("helperText");
    textEl.style.opacity = 0;
    setTimeout(() => { 
        textEl.textContent = q; 
        textEl.style.opacity = 1; 
    }, 200);
}

function formatTime(time) {
    let minutes = String(Math.floor(time / 60)).padStart(2, "0");
    let seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function updateTimerDisplay(time) { 
    document.getElementById("timer").textContent = formatTime(time); 
}

function showTimerEndSignal() {
    audioSystem.playSound('timerEnd');
    const signal = document.getElementById("timerEndSignal");
    signal.style.display = "flex";
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    setTimeout(() => { 
        signal.style.display = "none"; 
        endGame(); 
    }, 3000);
}

// --- POINTS SYSTEM ---
function calculatePoints(outcome) {
    const mode = GAME_MODES[currentGameMode];
    const multiplier = mode.pointsMultiplier;
    
    if (outcome === 'civilian') {
        players.forEach((p, index) => {
            if (roles[index] !== 'Spy') {
                let points = 2 * multiplier;
                
                if (roles[index] === 'Detective') {
                    const magnifier = p.inventory?.find(item => item.id === 'magnifier');
                    if (magnifier) points += 3 * multiplier;
                }
                
                p.points += Math.round(points);
                gameStats.totalPoints += Math.round(points);
                
                // Update challenge
                if (roles[index] === 'Detective') {
                    updateChallenge(CHALLENGE_TYPES.DETECTIVE_WIN);
                } else {
                    updateChallenge(CHALLENGE_TYPES.CIVILIAN_WIN);
                }
            }
        });
    } else if (outcome === 'spy') {
        players.forEach((p, index) => {
            if (roles[index] === 'Spy') {
                let points = 3 * multiplier;
                
                const spyMask = p.inventory?.find(item => item.id === 'spy_mask');
                if (spyMask) points += 3 * multiplier;
                
                const backdoor = p.inventory?.find(item => item.id === 'backdoor');
                if (backdoor) points *= 2;
                
                p.points += Math.round(points);
                gameStats.totalPoints += Math.round(points);
                
                // Update challenge
                updateChallenge(CHALLENGE_TYPES.SPY_WIN);
            }
        });
    }
    
    players.forEach(p => {
        p.coins += 2;
    });
    
    updatePointsDisplay();
    updateStats(outcome, chosenWord);
}

function updatePointsDisplay() {
    if (!isPointsEnabled) return;
    
    let pointsHtml = "";
    players.forEach((p) => {
        let itemsHtml = p.inventory ? p.inventory.map(i => i.icon).join(' ') : '';
        pointsHtml += `<span>${p.name}: ${p.points} ${itemsHtml}</span> | `;
    });
    document.getElementById("pointsDisplay").innerHTML = pointsHtml.slice(0, -2);
}

function endGame() { 
    audioSystem.playSound('click');
    clearInterval(timerInterval); 
    if (!isPointsEnabled) {
        revealSpies();
    } else {
        showFindSpySection(); 
    }
}

// --- VOTING SYSTEM ---
function showFindSpySection() {
    setActiveSection('findSpySection'); 
    saveGameState();
    
    let select = document.getElementById("findSpySelect"); 
    select.innerHTML = "";
    
    players.forEach((p, i) => {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = p.name;
        select.appendChild(option);
    });
    
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "აირჩიეთ";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    select.insertBefore(defaultOption, select.firstChild);
    
    if (isDetectiveMode) {
        const detectives = roles.map((r, i) => (r === "Detective" ? players[i].name : null)).filter(Boolean);
        const detectiveNames = detectives.join(", ");
        document.querySelector("#findSpySection .result-title").textContent = "დეტექტივი, ეძებე ჯაშუში!";
        document.querySelector("#findSpySection p").innerHTML = `<strong>${detectiveNames}</strong> - დეტექტივმა აირჩიოს ჯაშუში:`;
    } else {
        document.querySelector("#findSpySection .result-title").textContent = "მოთამაშეები ეძებენ ჯაშუშს";
        document.querySelector("#findSpySection p").textContent = "ვინ არის ჯაშუში?";
    }
}

function makePlayerGuess() {
    audioSystem.playSound('click');
    let guessIndex = parseInt(document.getElementById("findSpySelect").value);
    if (isNaN(guessIndex)) {
        alert("გთხოვთ აირჩიოთ მოთამაშე!");
        return;
    }
    
    if (isDetectiveMode) {
        handleDetectiveGuess(guessIndex);
    } else {
        handleRegularGuess(guessIndex);
    }
}

function handleDetectiveGuess(guessIndex) {
    const isGuessCorrect = roles[guessIndex] === "Spy";
    let resultText = isGuessCorrect ? "დეტექტივმა მოიგო!" : "ჯაშუშებმა მოიგეს!";
    document.getElementById("resultText").textContent = resultText;
    
    if (isPointsEnabled) {
        calculatePoints(isGuessCorrect ? 'civilian' : 'spy');
    }
    
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    const isGuessCorrect = roles[guessIndex] === "Spy";
    let resultText = isGuessCorrect ? "ჯაშუში გამოიცნეს! მოქალაქეებმა მოიგეს!" : "ჯაშუშმა მოიგო!";
    document.getElementById("resultText").textContent = resultText;
    
    if (isPointsEnabled) {
        calculatePoints(isGuessCorrect ? 'civilian' : 'spy');
    }
    
    revealSpies();
}

function revealSpies() {
    audioSystem.playSound('reveal');
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
    
    if(!isPointsEnabled) {
        document.getElementById("resultText").style.display = 'none';
        document.getElementById("showPointsBtn").style.display = 'none';
    } else {
        document.getElementById("resultText").style.display = 'block';
        document.getElementById("showPointsBtn").style.display = 'inline-flex';
    }

    setActiveSection('resultSection');
    saveGameState(); 
}

function showFinalPoints() {
    audioSystem.playSound('click');
    if (!isPointsEnabled) return;
    let modal = document.getElementById("finalPointsModal");
    let content = document.getElementById("finalPointsContent");
    content.innerHTML = "";
    
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    
    sortedPlayers.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-score-item");
        
        let position = "";
        if (index === 0) position = "🥇 ";
        else if (index === 1) position = "🥈 ";
        else if (index === 2) position = "🥉 ";
        
        let invIcons = p.inventory ? p.inventory.map(i => i.icon).join(' ') : '';
        item.innerHTML = `
            <span class="name">${position}${p.name} ${invIcons}</span> 
            <div>
                <span style="margin-right:10px; color:var(--neon-blue)">${p.points} ქულა</span>
                <span style="color:var(--gold)">${p.coins} <i class="fas fa-coins"></i></span>
            </div>
        `;
        content.appendChild(item);
    });
    
    modal.style.display = "flex";
}

function closeModal(id) { 
    audioSystem.playSound('click');
    document.getElementById(id).style.display = "none"; 
}

function restartGame(sameConfig) {
    audioSystem.playSound('click');
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = formatTime(GAME_MODES[currentGameMode].time);
    
    if (sameConfig) {
        if (configState.playerOrder === "sequential" && players.length > 0) {
            let firstPlayer = players.shift(); 
            players.push(firstPlayer);
        }
        clearGameState();
        startGame();
    } else {
        clearGameState();
        showPlayerInput(); 
    }
}

// --- AUDIO CONTROLS ---
function toggleSound() {
    const enabled = audioSystem.toggleSound();
    const icon = document.getElementById('soundToggleIcon');
    if (icon) {
        icon.className = enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    showToast(enabled ? "🔊 ხმა ჩართულია" : "🔇 ხმა გამორთულია");
    saveGameState();
}

// --- WAKE LOCK ---
function preventScreenOff() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        const requestWakeLock = async () => { 
            try { 
                wakeLock = await navigator.wakeLock.request('screen'); 
            } catch (err) {
                console.log("Wake Lock not supported");
            } 
        };
        requestWakeLock();
        
        document.addEventListener('visibilitychange', async () => { 
            if (document.visibilityState === 'visible' && wakeLock === null) { 
                requestWakeLock(); 
            } 
        });
    }
}

// --- INITIALIZATION ---
window.onload = function () { 
    createParticles(); 
    loadGameState(); 
    setTimeout(showReadyScreen, 1000); 
};

// Disable right-click context menu
document.addEventListener('contextmenu', e => e.preventDefault());