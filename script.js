// Particles
function createParticles() {
    const particlesContainer = document.getElementById("particles");
    const particleCount = 30;
    
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
let usedWords = []; // Track used words to avoid repetition

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    playerOrder: "random",
    pointsSystem: "disabled"
};

const words = [
    "ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "ჩრდილი", "საიდუმლო",
    "ყვავილი", "წიგნი", "ჩანთა", "მთა", "საათი", "ნაყინი", "ფანარი", "წყალი", "ფანჯარა", "კატა",
    "კარადა", "სკამი", "ტყე", "ხე", "ცხენი", "ბრინჯი", "პური", "ბოსტანი", "ყავა", "ჩაი", "მიკროტალღური ღუმელი",
    "მასწავლებელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "გამათბობელი", "რკინა", "ძეხვი", "ზმეიკა", "მანქანა", "ჰუდი", "კლავიატურა", "სიმინდი", "საათი", "ამაზონის ჯუნგლები", "იაგუარი", "შავი პანტერა",
    "ანბანი", "გლობუსი", "ტანკი", "ჰიტლერი",
    
"საფოსტო ყუთი", "თეთრი ღრუბელი", "ელექტრო ჩაიდანი", "საბუთების უჯრა", "დიდი კედელი", "ცისფერი პეპელა", "შავი ზღვა", "მწვანე ბალახი", "ტკბილი ნამცხვარი", "გემრიელი წვენი",
"წყნარი ტბა", "ხის მასალა", "ცეცხლმაქრი", "პლასტმასის ბორბალი", "მზის ამოსვლა", "შხაპის მიღება", "ზაფხულის სეზონი", "ზამთრის პერიოდი", "პოლიციის მანქანა", "გადაუდებელი დახმარება",
"სამედიცინო ცენტრი", "საფეხმავლო ბილიკი", "ველოსიპედის ბორბალი", "თხევადი საპონი", "ყავის ფინჯანი", "კომპიუტერის თაგვი", "რბილი დივანი", "ფილმის გმირი", "ხელოვნური ინტელექტი", "თვითმფრინავის ფრთა",
"ჩოგბურთის ბურთი", "სპორტული დარბაზი", "კომპლექსური ამოცანა", "მშვიდი ღამე", "წმინდა წყალი", "სალაშქრო ფეხსაცმელი", "საზოგადოებრივი ტრანსპორტი", "საათის ისარი", "გარდერობის კარი", "ქარის ტურბინა",
"გაზაფხულის წვიმა", "ციფრული კამერა", "დედამიწის ღერძი", "პატარა ბავშვი", "მბზინავი ქვა", "სკამის საზურგე", "ტელევიზორის ანტენა", "ფინანსური ანგარიში", "ოქროს თევზი", "ინტერნეტის სიჩქარე"

];

// --- SCREEN MANAGEMENT ---
function showReadyScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    const readyScreen = document.getElementById("readyScreen");
    
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
        loadingScreen.style.display = "none";
        readyScreen.style.display = "flex";
        setTimeout(() => {
            readyScreen.style.opacity = "1";
        }, 50);
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
        setTimeout(() => {
            transitionScreen.style.opacity = "1";
        }, 50);

        setTimeout(() => {
            transitionScreen.style.opacity = "0";
            setTimeout(() => {
                transitionScreen.style.display = "none";
                mainContent.style.display = "block";
                setTimeout(() => {
                    mainContent.style.opacity = "1";
                    showPlayerInput(); // Start on player input screen
                }, 50);
            }, 500);
        }, 2000);
    }, 500);
}

/**
 * Sets the active section and controls the visibility of the logo area.
 * @param {string} activeId The ID of the section to display.
 */
function setActiveSection(activeId) {
    const sections = ['playerInput', 'configSection', 'roleSection', 'gameSection', 'findSpySection', 'resultSection'];
    const logoArea = document.getElementById('logoArea');
    
    // Manage Logo Area Visibility - Show only on 'playerInput' and 'configSection'
    const showLogo = ['playerInput', 'configSection'].includes(activeId);
    
    if (showLogo) {
        logoArea.style.display = 'block';
    } else {
        logoArea.style.display = 'none';
    }

    // Set Active Section
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
}

function showPlayerInput() {
    setActiveSection('playerInput');
    updatePlayerList();
    // Load config from state to the UI
    document.getElementById('spyCount').value = configState.spyCount;
    document.getElementById('detectiveCount').value = configState.detectiveCount;
    document.getElementById('playerOrder').value = configState.playerOrder;
    document.getElementById('pointsSystem').value = configState.pointsSystem;
}

function showConfig() {
    // Update UI with current config state
    document.getElementById('spyCount').value = configState.spyCount;
    document.getElementById('detectiveCount').value = configState.detectiveCount;
    document.getElementById('playerOrder').value = configState.playerOrder;
    document.getElementById('pointsSystem').value = configState.pointsSystem;
    setActiveSection('configSection');
}

