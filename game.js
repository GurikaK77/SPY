// game.js

const game = {
    async requestScreenLock() {
        try {
            if ('wakeLock' in navigator) {
                state.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock ON');
            }
        } catch (err) { console.log('Wake lock failed', err); }
    },

    async releaseScreenLock() {
        if (state.wakeLock !== null) {
            try { 
                await state.wakeLock.release(); 
                state.wakeLock = null; 
                console.log('Wake Lock OFF');
            } catch (err) {}
        }
    },

    startValidation() {
        if (!state.config.manualEntry) {
            const count = parseInt(document.getElementById("totalPlayersCount").value);
            state.players = [];
            for (let i = 1; i <= count; i++) {
                state.players.push({ name: `Player ${i}`, points: 0, coins: 10, inventory: [], level: 1, xp: 0, avatar: '👤' });
            }
            
            // იძულებით ვთიშავთ მკვლელს და სინდიკატს, თუ სახელები გამორთულია
            state.config.assassinCount = 0;
            state.config.syndicateCount = 0;
            if (state.config.blackoutAllowedRoles) {
                state.config.blackoutAllowedRoles = state.config.blackoutAllowedRoles.filter(r => r !== 'Assassin' && r !== 'Syndicate');
            }
        }
        
        if (state.players.length < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
        
        let activeCounts = {
            Spy: state.config.spyCount,
            Detective: 0, Assassin: 0, Doctor: 0,
            Joker: 0, Syndicate: 0, Hacker: 0, DoubleAgent: 0
        };

        // ბლექაუთის რენდომიზაციის და შეზღუდვის ლოგიკა
        if (state.config.modifierBlackout) {
            let allowed = [...(state.config.blackoutAllowedRoles || [])];
            allowed.sort(() => Math.random() - 0.5);

            let maxSpecialSlots = Math.floor(state.players.length / 2);
            if (maxSpecialSlots + state.config.spyCount >= state.players.length) {
                 maxSpecialSlots = state.players.length - state.config.spyCount - 1; 
            }

            if (maxSpecialSlots > 0) {
                maxSpecialSlots = Math.floor(Math.random() * maxSpecialSlots) + 1;
            } else {
                maxSpecialSlots = 0;
            }

            for (let role of allowed) {
                if (maxSpecialSlots <= 0) break;

                if (role === 'Syndicate') {
                    if (maxSpecialSlots >= 2) {
                        activeCounts.Syndicate = 2;
                        maxSpecialSlots -= 2;
                    }
                } else {
                    activeCounts[role] = 1;
                    maxSpecialSlots -= 1;
                }
            }
        } else {
            activeCounts.Detective = state.config.detectiveCount;
            activeCounts.Assassin = state.config.assassinCount;
            activeCounts.Doctor = state.config.doctorCount;
            activeCounts.Joker = state.config.jokerCount;
            activeCounts.Syndicate = state.config.syndicateCount;
            activeCounts.Hacker = state.config.hackerCount;
            activeCounts.DoubleAgent = state.config.doubleAgentCount;
        }
        
        const totalRoles = Object.values(activeCounts).reduce((a, b) => a + b, 0);
        
        if (totalRoles >= state.players.length && !state.config.modifierBlackout) {
            alert(`როლების რაოდენობა (${totalRoles}) მეტია ან ტოლია მოთამაშეების რაოდენობაზე (${state.players.length})! აკლია მოქალაქე.`); return;
        }
        
        this.startGame(activeCounts);
    },

    startGame(activeCounts) {
        state.audio.playSound('click');
        
        let pool = [];
        
        if (state.config.selectedCategories.includes("custom") && state.config.customWordsList.trim() !== "") {
            const customArr = state.config.customWordsList.split(',').map(w => w.trim()).filter(w => w.length > 0);
            customArr.forEach(w => {
                pool.push({ w: w, h: "შენი დამატებული სიტყვა" });
            });
        }
        
        if(state.config.theme !== 'standard' && typeof wordData !== 'undefined' && wordData[state.config.theme]) {
             pool = pool.concat(wordData[state.config.theme]);
        } else {
             state.config.selectedCategories.forEach(c => { 
                 if(c !== 'custom' && typeof wordData !== 'undefined' && wordData[c]) pool = pool.concat(wordData[c]); 
             });
        }
        
        if(pool.length === 0 && typeof wordData !== 'undefined') pool = wordData['mix'];
        
        let available = pool.filter(o => !state.usedWords.includes(o.w));
        if(available.length === 0) { state.usedWords = []; available = pool; }
        
        const selection = available[Math.floor(Math.random() * available.length)];
        state.chosenWordObj = selection;
        state.usedWords.push(selection.w);
        
        if (!state.gameStats.favoriteWords[selection.w]) state.gameStats.favoriteWords[selection.w] = 0;
        state.gameStats.favoriteWords[selection.w]++;
        
        if (state.config.gameVariant === 'chameleon') {
            let fakeOptions = pool.filter(o => o.w !== selection.w);
            if (fakeOptions.length === 0 && typeof wordData !== 'undefined') fakeOptions = wordData['mix'].filter(o => o.w !== selection.w);
            state.chameleonWordObj = fakeOptions.length > 0 ? fakeOptions[Math.floor(Math.random() * fakeOptions.length)] : { w: "???", h: "???" };
        } else {
            state.chameleonWordObj = { w: "", h: "" };
        }
        
        state.roles = Array(state.players.length).fill("Civilian");
        let indices = [...Array(state.players.length).keys()];
        if(state.config.playerOrder === 'random') {
            state.players.sort(() => Math.random() - 0.5); 
        }
        
        const assignRole = (roleName, count) => {
            for(let i=0; i<count; i++) {
                if(indices.length > 0) {
                    let rnd = Math.floor(Math.random() * indices.length);
                    state.roles[indices[rnd]] = roleName;
                    indices.splice(rnd, 1);
                }
            }
        };

        assignRole("Spy", activeCounts.Spy);
        assignRole("Detective", activeCounts.Detective);
        assignRole("Assassin", activeCounts.Assassin);
        assignRole("Doctor", activeCounts.Doctor);
        assignRole("Joker", activeCounts.Joker);
        assignRole("Syndicate", activeCounts.Syndicate);
        assignRole("Hacker", activeCounts.Hacker);
        assignRole("DoubleAgent", activeCounts.DoubleAgent);
        
        state.currentIndex = 0;
        state.isDetectiveMode = activeCounts.Detective > 0;
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

        this.requestScreenLock();

        const pd = document.getElementById("pointsDisplay");
        if(state.isPointsEnabled) {
            pd.style.display = "block";
            pd.innerHTML = state.players.map(p => `${p.avatar||'👤'} ${p.name}: ${p.points||0}`).join(' | ');
        } else { pd.style.display = "none"; }

        state.audio.setMusicContext('game');
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
        const timerEl = document.getElementById("timer");
        timerEl.textContent = `${m}:${s}`;

        if (state.timeLeft <= 10 && state.timeLeft > 0) {
            state.audio.playSound('tick');
            if (window.anim) anim.urgency(timerEl);
        }
    },

    generateHelperQuestion() {
        state.audio.playSound('click');
        if (typeof helperQuestions !== 'undefined') {
            const q = helperQuestions[Math.floor(Math.random() * helperQuestions.length)];
            const el = document.getElementById("helperText");
            el.style.opacity = 0;
            setTimeout(() => {
                el.textContent = q;
                el.style.opacity = 1;
                if (window.anim) anim.pop(el);
            }, 200);
        }
    },

    endGame() {
        state.audio.playSound('click');
        clearInterval(state.timerInterval);
        this.releaseScreenLock(); 
        
        if(state.isPointsEnabled || state.config.modifierInfection) {
            this.showFindSpyVoting();
        } else {
            this.revealSpies(false);
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
        
        const btn = document.getElementById("submitVoteBtn");
        if(btn) btn.disabled = false;
        
        if (state.config.modifierBlackout) {
            title.textContent = "ბლექაუთი: ვინ არის მტერი?";
            desc.innerHTML = `სრული წყვდიადია. აირჩიეთ მთავარი ეჭვმიტანილი:`;
        } else if(state.isDetectiveMode) {
             const dets = state.roles.map((r,i) => r==='Detective'?state.players[i].name:null).filter(Boolean).join(", ");
             title.textContent = "დეტექტივი, ეძებე!";
             desc.innerHTML = `<strong>${dets}</strong> - აირჩიეთ ჯაშუში:`;
        } else {
             title.textContent = "ვინ არის ჯაშუში?";
             desc.textContent = "მოთამაშეებმა ერთობლივად უნდა აირჩიონ:";
        }
    },

    addXP(player, amount) {
        player.xp = parseInt(player.xp) || 0;
        player.level = parseInt(player.level) || 1;
        player.xp += amount;
        
        while (player.xp >= player.level * 100) {
            player.xp -= player.level * 100;
            player.level++;
            ui.showToast(`🎉 ${player.name} გადავიდა ${player.level} ლეველზე!`);
        }
    },

    makePlayerGuess() {
        const btn = document.getElementById("submitVoteBtn");
        if (btn) btn.disabled = true; 
        
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
            resultText = "ჯაშუშმა მოიგო!"; 
        }
        
        document.getElementById("resultText").textContent = resultText;
        
        state.players.forEach((p, i) => {
            p.inventory = p.inventory || [];
            p.cosmetics = p.cosmetics || [];
            p.points = parseInt(p.points) || 0;
            p.coins = parseInt(p.coins) || 0;
            
            let pts = 0;
            let earnedCoins = 0;
            let earnedXP = 10; 
            const role = state.roles[i];

            if (jokerWins) {
                if (role === "Joker") { pts = 5; earnedCoins = 10; earnedXP += 50; }
            } else if (civiliansWin) {
                if (["Civilian", "Detective", "Doctor", "Syndicate", "Hacker"].includes(role)) {
                    pts = 2; earnedCoins = 5; earnedXP += 30;
                    if (role === "Detective" && p.inventory.some(x=>x.id==='magnifier')) { pts += 3; earnedCoins += 2; }
                    if (role === "Hacker") { pts += 1; earnedCoins += 2; earnedXP += 10; } 
                }
            } else {
                if (role === "Spy") {
                    pts = 3; earnedCoins = 8; earnedXP += 40;
                    if (state.config.gameVariant === 'chameleon') { pts += 2; earnedXP += 20; }
                    if (p.inventory.some(x=>x.id==='spy_mask')) pts += 3;
                    if (p.inventory.some(x=>x.id==='backdoor')) { pts *= 2; earnedCoins *= 2; }
                }
                if (role === "Assassin" || role === "DoubleAgent") {
                    pts = 3; earnedCoins = 5; earnedXP += 30;
                }
            }
            
            p.points += Math.round(pts);
            
            // ეკონომიკა მხოლოდ სახელების ჩაწერისას
            if (state.config.manualEntry) {
                p.coins += earnedCoins;
                this.addXP(p, earnedXP);
            }
            
            state.gameStats.totalPoints = (parseInt(state.gameStats.totalPoints) || 0) + Math.round(pts);
        });

        if (!civiliansWin && !jokerWins && state.config.modifierInfection) {
            state.config.spyCount++;
            ui.showToast("🦠 ინფექცია: ჯაშუშების რაოდენობა გაიზარდა!");
        }
        
        this.revealSpies(true);
    },

    revealSpies(calculated = false, forceNoText = false) {
        state.audio.playSound('reveal');
        
        const spies = state.roles.map((r, i) => r === "Spy" ? state.players[i].name : null).filter(Boolean).join(", ");
        const jokers = state.roles.map((r, i) => r === "Joker" ? state.players[i].name : null).filter(Boolean).join(", ");
        const dAgents = state.roles.map((r, i) => r === "DoubleAgent" ? state.players[i].name : null).filter(Boolean).join(", ");
        
        let revealHtml = '';

        if (state.config.manualEntry) {
            revealHtml = `
                <div class="spy-reveal-container">
                    <div class="spy-label">ჯაშუში არის</div>
                    <div class="spy-name-big">${spies || "ვერ მოიძებნა"}</div>
                </div>`;
            
            if (jokers) revealHtml += `<div style="margin-top:10px; font-size:1rem; color:var(--warning);">🃏 ჯოკერი იყო: ${jokers}</div>`;
            if (dAgents) revealHtml += `<div style="margin-top:10px; font-size:1rem; color:var(--hacker-green);">🕵️‍♂️ ორმაგი აგენტი: ${dAgents}</div>`;
        } else {
            revealHtml = `
                <div class="spy-reveal-container" style="margin: 20px 0;">
                    <div class="spy-label" style="color: var(--text-muted); font-size: 1.1rem;">
                        <i class="fas fa-user-secret" style="margin-right: 8px;"></i> ჯაშუშის ვინაობა დაფარულია 
                        <br><span style="font-size: 0.85rem;">(რადგან მოთამაშეების სახელები გამორთულია)</span>
                    </div>
                </div>`;
        }
        
        if(state.config.gameVariant === 'chameleon') {
             revealHtml += `<div style="margin-top:20px; font-size:1rem; color:var(--neon-pink);">
                ჯაშუშის სიტყვა იყო: <strong>${state.chameleonWordObj.w}</strong>
             </div>`;
        }
        
        document.getElementById("resultDisplay").innerHTML = revealHtml;
        document.getElementById("wordDisplay").textContent = `ნამდვილი სიტყვა: ${state.chosenWordObj.w}`;
        
        const rText = document.getElementById("resultText");
        const ptsBtn = document.getElementById("showPointsBtn");
        
        if(!state.isPointsEnabled || forceNoText) {
            rText.style.display = 'none';
            if (ptsBtn) ptsBtn.style.display = 'none';
        } else {
            rText.style.display = 'block';
            if (ptsBtn) ptsBtn.style.display = 'inline-flex';
        }
        
        if (!calculated && !forceNoText) {
            state.gameStats.totalGames = (parseInt(state.gameStats.totalGames) || 0) + 1;
            if (state.config.manualEntry) {
                state.players.forEach(p => this.addXP(p, 10));
            }
        }

        if (calculated) {
            state.gameStats.totalGames = (parseInt(state.gameStats.totalGames) || 0) + 1;
            const spyWon = rText.textContent === "ჯაშუშმა მოიგო!";
            if (spyWon) state.gameStats.spyWins = (parseInt(state.gameStats.spyWins) || 0) + 1;
            else if (rText.textContent === "დეტექტივმა მოიგო!" || rText.textContent === "ჯაშუში გამოიცნეს!") {
                state.gameStats.civilianWins = (parseInt(state.gameStats.civilianWins) || 0) + 1;
            }
            state.checkAchievements();
        }
        
        if (calculated) {
            const spyWon = rText.textContent === "ჯაშუშმა მოიგო!";
            if (spyWon) state.audio.playSound('glitch');
            else state.audio.playSound('victory');
        } else {
            state.audio.playSound('victory');
        }

        ui.setActiveSection('resultSection');
        state.audio.setMusicContext('menu');
        state.saveGame();
    },

    restartGame(sameConfig) {
        clearInterval(state.timerInterval);
        this.releaseScreenLock(); 
        state.clearGameState();
        if(sameConfig) {
            if(state.config.playerOrder === 'sequential' && state.players.length > 0) {
                 state.players.push(state.players.shift()); 
            }
            this.startValidation();
        } else {
            ui.showPlayerInput();
        }
    },
    
    buyItem(itemId, pIndex) {
        const player = state.players[pIndex];
        const item = typeof shopItems !== 'undefined' ? shopItems.find(i => i.id === itemId) : null;
        if(!item) return;
        
        player.coins = parseInt(player.coins) || 0;
        player.inventory = player.inventory || [];
        player.cosmetics = player.cosmetics || [];

        if(player.coins >= item.price) {
            player.coins -= item.price;
            
            if (item.type === 'avatar') {
                player.avatar = item.icon;
                ui.showToast(`ავატარი არჩეულია!`);
            } else if(item.type === 'instant') {
                player.points = (parseInt(player.points) || 0) + (item.effectValue || 0);
                this.addXP(player, item.xpValue || 0);
                ui.showToast(`+${item.effectValue} ქულა!`);
            } else if (item.type === 'cosmetic') {
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
