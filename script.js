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

function showReadyScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  const readyScreen = document.getElementById("readyScreen");
  loadingScreen.style.opacity = "0";
  setTimeout(() => {
    loadingScreen.style.display = "none";
    readyScreen.style.display = "flex";
    readyScreen.style.opacity = "1";
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
    transitionScreen.style.opacity = "1";

    setTimeout(() => {
      transitionScreen.style.opacity = "0";
      setTimeout(() => {
        transitionScreen.style.display = "none";
        mainContent.style.display = "block";
        mainContent.style.opacity = "1";
      }, 500);
    }, 2000);
  }, 500);
}

let players = [];
let roles = [];
let chosenWord = "";
let currentIndex = 0;
let timerInterval;
let timeLeft = 0;
let isDetectiveMode = false;
let isPointsEnabled = false;
const words = [
  "ფეხბურთი",
  "თეატრი",
  "კომპიუტერი",
  "სახლი",
  "ტელეფონი",
  "საქართველო",
  "კუ",
  "ძაღლი",
  "ჩრდილი",
  "საიდუმლო",
  "ყვავილი",
  "წიგნი",
  "ჩანთა",
  "მთა",
  "საათი",
  "ნაყინი",
  "ფანარი",
  "წყალი",
  "ფანჯარა",
  "კატა",
  "კარადა",
  "სკამი",
  "ტყე",
  "ხე",
  "ცხენი",
  "ბრინჯი",
  "პური",
  "ბოსტანი",
  "ყავა",
  "ჩაი",
  "სასმელი",
  "თევზი",
  "ზღვა",
  "მზა",
  "ვარსკვლავი",
  "მთვარე",
  "ღამე",
  "დღე",
  "ქარი",
  "წვიმა",
  "თოვლი",
  "ფერი",
  "სიტყვა",
  "მელოდია",
  "მუსიკა",
  "პიანინო",
  "გიტარა",
  "ბგერა",
  "ვიდეო",
  "ფილმი",
  "სერიალი",
  "საღამო",
  "დილა",
  "მომენტი",
  "ხედი",
  "კარავი",
  "ბანაკი",
  "საბანი",
  "დრონი",
  "პლედი",
  "მიკროფონი",
  "ჩაფხუტი",
  "სათვალე",
  "ზუგჩანთა",
  "ვერცხლი",
  "ბენზინი",
  "ფაზლი",
  "პლანშეტი",
  "კარტოფილი",
  "ჩამრთველი",
  "კიბე",
  "ხალიჩა",
  "ფარდები",
  "თიხა",
  "ქაფი",
  "ტილო",
  "სანათი",
  "კომპასი",
  "სარკე",
  "ბალიში",
  "ბატონი",
  "ბალახი",
  "დანა",
  "კოვზი",
  "ჩანგალი",
  "თასი",
  "ჭიქა",
  "ყუთი",
  "ბოთლი",
  "საფარი",
  "ბურთი",
  "ხალათი",
  "პლაჟი",
  "ქუდი",
  "კეპი",
  "ჩაფხუტი",
  "ჟილეტი",
  "შარვალი",
  "კომბინიზონი",
  "შარფი",
  "ყურსასმენი",
  "მაკრატელი",
  "გიტარა",
];

