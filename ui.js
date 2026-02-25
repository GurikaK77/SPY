// ui.js

const ui = {
    initAudio() {
        if(state.audio && state.audio.sounds && state.audio.sounds.click) {
            state.audio.sounds.click.play().then(() => {
                state.audio.sounds.click.pause(); state.audio.sounds.click.currentTime = 0;
            }).catch(e => {});
        }
    },

    showToast(message) {
        const toast = document.getElementById("toastMessage");
        if (toast) {
            toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            toast.classList.add("show");
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => { toast.classList.remove("show"); }, 3000);
        }
    },

    toggleBurgerMenu() {
        document.getElementById("burgerMenuContent").classList.toggle("show");
        document.getElementById("burgerMenuOverlay").classList.toggle("show");
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
        if(state.config.theme !== 'standard') document.body.classList.add(`theme-${state.config.theme}`);
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
        
        if (activeId === 'statsSection') this.showStats();
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

    adjustPlayerCount(delta) {
        state.audio.playSound('click');
        const input = document.getElementById("totalPlayersCount");
        let val = parseInt(input.value) || 5;
        val += delta;
        if(val < 3) val = 3; if(val > 20) val = 20;
        input.value = val;
        this.updateInputMode(true);
    },

    updateInputMode(triggeredByToggle = false) {
        const manualToggle = document.getElementById("manualEntryToggle");
        const manualContainer = document.getElementById("manualInputContainer");
        const autoContainer = document.getElementById("autoInputContainer");
        const pointsSelect = document.getElementById("pointsSystem");
        const countInput = document.getElementById("totalPlayersCount");

        const isManual = manualToggle ? manualToggle.checked : true;
        
        if (triggeredByToggle) {
            if (isManual) {
                state.players = state.savedManualPlayers || [];
            } else {
                if (state.config.manualEntry) state.savedManualPlayers = [...state.players];
                const count = parseInt(countInput.value) || 5;
                state.players = [];
                for (let i = 1; i <= count; i++) {
                     state.players.push({ name: `Player ${i}`, points: 0, coins: 10, inventory: [], level: 1, xp: 0, avatar: '👤' });
                }
            }
        }
        
        state.config.manualEntry = isManual;
        this.updatePlayerList();

        if (isManual) {
            manualContainer.style.display = "block"; autoContainer.style.display = "none";
            if(pointsSelect) pointsSelect.disabled = false;
        } else {
            manualContainer.style.display = "none"; autoContainer.style.display = "block";
            if(pointsSelect) { pointsSelect.value = "disabled"; pointsSelect.disabled = true; state.config.pointsSystem = "disabled"; }
            
            // ვთიშავთ მკვლელს და სინდიკატს ავტომატურ რეჟიმში
            state.config.assassinCount = 0;
            state.config.syndicateCount = 0;
            if (state.config.blackoutAllowedRoles) {
                state.config.blackoutAllowedRoles = state.config.blackoutAllowedRoles.filter(r => r !== 'Assassin' && r !== 'Syndicate');
            }
        }
        this.updatePlayerCountInfo();
    },

    addPlayer() {
        state.audio.playSound('click');
        const input = document.getElementById("playerName");
        const name = input.value.trim();
        if (name && !state.players.some(p => p.name === name)) {
            state.players.push({ name: name, points: 0, coins: 10, inventory: [], level: 1, xp: 0, avatar: '👤' });
            state.savedManualPlayers = [...state.players];
            this.updatePlayerList();
            input.value = "";
            state.saveGame();
        } else { alert("სახელი ცარიელია ან უკვე არსებობს"); }
    },

    updatePlayerList() {
        const list = document.getElementById("playerList");
        list.innerHTML = "";
        
        if (state.players.length === 0) return;

        state.players.forEach((p, i) => {
            const div = document.createElement("div");
            div.className = "player-item";
            
            p.cosmetics = p.cosmetics || [];
            if(p.cosmetics.includes('rainbow_name')) {
                div.style.background = 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)';
                div.style.backgroundSize = '400% 400%';
                div.style.animation = 'rainbow 3s ease infinite';
            }
            
            let removeBtnHtml = '';
            if (state.config.manualEntry) {
                removeBtnHtml = `<button class="remove-btn" onclick="state.players.splice(${i}, 1); state.savedManualPlayers = [...state.players]; ui.updatePlayerList(); state.saveGame();"><i class="fas fa-times"></i></button>`;
            }
            
            p.xp = parseInt(p.xp) || 0;
            p.level = parseInt(p.level) || 1;
            
            let xpNeeded = p.level * 100;
            let xpPercent = Math.min(100, Math.round((p.xp / xpNeeded) * 100)) + "%";

            div.innerHTML = `
                <div class="player-name" style="display:flex; align-items:center;">
                    <div class="player-avatar">${p.avatar || '👤'}</div>
                    <div style="display:flex; flex-direction:column;">
                        <div>${p.name} <span class="level-badge">Lvl ${p.level}</span></div>
                        <div class="xp-bar-container"><div class="xp-bar-fill" style="width:${xpPercent};"></div></div>
                    </div>
                </div>
                ${removeBtnHtml}
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
    
    switchSettingsTab(tabName) {
        state.audio.playSound('click');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-tab'));
        const activeTab = document.getElementById(`tab-${tabName}`);
        if (activeTab) activeTab.classList.add('active-tab');
    },

    toggleBlackoutSettings() {
        const el = document.getElementById("blackoutRolesSettings");
        if (el) {
            el.style.display = state.config.modifierBlackout ? "block" : "none";
        }
    },

    showSystemSettings() {
        state.audio.playSound('click');
        
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal("spyCountConfig", state.config.spyCount);
        setVal("detectiveCount", state.config.detectiveCount);
        setVal("assassinCount", state.config.assassinCount);
        setVal("doctorCount", state.config.doctorCount);
        setVal("jokerCount", state.config.jokerCount);
        setVal("syndicateCount", state.config.syndicateCount);
        setVal("hackerCount", state.config.hackerCount);
        setVal("doubleAgentCount", state.config.doubleAgentCount);
        
        setVal("timeConfig", state.config.timePerRound / 60); 
        setVal("pointsSystem", state.config.pointsSystem);
        setVal("playerOrder", state.config.playerOrder);
        setVal("themeSelect", state.config.theme);
        
        document.getElementById("spyHintToggle").checked = state.config.spyHintEnabled;
        document.getElementById("modBlackout").checked = state.config.modifierBlackout;
        document.getElementById("modInfection").checked = state.config.modifierInfection;
        document.getElementById("customWordsInput").value = state.config.customWordsList || "";
        
        this.toggleBlackoutSettings();
        
        // მკვლელის და სინდიკატის მენიუს გათიშვა/ჩართვის ლოგიკა გლობალურად და ბლექაუთში
        const assSelect = document.getElementById("assassinCount");
        const synSelect = document.getElementById("syndicateCount");
        if (assSelect) {
            assSelect.disabled = !state.config.manualEntry;
            if(!state.config.manualEntry) { assSelect.value = "0"; state.config.assassinCount = 0; }
        }
        if (synSelect) {
            synSelect.disabled = !state.config.manualEntry;
            if(!state.config.manualEntry) { synSelect.value = "0"; state.config.syndicateCount = 0; }
        }

        const bRoles = state.config.blackoutAllowedRoles || [];
        document.querySelectorAll("#blackoutRolesSettings input[type='checkbox']").forEach(cb => {
            cb.checked = bRoles.includes(cb.value);
            if (cb.value === 'Assassin' || cb.value === 'Syndicate') {
                cb.disabled = !state.config.manualEntry;
                if(!state.config.manualEntry) cb.checked = false;
            }
        });
        
        state.setGameVariant(state.config.gameVariant);
        
        const container = document.getElementById("categoriesContainer");
        container.innerHTML = "";
        
        const basicCats = ["mix", "objects", "nature", "places", "custom", "halloween", "christmas", "cyberpunk", "fantasy"];
        
        basicCats.forEach(key => {
            const div = document.createElement("div");
            div.className = "category-option";
            const chk = document.createElement("input");
            chk.type = "checkbox"; chk.value = key; chk.id = `cat_${key}`;
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
            lbl.innerHTML = (typeof categoryNames !== 'undefined' && categoryNames[key]) ? categoryNames[key] : key;
            if(key === "custom") lbl.style.color = "var(--gold)";
            
            div.appendChild(chk); div.appendChild(lbl);
            container.appendChild(div);
        });

        this.switchSettingsTab('gameplay');
        this.setActiveSection('systemSettingsSection');
    },

    showShop() {
        state.audio.playSound('click');
        if (!state.config.manualEntry) {
            this.showToast("მაღაზია ხელმისაწვდომია მხოლოდ სახელებით დამატების რეჟიმში!");
            return;
        }
        
        const select = document.getElementById("shopPlayerSelect");
        select.innerHTML = "";
        state.players.forEach((p, i) => {
            const opt = document.createElement("option");
            opt.value = i; opt.textContent = `${p.avatar||'👤'} ${p.name}`;
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
        
        if(!player || !grid || typeof shopItems === 'undefined') return;
        
        player.coins = parseInt(player.coins) || 0;
        player.inventory = player.inventory || [];
        player.cosmetics = player.cosmetics || [];
        
        balance.textContent = player.coins;
        grid.innerHTML = "";

        shopItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "shop-item-card" + (item.hacker ? " hacker-item" : "") + (item.type === 'cosmetic' ? " cosmetic-item" : "");
            card.onclick = function() { this.classList.toggle('show-desc'); };

            const owns = player.inventory.some(i => i.id === item.id) || player.cosmetics.includes(item.id) || (item.type === 'avatar' && player.avatar === item.icon);
            const canBuy = (item.type === 'instant' ? true : !owns) && player.coins >= item.price;
            
            card.innerHTML = `
                <div class="shop-info-icon"><i class="fas fa-info"></i></div>
                <div class="shop-item-desc-overlay">${item.desc}</div>
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-title">${item.name}</div>
                <div class="shop-item-price">${item.price} <i class="fas fa-coins"></i></div>
                <button class="btn btn-buy" ${canBuy ? '' : 'disabled'} onclick="event.stopPropagation(); game.buyItem('${item.id}', ${pIndex})">
                    ${owns && item.type !== 'instant' ? 'არჩეულია' : 'ყიდვა'}
                </button>
            `;
            grid.appendChild(card);
        });
    },

    showStats() {
        const s = state.gameStats;
        let favWord = "არ არის"; let max = 0;
        if (s.favoriteWords) {
            for(const [w, c] of Object.entries(s.favoriteWords)) { if(c > max) { max = c; favWord = w; } }
        }
        
        const content = document.getElementById("statsContent");
        if(content) {
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${s.totalGames || 0}</div><div>სულ თამაში</div></div>
                    <div class="stat-card"><div class="stat-value">${s.spyWins || 0}</div><div>ჯაშუშის მოგება</div></div>
                    <div class="stat-card"><div class="stat-value">${s.civilianWins || 0}</div><div>მოქალაქის მოგება</div></div>
                </div>
                <div class="stats-details">
                    <p>საყვარელი სიტყვა: <span class="stat-highlight">${favWord}</span></p>
                </div>
            `;
        }
        
        const achGrid = document.getElementById("achievementsGrid");
        if(achGrid && typeof globalAchievements !== 'undefined') {
            achGrid.innerHTML = "";
            globalAchievements.forEach(ach => {
                const isUnlocked = s.achievements && s.achievements.includes(ach.id);
                achGrid.innerHTML += `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
                        <div class="achiev-icon">${ach.icon}</div>
                        <div class="achiev-info">
                            <h5>${ach.name}</h5>
                            <p>${ach.desc} (${isUnlocked ? ach.target : (ach.type==='games'?(s.totalGames||0):ach.type==='spy_wins'?(s.spyWins||0):(s.civilianWins||0))}/${ach.target})</p>
                        </div>
                    </div>
                `;
            });
        }
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
        
        const calculateStyle = (text) => {
            const len = text.length; const hasSpace = text.includes(' ');
            if (!hasSpace) {
                let size = len > 14 ? '1.3rem' : len > 11 ? '1.6rem' : len > 8 ? '2.0rem' : '2.5rem';
                return `font-size: ${size}; white-space: nowrap; display: block; width: 100%; text-align: center; line-height: 1.2; overflow: visible;`;
            } else {
                let size = (len < 15) ? '2.2rem' : '1.8rem';
                return `font-size: ${size}; white-space: normal; word-wrap: break-word; display: block; width: 100%; text-align: center; line-height: 1.1;`;
            }
        };

        let theWord = state.chosenWordObj.w;

        switch(role) {
            case "Spy":
                navigator.vibrate?.([100, 50, 100]);
                if (state.config.gameVariant === 'chameleon') {
                    contentHtml = `<div class="role-icon"><i class="fas fa-user"></i></div><div class="role-text">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chameleonWordObj.w)}">${state.chameleonWordObj.w}</span></div>`;
                } else {
                    let hintHtml = state.config.spyHintEnabled ? `<div style="font-size:0.9rem; color:#aaa; margin-top:10px;">მინიშნება: ${state.chosenWordObj.h}</div>` : "";
                    contentHtml = `<div class="role-icon" style="color:var(--neon-pink)"><i class="fas fa-user-secret"></i></div><div class="role-text spy-text">ჯაშუში</div>${hintHtml}`;
                }
                break;
            case "Detective":
                let detectiveHintHtml = "";
                if (state.config.gameVariant === 'chameleon') {
                    detectiveHintHtml = `<div style="font-size:0.9rem; color:var(--neon-blue); font-weight:bold; margin-bottom:5px;"><i class="fas fa-user-secret"></i> ჯაშუში ხედავს სიტყვას:</div><div style="font-size:1rem; color:#fff; font-style:italic;">"${state.chameleonWordObj.w}"</div>`;
                } else {
                    detectiveHintHtml = `<div style="font-size:0.9rem; color:var(--neon-blue); font-weight:bold; margin-bottom:5px;"><i class="fas fa-user-secret"></i> ჯაშუშის მინიშნება:</div><div style="font-size:1rem; color:#fff; font-style:italic;">"${state.chosenWordObj.h}"</div>`;
                }
                
                contentHtml = `<div class="role-icon" style="color:var(--neon-blue)"><i class="fas fa-search"></i></div><div class="role-text detektivi">დეტექტივი</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div>
                    <div style="background:rgba(0, 243, 255, 0.1); border:1px solid var(--neon-blue); border-radius:10px; padding:10px; margin-top:15px;">${detectiveHintHtml}</div>`;
                break;
            case "Assassin":
                let spyNames = [];
                state.roles.forEach((r, i) => { if (r === "Spy") spyNames.push(state.players[i].name); });
                let spyText = spyNames.length > 0 ? spyNames.join(", ") : "ვერ მოიძებნა";
                
                contentHtml = `
                    <div class="role-icon" style="color:var(--neon-pink)"><i class="fas fa-skull-crossbones"></i></div>
                    <div class="role-text" style="color:var(--neon-pink)">მკვლელი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br>
                    <span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div>
                    <div style="margin-top:15px; font-size:0.9rem; color:var(--neon-pink);">
                        დასაცავი ჯაშუში:<br><strong>${spyText}</strong>
                    </div>`;
                break;
            case "Doctor":
                contentHtml = `<div class="role-icon" style="color:#00ff88"><i class="fas fa-user-md"></i></div><div class="role-text" style="color:#00ff88">ექიმი</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div>`;
                break;
            case "Joker":
                contentHtml = `<div class="role-icon" style="color:#ffaa00"><i class="fas fa-theater-masks"></i></div><div class="role-text" style="color:#ffaa00">ჯოკერი</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${state.chosenWordObj.w}</span></div>`;
                break;
            case "Syndicate":
                let partner = "ვერ მოიძებნა";
                state.roles.forEach((r, i) => { if(r === "Syndicate" && i !== state.currentIndex) partner = state.players[i].name; });
                contentHtml = `<div class="role-icon" style="color:#ff00ff"><i class="fas fa-user-friends"></i></div><div class="role-text" style="color:#ff00ff">სინდიკატი</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div><div style="margin-top:15px; font-size:1rem; color:#ff00ff;">შენი პარტნიორი:<br><strong>${partner}</strong></div>`;
                break;
            case "Hacker":
                contentHtml = `<div class="role-icon" style="color:var(--hacker-green)"><i class="fas fa-laptop-code"></i></div><div class="role-text" style="color:var(--hacker-green)">ჰაკერი</div><div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br><span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div><div style="margin-top:10px; font-size:0.85rem; color:var(--hacker-green);">სისტემის პრივილეგია:<br>შენი ხმა ითვლება 2-ად.</div>`;
                break;
            case "DoubleAgent":
                contentHtml = `
                    <div class="role-icon" style="color:var(--warning)"><i class="fas fa-user-ninja"></i></div>
                    <div class="role-text" style="color:var(--warning); font-size:1.5rem;">ორმაგი აგენტი</div>
                    <div style="font-size:0.8rem; margin-top:10px; color:#aaa;">სიტყვა:<br>
                    <span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${theWord}</span></div>
                    <div style="margin-top:10px; font-size:0.85rem; color:#aaa;">
                        შენ ხარ ჯაშუშის მოკავშირე. გადაარჩინე ის ისე, რომ <strong style="color:var(--warning)">არ იცი ვინ არის ის!</strong>
                    </div>`;
                break;
            default: // Civilian
                contentHtml = `
                    <div class="role-icon" style="color:#aaa;"><i class="fas fa-user"></i></div>
                    <div style="font-size:0.8rem; margin-top:20px; color:#aaa;">სიტყვა:<br>
                    <span class="sityva" style="${calculateStyle(state.chosenWordObj.w)}">${state.chosenWordObj.w}</span></div>
                `;
                if (state.config.modifierBlackout) {
                    contentHtml += `<div style="font-size:0.75rem; color:var(--neon-pink); margin-top:20px; text-transform:uppercase;"><i class="fas fa-eye-slash"></i> ბლექაუთი აქტიურია</div>`;
                }
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
        
        [...state.players].sort((a,b) => (parseInt(b.points)||0) - (parseInt(a.points)||0)).forEach((p, i) => {
             content.innerHTML += `<div class="player-score-item">
                <div style="display:flex; align-items:center;">
                    <span style="margin-right:10px;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':''}</span>
                    ${p.avatar||'👤'} ${p.name} <span class="level-badge">Lvl ${p.level||1}</span>
                </div>
                <div>${p.points||0} ქულა</div>
             </div>`;
        });
        modal.style.display = "flex";
    },

    closeModal(id) { document.getElementById(id).style.display = "none"; },
    
    closeWelcomeModal() {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('hasSeenRulesModal', 'true');
    },
    
    goToRulesFromWelcome() {
        this.closeWelcomeModal();
        document.getElementById("readyScreen").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        this.showInstructions();
    },

    showInstructions() { this.setActiveSection('instructionsSection'); },
    showAbout() { this.setActiveSection('aboutSection'); },
    updateChallengesDisplay() { /* placeholder */ }
};
