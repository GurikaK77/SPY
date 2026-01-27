// game.js

const game = {
    startValidation() {
        if (!state.config.manualEntry) {
            const count = parseInt(document.getElementById("totalPlayersCount").value);
            state.players = [];
            for (let i = 1; i <= count; i++) {
                state.players.push({ name: `მოთამაშე ${i}`, points: 0, coins: 10, inventory: [], level: 1, xp: 0 });
            }
        }
        
        if (state.players.length < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
        
        // Validate Role Counts
        const totalRoles = state.config.spyCount + state.config.detectiveCount + 
                           state.config.assassinCount + state.config.doctorCount + 
                           state.config.psychicCount + state.config.jokerCount;
        
        if (totalRoles >= state.players.length) {
            alert(`როლების რაოდენობა (${totalRoles}) მეტია ან ტოლია მოთამაშეების (${state.players.length})!`); return;
        }
        
        this.startGame();
    },

    startGame() {
        state.audio.playSound('click');
        
        // Select Word based on Theme or Categories
        let pool = [];
        
        // If specific theme is active (not standard), prefer those words
        if(state.config.theme !== 'standard' && wordData[state.config.theme]) {
             pool = wordData[state.config.theme];
        } else {
             state.config.selectedCategories.forEach(c => { if(wordData[c]) pool = pool.concat(wordData[c]); });
        }
        
        if(pool.length === 0) pool = wordData['mix'];
        
        // Avoid used words
        let available = pool.filter(o => !state.usedWords.includes(o.w));
        if(available.length === 0) { state.usedWords = []; available = pool; }
        
        const selection = available[Math.floor(Math.random() * available.length)];
        state.chosenWordObj = selection;
        state.usedWords.push(selection.w);
        
        // Roles Initialization
        state.roles = Array(state.players.length).fill("Civilian");
        let indices = [...Array(state.players.length).keys()];
        if(state.config.playerOrder === 'random') {
            state.players.sort(() => Math.random() - 0.5); 
        }
        
        // Helper to assign role
        const assignRole = (roleName, count) => {
            for(let i=0; i<count; i++) {
                if(indices.length > 0) {
                    let rnd = Math.floor(Math.random() * indices.length);
                    state.roles[indices[rnd]] = roleName;
                    indices.splice(rnd, 1);
                }
            }
        };

        // Assign Special Roles
        assignRole("Spy", state.config.spyCount);
        assignRole("Detective", state.config.detectiveCount);
        assignRole("Assassin", state.config.assassinCount);
        assignRole("Doctor", state.config.doctorCount);
        assignRole("Psychic", state.config.psychicCount);
        assignRole("Joker", state.config.jokerCount);
        
        state.currentIndex = 0;
        state.isDetectiveMode = state.config.detectiveCount > 0;
        state.isPointsEnabled = state.config.pointsSystem === 'enabled';
        
        ui.setActiveSection('roleSection');
        ui.updateTurnDisplay();
        state.saveGame();
    },

    nextPlayer() {
        state.audio.playSound('click');
        state.currentIndex++;
        if (state.currentIndex < state.players.length) {
            ui.updateTurnDisplay();
        } else {
            this.startTimerScreen();
        }
        state.saveGame();
    },

    startTimerScreen() {
        ui.setActiveSection('gameSection');
        document.getElementById("helperText").textContent = "";
        
        // Points Display
        const pd = document.getElementById("pointsDisplay");
        if(state.isPointsEnabled) {
            pd.style.display = "block";
            pd.innerHTML = state.players.map(p => `${p.name}: ${p.points}`).join(' | ');
        } else { pd.style.display = "none"; }
        
        state.timeLeft = state.config.timePerRound;
        this.updateTimer();
        this.startTimer();
    },

    startTimer() {
        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            this.updateTimer();
            if(state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                ui.showTimerEnd();
            }
        }, 1000);
    },

    updateTimer() {
        let m = String(Math.floor(state.timeLeft / 60)).padStart(2, '0');
        let s = String(state.timeLeft % 60).padStart(2, '0');
        document.getElementById("timer").textContent = `${m}:${s}`;
    },

    generateHelperQuestion() {
        state.audio.playSound('click');
        const q = helperQuestions[Math.floor(Math.random() * helperQuestions.length)];
        const el = document.getElementById("helperText");
        el.style.opacity = 0;
        setTimeout(() => { el.textContent = q; el.style.opacity = 1; }, 200);
    },

    endGame() {
        state.audio.playSound('click');
        clearInterval(state.timerInterval);
        
        if(state.isPointsEnabled) {
            this.showFindSpyVoting();
        } else {
            this.revealSpies();
        }
    },

    showFindSpyVoting() {
        ui.setActiveSection('findSpySection');
        const sel = document.getElementById("findSpySelect");
        sel.innerHTML = `<option value="" selected>არჩევა...</option>`;
        state.players.forEach((p, i) => {
            sel.innerHTML += `<option value="${i}">${p.name}</option>`;
        });
        
        const title = document.getElementById("findSpyTitle");
        const desc = document.getElementById("findSpyDescription");
        
        if(state.isDetectiveMode) {
             const dets = state.roles.map((r,i) => r==='Detective'?state.players[i].name:null).filter(Boolean).join(", ");
             title.textContent = "დეტექტივი, ეძებე!";
             desc.innerHTML = `<strong>${dets}</strong> - აირჩიეთ ჯაშუში:`;
        } else {
             title.textContent = "ვინ არის ჯაშუში?";
             desc.textContent = "მოთამაშეებმა უნდა აირჩიონ:";
        }
    },

    makePlayerGuess() {
        const idx = document.getElementById("findSpySelect").value;
        if(idx === "") {
            this.revealSpies(false, true); 
            return;
        }
        
        const targetRole = state.roles[idx];
        let resultText = "";
        let civiliansWin = false;
        let jokerWins = false;

        if (targetRole === "Spy") {
            resultText = state.isDetectiveMode ? "დეტექტივმა მოიგო!" : "ჯაშუში გამოიცნეს!";
            civiliansWin = true;
        } else if (targetRole === "Joker") {
            resultText = "ჯოკერმა მოიგო! მას უნდოდა რომ აგერჩიათ.";
            jokerWins = true;
        } else {
            resultText = "ჯაშუშმა მოიგო!"; // Incorrect guess
        }
        
        document.getElementById("resultText").textContent = resultText;
        
        // Calculate Points
        const multiplier = GAME_MODES[state.currentGameMode].pointsMultiplier;
        
        state.players.forEach((p, i) => {
            let pts = 0;
            const role = state.roles[i];

            if (jokerWins) {
                if (role === "Joker") pts = 5 * multiplier; // Huge bonus for Joker
            } else if (civiliansWin) {
                // Civilians, Detectives, Doctors, Psychics, Assassins (if betraying spy) win
                if (role !== "Spy" && role !== "Joker") {
                    pts = 2 * multiplier;
                    if (role === "Detective" && p.inventory.some(x=>x.id==='magnifier')) pts += 3;
                    if (role === "Assassin") pts += 1; // Assassin gets small bonus for finding Spy
                }
            } else {
                // Spy wins
                if (role === "Spy") {
                    pts = 3 * multiplier;
                    if (p.inventory.some(x=>x.id==='spy_mask')) pts += 3;
                    if (p.inventory.some(x=>x.id==='backdoor')) pts *= 2;
                }
                // Assassin wins with Spy
                if (role === "Assassin") {
                    pts = 3 * multiplier;
                }
            }
            
            p.points += Math.round(pts);
            state.gameStats.totalPoints += Math.round(pts);
        });
        
        // Coins for everyone
        state.players.forEach(p => p.coins += 2);
        
        this.revealSpies(true);
    },

    revealSpies(calculated = false, forceNoText = false) {
        state.audio.playSound('reveal');
        
        const spies = state.roles.map((r, i) => r === "Spy" ? state.players[i].name : null).filter(Boolean).join(", ");
        const jokers = state.roles.map((r, i) => r === "Joker" ? state.players[i].name : null).filter(Boolean).join(", ");
        
        let revealHtml = `
            <div class="spy-reveal-container">
                <div class="spy-label">ჯაშუში არის</div>
                <div class="spy-name-big">${spies}</div>
            </div>`;
        
        if (jokers) {
            revealHtml += `<div style="margin-top:10px; font-size:1rem; color:var(--warning);">🃏 ჯოკერი იყო: ${jokers}</div>`;
        }
        
        document.getElementById("resultDisplay").innerHTML = revealHtml;
        document.getElementById("wordDisplay").textContent = `საიდუმლო სიტყვა: ${state.chosenWordObj.w}`;
        
        const rText = document.getElementById("resultText");
        const ptsBtn = document.getElementById("showPointsBtn");
        
        if(!state.isPointsEnabled || forceNoText) {
            rText.style.display = 'none';
            ptsBtn.style.display = 'none';
        } else {
            rText.style.display = 'block';
            ptsBtn.style.display = 'inline-flex';
        }
        
        if(!calculated && !state.isPointsEnabled && !forceNoText) {
            state.gameStats.totalGames++;
        }
        
        ui.setActiveSection('resultSection');
        state.saveGame();
    },

    restartGame(sameConfig) {
        clearInterval(state.timerInterval);
        state.clearGameState();
        if(sameConfig) {
            if(state.config.playerOrder === 'sequential' && state.players.length > 0) {
                 state.players.push(state.players.shift()); // Rotate
            }
            this.startValidation();
        } else {
            ui.showPlayerInput();
        }
    },
    
    buyItem(itemId, pIndex) {
        const player = state.players[pIndex];
        const item = shopItems.find(i => i.id === itemId);
        if(player.coins >= item.price) {
            player.coins -= item.price;
            if(item.type === 'instant') {
                player.points += item.effectValue;
                ui.showToast(`+${item.effectValue} ქულა!`);
            } else if (item.type === 'cosmetic') {
                if(!player.cosmetics) player.cosmetics = [];
                player.cosmetics.push(item.id);
            } else {
                player.inventory.push(item);
            }
            state.audio.playSound('purchase');
            ui.renderShopItems();
            state.saveGame();
        }
    }
};
