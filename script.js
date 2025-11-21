let questions = [];
let currentIndex = 0;
let bankBalance = 0;
const praises = ["Nice one!", "That's how it's done!", "You're on fire!", "Keep it up!", "Solid work!"];
const roasts = ["You call that a guess?", "My grandma knows more!", "Did you even read the code?", "Back to the books!", "Wrong! And stop crying."];

async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();

        // Generate options for each question since the JSON only has answers
        questions.forEach(q => {
            if (!q.options) {
                q.options = generateOptions(q.answer, questions);
            }
        });

        startGame();
    } catch (error) {
        console.error("Error loading questions:", error);
        document.getElementById('q-text').innerText = "Error loading questions. Check console.";
    }
}

function generateOptions(correctAnswer, allQuestions) {
    // Create a pool of potential wrong answers from other questions
    const otherAnswers = allQuestions
        .map(q => q.answer)
        .filter(a => a !== correctAnswer);

    // Shuffle and pick 3 wrong answers
    shuffle(otherAnswers);
    const wrongAnswers = otherAnswers.slice(0, 3);

    // Combine with correct answer and shuffle
    const options = [...wrongAnswers, correctAnswer];
    shuffle(options);
    return options;
}

function startGame() {
    bankBalance = 0;
    currentIndex = 0;
    shuffle(questions);
    loadQuestion();
    updateHUD();
    const oldRestart = document.querySelector('.btn-next');
    if (oldRestart) oldRestart.remove();
}

function loadQuestion() {
    if (currentIndex >= questions.length) {
        finishGame();
        return;
    }
    const qData = questions[currentIndex];
    document.getElementById('q-text').innerText = qData.question;
    const optContainer = document.getElementById('opt-container');
    optContainer.innerHTML = '';
    qData.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.onclick = () => checkAnswer(btn, qData);
        optContainer.appendChild(btn);
    });
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('foreman-speech').style.display = 'none';
    document.getElementById('foreman-speech').innerText = "Well? Spit it out!";
    document.getElementById('foreman-speech').style.borderBottom = "4px solid var(--border)";
    document.getElementById('face').style.borderColor = "var(--border)";
    setTimeout(() => document.getElementById('foreman-speech').style.display = 'block', 100);
}

function checkAnswer(btn, qData) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const speechBubble = document.getElementById('foreman-speech');
    const face = document.getElementById('face');

    if (btn.innerText === qData.answer) {
        btn.classList.add('correct');
        bankBalance += 55;
        speechBubble.innerText = praises[Math.floor(Math.random() * praises.length)];
        speechBubble.style.borderBottom = "4px solid var(--correct)";
        face.style.borderColor = "var(--correct)";
    } else {
        btn.classList.add('wrong');
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.innerText === qData.answer) b.classList.add('missed');
        });
        bankBalance -= 25;
        speechBubble.innerText = roasts[Math.floor(Math.random() * roasts.length)];
        speechBubble.style.borderBottom = "4px solid var(--wrong)";
        face.style.borderColor = "var(--wrong)";
        document.getElementById('quiz-card').classList.add('shaking');
        setTimeout(() => document.getElementById('quiz-card').classList.remove('shaking'), 400);
    }

    speechBubble.style.display = 'block';
    document.getElementById('explanation').style.display = 'block';
    document.getElementById('code-text').innerText = qData.code_text;
    document.getElementById('citation-text').innerText = qData.citation;
    document.getElementById('next-btn').style.display = 'block';
    updateHUD();
}

function nextQuestion() { currentIndex++; loadQuestion(); }

function updateHUD() {
    const display = document.getElementById('bank-display');
    display.innerText = "$" + bankBalance.toFixed(2);
    display.style.color = bankBalance >= 0 ? "var(--money)" : "var(--wrong)";
    const badge = document.getElementById('rank-badge');
    if (bankBalance < 0) badge.innerText = "Liability";
    else if (bankBalance < 500) badge.innerText = "Apprentice";
    else badge.innerText = "Journeyman";
}

function finishGame() {
    document.getElementById('q-text').innerText = "Shift Over.";
    document.getElementById('opt-container').innerHTML = "";
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('foreman-speech').innerText = bankBalance > 500 ? "Not bad. See you tomorrow." : "You're dragging up. Get out.";
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn-next';
    restartBtn.style.display = 'block';
    restartBtn.innerText = "Start New Shift";
    restartBtn.onclick = startGame;
    document.getElementById('quiz-card').appendChild(restartBtn);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialize
fetchQuestions();
