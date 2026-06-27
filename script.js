// ============================================================
// MEMORY VAULT — script.js
// ============================================================

// ---------- Elements ----------
const videoOverlay = document.getElementById("videoOverlay");
const portalVideo = document.getElementById("portalVideo");

const screens = document.querySelectorAll(".screen");

const bootLine1 = document.getElementById("bootLine1");
const bootLine2 = document.getElementById("bootLine2");
const bootLine3 = document.getElementById("bootLine3");
const bootLine4 = document.getElementById("bootLine4");
const bootLines = [bootLine1, bootLine2, bootLine3, bootLine4];
const bootFooter = document.getElementById("bootFooter");
const bootGreeting = document.getElementById("bootGreeting");
const bootSubtitle = document.getElementById("bootSubtitle");
const enterBtn = document.getElementById("enterBtn");

const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const quizProgress = document.getElementById("quizProgress");
const quizCounter = document.getElementById("quizCounter");

const memoryProgress = document.getElementById("memoryProgress");
const memoryProgressLabel = document.getElementById("memoryProgressLabel");
const decryptText = document.getElementById("decryptText");
const memoryImage = document.getElementById("memoryImage");
const memoryCaption = document.getElementById("memoryCaption");
const nextMemoryBtn = document.getElementById("nextMemoryBtn");
const memoryList = document.getElementById("memoryList");

const terminalPrompt = document.getElementById("terminalPrompt");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const celebrationContent = document.getElementById("celebrationContent");
const birthdayTitle = document.getElementById("birthdayTitle");
const finalMessage = document.getElementById("finalMessage");
const replayBtn = document.getElementById("replayBtn");
const downloadBtn = document.getElementById("downloadBtn");

const bgMusic = document.getElementById("bgMusic");
const clickSound = document.getElementById("clickSound");
const successSound = document.getElementById("successSound");

// ---------- Cinematic screen switching ----------
function showScreen(id, animClass = "screen-fade-in") {
    screens.forEach((s) => {
        if (s.classList.contains("active")) {
            s.classList.add("screen-exit");
            setTimeout(() => {
                s.classList.remove("active", "screen-exit");
            }, 400);
        }
    });
    const next = document.getElementById(id);
    next.classList.add("active");
    if (animClass) {
        next.classList.remove(animClass);
        void next.offsetWidth; // reflow
        next.classList.add(animClass);
        setTimeout(() => next.classList.remove(animClass), 800);
    }
}

function playSound(audioEl) {
    if (!audioEl || !audioEl.src) return;
    audioEl.currentTime = 0;
    audioEl.play().catch(() => { });
}

// ---------- Load vault data ----------
function getVaultIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("vault");
}

function loadVaultData() {
    const vaultId = getVaultIdFromUrl();
    if (!vaultId) return null;
    const raw = localStorage.getItem(vaultId);
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch (e) { return null; }
}

const vaultData = loadVaultData();

if (!vaultData) {
    showScreen("errorScreen");
} else {
    initVault(vaultData);
}

// ============================================================
// MAIN FLOW
// ============================================================
function initVault(data) {
    if (data.music) bgMusic.src = data.music;
    runBootSequence(data.name);

    enterBtn.addEventListener("click", () => {

        playSound(clickSound);

        animateWordsToPortal(
            document.querySelector('.boot-container')
        );

        playPortalIntro(() => {
            stopPortalParticles();

            bgMusic.play().catch(() => { });
            startQuiz(data.questions);

        });

    });

};


function playPortalIntro(callback) {

    videoOverlay.classList.remove("hidden");

    portalVideo.currentTime = 0;

    portalVideo.play();

    portalVideo.onended = () => {

        document.getElementById("bootScreen").classList.remove("active");

        if (callback) {
            callback();
        }

        videoOverlay.classList.add("hidden");
    };
}

// ---------- 1. BOOT SCREEN ----------


function runBootSequence(name) {
    startPortalParticles();

    const messages = [
        "> Initializing secure connection...",
        "> Scanning for the most special person...",
        "> Match found.",
        "> Loading inside jokes...",
    ];



    typeLines(bootLines, messages, () => {
        bootFooter.classList.remove("hidden");


        bootGreeting.textContent = "";

        let greeting = `Hello, ${name || "You"} ❤️`;

        let i = 0;

        let typing = setInterval(() => {

            bootGreeting.textContent += greeting[i];

            i++;

            if (i >= greeting.length) {

                clearInterval(typing);

                bootFooter.classList.remove("hidden");

                bootSubtitle.textContent = "";
                bootSubtitle.classList.remove("hidden");

                const subtitle =
                    "You're about to access something truly special.\nAre you ready to enter?";

                let j = 0;

                const subtitleTyping = setInterval(() => {

                    bootSubtitle.textContent += subtitle[j];

                    j++;

                    if (j >= subtitle.length) {

                        clearInterval(subtitleTyping);

                    }

                }, 35);

            }

        }, 70);

    });
    // start subtle portal particles near the right-side portal background
}

