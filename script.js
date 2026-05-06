// --- HARDCODED DATABASE ---
const CONTENT_DB = {
    concepts: [
        { title: "Indus Valley", text: "World's earliest urban civilization. Known for grid patterns and drainage.", subject: "History" },
        { title: "Article 21", text: "Protection of Life and Personal Liberty. It is the heart of Fundamental Rights.", subject: "Polity" },
        { title: "Western Ghats", text: "A UNESCO World Heritage site and one of the eight 'hottest hotspots' of biological diversity.", subject: "Geography" },
        { title: "Preamble", text: "Based on 'Objective Resolution' drafted by Nehru. Not enforceable in court.", subject: "Polity" }
    ],
    mcqs: [
        {
            q: "Who was the first Viceroy of India?",
            options: ["Lord Canning", "Lord Dalhousie", "Lord Curzon", "Lord Mountbatten"],
            correct: 0,
            exp: "Government of India Act 1858 created the office of Viceroy.",
            subject: "History"
        },
        {
            q: "Which schedule deals with Anti-Defection?",
            options: ["8th", "9th", "10th", "12th"],
            correct: 2,
            exp: "10th Schedule was added by 52nd Amendment Act, 1985.",
            subject: "Polity"
        }
    ]
};

// --- CORE STATE ---
let state = {
    xp: parseInt(localStorage.getItem('upsc_xp')) || 0,
    streak: parseInt(localStorage.getItem('upsc_streak')) || 1,
    lastLogin: localStorage.getItem('upsc_last_login'),
    level: 1,
    viewedCount: 0,
    historyXP: parseInt(localStorage.getItem('upsc_hist')) || 0,
    polityXP: parseInt(localStorage.getItem('upsc_pol')) || 0,
    geoXP: parseInt(localStorage.getItem('upsc_geo')) || 0,
};

// Load Custom User Posts
let customPosts = JSON.parse(localStorage.getItem('upsc_custom_posts')) || { concepts: [], mcqs: [] };

const feed = document.getElementById('feed-container');

// --- INITIALIZATION ---
function init() {
    checkStreak();
    renderInitialCards();
    updateUI();
    
    feed.addEventListener('scroll', handleScroll);
}

function checkStreak() {
    const today = new Date().toDateString();
    if (state.lastLogin && state.lastLogin !== today) {
        const lastDate = new Date(state.lastLogin);
        const diff = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
        if (diff > 1.5) state.streak = 1;
        else state.streak++;
    }
    state.lastLogin = today;
    saveState();
}

function saveState() {
    localStorage.setItem('upsc_xp', state.xp);
    localStorage.setItem('upsc_streak', state.streak);
    localStorage.setItem('upsc_last_login', state.lastLogin);
    localStorage.setItem('upsc_hist', state.historyXP);
    localStorage.setItem('upsc_pol', state.polityXP);
    localStorage.setItem('upsc_geo', state.geoXP);
}

function saveCustomPosts() {
    localStorage.setItem('upsc_custom_posts', JSON.stringify(customPosts));
}

// --- CARD RENDERING & LOGIC ---
function createConceptCard(data) {
    const div = document.createElement('div');
    div.className = 'card';
    const isCustom = data.isCustom ? `<span style="font-size: 0.7rem; color: #cbd5e1; margin-left: 8px;">👤 User Upload</span>` : '';
    
    div.innerHTML = `
        <div class="glass-content">
            <span class="subject-tag">${data.subject}</span> ${isCustom}
            <h2 style="margin: 10px 0">${data.title}</h2>
            <p>${data.text}</p>
            <div style="margin-top:20px; font-size:0.8rem; color:gray">Scroll to continue • +5 XP</div>
        </div>
    `;
    return div;
}

function createMCQCard(data) {
    const div = document.createElement('div');
    div.className = 'card';
    const isCustom = data.isCustom ? `<span style="font-size: 0.7rem; color: #cbd5e1; margin-left: 8px;">👤 User Upload</span>` : '';

    const optionsHtml = data.options.map((opt, i) => 
        `<button class="option-btn" onclick="checkAnswer(this, ${i === parseInt(data.correct)}, '${data.subject}', \`${data.exp}\`)">${opt}</button>`
    ).join('');

    div.innerHTML = `
        <div class="glass-content">
            <span class="subject-tag">${data.subject} MCQ</span> ${isCustom}
            <h3 style="margin: 15px 0">${data.q}</h3>
            <div class="options-grid">${optionsHtml}</div>
            <p class="explanation hidden" style="margin-top:15px; font-size:0.9rem; color:var(--accent)">${data.exp}</p>
        </div>
    `;
    return div;
}

function renderInitialCards() {
    feed.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        addRandomCard();
    }
}

