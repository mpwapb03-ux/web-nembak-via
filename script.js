/* ==========================================
   WEB NEMBAK PACAR - CLEAN HUMAN VERSION
   ========================================== */

const state = {
  doiName: "Sayangku",
  senderName: "aku",
  proposalText: "sebenernya aku udah lama banget nyimpen perasaan ini ke kamu, Devia... tiap hari ada kamu tuh bikin hari-hariku jauh lebih bahagia. jadi hari ini aku mau nanya langsung aja: <strong>Via, kamu mau gak jadi pacar aku?</strong>",
  praiseText: "jujur ya Via, dari pertama kenal kamu tuh aku udah kagum banget. kamu orangnya manis, lucu, terus senyum kamu selalu bisa bikin hari-hariku yang capek jadi seru lagi. makasih ya udah hadir dan nemenin aku.",
  doiPhotos: ["assets/photo_1.jpg", "assets/photo_2.jpg", "assets/photo_3.jpg", "assets/photo_4.jpg"],
  discordWebhook: "https://discord.com/api/webhooks/1537412788295831632/29FxLi7XLwZfIuSuCumO6m-HUTdUsEY2e0yaC0wBHuyeKA0h7YSV10GP2Yge1VBlKOay",
  musicUrl: "assets/Bruno Mars - Risk It All.mp3",
  placedPieces: 0,
  selectedPieceIdx: null,
  activeHeartType: "yes"
};

document.addEventListener("DOMContentLoaded", () => {
  loadSavedSettings();
  initBackgroundCanvas();
  initAudio();
  initEvents();
  initPuzzleGame();
  updateDOMWithState();
});

function loadSavedSettings() {
  const saved = localStorage.getItem("nembak_app_settings");
  if (saved) {
    try { Object.assign(state, JSON.parse(saved)); } catch (e) {}
  }
}

function saveSettings() {
  localStorage.setItem("nembak_app_settings", JSON.stringify({
    doiName: state.doiName,
    senderName: state.senderName,
    proposalText: state.proposalText,
    praiseText: state.praiseText,
    doiPhotos: state.doiPhotos,
    discordWebhook: state.discordWebhook,
    musicUrl: state.musicUrl
  }));
  updateDOMWithState();
  initPuzzleGame();
  playChimeSound(600, "sine");
  closeSettingsModal();
}

function resetSettings() {
  localStorage.removeItem("nembak_app_settings");
  state.doiName = "Via";
  state.senderName = "aku";
  state.proposalText = "sebenernya aku udah lama banget nyimpen perasaan ini ke kamu, Devia... tiap hari ada kamu tuh bikin hari-hariku jauh lebih bahagia. jadi hari ini aku mau nanya langsung aja: <strong>Via, kamu mau gak jadi pacar aku?</strong>";
  state.praiseText = "jujur ya Via, dari pertama kenal kamu tuh aku udah kagum banget. kamu orangnya manis, lucu, terus senyum kamu selalu bisa bikin hari-hariku yang capek jadi seru lagi. makasih ya udah hadir dan nemenin aku.";
  state.doiPhotos = ["assets/photo_1.jpg", "assets/photo_2.jpg", "assets/photo_3.jpg", "assets/photo_4.jpg"];
  state.discordWebhook = "https://discord.com/api/webhooks/1537412788295831632/29FxLi7XLwZfIuSuCumO6m-HUTdUsEY2e0yaC0wBHuyeKA0h7YSV10GP2Yge1VBlKOay";
  state.musicUrl = "assets/Bruno Mars - Risk It All.mp3";
  updateDOMWithState();
  initPuzzleGame();
  populateSettingsForm();
  playChimeSound(400, "sine");
}

function updateDOMWithState() {
  document.querySelectorAll(".doi-name").forEach(el => el.textContent = state.doiName);
  document.querySelectorAll(".sender-name").forEach(el => el.textContent = state.senderName);
  
  const proposalEl = document.getElementById("proposal-text");
  if (proposalEl) proposalEl.innerHTML = state.proposalText;

  const praiseEl = document.getElementById("praise-text");
  if (praiseEl) praiseEl.innerHTML = state.praiseText;

  for (let i = 0; i < 4; i++) {
    const photoEl = document.getElementById(`doi-photo-${i + 1}`);
    if (photoEl) photoEl.src = (state.doiPhotos && state.doiPhotos[i]) || `assets/photo_${i + 1}.jpg`;
  }

  const bgMusic = document.getElementById("bg-music");
  if (bgMusic && bgMusic.src !== state.musicUrl) bgMusic.src = state.musicUrl;
}