function addPlayer() {
  let name = document.getElementById("playerName").value.trim();
  if (name && !players.some((p) => p.name === name)) {
    players.push({ name: name, points: 0 });
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
    list.innerHTML =
      '<div style="padding: 15px; text-align: center; color: var(--color5);">მოთამაშეები არ არიან</div>';
    return;
  }

  players.forEach((p, index) => {
    let item = document.createElement("div");
    item.classList.add("player-item");

    let nameAndPoints = document.createElement("div");
    nameAndPoints.classList.add("player-name-and-points");

    if (isPointsEnabled) {
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

  let spyCount = parseInt(document.getElementById("spyCount").value);
  let detectiveCount = parseInt(
    document.getElementById("detectiveCount").value
  );
  isDetectiveMode = detectiveCount === 1;
  isPointsEnabled = document.getElementById("pointsSystem").value === "enabled";
  if (spyCount + detectiveCount >= players.length) {
    alert(
      "ჯაშუშების და დეტექტივების რაოდენობა უნდა იყოს ნაკლები მოთამაშეების რაოდენობაზე!"
    );
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

  let combined = players.map((p, i) => ({
    name: p.name,
    role: roles[i],
    points: p.points,
  }));
  combined.sort(() => Math.random() - 0.5);

  players = combined.map((c) => ({ name: c.name, points: c.points }));
  roles = combined.map((c) => c.role);
  if (isPointsEnabled) {
    document.getElementById("showPointsBtn").style.display = "inline-flex";
  } else {
    document.getElementById("showPointsBtn").style.display = "none";
  }

  document.getElementById("playerInput").classList.remove("active");
  document.getElementById("roleSection").classList.add("active");

  currentIndex = 0;
  updateTurnDisplay();
}

function updateTurnDisplay() {
  document.getElementById(
    "playerTurn"
  ).textContent = `${players[currentIndex].name} `;   // დააჭირე რომ ნახო შენი როლი
  document.getElementById(
    "currentPlayer"
  ).textContent = `${currentIndex + 1} / ${players.length}`;
  document.getElementById("roleDisplay").textContent =
    "ნახე შენი როლი";  // მომზადება როლის საჩვენებლად...
    
}

function revealRole() {
  let display = document.getElementById("roleDisplay");
  let role = roles[currentIndex];
  display.classList.remove("spy-text", "word-text");
  if (role === "Spy") {
    display.innerHTML = `<span class="spy-text">ჯაშუში</span>`;
  } else if (role === "Detective") {
    display.innerHTML = `შენ ხარ <span class="word-text detektivi">დეტექტივი</span>`;
  } else {
    display.innerHTML = `სიტყვა: <span class="word-text sityva">${chosenWord}</span>`;
  }

  currentIndex++;

  if (currentIndex < players.length) {
    setTimeout(() => {
      updateTurnDisplay();
    }, 2000);
  } else {
    setTimeout(() => {
      document.getElementById("roleSection").classList.remove("active");
      document.getElementById("gameSection").classList.add("active");
      if (isPointsEnabled) {
        document.getElementById("pointsDisplay").style.display = "block";
        updatePointsDisplay();
      } else {
        document.getElementById("pointsDisplay").style.display = "none";
      }
    }, 2000);
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
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timer").textContent = "დრო ამოიწურა!";
      document.getElementById("alarmSound").play();
      showFindSpySection();
    }
  }, 1000);
}

function updateTimerDisplay(time) {
  let minutes = String(Math.floor(time / 60)).padStart(2, "0");
  let seconds = String(time % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

function updatePointsDisplay() {
  let pointsHtml = "";
  players.forEach((p, i) => {
    pointsHtml += `<span>${p.name}: ${p.points}</span> | `;
  });
  document.getElementById("pointsDisplay").innerHTML = pointsHtml.slice(0, -2);
}

function endGame() {
  clearInterval(timerInterval);
  showFindSpySection();
}

function showFindSpySection() {
  document.getElementById("gameSection").classList.remove("active");
  document.getElementById("findSpySection").classList.add("active");

  let select = document.getElementById("findSpySelect");
  select.innerHTML = "";
  
  // დავამატოთ "აირჩიეთ" დეფოლტად
  let defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "აირჩიეთ";
  defaultOption.selected = true;
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

  // თუ "აირჩიეთ" არის არჩეული
  if (isNaN(guessIndex)) {
    // თამაში დასრულდება ჩვეულებრივად, მაგრამ არავინ მოიგებს
    document.getElementById("findSpySection").classList.remove("active");
    // document.getElementById("resultText").textContent = "არავინ მოიგო!";
    revealSpies();
    return;
  }

  document.getElementById("findSpySection").classList.remove("active");
  if (isDetectiveMode && roles[guessIndex] === "Detective") {
    endGameWithDetectiveLoss(guessIndex);
  } else {
    endGameWithPlayerGuess(guessIndex);
  }
}

function endGameWithPlayerGuess(guessIndex) {
  let spyIndex = roles.indexOf("Spy");
  let resultText = "";

  if (isPointsEnabled) {
    if (guessIndex === spyIndex) {
      players[spyIndex].points -= 30;
      resultText = "თქვენ სწორად იპოვეთ ჯაშუში!";
    } else {
      players[spyIndex].points += 70;
      resultText = "თქვენ ვერ იპოვეთ ჯაშუში!";
    }
  } else {
    if (guessIndex === spyIndex) {
      resultText = "წააგო ჯაშუშმა!";
    } else {
      resultText = "მოიგო ჯაშუშმა!";
    }
  }

  if (isDetectiveMode && guessIndex !== spyIndex) {
    document.getElementById("resultText").textContent = resultText;
    showDetectiveGuessSection();
  } else {
    document.getElementById("resultText").textContent = resultText;
    revealSpies();
  }
}

function endGameWithDetectiveLoss(detectiveIndex) {
  let resultText = "თამაში დასრულდა! თქვენ მოკალით დეტექტივი.";
  let spyIndex = roles.indexOf("Spy");

  if (isPointsEnabled) {
    if (spyIndex !== -1) {
      players[spyIndex].points += 70;
    }
  }

  document.getElementById("resultText").textContent = resultText;
  revealSpies();
}

function showDetectiveGuessSection() {
  document.getElementById("detectiveSection").classList.add("active");
  let select = document.getElementById("detectiveGuessSelect");
  select.innerHTML = "";
  
  // დავამატოთ "აირჩიეთ" დეფოლტად
  let defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "აირჩიეთ";
  defaultOption.selected = true;
  select.appendChild(defaultOption);
  
  players.forEach((p, i) => {
    if (roles[i] !== "Detective") {
      let option = document.createElement("option");
      option.value = i;
      option.textContent = p.name;
      select.appendChild(option);
    }
  });
}

function detectiveGuess() {
  let guessIndex = parseInt(document.getElementById("detectiveGuessSelect").value);

  // თუ "აირჩიეთ" არის არჩეული
  if (isNaN(guessIndex)) {
    // თამაში დასრულდება ჩვეულებრივად, მაგრამ არავინ მოიგებს
    document.getElementById("detectiveSection").classList.remove("active");
    document.getElementById("resultText").textContent = "არავინ მოიგო!";
    revealSpies();
    return;
  }

  let spyIndex = roles.indexOf("Spy");
  let detectiveIndex = roles.indexOf("Detective");
  let resultText = "";
  if (isPointsEnabled) {
    if (guessIndex === spyIndex) {
      players[detectiveIndex].points += 50;
      if (spyIndex !== -1) players[spyIndex].points -= 20;
      resultText = `დეტექტივმა, ${players[detectiveIndex].name}-მ, სწორად გამოიცნო!`;
    } else {
      players[detectiveIndex].points -= 10;
      if (spyIndex !== -1) players[spyIndex].points += 30;
      resultText = `დეტექტივმა, ${players[detectiveIndex].name}-მ, ვერ გამოიცნო.`;
    }
  } else {
    if (guessIndex === spyIndex) {
      resultText = "დეტექტივმა სწორად გამოიცნო! ჯაშუშმა წააგო.";
    } else {
      resultText = "დეტექტივმა ვერ გამოიცნო. ჯაშუშმა მოიგო.";
    }
  }

  document.getElementById("resultText").textContent = resultText;
  document.getElementById("detectiveSection").classList.remove("active");
  revealSpies();
}

function revealSpies() {
  let spies = roles
    .map((r, i) => (r === "Spy" ? players[i].name : null))
    .filter(Boolean);
  let spiesText = spies.join(", ");

  document.getElementById("resultDisplay").textContent = `ჯაშუში: ${spiesText}`;
  document.getElementById("wordDisplay").textContent = `სიტყვა იყო: ${chosenWord}`;

  document.getElementById("resultSection").classList.add("active");
}

function showFinalPoints() {
  let modal = document.getElementById("finalPointsModal");
  let content = document.getElementById("finalPointsContent");
  content.innerHTML = "";
  players.forEach((p) => {
    let item = document.createElement("div");
    item.classList.add("player-score-item");
    item.innerHTML = `<span class="name">${p.name}:</span> <span class="points">${p.points}</span>`;
    content.appendChild(item);
  });
  modal.style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function restartGame() {
  document.getElementById("resultSection").classList.remove("active");
  document.getElementById("playerInput").classList.add("active");

  currentIndex = 0;
  updatePlayerList();
  document.getElementById("startTimerBtn").style.display = "block";
  document.getElementById("timer").textContent = "02:00";
}

window.onload = function () {
  createParticles();
  updatePlayerList();
  setTimeout(showReadyScreen, 1000);
};
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}