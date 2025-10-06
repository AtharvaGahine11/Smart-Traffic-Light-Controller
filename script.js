// ==================== IMPORTS ====================
import { db, trafficRef, doc, setDoc, onSnapshot, serverTimestamp, auth } from "./firebase.js"; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 

// ==================== GLOBAL VARIABLES ====================
let mode = "AUTO";
let activePhase = "NS";
let nextPhase = "EW";
let autoInterval = null;
let timerInterval = null;
let currentTimer = 0;
const clientId = Math.random().toString(36).substring(2, 8); // unique client ID

// ==================== ELEMENTS ====================
const modeButtons = document.querySelectorAll(".mode-btn");
const activeModeLabel = document.getElementById("activeMode");
const emergencyBadge = document.getElementById("emergencyBadge");
const logArea = document.getElementById("logArea");
const manualBtns = document.querySelectorAll(".manual-btn"); 
const activePhaseDisplay = document.getElementById("activePhaseDisplay");
const nextDirectionDisplay = document.getElementById("nextDirection");
const timerDisplay = document.getElementById("timer");
const pedSignalDisplay = document.getElementById("pedSignal");
const logoutBtn = document.getElementById("logoutBtn"); 

const nsDurationInput = document.getElementById("nsDuration");
const ewDurationInput = document.getElementById("ewDuration");

// ==================== HELPERS ====================

// Log activity
function logState(message) {
    const time = new Date().toLocaleTimeString();
    const logLine = document.createElement("p");
    logLine.innerHTML = `<span>[${time}]</span> ${message}`;
    logArea.prepend(logLine);
    if (logArea.children.length > 50) logArea.removeChild(logArea.lastChild); 
}

// Play simple sound (using the provided audio URL)
function playSound() {
    const audio = document.getElementById("modeSound");
    if (audio) {
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed:", e));
    }
}

// Clear all timers
function clearTimers() {
    clearInterval(autoInterval);
    clearInterval(timerInterval);
}

// Update UI elements for status
function updateStatusUI() {
    activePhaseDisplay.textContent = activePhase || "-";
    nextDirectionDisplay.textContent = nextPhase || "-";
    pedSignalDisplay.textContent = (activePhase === "NS" || activePhase === "EW") ? "WALK (Active Phase)" : "STOP";
}