function getFormattedDate() {
  return new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
}

// --- DISCORD ---
function sendDiscordNotification(eventStatus) {
  if (!state.discordWebhook || !state.discordWebhook.trim().startsWith("http")) return;

  let payload = {};

  if (eventStatus === "ACCEPTED") {
    payload = {
      username: "Kabar Dari Doi",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/2904/2904838.png",
      embeds: [{
        title: "YAAAY! Via mau jadi pacar lu!!",
        description: `**${state.doiName}** baru aja selesai nyusun puzzle hati merah. doi resmi jadian sama lu hari ini!`,
        color: 16731003,
        fields: [
          { name: "pasangan baru", value: `${state.senderName} & ${state.doiName}`, inline: true },
          { name: "tanggal jadian", value: getFormattedDate(), inline: true },
          { name: "status", value: "resmi berdua", inline: false }
        ],
        footer: { text: "selamat ya bro, jangan lupa ajak jalan" },
        timestamp: new Date().toISOString()
      }]
    };
  } else if (eventStatus === "REJECTED_ATTEMPT") {
    payload = {
      username: "Kabar Dari Doi",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/1077/1077035.png",
      embeds: [{
        title: "wkwk Via sempet iseng mau milih hati retak",
        description: `tenang bro, begitu **${state.doiName}** pencet hati retak langsung dikasih popup suruh susun yang utuh`,
        color: 16753920,
        fields: [
          { name: "doi", value: state.doiName, inline: true },
          { name: "status", value: "ke-distract popup", inline: true }
        ],
        footer: { text: "tunggu bentar lagi pasti disusun yang merah" },
        timestamp: new Date().toISOString()
      }]
    };
  }

  fetch(state.discordWebhook.trim(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

// --- PUZZLE ---
function initPuzzleGame() {
  state.placedPieces = 0;
  state.selectedPieceIdx = null;
  document.getElementById("placed-count").textContent = "0";

  const board = document.getElementById("puzzle-board");
  if (board) board.classList.remove("complete-glow");

  const tray = document.getElementById("pieces-tray");
  tray.innerHTML = "";

  const imgAsset = state.activeHeartType === "yes" ? "assets/heart_puzzle.svg" : "assets/heart_broken.svg";

  const slots = document.querySelectorAll(".puzzle-slot");
  slots.forEach((slot, idx) => {
    slot.innerHTML = `<span class="slot-hint">${idx + 1}</span>`;
    slot.classList.remove("filled", "drag-over");
    
    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.classList.add("drag-over"); });
    slot.addEventListener("dragleave", () => { slot.classList.remove("drag-over"); });
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-over");
      const pieceIdx = e.dataTransfer.getData("text/plain");
      if (pieceIdx !== undefined && pieceIdx !== null) attemptPlacePiece(parseInt(pieceIdx), slot, imgAsset);
    });
    slot.addEventListener("click", () => {
      if (state.selectedPieceIdx !== null) attemptPlacePiece(state.selectedPieceIdx, slot, imgAsset);
    });
  });

  [3, 1, 5, 0, 4, 2].forEach(pIdx => {
    const pieceEl = document.createElement("div");
    pieceEl.className = "puzzle-piece";
    pieceEl.setAttribute("data-piece", pIdx);
    pieceEl.setAttribute("draggable", "true");
    pieceEl.style.backgroundImage = `url('${imgAsset}')`;
    pieceEl.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", pIdx); selectPiece(pIdx, pieceEl); });
    pieceEl.addEventListener("click", (e) => { e.stopPropagation(); selectPiece(pIdx, pieceEl); });
    tray.appendChild(pieceEl);
  });
}

function selectPiece(pIdx, pieceEl) {
  playChimeSound(500, "sine");
  document.querySelectorAll(".puzzle-piece").forEach(el => el.classList.remove("selected"));
  pieceEl.classList.add("selected");
  state.selectedPieceIdx = pIdx;
}

