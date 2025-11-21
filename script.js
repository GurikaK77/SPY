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

// Configuration State
let configState = {
    spyCount: 1,
    detectiveCount: 0,
    pointsSystem: "disabled"
};

const words = [
    "ფეხბურთი", "თეატრი", "კომპიუტერი", "სახლი", "ტელეფონი", "საქართველო", "კუ", "ძაღლი", "ჩრდილი", "საიდუმლო",
    "ყვავილი", "წიგნი", "ჩანთა", "მთა", "საათი", "ნაყინი", "ფანარი", "წყალი", "ფანჯარა", "კატა",
    "კარადა", "სკამი", "ტყე", "ხე", "ცხენი", "ბრინჯი", "პური", "ბოსტანი", "ყავა", "ჩაი", "მიკროტალღური ღუმელი",
    "მასწავლებელი", "ჩანთა", "რუკა", "ქუდი", "ქურთუკი", "გამათბობელი", "რკინა", "ძეხვი", "ზმეიკა"
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
    document.getElementById('pointsSystem').value = configState.pointsSystem;
}

function showConfig() {
    // Update UI with current config state
    document.getElementById('spyCount').value = configState.spyCount;
    document.getElementById('detectiveCount').value = configState.detectiveCount;
    document.getElementById('pointsSystem').value = configState.pointsSystem;
    setActiveSection('configSection');
}

function saveConfig() {
    // Save config from UI to state
    configState.spyCount = parseInt(document.getElementById("spyCount").value);
    configState.detectiveCount = parseInt(document.getElementById("detectiveCount").value);
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

function startGame() {
    if (players.length < 3) {
        alert("მინიმუმ 3 მოთამაშე უნდა იყოს!");
        return;
    }

    // Use the saved config state
    let spyCount = configState.spyCount;
    let detectiveCount = configState.detectiveCount;
    isDetectiveMode = detectiveCount === 1;
    isPointsEnabled = configState.pointsSystem === "enabled";
    
    if (spyCount + detectiveCount >= players.length) {
        alert("ჯაშუშების და დეტექტივების რაოდენობა უნდა იყოს ნაკლები მოთამაშეების რაოდენობაზე!");
        return;
    }

    chosenWord = words[Math.floor(Math.random() * words.length)];
    roles = Array(players.length).fill("Civilian");
    let indices = [...Array(players.length).keys()];
    indices.sort(() => Math.random() - 0.5);

    let spyIndices = indices.slice(0, spyCount);
    spyIndices.forEach((i) => (roles[i] = "Spy"));
    
    if (isDetectiveMode) {
        let availableIndices = indices.filter((i) => !spyIndices.includes(i));
        let detectiveIndex = availableIndices[0];
        roles[detectiveIndex] = "Detective";
    }

    // Shuffle players and roles together
    let combined = players.map((p, i) => ({
        name: p.name,
        role: roles[i],
        points: p.points
    }));
    combined.sort(() => Math.random() - 0.5);

    // Update players array with new order (keeping points)
    players = combined.map((c) => ({ name: c.name, points: c.points }));
    roles = combined.map((c) => c.role);
    
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
    
    players.forEach((p, i) => {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = p.name;
        select.appendChild(option);
    });
}

function makePlayerGuess() {
    let guessIndex = parseInt(document.getElementById("findSpySelect").value);

    if (isNaN(guessIndex)) {
        document.getElementById("resultText").textContent = "გამარჯვებული არ გამოვლენილა! (არჩევანი არ გაკეთებულა)";
        revealSpies();
        return;
    }

    if (roles[guessIndex] === "Detective") {
        endGameWithDetectiveLoss(guessIndex);
    } else {
        endGameWithPlayerGuess(guessIndex);
    }
}

function endGameWithPlayerGuess(guessIndex) {
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");
    let isGuessCorrect = spies.some(spy => spy.index === guessIndex);
    let resultText = "";

    if (isPointsEnabled) {
        if (isGuessCorrect) {
            spies.forEach(spy => { players[spy.index].points -= 30; });
            resultText = "სამოქალაქოებმა მოიგეს! სწორად იპოვეთ ჯაშუში!";
        } else {
            spies.forEach(spy => { players[spy.index].points += 70; });
            resultText = "ჯაშუშმა მოიგო! ვერ იპოვეთ ჯაშუში.";
        }
    } else {
        if (isGuessCorrect) {
            resultText = "მოიგეს სამოქალაქოებმა (და დეტექტივმა)! წააგო ჯაშუშმა!";
        } else {
            resultText = "მოიგო ჯაშუშმა! წააგეს სამოქალაქოებმა.";
        }
    }

    document.getElementById("resultText").textContent = resultText;
    revealSpies();
}

function endGameWithDetectiveLoss(detectiveIndex) {
    let resultText = "ჯაშუშმა მოიგო! თქვენ მოკალით დეტექტივი.";
    let spies = roles.map((r, i) => ({ role: r, index: i })).filter(p => p.role === "Spy");

    if (isPointsEnabled) {
        spies.forEach(spy => { players[spy.index].points += 70; });
    }

    document.getElementById("resultText").textContent = resultText;
    revealSpies();
}

function revealSpies() {
    let spies = roles
        .map((r, i) => (r === "Spy" ? players[i].name : null))
        .filter(Boolean);
    let detective = roles
        .map((r, i) => (r === "Detective" ? players[i].name : null))
        .filter(Boolean);

    let spiesText = spies.join(", ");
    let detectiveText = detective.length > 0 ? ` (დეტექტივი: ${detective[0]})` : "";

    document.getElementById("resultDisplay").textContent = `ჯაშუში: ${spiesText}${detectiveText}`;
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
        // ეგრევე იწყებს ახალ თამაშს როლების არჩევით
        startGame();
    } else {
        // ბრუნდება მთავარ მენიუში
        showPlayerInput();
    }
}

// Initialize
window.onload = function () {
    createParticles();
    // Load initial config
    loadConfigFromUI();
    setTimeout(showReadyScreen, 1000);
};
