// ui.js

const ui = {
    showToast(message) {
        const toast = document.getElementById("toastMessage");
        if (toast) {
            toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            toast.classList.add("show");
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => { toast.classList.remove("show"); }, 2000);
        }
    },

    toggleBurgerMenu() {
        const menu = document.getElementById("burgerMenuContent");
        const overlay = document.getElementById("burgerMenuOverlay");
        menu.classList.toggle("show");
        overlay.classList.toggle("show");
        
        const st = document.getElementById("burgerSoundToggle");
        if(st) st.checked = state.soundEnabled;
    },

    closeBurgerMenu() {
        document.getElementById("burgerMenuContent").classList.remove("show");
        document.getElementById("burgerMenuOverlay").classList.remove("show");
    },
    
    toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        this.showToast(state.soundEnabled ? "🔊 ხმა ჩართულია" : "🔇 ხმა გამორთულია");
        state.saveGame();
    },
    
    updateTheme() {
        document.body.classList.remove('theme-halloween', 'theme-christmas', 'theme-cyberpunk', 'theme-fantasy');
        
        if(state.config.theme !== 'standard') {
            document.body.classList.add(`theme-${state.config.theme}`);
        }
        
        if(window.createParticles) window.createParticles();
    },

    setActiveSection(activeId) {
        const sections = ['playerInput', 'shopSection', 'roleSection', 'gameSection', 
                         'findSpySection', 'resultSection', 'statsSection',
                         'challengesSection', 'instructionsSection', 'aboutSection',
                         'systemSettingsSection']; 
        
        const logoArea = document.getElementById('logoArea');
        const hideLogo = ['gameSection', 'roleSection', 'findSpySection', 'resultSection'].includes(activeId);
        if (logoArea) logoArea.style.display = hideLogo ? 'none' : 'block';

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === activeId) { el.style.display = "block"; el.classList.add("active"); }
                else { el.style.display = "none"; el.classList.remove("active"); }
            }
        });
        
        if (activeId === 'statsSection') this.updateStatsDisplay();
        if (activeId === 'challengesSection') this.updateChallengesDisplay();
        if (activeId === 'shopSection') this.renderShopItems();
        if (state.players.length > 0) state.saveGame();
    },

    showMainPage() {
        state.audio.playSound('click');
        document.getElementById("readyScreen").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        this.showPlayerInput();
    },

    showPlayerInput() {
        this.setActiveSection('playerInput');
        this.updateInputMode(false); 
        this.updatePlayerList();
    },

    updateInputMode(triggeredByToggle = false) {
        const manualToggle = document.getElementById("manualEntryToggle");
        const manualContainer = document.getElementById("manualInputContainer");
        const autoContainer = document.getElementById("autoInputContainer");
        const pointsSelect = document.getElementById("pointsSystem");
        const countInput = document.getElementById("totalPlayersCount");

        const isManual = manualToggle ? manualToggle.checked : true;
        state.config.manualEntry = isManual;

        if (triggeredByToggle) {
            if (isManual) {
                state.players = [];
            } else {
                const count = parseInt(countInput.value) || 5;
                state.players = [];
                for (let i = 1; i <= count; i++) {
                     state.players.push({ 
                        name: `მოთამაშე ${i}`, 
                        points: 0, coins: 10, inventory: [], level: 1, xp: 0 
                    });
                }
            }
            this.updatePlayerList();
        }

        if (isManual) {
            manualContainer.style.display = "block";
            autoContainer.style.display = "none";
            if(pointsSelect) pointsSelect.disabled = false;
        } else {
            manualContainer.style.display = "none";
            autoContainer.style.display = "block";
            if(pointsSelect) { 
                pointsSelect.value = "disabled"; 
                pointsSelect.disabled = true; 
                state.config.pointsSystem = "disabled";
            }
        }
        
        this.updatePlayerCountInfo();
    },

    addPlayer() {
        state.audio.playSound('click');
        const input = document.getElementById("playerName");
        const name = input.value.trim();
        if (name && !state.players.some(p => p.name === name)) {
            state.players.push({ 
                name: name, points: 0, coins: 10, inventory: [], level: 1, xp: 0 
            });
            this.updatePlayerList();
            input.value = "";
            state.saveGame();
        } else {
            alert("სახელი ცარიელია ან უკვე არსებობს");
        }
    },

    updatePlayerList() {
        const list = document.getElementById("playerList");
        list.innerHTML = "";
        
        // აქ შევცვალეთ: თუ სია ცარიელია, უბრალოდ ვასრულებთ და არაფერს ვწერთ
        if (state.players.length === 0) {
            return; 
        }

        state.players.forEach((p, i) => {
            const div = document.createElement("div");
            div.className = "player-item";
            if(p.cosmetics && p.cosmetics.includes('rainbow_name')) {
                div.style.background = 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)';
                div.style.backgroundSize = '400% 400%';
                div.style.animation = 'rainbow 3s ease infinite';
            }
            div.innerHTML = `
                <div class="player-name">
                    ${p.name} <span class="level-badge" style="font-size:0.7rem; margin-left:10px; background:var(--neon-purple); padding:2px 6px; border-radius:10px;">Lvl ${p.level}</span>
                </div>
                <button class="remove-btn" onclick="state.players.splice(${i}, 1); ui.updatePlayerList(); state.saveGame();">
                    <i class="fas fa-times"></i>
                </button>
            `;
            list.appendChild(div);
        });
        this.updatePlayerCountInfo();
    },

    updatePlayerCountInfo() {
        const span = document.querySelector("#playersCountInfo span");
        if(span) {
            span.textContent = state.players.length;
            span.style.color = state.players.length >= 3 ? "var(--success)" : "var(--neon-pink)";
        }
    },
    
    // --- NEW TABS LOGIC ---
    switchSettingsTab(tabName) {
        state.audio.playSound('click');
        
        // Update Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('onclick').includes(`'${tabName}'`)) {
                btn.classList.add('active');
            }
        });

        // Update Content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active-tab');
        });
        const activeContent = document.getElementById(`tab-${tabName}`);
        if(activeContent) activeContent.classList.add('active-tab');
    },

    showSystemSettings() {
        state.audio.playSound('click');
        
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal("spyCountConfig", state.config.spyCount);
        setVal("detectiveCount", state.config.detectiveCount);
        setVal("assassinCount", state.config.assassinCount);
        setVal("doctorCount", state.config.doctorCount);
        setVal("psychicCount", state.config.psychicCount);
        setVal("jokerCount", state.config.jokerCount);
        setVal("timeConfig", state.config.timePerRound);
        setVal("pointsSystem", state.config.pointsSystem);
        setVal("playerOrder", state.config.playerOrder);
        setVal("themeSelect", state.config.theme);

        // აქ ვამოწმებთ სეტინგებს გახსნისას
        const spyToggle = document.getElementById("spyHintToggle");
        if(spyToggle) spyToggle.checked = state.config.spyHintEnabled;
        
        state.setGameVariant(state.config.gameVariant);
        
        const container = document.getElementById("categoriesContainer");
        container.innerHTML = "";
        
        const basicCats = ["mix", "objects", "nature", "places"];
        
        basicCats.forEach(key => {
            const div = document.createElement("div");
            div.className = "category-option";
            const chk = document.createElement("input");
            chk.type = "checkbox";
            chk.value = key;
            chk.id = `cat_${key}`;
            if(state.config.selectedCategories.includes(key)) chk.checked = true;
            
            chk.onchange = function() {
                const checkboxes = document.querySelectorAll("#categoriesContainer input[type='checkbox']");
                const selected = [];
                checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
                if (selected.length === 0) selected.push("mix");
                state.updateConfig('selectedCategories', selected);
            };
            
            const lbl = document.createElement("label");
            lbl.htmlFor = `cat_${key}`;
            lbl.textContent = categoryNames[key];
            
            div.appendChild(chk); div.appendChild(lbl);
            container.appendChild(div);
        });

        this.switchSettingsTab('gameplay');
        this.setActiveSection('systemSettingsSection');
    },

    showShop() {
        state.audio.playSound('click');
        const select = document.getElementById("shopPlayerSelect");
        select.innerHTML = "";
        state.players.forEach((p, i) => {
            const opt = document.createElement("option");
            opt.value = i; opt.textContent = p.name;
            select.appendChild(opt);
        });
        this.renderShopItems();
        this.setActiveSection('shopSection');
    },

    renderShopItems() {
        const pIndex = document.getElementById("shopPlayerSelect").value;
        const player = state.players[pIndex];
        const grid = document.getElementById("shopItemsGrid");
        const balance = document.getElementById("shopBalance");
        
        if(!player || !grid) return;
        balance.textContent = player.coins;
        grid.innerHTML = "";

        shopItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "shop-item-card" + (item.hacker ? " hacker-item" : "") + (item.type === 'cosmetic' ? " cosmetic-item" : "");
            card.onclick = function() { this.classList.toggle('show-desc'); };

            const owns = player.inventory?.some(i => i.id === item.id) || player.cosmetics?.includes(item.id);
            const canBuy = (item.type === 'instant' ? true : !owns) && player.coins >= item.price;
            
            card.innerHTML = `
                <div class="shop-info-icon"><i class="fas fa-info"></i></div>
                <div class="shop-item-desc-overlay">${item.desc}</div>
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-title">${item.name}</div>
                <div class="shop-item-price">${item.price} <i class="fas fa-coins"></i></div>
                <button class="btn btn-buy" ${canBuy ? '' : 'disabled'} onclick="event.stopPropagation(); game.buyItem('${item.id}', ${pIndex})">
                    ${owns && item.type !== 'instant' ? 'ნაყიდია' : 'ყიდვა'}
                </button>
            `;
            grid.appendChild(card);
        });
    },

    showStats() {
        state.audio.playSound('click');
        const s = state.gameStats;
        let favWord = "არ არის";
        let max = 0;
        for(const [w, c] of Object.entries(s.favoriteWords)) {
            if(c > max) { max = c; favWord = w; }
        }
        
        const content = document.getElementById("statsContent");
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-value">${s.totalGames}</div><div>სულ თამაში</div></div>
                <div class="stat-card"><div class="stat-value">${s.spyWins}</div><div>ჯაშუშის მოგება</div></div>
                <div class="stat-card"><div class="stat-value">${s.civilianWins}</div><div>მოქალაქის მოგება</div></div>
            </div>
            <div class="stats-details">
                <p>საყვარელი სიტყვა: <span class="stat-highlight">${favWord}</span></p>
            </div>
        `;
        this.setActiveSection('statsSection');
    },
    
    showChallenges() {
        state.audio.playSound('click');
        this.updateChallengesDisplay();
        this.setActiveSection('challengesSection');
    },

    updateChallengesDisplay() {
        const container = document.getElementById('challengesContainer');
        if (!container) return;
        container.innerHTML = '';
        state.dailyChallenges.forEach(c => {
            const div = document.createElement('div');
            div.className = 'challenge-item';
            div.innerHTML = `
                <div class="challenge-text">${c.description}</div>
                <div class="challenge-progress">${c.progress}/${c.target}</div>
                ${c.completed ? '<div class="challenge-completed">✓</div>' : ''}
            `;
            container.appendChild(div);
        });
    },

    updateTurnDisplay() {
        const p = state.players[state.currentIndex];
        document.getElementById("playerTurn").textContent = p.name;
        document.getElementById("currentPlayer").textContent = `${state.currentIndex + 1} / ${state.players.length}`;
        document.getElementById("roleCard").classList.remove("flipped");
        document.getElementById("nextPlayerBtn").style.display = "none";
        document.getElementById("roleCardFront").innerHTML = `<div class="role-icon"><i class="fas fa-fingerprint"></i></div>`;
    },

    revealRole() {
        state.audio.playSound('reveal');
        document.getElementById("roleCard").classList.add("flipped");
        const role = state.roles[state.currentIndex];
        const back = document.getElementById("roleCardBack");
        
        let contentHtml = '';
        
        switch(role) {
            case "Spy":
                navigator.vibrate?.([100, 50, 100]);
                
                if (state.config.gameVariant === 'chameleon') {
                    contentHtml = `
                        <div class="role-icon"><i class="fas fa-user"></i></div>
                        <div class="role-text">სიტყვა:<br><span class="sityva">${state.chameleonWordObj.w}</span></div>
                    `;
                } else {
                    let hintHtml = "";
                    if (state.config.spyHintEnabled) {
                        hintHtml = `<div style="font-size:0.9rem; color:#aaa; margin-top:10px;">მინიშნება: ${state.chosenWordObj.h}</div>`;
                    }
                    contentHtml = `
                        <div class="role-icon" style="color:var(--neon-pink)"><i class="fas fa-user-secret"></i></div>
                        <div class="role-text spy-text">ჯაშუში</div>
                        ${hintHtml}
                    `;
                }
                break;
            case "Detective":
                contentHtml = `
                    <div class="role-icon" style="color:var(--neon-blue)"><i class="fas fa-search"></i></div>
                    <div class="role-text detektivi">დეტექტივი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="font-size:1.5rem">${state.chosenWordObj.w}</span></div>
                    
                    <div style="background:rgba(0, 243, 255, 0.1); border:1px solid var(--neon-blue); border-radius:10px; padding:10px; margin-top:15px;">
                        <div style="font-size:0.9rem; color:var(--neon-blue); font-weight:bold; margin-bottom:5px;">
                            <i class="fas fa-user-secret"></i> ჯაშუშის მინიშნება:
                        </div>
                        <div style="font-size:1rem; color:#fff; font-style:italic;">
                            "${state.chosenWordObj.h}"
                        </div>
                    </div>
                `;
                break;
            case "Assassin":
                contentHtml = `
                    <div class="role-icon" style="color:var(--neon-pink)"><i class="fas fa-skull-crossbones"></i></div>
                    <div class="role-text" style="color:var(--neon-pink)">მკვლელი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="font-size:1.5rem">${state.chosenWordObj.w}</span></div>
                `;
                break;
            case "Doctor":
                contentHtml = `
                    <div class="role-icon" style="color:#00ff88"><i class="fas fa-user-md"></i></div>
                    <div class="role-text" style="color:#00ff88">ექიმი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="font-size:1.5rem">${state.chosenWordObj.w}</span></div>
                `;
                break;
            case "Psychic":
                 let catName = "უცნობი";
                 for(let key in wordData) {
                     if(wordData[key].find(o => o.w === state.chosenWordObj.w)) {
                         catName = categoryNames[key] || key;
                         break;
                     }
                 }
                contentHtml = `
                    <div class="role-icon" style="color:#bf00ff"><i class="fas fa-eye"></i></div>
                    <div class="role-text" style="color:#bf00ff">ნათელმხილველი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="font-size:1.5rem">${state.chosenWordObj.w}</span></div>
                    <div style="font-size:0.8rem; color:#ffd700; margin-top:5px;">კატეგორია: ${catName}</div>
                `;
                break;
            case "Joker":
                contentHtml = `
                    <div class="role-icon" style="color:#ffaa00"><i class="fas fa-theater-masks"></i></div>
                    <div class="role-text" style="color:#ffaa00">ჯოკერი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="font-size:1.5rem">${state.chosenWordObj.w}</span></div>
                `;
                break;
            default: // Civilian
                contentHtml = `
                    <div class="role-icon"><i class="fas fa-user"></i></div>
                    <div class="role-text">სიტყვა:<br><span class="sityva">${state.chosenWordObj.w}</span></div>
                `;
        }
        
        back.innerHTML = contentHtml;
        document.getElementById("nextPlayerBtn").style.display = "block";
    },

    showTimerEnd() {
        state.audio.playSound('timerEnd');
        const s = document.getElementById("timerEndSignal");
        s.style.display = "flex";
        setTimeout(() => { s.style.display = "none"; game.endGame(); }, 3000);
    },
    
    showFinalPoints() {
        state.audio.playSound('click');
        const modal = document.getElementById("finalPointsModal");
        const content = document.getElementById("finalPointsContent");
        content.innerHTML = "";
        
        [...state.players].sort((a,b) => b.points - a.points).forEach((p, i) => {
             content.innerHTML += `<div class="player-score-item">
                <span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':''} ${p.name}</span>
                <span>${p.points} ქულა</span>
             </div>`;
        });
        modal.style.display = "flex";
    },

    closeModal(id) {
        document.getElementById(id).style.display = "none";
    },

    showInstructions() { this.setActiveSection('instructionsSection'); },
    showAbout() { this.setActiveSection('aboutSection'); }
};
