// ---------- GENERIC SCHEDULE (longer text friendly) ----------
const schedule = [
    { name: "Opening Ceremony & Keynote: 'AI in Africa'", start: "09:00", end: "10:00" },
    { name: "Team Formation + Icebreaker Session", start: "10:00", end: "10:45" },
    { name: "Workshop: Build a Chrome Extension in 45min", start: "10:45", end: "11:30" },
    { name: "Lunch Break + Tech Demos", start: "11:30", end: "12:30" },
    { name: "Panel: Women in Computing - Breaking Barriers", start: "12:30", end: "13:30" },
    { name: "Lightning Talks by Students", start: "13:30", end: "14:15" },
    { name: "Hands-on: GitHub Copilot & AI Pair Programming", start: "14:15", end: "15:00" },
    { name: "Project Pitches (Top 10 finalists)", start: "15:00", end: "16:00" },
    { name: "Judging & Networking Break", start: "16:00", end: "16:45" },
    { name: "Awards Ceremony & Closing NACOS 2026", start: "16:45", end: "18:00" }
];

// Helper: convert "HH:MM" to minutes since midnight
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

// Get current time in minutes (using device time, but you can mock for testing)
function getCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

// Determine current and next activity
function getCurrentAndNext() {
    const nowMins = getCurrentMinutes();
    let current = null;
    let next = null;
    
    for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        const startMins = timeToMinutes(item.start);
        const endMins = timeToMinutes(item.end);
        
        if (nowMins >= startMins && nowMins < endMins) {
            current = { ...item, endMins };
        }
        
        if (nowMins < startMins && !next) {
            next = { ...item, startMins };
        }
    }
    
    // If after last activity
    const lastEnd = timeToMinutes(schedule[schedule.length-1].end);
    if (nowMins >= lastEnd) {
        return { current: null, next: null, isAfterEnd: true };
    }
    
    // If before first activity
    const firstStart = timeToMinutes(schedule[0].start);
    if (nowMins < firstStart) {
        return { current: null, next: schedule[0], isBeforeStart: true };
    }
    
    return { current, next, isAfterEnd: false };
}

// Countdown update
function updateDisplay() {
    const nowMins = getCurrentMinutes();
    const { current, next, isAfterEnd, isBeforeStart } = getCurrentAndNext();
    
    const currentActivitySpan = document.getElementById("currentActivity");
    const nextActivitySpan = document.getElementById("nextActivity");
    const countdownSpan = document.getElementById("countdownDisplay");
    
    // Handle end of day
    if (isAfterEnd) {
        currentActivitySpan.innerText = "🎉 Event Concluded!";
        nextActivitySpan.innerText = "See you at NACOS 2027";
        countdownSpan.innerText = "🎊🎊🎊";
        return;
    }
    
    if (isBeforeStart && next) {
        currentActivitySpan.innerText = "⏳ Get Ready!";
        nextActivitySpan.innerText = next.name;
        const startMins = timeToMinutes(next.start);
        let diffSecs = (startMins - nowMins) * 60;
        if (diffSecs < 0) diffSecs = 0;
        const hrs = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        countdownSpan.innerText = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        return;
    }
    
    // Normal flow: current activity exists
    if (current) {
        currentActivitySpan.innerText = current.name;
        if (next) {
            nextActivitySpan.innerText = next.name;
        } else {
            nextActivitySpan.innerText = "🏁 Closing soon!";
        }
        
        // countdown to current's end
        let diffSecs = (current.endMins - nowMins) * 60;
        if (diffSecs < 0) diffSecs = 0;
        const hrs = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        countdownSpan.innerText = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    } else if (next && !current) {
        currentActivitySpan.innerText = "🔄 Transition...";
        nextActivitySpan.innerText = next.name;
        const startMins = timeToMinutes(next.start);
        let diffSecs = (startMins - nowMins) * 60;
        if (diffSecs < 0) diffSecs = 0;
        const hrs = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        countdownSpan.innerText = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }
}

// Render modal schedule (past / current / upcoming)
function renderScheduleModal() {
    const nowMins = getCurrentMinutes();
    const scheduleListDiv = document.getElementById("scheduleList");
    scheduleListDiv.innerHTML = "";
    
    schedule.forEach(item => {
        const startMins = timeToMinutes(item.start);
        const endMins = timeToMinutes(item.end);
        let status = "";
        
        if (nowMins >= endMins) status = "past";
        else if (nowMins >= startMins && nowMins < endMins) status = "current";
        else status = "upcoming";
        
        const div = document.createElement("div");
        div.className = `schedule-item ${status}`;
        div.innerHTML = `
            <div class="item-time">📅 ${item.start} – ${item.end}</div>
            <div class="item-name">${item.name}</div>
        `;
        scheduleListDiv.appendChild(div);
    });
}

// Modal controls
const modal = document.getElementById("modal");
const showBtn = document.getElementById("showScheduleBtn");
const closeBtn = document.getElementById("closeModalBtn");

showBtn.onclick = () => {
    renderScheduleModal();
    modal.style.display = "flex";
};
closeBtn.onclick = () => {
    modal.style.display = "none";
};
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

// Timer update every second
setInterval(updateDisplay, 1000);
updateDisplay();