function saveConfig() {
    // Save config from UI to state
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.pointsSystem = document.getElementById("pointsSystem").value;
    
    // Show success message
    alert("კონფიგურაცია შენახულია!");
    
    // Return to player input
    showPlayerInput();
}

// --- GAME LOGIC ---

function loadConfigFromUI() {
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
    configState.playerOrder = document.getElementById("playerOrder").value;
    configState.pointsSystem = document.getElementById("pointsSystem").value;
}

function addPlayer() {
    let name = document.getElementById("playerName").value.trim();
    if (name && !players.some((p) => p.name === name)) {
        let initialPoints = (configState.pointsSystem === "enabled") ? 0 : 0;
        players.push({ name: name, points: initialPoints });
        updatePlayerList();
        document.getElementById("playerName").value = "";
    } else if (players.some((p) => p.name === name)) {
        alert("მოთამაშე ამ სახელით უკვე დამატებულია!");
    }
}

function updatePlayerList() {
    let list = document.getElementById("playerList");
    list.innerHTML = "";

    if (players.length === 0) {
        list.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--gray);">მოთამაშეები არ არიან</div>';
        return;
    }

    const currentPointsEnabled = configState.pointsSystem === "enabled";

    players.forEach((p, index) => {
        let item = document.createElement("div");
        item.classList.add("player-item");

        let nameAndPoints = document.createElement("div");
        nameAndPoints.classList.add("player-name-and-points");

        if (currentPointsEnabled) {
            nameAndPoints.innerHTML = `<span>${p.name}</span> <span class="player-score">(${p.points})</span>`;
        } else {
            nameAndPoints.innerHTML = `<span>${p.name}</span>`;
        }

        let removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-btn");
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = function () {
            players.splice(index, 1);
            updatePlayerList();
        };

        item.appendChild(nameAndPoints);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

function getRandomWord() {
    // If all words have been used, reset the used words list
    if (usedWords.length >= words.length) {
        usedWords = [];
    }
    
    // Filter out used words
    const availableWords = words.filter(word => !usedWords.includes(word));
    
    // If no available words, reset used words
    if (availableWords.length === 0) {
        usedWords = [];
        return words[Math.floor(Math.random() * words.length)];
    }
    
    // Get random word from available words
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(randomWord);
    return randomWord;
}

function startGame() {
    if (players.length < 3) {
        alert("მინიმუმ 3 მოთამაშე უნდა იყოს!");
        return;
    }

    // Use the saved config state
    let spyCount = configState.spyCount;
    let detectiveCount = configState.detectiveCount;
    let playerOrder = configState.playerOrder;
    isDetectiveMode = detectiveCount > 0;
    isPointsEnabled = configState.pointsSystem === "enabled";
    
    if (spyCount + detectiveCount >= players.length) {
        alert("ჯაშუშების და დეტექტივების რაოდენობა უნდა იყოს ნაკლები მოთამაშეების რაოდენობაზე!");
        return;
    }

    // Get a new random word that hasn't been used recently
    chosenWord = getRandomWord();
    roles = Array(players.length).fill("Civilian");
    
    // Save original player order for sequential mode
    originalPlayerOrder = [...players];

    // Handle player order
    if (playerOrder === "sequential") {
        // Keep players in the order they were added
        // No shuffling needed - players stay in their original order
        console.log("Sequential order - players remain in original order");
    } else {
        // Random order - shuffle players
        let combined = players.map((p, i) => ({
            name: p.name,
            role: roles[i],
            points: p.points
        }));
        combined.sort(() => Math.random() - 0.5);
        players = combined.map((c) => ({ name: c.name, points: c.points }));
        roles = combined.map((c) => c.role);
        console.log("Random order - players shuffled");
    }

    // Assign spy roles
    let indices = [...Array(players.length).keys()];
    let spyIndices = [];
    
    for (let i = 0; i < spyCount; i++) {
        let availableIndices = indices.filter(idx => !spyIndices.includes(idx));
        let randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        spyIndices.push(randomIndex);
        roles[randomIndex] = "Spy";
    }
    
    // Assign detective roles
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

    if (isPointsEnabled) {
        document.getElementById("showPointsBtn").style.display = "inline-flex";
    } else {
        document.getElementById("showPointsBtn").style.display = "none";
    }

    setActiveSection('roleSection');
    currentIndex = 0;
    updateTurnDisplay();
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").textContent = `${players[currentIndex].name} - დააჭირე ბარათს როლის საჩვენებლად`;
    document.getElementById("currentPlayer").textContent = `${currentIndex + 1} / ${players.length}`;
    
    // Reset card and hide next button
    const roleCard = document.getElementById("roleCard");
    roleCard.classList.remove("flipped");
    document.getElementById("nextPlayerBtn").style.display = "none";
    
    // Set front card content
    document.getElementById("roleCardFront").innerHTML = `
        <div class="role-icon">
            <i class="fas fa-user-secret"></i>
        </div>
        <div class="role-text">დააჭირე როლის საჩვენებლად</div>
    `;
}

function revealRole() {
    const roleCard = document.getElementById("roleCard");
    const role = roles[currentIndex];
    
    roleCard.classList.add("flipped");
    
    const roleCardBack = document.getElementById("roleCardBack");
    if (role === "Spy") {
        roleCardBack.innerHTML = `
            <div class="role-icon">
                <i class="fas fa-skull"></i>
            </div>
            <div class="role-text spy-text">ჯაშუში</div>
        `;
    } else if (role === "Detective") {
        roleCardBack.innerHTML = `
            <div class="role-icon">
                <i class="fas fa-search"></i>
            </div>
            <div class="role-text detektivi">დეტექტივი</div>
            <div class="role-text" style="margin-top: 10px; font-size: 1rem;">მხოლოდ შენ შეგიძლია ჯაშუშის გამოცნობა!</div>
        `;
    } else {
        roleCardBack.innerHTML = `
            <div class="role-icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="role-text">
                სიტყვა: <span class="sityva">${chosenWord}</span>
            </div>
        `;
    }
    
    document.getElementById("nextPlayerBtn").style.display = "block";
}

function nextPlayer() {
    currentIndex++;
    
    if (currentIndex < players.length) {
        updateTurnDisplay();
    } else {
        setActiveSection('gameSection');
        if (isPointsEnabled) {
            document.getElementById("pointsDisplay").style.display = "block";
            updatePointsDisplay();
        } else {
            document.getElementById("pointsDisplay").style.display = "none";
        }
        document.getElementById("startTimerBtn").style.display = "block";
    }
}

// --- TIMER & GAME END ---

function startTimer() {
    document.getElementById("startTimerBtn").style.display = "none";
    timeLeft = 120; // 2 minutes
    updateTimerDisplay(timeLeft);

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showTimerEndSignal();
        }
    }, 1000);
}