function typeLines(lineEls, messages, onComplete) {
    let lineIndex = 0;

    function typeNextLine() {
        if (lineIndex >= messages.length) {
            onComplete();
            return;
        }
        const text = messages[lineIndex];
        const el = lineEls[lineIndex];
        el.textContent = "";
        let charIndex = 0;

        const typingInterval = setInterval(() => {
            el.textContent += text.charAt(charIndex);
            charIndex++;
            if (charIndex >= text.length) {
                clearInterval(typingInterval);
                lineIndex++;
                setTimeout(typeNextLine, 280);
            }
        }, 32);
    }
    typeNextLine();
}

// ---------- 2. QUIZ SCREEN ----------
let currentQuestionIndex = 0;
let quizQuestions = [];

function startQuiz(questions) {

    quizQuestions = questions || [];
    currentQuestionIndex = 0;

    showScreen("quizScreen");

    const box = document.querySelector(".quiz-container");
    box.classList.remove("show");

    setTimeout(() => {
        box.classList.add("show");
    }, 100);

    renderQuestion();
}

function renderQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showScreen("glitchScreen");
        runGlitchSequence();
        return;
    }

    const q = quizQuestions[currentQuestionIndex];
    quizQuestion.textContent = q.question;
    quizFeedback.textContent = "";
    quizOptions.innerHTML = "";

    // Update counter
    if (quizCounter) {
        quizCounter.textContent = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    }

    quizOptions.innerHTML = `
        <input
            type="text"
            id="answerInput"
            placeholder="Type your answer..."
            class="answer-input"
        />
        <button id="submitAnswerBtn" class="action-btn">Submit</button>
    `;

    document.getElementById("submitAnswerBtn").addEventListener("click", () => {
        const userAnswer = document.getElementById("answerInput").value;
        handleAnswer(userAnswer, q.answer, q.hint);
    });

    document.getElementById("answerInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") document.getElementById("submitAnswerBtn").click();
    });

    updateQuizProgress();
}

const roastLines = [
    "Wrong. Did we even meet? 😏",
    "Nope. Try harder, detective.",
    "That's a hard no from the vault.",
];

function handleAnswer(selected, correct, hint) {
    if (selected.trim().toLowerCase() === correct.trim().toLowerCase()) {
        playSound(successSound);
        quizFeedback.textContent = `✅ Correct! ${hint || ""}`;
        quizFeedback.style.color = "#00ff9c";
        currentQuestionIndex++;
        setTimeout(renderQuestion, 900);
    } else {
        const roast = roastLines[Math.floor(Math.random() * roastLines.length)];
        quizFeedback.textContent = roast;
        quizFeedback.style.color = "#ff6b6b";
    }
}

function updateQuizProgress() {
    const total = quizQuestions.length;
    const done = currentQuestionIndex;
    const pct = total ? (done / total) * 100 : 0;
    quizProgress.style.width = `${pct}%`;
}

// ---------- 3. GLITCH TRANSITION ----------
function runGlitchSequence() {
    const fillEl = document.getElementById("fakeProgressFill");
    const percentEl = document.getElementById("glitchPercent");
    const messageEl = document.getElementById("glitchMessage");

    // Reset state
    fillEl.style.width = "0%";
    percentEl.textContent = "0%";
    messageEl.classList.remove("show");
    messageEl.classList.add("hidden");

    // ── Step 1: Progress bar fills to 67% ──
    setTimeout(() => {
        fillEl.style.width = "67%";
        animateCounter(percentEl, 0, 67, 1600);
    }, 300);

    // ── Step 2: "Just kidding..." message appears ──
    setTimeout(() => {
        messageEl.classList.remove("hidden");
        messageEl.classList.add("show");
    }, 2200);

    // ── Step 3: VIOLENT SHAKE — system breaking ──
    setTimeout(() => {
        document.body.classList.add("violent-shake");
    }, 3200);

    // ── Step 4: RGB CRACK — screen shatters, ends blinding white ──
    setTimeout(() => {
        document.body.classList.remove("violent-shake");
        document.body.classList.add("rgb-crack");
    }, 3850);

    // ── Step 5: VAULT EXPLOSION — white-pink shockwave via body pseudo ──
    setTimeout(() => {
        document.body.classList.remove("rgb-crack");
        document.body.classList.add("vault-explosion");
    }, 4500);

    // ── Step 6: ABSOLUTE BLACK VOID — all screens killed, pure darkness ──
    setTimeout(() => {
        document.body.classList.remove("vault-explosion");
        document.body.classList.add("void-state");
        screens.forEach(s => s.classList.remove("active"));
    }, 5100);

    // ── Step 7: 2 full seconds of silence in the void ──

    // ── Step 8: Memory world materializes out of darkness ──
    setTimeout(() => {
        document.body.classList.remove("void-state");
        playVaultReveal();
    }, 7100);
}