function attemptPlacePiece(pieceIdx, slotEl, imgAsset) {
  const slotIdx = parseInt(slotEl.getAttribute("data-slot"));
  if (slotIdx === pieceIdx && !slotEl.classList.contains("filled")) {
    playChimeSound(800, "sine");
    slotEl.classList.add("filled");
    const placedElem = document.createElement("div");
    placedElem.className = "puzzle-piece placed";
    placedElem.setAttribute("data-piece", pieceIdx);
    placedElem.style.backgroundImage = `url('${imgAsset}')`;
    slotEl.innerHTML = "";
    slotEl.appendChild(placedElem);
    const trayPiece = document.querySelector(`.pieces-tray .puzzle-piece[data-piece="${pieceIdx}"]`);
    if (trayPiece) trayPiece.remove();
    state.selectedPieceIdx = null;
    state.placedPieces++;
    document.getElementById("placed-count").textContent = state.placedPieces;
    if (state.placedPieces === 6) {
      if (state.activeHeartType === "yes") setTimeout(onPuzzleComplete, 500);
      else showBrokenHeartWarning();
    }
  } else {
    playChimeSound(250, "square");
    slotEl.classList.add("drag-over");
    setTimeout(() => slotEl.classList.remove("drag-over"), 400);
  }
}

function showBrokenHeartWarning() {
  playChimeSound(200, "sawtooth");
  document.getElementById("warning-box").style.display = "block";
  sendDiscordNotification("REJECTED_ATTEMPT");
  setTimeout(() => {
    state.activeHeartType = "yes";
    document.getElementById("tab-yes-heart").classList.add("active");
    document.getElementById("tab-no-heart").classList.remove("active");
    document.getElementById("warning-box").style.display = "none";
    initPuzzleGame();
  }, 2200);
}

function onPuzzleComplete() {
  const board = document.getElementById("puzzle-board");
  if (board) board.classList.add("complete-glow");
  playVictoryFanfare();
  triggerConfetti();
  sendDiscordNotification("ACCEPTED");
  setTimeout(() => switchScreen("screen-praise"), 1200);
}

function goToVictoryScreen() {
  playChimeSound(650, "sine");
  document.getElementById("victory-date").textContent = getFormattedDate();
  switchScreen("screen-victory");
}

// --- AUDIO ---
let audioCtx = null;
let isMusicPlaying = false;

function startBgMusic() {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic) return;
  if (bgMusic.currentTime < 64) {
    bgMusic.currentTime = 64;
  }
  bgMusic.play().then(() => {
    isMusicPlaying = true;
    const vinyl = document.getElementById("vinyl-record");
    if (vinyl) vinyl.classList.add("spin");
  }).catch(() => {});
}

function initAudio() {
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.src = state.musicUrl;
    bgMusic.volume = 0.5;
  }
  const btnToggle = document.getElementById("btn-music-toggle");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        const vinyl = document.getElementById("vinyl-record");
        if (vinyl) vinyl.classList.remove("spin");
      } else {
        startBgMusic();
      }
    });
  }
}

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playChimeSound(freq = 523.25, type = "sine") {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function playVictoryFanfare() {
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
    setTimeout(() => playChimeSound(freq, "triangle"), idx * 120);
  });
}

// --- BACKGROUND CANVAS ---
function initBackgroundCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });

  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width, y: Math.random() * height,
      size: Math.random() * 14 + 6,
      speedY: Math.random() * 1.2 + 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.6 + 0.3,
      isHeart: Math.random() > 0.4
    });
  }

  function drawPetal(x, y, size, rotation, opacity) {
    ctx.save(); ctx.translate(x, y); ctx.rotate((rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity; ctx.fillStyle = "#ffb7c5";
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size / 2, -size / 2, size, 0);
    ctx.quadraticCurveTo(size / 2, size / 2, 0, 0);
    ctx.fill(); ctx.restore();
  }

  function drawHeart(x, y, size, opacity) {
    ctx.save(); ctx.globalAlpha = opacity; ctx.fillStyle = "#ff4b72";
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    ctx.fill(); ctx.restore();
  }

  (function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y += p.speedY; p.x += Math.sin(p.y * 0.015) * 0.8; p.rotation += p.rotationSpeed;
      if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
      if (p.isHeart) drawHeart(p.x, p.y, p.size, p.opacity);
      else drawPetal(p.x, p.y, p.size, p.rotation, p.opacity);
    });
    requestAnimationFrame(animate);
  })();
}