function updateTimerDisplay(time) {
    let minutes = String(Math.floor(time / 60)).padStart(2, "0");
    let seconds = String(time % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

function showTimerEndSignal() {
    const signal = document.getElementById("timerEndSignal");
    signal.style.display = "flex";
    
    const alarmSound = document.getElementById("alarmSound");
    if (alarmSound) {
        alarmSound.play();
    }
    
    setTimeout(() => {
        signal.style.display = "none";
        showFindSpySection();
    }, 3000);
}

function updatePointsDisplay() {
    let pointsHtml = "";
    players.forEach((p) => {
        pointsHtml += `<span>${p.name}: ${p.points}</span> | `;
    });
    document.getElementById("pointsDisplay").innerHTML = pointsHtml.slice(0, -2);
}

function endGame() {
    clearInterval(timerInterval);
    showFindSpySection();
}

function showFindSpySection() {
    setActiveSection('findSpySection');

    let select = document.getElementById("findSpySelect");
    select.innerHTML = "";
    
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "აირჩიეთ";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    select.appendChild(defaultOption);
    
    // If detective mode is active, only detectives can guess
    if (isDetectiveMode) {
        let detectives = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Detective");
        if (detectives.length > 0) {
            document.getElementById("findSpySelect").innerHTML = `
                <option value="" selected disabled>აირჩიეთ ჯაშუში</option>
                ${players.map((p, i) => 
                    `<option value="${i}">${p.name}</option>`
                ).join('')}
            `;
            // Show which detective is guessing
            let detectiveNames = detectives.map(d => players[d.index].name).join(", ");
            document.querySelector("#findSpySection .result-title").textContent = "დეტექტივი, ეძებე ჯაშუში!";
            document.querySelector("#findSpySection p").innerHTML = `<strong>${detectiveNames}</strong> - დეტექტივმა უნდა გამოიცნოს ჯაშუში:`;
        }
    } else {
        players.forEach((p, i) => {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = p.name;
            select.appendChild(option);
        });
        document.querySelector("#findSpySection .result-title").textContent = "მოთამაშეები ეძებენ ჯაშუშს";
        document.querySelector("#findSpySection p").textContent = "დააფიქსირეთ თქვენი ეჭვი, ვინ არის ჯაშუში:";
    }
}

function makePlayerGuess() {
    let guessIndex = parseInt(document.getElementById("findSpySelect").value);

    if (isNaN(guessIndex)) {
        document.getElementById("resultText").textContent = "გამარჯვებული არ გამოვლენილა! (არჩევანი არ გაკეთებულა)";
        revealSpies();
        return;
    }

    if (isDetectiveMode) {
        handleDetectiveGuess(guessIndex);
    } else {
        handleRegularGuess(guessIndex);
    }
}

function handleDetectiveGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let detectives = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Detective");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = "";

    if (isPointsEnabled) {
        if (isGuessCorrect) {
            // Detective gets +4 points for finding spy
            detectives.forEach(det => { players[det.index].points += 4; });
            // Spy loses -1 point
            spies.forEach(spy => { players[spy.index].points -= 1; });
            resultText = "დეტექტივმა მოიგო! სწორად იპოვეთ ჯაშუში!";
        } else {
            // Detective loses -1 point for wrong guess
            detectives.forEach(det => { players[det.index].points -= 1; });
            // Spy gets +3 points for not being found
            spies.forEach(spy => { players[spy.index].points += 3; });
            resultText = "ჯაშუშებმა მოიგეს! დეტექტივმა ვერ იპოვა ჯაშუში.";
        }
    } else {
        if (isGuessCorrect) {
            resultText = "დეტექტივმა მოიგო! სწორად იპოვეთ ჯაშუში!";
        } else {
            resultText = "ჯაშუშებმა მოიგეს! დეტექტივმა ვერ იპოვა ჯაშუში.";
        }
    }

    document.getElementById("resultText").textContent = resultText;
    revealSpies();
}

function handleRegularGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = "";

    if (isPointsEnabled) {
        if (isGuessCorrect) {
            // Spy loses -1 point when found
            spies.forEach(spy => { players[spy.index].points -= 1; });
            resultText = "სამოქალაქოებმა მოიგეს! სწორად იპოვეთ ჯაშუში!";
        } else {
            // Spy gets +3 points when not found
            spies.forEach(spy => { players[spy.index].points += 3; });
            resultText = "ჯაშუშმა მოიგო! ვერ იპოვეთ ჯაშუში.";
        }
    } else {
        if (isGuessCorrect) {
            resultText = "მოიგეს სამოქალაქოებმა! წააგო ჯაშუშმა!";
        } else {
            resultText = "მოიგო ჯაშუშმა! წააგეს სამოქალაქოებმა.";
        }
    }

    document.getElementById("resultText").textContent = resultText;
    revealSpies();
}