function playVaultReveal() {

    showScreen("vaultRevealScreen");

    const video = document.getElementById("vaultRevealVideo");

    video.currentTime = 0;
    video.play();

    video.onended = () => {

        const overlay = document.createElement("div");
        overlay.id = "vaultFadeOverlay";

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = "0.7";
        });

        setTimeout(() => {

            startTimeline(vaultData.memories);

            setTimeout(() => {
                overlay.style.opacity = "0";

                setTimeout(() => {
                    overlay.remove();
                }, 1200);

            }, 300);

        }, 700);
    };
}

function animateCounter(el, start, end, duration) {
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(start + (end - start) * progress);
        el.textContent = `${value}%`;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}


function playCrystalTransition() {

    showScreen("crystalTransitionScreen");

    const video = document.getElementById("crystalTransitionVideo");

    video.currentTime = 0;

    video.play();

    video.onended = () => {
        video.classList.add("fade-to-black");

        setTimeout(() => {
            playCelebrationVideo();
        }, 1200);
    };
}

function playCelebrationVideo() {

    showScreen("celebrationScreen");

    const video = document.getElementById("celebrationVideo");
    const title = document.getElementById("videoBirthdayTitle");

    title.textContent =
        `Happy Birthday, ${vaultData.name}! ❤️`;

    title.style.opacity = "0";
    title.classList.remove("video-title-show");

    video.currentTime = 0;

    title.style.opacity = "0";
    title.classList.remove("video-title-show");

    setTimeout(() => {

        title.style.opacity = "1";

        title.classList.remove("video-title-show");
        void title.offsetWidth;
        title.classList.add("video-title-show");

    }, 5000);

    video.play();

    
    video.onended = () => {
        title.style.opacity = "0";
        title.classList.remove("video-title-shoow");

        const fade = document.getElementById("cinematicFade");

        fade.style.opacity = "0.25";

        setTimeout(() => {

            showScreen("finalScreen");

            fade.style.opacity = "0";

            terminalPrompt.classList.add("hidden");
            celebrationContent.classList.remove("hidden");

            if (birthdayTitle) {
                birthdayTitle.textContent =
                    `Happy Birthday, ${vaultData.name}! ❤️`;
            }

            if (finalMessage) {
                finalMessage.textContent =
                    vaultData.finalMessage || "";
            }

            launchConfetti();

        }, 400);

    };
}

// ---------- 4. MEMORY TIMELINE ----------
let memories = [];
let currentMemoryIndex = 0;

function startTimeline(memoryList) {
    memories = memoryList || [];
    currentMemoryIndex = 0;

    // Build sidebar immediately (hidden behind void)
    buildMemorySidebar();

    // Step 1: screen active but invisible
    const tl = document.getElementById("timelineScreen");
    screens.forEach(s => s.classList.remove("active"));
    tl.classList.add("active", "materializing");

    // Step 2: trigger world materialization
    void tl.offsetWidth;
    setTimeout(() => {
        tl.classList.remove("materializing");
        tl.classList.add("materialize-in");

        // Step 3: renderMemory only AFTER world has appeared (1.4s in)
        // So user sees the world materialize, THEN decrypting starts
        setTimeout(() => {
            renderMemory();
        }, 1400);

        // Step 4: clean up animation class
        setTimeout(() => {
            tl.classList.remove("materialize-in");
        }, 2800);
    }, 50);
}