function addRandomCard() {
    // Combine hardcoded DB and Custom User DB dynamically
    const allConcepts = [...CONTENT_DB.concepts, ...customPosts.concepts];
    const allMCQs = [...CONTENT_DB.mcqs, ...customPosts.mcqs];

    const rand = Math.random();
    let card;
    
    // Fallback logic if one array is empty
    if (rand > 0.4 && allConcepts.length > 0) {
        const randomConcept = allConcepts[Math.floor(Math.random() * allConcepts.length)];
        card = createConceptCard(randomConcept);
    } else if (allMCQs.length > 0) {
        const randomMCQ = allMCQs[Math.floor(Math.random() * allMCQs.length)];
        card = createMCQCard(randomMCQ);
    }
    
    if (card) feed.appendChild(card);
}

function checkAnswer(btn, isCorrect, subject, explanation) {
    const parent = btn.parentElement;
    if (parent.classList.contains('answered')) return;
    
    parent.classList.add('answered');
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
        if ('vibrate' in navigator) navigator.vibrate(50); // Haptic feedback
        addXP(20, subject);
    } else {
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
        const buttons = parent.querySelectorAll('.option-btn');
        buttons.forEach(b => b.style.opacity = "0.5");
        btn.style.opacity = "1";
    }
    
    parent.nextElementSibling.classList.remove('hidden'); 
}

function addXP(amount, subject) {
    state.xp += amount;
    if (subject === "History") state.historyXP += amount;
    else if (subject === "Polity") state.polityXP += amount;
    else if (subject === "Geography") state.geoXP += amount;
    
    const popup = document.getElementById('xp-popup');
    popup.innerText = `+${amount} XP`;
    
    // Trigger CSS animation reflow
    popup.classList.remove('pop-animation');
    void popup.offsetWidth; 
    popup.classList.add('pop-animation');
    
    updateUI();
    saveState();
}

function handleScroll() {
    const scrollPos = feed.scrollTop;
    const height = window.innerHeight;
    const index = Math.round(scrollPos / height);
    
    if (index > state.viewedCount) {
        state.viewedCount = index;
        
        // Pre-load next cards continuously
        if (feed.children.length - index < 3) {
            addRandomCard();
            addRandomCard();
        }
        
        // Passive XP for reading concepts
        if (feed.children[index-1] && feed.children[index-1].querySelector('h2')) {
            addXP(5, "General");
        }
    }

    const progress = (scrollPos / (feed.scrollHeight - height)) * 100;
    document.getElementById('main-progress-bar').style.width = `${progress}%`;
}

// --- UI MANAGERS ---
function updateUI() {
    document.getElementById('xp-display').innerText = state.xp;
    document.getElementById('streak-display').innerText = state.streak;
    
    state.level = Math.floor(state.xp / 100) + 1;
    const ranks = ["Beginner", "Aspirant", "Serious Candidate", "Mains Ready", "Officer"];
    const rankIndex = Math.min(Math.floor(state.level / 5), ranks.length - 1);
    
    document.getElementById('rank-name').innerText = ranks[rankIndex];
    document.getElementById('level-progress').style.width = `${state.xp % 100}%`;
    
    document.getElementById('stat-history').innerText = state.historyXP;
    document.getElementById('stat-polity').innerText = state.polityXP;
    document.getElementById('stat-geo').innerText = state.geoXP;
}

function toggleDashboard() {
    document.getElementById('dashboard').classList.toggle('hidden');
}

function resetProgress() {
    if(confirm("Are you sure? All XP and Custom Posts will be deleted.")) {
        localStorage.clear();
        location.reload();
    }
}

// --- CUSTOM POST CREATION ---
function toggleCreateModal() {
    document.getElementById('create-modal').classList.toggle('hidden');
}

function switchFormType() {
    const type = document.getElementById('new-post-type').value;
    document.getElementById('concept-fields').classList.toggle('hidden', type !== 'concept');
    document.getElementById('mcq-fields').classList.toggle('hidden', type !== 'mcq');
}

function handleCreatePost(e) {
    e.preventDefault();
    const type = document.getElementById('new-post-type').value;
    const subject = document.getElementById('new-subject').value;

    if (type === 'concept') {
        const title = document.getElementById('new-title').value;
        const text = document.getElementById('new-text').value;
        if(!title || !text) return alert("Please fill all fields.");

        customPosts.concepts.push({ title, text, subject, isCustom: true });
    } 
    else if (type === 'mcq') {
        const q = document.getElementById('new-q').value;
        const opt0 = document.getElementById('opt-0').value;
        const opt1 = document.getElementById('opt-1').value;
        const opt2 = document.getElementById('opt-2').value;
        const opt3 = document.getElementById('opt-3').value;
        const correct = document.getElementById('new-correct').value;
        const exp = document.getElementById('new-exp').value;
        
        if(!q || !opt0 || !opt1 || !opt2 || !opt3 || !exp) return alert("Please fill all MCQ fields.");

        customPosts.mcqs.push({
            q, 
            options: [opt0, opt1, opt2, opt3], 
            correct: parseInt(correct), 
            exp, 
            subject, 
            isCustom: true 
        });
    }

    saveCustomPosts();
    
    // Reset Form
    e.target.reset();
    switchFormType(); // Reset visibility based on default select
    toggleCreateModal();
    
    // Push the new card to the feed immediately
    addRandomCard();
    alert("Post added successfully! Keep scrolling to find it.");
}

init();