function revealSpies() {
    let spies = roles
        .map((r, i) => (r === "Spy" ? players[i].name : null))
        .filter(Boolean);
    let detectives = roles
        .map((r, i) => (r === "Detective" ? players[i].name : null))
        .filter(Boolean);

    let spiesText = spies.join(", ");
    let detectiveText = detectives.length > 0 ? ` (დეტექტივები: ${detectives.join(", ")})` : "";

    document.getElementById("resultDisplay").textContent = `ჯაშუშები: ${spiesText}${detectiveText}`;
    document.getElementById("wordDisplay").textContent = `საიდუმლო სიტყვა: ${chosenWord}`;

    setActiveSection('resultSection');
}

function showFinalPoints() {
    if (!isPointsEnabled) {
        alert("ქულების სისტემა გამორთულია კონფიგურაციაში!");
        return;
    }

    let modal = document.getElementById("finalPointsModal");
    let content = document.getElementById("finalPointsContent");
    
    content.innerHTML = "";
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    sortedPlayers.forEach((p) => {
        let item = document.createElement("div");
        item.classList.add("player-score-item");
        item.innerHTML = `<span class="name">${p.name}:</span> <span class="points">${p.points}</span>`;
        content.appendChild(item);
    });
    modal.style.display = "flex";
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = "none";
}

function restartGame(sameConfig) {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "02:00";

    if (sameConfig) {
        // Rotate players for sequential mode
        if (configState.playerOrder === "sequential" && players.length > 0) {
            let firstPlayer = players.shift();
            players.push(firstPlayer);
            
            let firstRole = roles.shift();
            roles.push(firstRole);
            
            console.log("Sequential mode - rotated players:", players.map(p => p.name));
        }
        
        // Start completely new game with new word and roles
        startGame();
    } else {
        // Return to main menu
        showPlayerInput();
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Prevent screen from turning off when app is active
function preventScreenOff() {
    // Request wake lock if supported
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Screen will stay on');
                
                wakeLock.addEventListener('release', () => {
                    console.log('Screen Wake Lock was released');
                });
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        };
        
        requestWakeLock();
        
        // Re-request wake lock when page becomes visible again
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && wakeLock === null) {
                requestWakeLock();
            }
        });
    }
}

// Initialize
window.onload = function () {
    createParticles();
    // Load initial config
    loadConfigFromUI();
    // Prevent screen from turning off
    preventScreenOff();
    setTimeout(showReadyScreen, 1000);
};

// Prevent context menu on long press
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Prevent text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});