function buildMemorySidebar() {
    if (!memoryList) return;
    memoryList.innerHTML = "";
    memories.forEach((mem, i) => {
        const li = document.createElement("li");
        li.id = `memItem_${i}`;
        li.innerHTML = `<span class="mem-status">🔒</span> MEMORY_0${i + 1}`;
        memoryList.appendChild(li);
    });
}

function updateSidebar() {
    memories.forEach((_, i) => {
        const li = document.getElementById(`memItem_${i}`);
        if (!li) return;
        li.className = "";
        if (i < currentMemoryIndex) {
            li.className = "unlocked";
            li.innerHTML = `<span class="mem-status">✅</span> MEMORY_0${i + 1} <small style="color:#7a8c84">Unlocked</small>`;
        } else if (i === currentMemoryIndex) {
            li.className = "current";
            li.innerHTML = `<span class="mem-status">⏳</span> MEMORY_0${i + 1} <small style="color:#00ff9c">Decrypting...</small>`;
        } else {
            li.innerHTML = `<span class="mem-status">🔒</span> MEMORY_0${i + 1}`;
        }
    });
}

function renderMemory() {
    if (currentMemoryIndex >= memories.length) {

        showScreen("finalScreen");

        terminalPrompt.classList.remove("hidden");
        celebrationContent.classList.add("hidden");

        return;
    }

    const mem = memories[currentMemoryIndex];

    decryptText.textContent = `Decrypting memory_0${currentMemoryIndex + 1}...`;
    decryptText.classList.remove("hidden");
    memoryImage.classList.add("hidden");
    memoryCaption.classList.add("hidden");
    nextMemoryBtn.classList.add("hidden");

    const heartBtn = document.getElementById("memoryHeart");
    if (heartBtn) heartBtn.classList.add("hidden");

    updateMemoryProgress();
    updateSidebar();

    setTimeout(() => {
        decryptText.classList.add("hidden");
        if (mem.image) {
            memoryImage.src = mem.image;
            memoryImage.classList.remove("hidden");
        }
        memoryCaption.textContent = mem.caption || "";
        memoryCaption.classList.remove("hidden");
        nextMemoryBtn.classList.remove("hidden");
        if (heartBtn) heartBtn.classList.remove("hidden");
    }, 1200);
}

nextMemoryBtn.addEventListener("click", () => {
    playSound(clickSound);
    currentMemoryIndex++;
    renderMemory();
});

// Heart toggle
const heartBtn = document.getElementById("memoryHeart");
if (heartBtn) {
    heartBtn.addEventListener("click", () => {
        heartBtn.textContent = heartBtn.textContent === "♡" ? "♥" : "♡";
        heartBtn.style.color = heartBtn.textContent === "♥" ? "#ff69b4" : "#9b59b6";
    });
}

function updateMemoryProgress() {
    const total = memories.length;
    const done = currentMemoryIndex;
    const pct = total ? (done / total) * 100 : 0;
    memoryProgress.style.width = `${pct}%`;
    if (memoryProgressLabel) {
        memoryProgressLabel.textContent = `${done} / ${total}`;
    }
}

// ---------- 5. FINAL REVEAL ----------
if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener("click", () => {
        playSound(clickSound);
        playCrystalTransition();
        return;
        // Set dynamic birthday title from vault data
        if (birthdayTitle && vaultData && vaultData.name) {
            birthdayTitle.textContent = `Happy Birthday, ${vaultData.name}! ❤️`;
        }

        // Set final message
        if (finalMessage) {
            finalMessage.textContent = vaultData.finalMessage || "";
        }

        launchConfetti();
    });
}

if (replayBtn) {
    replayBtn.addEventListener("click", () => {
        window.location.reload();
    });
}

if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
        // Simple download: opens a new tab / could be extended
        alert("Memory saved to your heart 💗");
    });
}