// --- CONFETTI ---
function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const colors = ['#ff4b72', '#ff758c', '#ffd166', '#06d6a0', '#118ab2', '#8a2be2', '#fff'];
  const confetti = [];
  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: width / 2, y: height / 2 + 50,
      vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.8) * 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 10, opacity: 1
    });
  }
  let af;
  (function render() {
    ctx.clearRect(0, 0, width, height);
    let active = 0;
    confetti.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.98;
      p.rotation += p.rotationSpeed; p.opacity -= 0.008;
      if (p.opacity > 0) {
        active++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
      }
    });
    if (active > 0) af = requestAnimationFrame(render);
    else { ctx.clearRect(0, 0, width, height); cancelAnimationFrame(af); }
  })();
}

// --- EVENTS ---
function initEvents() {
  const envelope = document.getElementById("envelope-trigger");
  if (envelope) {
    envelope.addEventListener("click", () => {
      playChimeSound(800, "sine");
      envelope.classList.add("open");
      startBgMusic();
      setTimeout(() => switchScreen("screen-proposal"), 1200);
    });
  }

  const tabYes = document.getElementById("tab-yes-heart");
  if (tabYes) {
    tabYes.addEventListener("click", () => {
      state.activeHeartType = "yes";
      tabYes.classList.add("active");
      const tabNo = document.getElementById("tab-no-heart");
      if (tabNo) tabNo.classList.remove("active");
      const warnBox = document.getElementById("warning-box");
      if (warnBox) warnBox.style.display = "none";
      initPuzzleGame();
    });
  }

  const tabNo = document.getElementById("tab-no-heart");
  if (tabNo) {
    tabNo.addEventListener("click", () => {
      state.activeHeartType = "no";
      tabNo.classList.add("active");
      if (tabYes) tabYes.classList.remove("active");
      showBrokenHeartWarning();
      initPuzzleGame();
    });
  }

  const btnOpenSettings = document.getElementById("btn-open-settings");
  if (btnOpenSettings) btnOpenSettings.addEventListener("click", openSettingsModal);

  const btnCloseSettings = document.getElementById("btn-close-settings");
  if (btnCloseSettings) btnCloseSettings.addEventListener("click", closeSettingsModal);

  const btnSaveSettings = document.getElementById("btn-save-settings");
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener("click", () => {
      state.doiName = document.getElementById("input-doi-name").value.trim() || "Via";
      state.senderName = document.getElementById("input-sender-name").value.trim() || "aku";
      state.proposalText = document.getElementById("input-proposal").value.trim() || state.proposalText;
      state.praiseText = document.getElementById("input-praise").value.trim() || state.praiseText;
      for (let i = 0; i < 4; i++) {
        const inputEl = document.getElementById(`input-doi-photo-${i + 1}`);
        if (inputEl) {
          const val = inputEl.value.trim();
          if (val) state.doiPhotos[i] = val;
        }
      }
      const webhookEl = document.getElementById("input-discord-webhook");
      if (webhookEl) state.discordWebhook = webhookEl.value.trim();
      const musicInp = document.getElementById("input-music-url");
      if (musicInp && musicInp.value.trim()) state.musicUrl = musicInp.value.trim();
      saveSettings();
    });
  }

  const btnResetSettings = document.getElementById("btn-reset-settings");
  if (btnResetSettings) btnResetSettings.addEventListener("click", resetSettings);
}

function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
}

function restartApp() {
  state.activeHeartType = "yes";
  document.getElementById("tab-yes-heart").classList.add("active");
  document.getElementById("tab-no-heart").classList.remove("active");
  document.getElementById("warning-box").style.display = "none";
  initPuzzleGame();
  switchScreen("screen-opening");
  const envelope = document.getElementById("envelope-trigger");
  if (envelope) envelope.classList.remove("open");
}

function openSettingsModal() {
  populateSettingsForm();
  document.getElementById("settings-modal").classList.add("active");
}

function closeSettingsModal() {
  document.getElementById("settings-modal").classList.remove("active");
}

function populateSettingsForm() {
  document.getElementById("input-doi-name").value = state.doiName;
  document.getElementById("input-sender-name").value = state.senderName;
  document.getElementById("input-proposal").value = state.proposalText;
  document.getElementById("input-praise").value = state.praiseText;
  for (let i = 0; i < 4; i++) {
    document.getElementById(`input-doi-photo-${i + 1}`).value = (state.doiPhotos && state.doiPhotos[i]) || "";
  }
  document.getElementById("input-discord-webhook").value = state.discordWebhook || "";
  document.getElementById("input-music-url").value = state.musicUrl;
}