function startTimer(duration) {
    clearInterval(timerInterval);
    currentTimer = duration;
    timerDisplay.textContent = currentTimer.toString().padStart(2, '0');

    timerInterval = setInterval(() => {
        currentTimer--;
        timerDisplay.textContent = currentTimer.toString().padStart(2, '0');
        if (currentTimer <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

// ==================== LIGHT CONTROL ====================
function setLights(state) {
    const allSignals = {
        N: document.getElementById("signalN"),
        S: document.getElementById("signalS"),
        E: document.getElementById("signalE"),
        W: document.getElementById("signalW")
    };

    for (const dir in state) {
        const signalEl = allSignals[dir];
        if (!signalEl) continue;

        const lights = signalEl.querySelectorAll(".light");
        const lightState = state[dir];

        lights.forEach(light => {
            light.classList.remove("red", "yellow", "green");
        });

        if (lightState === "red") lights[0].classList.add("red");
        else if (lightState === "yellow") lights[1].classList.add("yellow");
        else if (lightState === "green") lights[2].classList.add("green");
    }
}

// Simple car/pedestrian visualization update
function updateVisuals(activeDir) {
    const allCarStacks = document.querySelectorAll(".car-stack");
    allCarStacks.forEach(stack => stack.classList.remove("active"));
    if (activeDir === "NS") {
        document.getElementById("carsN").classList.add("active");
        document.getElementById("carsS").classList.add("active");
    } else if (activeDir === "EW") {
        document.getElementById("carsE").classList.add("active");
        document.getElementById("carsW").classList.add("active");
    }
}

// ==================== FIREBASE UPDATES ====================
async function updateTraffic(data) {
    if (data.mode === mode) {
        try {
            await setDoc(trafficRef, {
                ...data,
                clientId,
                timestamp: serverTimestamp(),
            }, { merge: true });
            console.log("✅ Updated Firestore:", data);
        } catch (err) {
            console.error("❌ Firebase update failed:", err);
            logState(`ERROR: Failed to update Firestore. Check permissions.`);
        }
    }
}

// ==================== MODE CONTROL ====================
function switchMode(newMode, fromFirebase = false) {
    if (mode === newMode && !fromFirebase) return;

    clearTimers();

    mode = newMode;
    activeModeLabel.textContent = newMode;
    emergencyBadge.classList.toggle("hidden", newMode !== "EMERGENCY");
    
    if (!fromFirebase) {
        playSound();
        logState(`Mode switched to ${newMode}`);
        updateTraffic({ mode: newMode, activePhase });
    }
    
    const isAuto = newMode === "AUTO";
    nsDurationInput.disabled = !isAuto;
    ewDurationInput.disabled = !isAuto;

    if (newMode === "AUTO") {
        startAuto();
    } else if (newMode === "MANUAL") {
        startManual("NS", fromFirebase);
    } else if (newMode === "EMERGENCY") {
        startEmergency(fromFirebase);
    }
    
    modeButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-mode="${newMode}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

// ==================== AUTO MODE ====================
function startAuto() {
    clearTimers();
    logState("AUTO mode started");
    
    activePhase = activePhase === "NS" ? "EW" : "NS"; 
    nextPhase = activePhase === "NS" ? "EW" : "NS";

    runAutoCycle(); 
}

function runAutoCycle() {
    clearTimers();

    activePhase = nextPhase;
    nextPhase = activePhase === "NS" ? "EW" : "NS";
    
    const duration = activePhase === "NS" 
        ? parseInt(nsDurationInput.value)
        : parseInt(ewDurationInput.value);

    const state = { N: "red", S: "red", E: "red", W: "red" };
    if (activePhase === "NS") { state.N = "green"; state.S = "green"; }
    else { state.E = "green"; state.W = "green"; }

    setLights(state);
    updateVisuals(activePhase);
    startTimer(duration);
    updateStatusUI();

    updateTraffic({ mode, activePhase, lights: state, duration });
    logState(`AUTO phase changed to ${activePhase} for ${duration} seconds.`);

    autoInterval = setTimeout(runAutoCycle, duration * 1000);
}


// ==================== MANUAL MODE ====================
function startManual(dir, fromFirebase = false) {
    clearTimers();
    activePhase = dir;
    nextPhase = dir === "NS" ? "EW" : "NS";
    
    const state = { N: "red", S: "red", E: "red", W: "red" };

    if (dir === "NS") { state.N = "green"; state.S = "green"; }
    else { state.E = "green"; state.W = "green"; }

    setLights(state);
    updateVisuals(dir);
    startTimer(0);
    updateStatusUI();

    if (!fromFirebase) {
        updateTraffic({ mode, activePhase: dir, lights: state });
        logState(`MANUAL switched to ${dir} GREEN`);
    }
}

// ==================== EMERGENCY MODE ====================
function startEmergency(fromFirebase = false) {
    clearTimers();
    activePhase = "NONE";
    nextPhase = "NONE";

    const state = { N: "red", S: "red", E: "red", W: "red" };
    setLights(state);
    updateVisuals("NONE");
    startTimer(0);
    updateStatusUI();

    if (!fromFirebase) {
        updateTraffic({ mode, activePhase: "NONE", lights: state });
        logState("EMERGENCY mode active: All RED");
    }
}

// ==================== FIREBASE REAL-TIME LISTENER ====================
function setupFirestoreListener() {
    onSnapshot(trafficRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.clientId === clientId) return;

            console.log("📡 Received from Firestore:", data);

            if (data.mode && data.mode !== mode) {
                switchMode(data.mode, true);
            }

            if (data.lights) setLights(data.lights);
            if (data.activePhase) {
                activePhase = data.activePhase;
                nextPhase = activePhase === "NS" ? "EW" : "NS";
                updateVisuals(activePhase);
                updateStatusUI();

                if (mode === "MANUAL" && activePhase !== "NONE") {
                    startManual(activePhase, true); 
                }
            }
        }
    });
}

// ==================== EVENT LISTENERS (Authenticated) ====================
function setupEventListeners() {
    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => switchMode(btn.dataset.mode));
    });

    manualBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (mode === "MANUAL") {
                startManual(btn.dataset.dir);
            } else {
                logState(`Operation blocked: Must be in MANUAL mode.`);
            }
        });
    });
}

// ==================== AUTHENTICATION & INITIALIZATION ====================

function initController() {
    setupEventListeners();
    setupFirestoreListener();
    switchMode("AUTO"); 
    logState("System initialized. Welcome, Admin!");
}

// Handle Logout
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
        logState(`Logout failed: ${error.message}`);
    }
});

// Primary Gatekeeper: Check Authentication Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in (Admin). Start the main app.
        console.log("Admin logged in. Starting controller:", user.uid);
        initController();
    } else {
        // User is signed out or not logged in. Redirect to the login page (now index.html).
        console.log("User not logged in. Redirecting to login page.");
        window.location.href = "index.html"; // <-- CHANGED FROM login.html to index.html
    }
});