// ---------- Confetti ----------
function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#ff69b4", "#ffd700", "#9b59b6", "#ff9966", "#ff6b6b", "#fff"];
    const pieces = Array.from({ length: 180 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        size: 4 + Math.random() * 7,
        speed: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let frame = 0;
    const maxFrames = 500;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach((p) => {
            p.y += p.speed;
            p.rotation += 3;
            if (p.y > canvas.height) p.y = -10;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            if (p.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            ctx.restore();
        });

        frame++;
        if (frame < maxFrames) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    animate();
}

// ------------------ Portal particles + word-to-portal animation ------------------
function startPortalParticles() {
    if (window._portalParticlesRunning) return;
    window._portalParticlesRunning = true;

    const container = document.createElement('div');
    container.id = 'portalParticles';
    container.className = 'portal-particles';
    document.body.appendChild(container);
    window._portalParticlesContainer = container;

    // spawn interval
    window._portalParticlesInterval = setInterval(spawnPortalParticle, 22);
}

function stopPortalParticles() {
    window._portalParticlesRunning = false;
    clearInterval(window._portalParticlesInterval);
    if (window._portalParticlesContainer) window._portalParticlesContainer.remove();
}

function spawnPortalParticle() {
    const c = window._portalParticlesContainer;
    if (!c) return;
    const p = document.createElement('div');
    p.className = 'portal-particle';
    const size = 2 + Math.random() * 8;
    p.style.width = p.style.height = size + 'px';

    // start somewhere inside the particle container
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    // const startX = Math.random() * (c.clientWidth || 180);
    // const startY = Math.random() * (c.clientHeight || 180);
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    c.appendChild(p);

    // approximate portal center (right side of window)
    const portalX = window.innerWidth * 0.75; // adjust as needed to align with portal background
    const portalY = window.innerHeight * 0.5;
    const rect = p.getBoundingClientRect();
    const dx = portalX - (rect.left + rect.width / 2);
    const dy = portalY - (rect.top + rect.height / 2);


    const duration = 1800 + Math.random() * 1200;

    const curveX = dx + (Math.random() - 0.5) * 250;
    const curveY = dy + (Math.random() - 0.5) * 250;

    p.animate([
        {
            transform: 'translate(0px,0px) scale(0.3)',
            opacity: 0
        },
        {
            transform: `translate(${curveX * 0.4}px,${curveY * 0.4}px) scale(1.2)`,
            opacity: 1,
            offset: 0.35
        },
        {
            transform: `translate(${dx}px,${dy}px) scale(0.05)`,
            opacity: 0
        }
    ], {
        duration,
        easing: 'cubic-bezier(.25,.1,.25,1)',
        fill: 'forwards'
    });
    

    setTimeout(() => p.remove(), duration + 50);
}

function animateWordsToPortal(containerEl, onComplete) {
    if (!containerEl) {
        if (onComplete) onComplete();
        return;
    }

    // choose visible text nodes/elements to animate
    const sel = 'h1,h2,h3,h4,p,span,button,hr,.boot-line,.boot-greeting,.boot-subtitle,.boot-tip,.boot-system-label';
    const elems = Array.from(containerEl.querySelectorAll(sel)).filter(e => e.offsetParent !== null);

    if (!elems.length) {
        if (onComplete) onComplete();
        return;
    }

    const portalX = window.innerWidth - 180;
    const portalY = window.innerHeight / 2;

    let running = elems.length;
    const stagger = 80;
    elems.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        clone.classList.add('word-fly');

        clone.style.position = 'fixed';
        clone.style.zIndex = '99999';
     
        const style = window.getComputedStyle(el);
        clone.style.font = style.font;
        clone.style.color = style.color;
        clone.style.fontSize = style.fontSize;
        clone.style.fontWeight = style.fontWeight;
        clone.style.letterSpacing = style.letterSpacing;

        // position clone exactly over original
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.lineHeight = style.lineHeight;
        document.body.appendChild(clone);

        // hide original text while animating
        el.classList.add('word-hide');
        el.style.opacity = '0';

        const dx = portalX - (rect.left + rect.width / 2);
        const dy = portalY - (rect.top + rect.height / 2);
        console.log("Animating word ", el.textContent);
        const duration = 1800;

        const delay = i * stagger;
        setTimeout(() => {
            clone.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                {
                    transform: `translate(${dx * 0.5}px, ${dy * 0.3}px) scale(1.1)`,
                    opacity: 1,
                    offset: 0.4
                },
                {
                    transform: `translate(${dx}px, ${dy}px) scale(0.02)`,
                    opacity: 0
                }
            ], {
                duration: 1800,
                fill: 'forwards'
            });

            setTimeout(() => {
                clone.remove();
                running--;
                // when last finishes, cleanup and call callback
                if (running <= 0) {
                    document.body.classList.add('portal-flash');

                    setTimeout(() => {
                        document.body.classList.remove('portal-flash');
                    }, 500);
                    // optionally stop the particles after a beat
                    // containerEl.style.display = 'none';
                    // setTimeout(() => stopPortalParticles(), 5000);
                    if (onComplete) onComplete();
                }
            }, duration + 40);
        }, delay);
    });
}