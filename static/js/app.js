// Global State & Functions to ensure HTML onclicks work reliably
window.state = {
    quizzes: [],
    currentQuizId: null, // filename
    quizData: null,
    currentQuestionIndex: 0,
    answers: {}, // map questionIndex -> {selected: [], verified: boolean}
    startTime: null,
    elapsedSeconds: 0,
    timerInterval: null
};

window.views = {};
window.containers = {};

// Helper: Mock Metadata for QuizCaffe Look (AWS Practitioner Themed)
const QUIZ_META = {
    'Simulazione_1.json': {
        title: 'Cloud Concepts',
        desc: 'AWS Value Proposition & Cloud Economics',
        diff: 'Media',
        questions: 65,
        icon: '☁️'
    },
    'Simulazione_2.json': {
        title: 'Security & Compliance',
        desc: 'Shared Responsibility & Access Mgmt',
        diff: 'Difficile',
        questions: 65,
        icon: '🔒'
    },
    'Simulazione_3.json': {
        title: 'AWS Technology',
        desc: 'Core Services (EC2, S3, RDS)',
        diff: 'Media',
        questions: 65,
        icon: '💻'
    },
    'Simulazione_4.json': {
        title: 'Billing & Pricing',
        desc: 'Models, Support Plans & Calculator',
        diff: 'Difficile',
        questions: 65,
        icon: '💰'
    },
    'Simulazione_5.json': {
        title: 'Full Practice Exam 1',
        desc: 'Comprehensive AWS Practitioner Test',
        diff: 'Molto Difficile',
        questions: 65,
        icon: '🏆'
    },
    'Simulazione_6.json': {
        title: 'Full Practice Exam 2',
        desc: 'Final Readiness Assessment',
        diff: 'Estremo',
        questions: 65,
        icon: '🚀'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM Elements
    window.views = {
        dashboard: document.getElementById('dashboard-view'),
        quiz: document.getElementById('quiz-view')
    };

    window.containers = {
        quizList: document.getElementById('quiz-list'),
        question: document.getElementById('question-container'),
        progressText: document.getElementById('progress-text'),
        timerDisplay: document.getElementById('timer-display'),
        timerContainer: document.getElementById('timer-container'),
        sidebarNav: document.getElementById('sidebar-nav'),
        loading: document.getElementById('quiz-loading')
    };

    // Initialize App
    loadQuizzes();
});

function getQuizMeta(filename) {
    return QUIZ_META[filename] || {
        title: filename.replace('.json', '').replace(/_/g, ' '),
        desc: 'Quiz di esercitazione',
        diff: 'N/A',
        questions: '?',
        icon: '📝'
    };
}

// Global Logic Functions

window.exitQuiz = function () {
    console.log('exitQuiz called');
    if (confirm("Sei sicuro di voler uscire? I tuoi progressi verranno salvati.")) {
        console.log('Exit confirmed, switching view');
        switchView('dashboard');
    }
};

window.switchView = function (viewName) {
    console.log('switchView called:', viewName);
    if (viewName === 'quiz') {
        // Show Quiz
        views.dashboard.style.display = 'none';
        views.quiz.style.display = 'flex'; // Restore flex layout

        if (containers.timerContainer) {
            containers.timerContainer.classList.remove('hidden'); // Ensure class logic is also correct just in case
            containers.timerContainer.style.display = 'flex';
        }
    } else {
        // Show Dashboard
        views.quiz.style.display = 'none';
        views.dashboard.style.display = 'block'; // Restore default block

        if (containers.timerContainer) {
            containers.timerContainer.style.display = 'none';
        }
    }
};

async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        state.quizzes = await response.json();
        renderDashboard();
    } catch (error) {
        console.error('Failed to load quizzes:', error);
        if (containers.quizList)
            containers.quizList.innerHTML = '<p class="text-brand-primary text-center col-span-3 font-bold text-lg">Impossibile caricare i quiz. Riprova più tardi.</p>';
    } finally {
        if (containers.loading) containers.loading.classList.add('hidden');
        if (containers.quizList) containers.quizList.classList.remove('hidden');
    }
}

function renderDashboard() {
    if (!containers.quizList) return;
    containers.quizList.innerHTML = state.quizzes.map(filename => {
        const meta = getQuizMeta(filename);
        return `
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="text-6xl">${meta.icon}</span>
                </div>
                
                <div class="relative z-10">
                    <div class="w-12 h-12 rounded-xl bg-brand-secondary/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-brand-primary">
                        ${meta.icon}
                    </div>
                    
                    <h3 class="text-xl font-bold text-brand-text mb-2 line-clamp-1" title="${meta.title}">
                        ${meta.title}
                    </h3>
                    
                    <p class="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                        ${meta.desc}
                    </p>
                    
                    <div class="flex items-center gap-4 text-xs font-medium text-gray-400 mb-6">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            ${meta.questions} Domande
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            ${meta.diff}
                        </span>
                    </div>
                    
                    <button onclick="startQuiz('${filename}')" class="w-full py-3 rounded-xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                        <span>Gioca ora</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.startQuiz = async function (filename) {
    console.log(`Starting quiz: ${filename}`);
    state.currentQuizId = filename;
    state.quizData = null;

    // Load progress
    const savedState = localStorage.getItem(`quiz_progress_${filename}`);

    try {
        const response = await fetch(`/api/quiz/${filename}`);
        if (!response.ok) {
            console.error(`Fetch failed: ${response.status} ${response.statusText}`);
            throw new Error('Failed to load quiz');
        }
        state.quizData = await response.json();

        // Normalize: map AWS 'correct_response' ['a', 'b'] to indices [0, 1]
        state.quizData.forEach(q => {
            if (q.correct_response && !q.correct_indices) {
                q.correct_indices = q.correct_response.map(char => char.toLowerCase().charCodeAt(0) - 97);
            }
        });

        if (!state.quizData || state.quizData.length === 0) {
            throw new Error('Quiz data empty');
        }

        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.quizDataLength && parsed.quizDataLength === state.quizData.length) {
                state.answers = parsed.answers || {};
                state.currentQuestionIndex = parsed.currentQuestionIndex || 0;
                state.elapsedSeconds = parsed.elapsedSeconds || 0;
            } else {
                resetQuizState();
            }
        } else {
            resetQuizState();
        }

        startTimer();
        renderQuizView();
        switchView('quiz');
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert(`Impossibile avviare il quiz: ${error.message}. Per favore riprova.`);
    }
};

function resetQuizState() {
    state.answers = {};
    state.currentQuestionIndex = 0;
    state.elapsedSeconds = 0;
    state.startTime = Date.now();
}

function renderQuizView() {
    renderSidebar();
    renderQuestion(state.currentQuestionIndex);
    updateProgress();
}

function renderSidebar() {
    if (!containers.sidebarNav) return;
    containers.sidebarNav.innerHTML = state.quizData.map((_, idx) => {
        const answer = state.answers[idx];
        let statusClass = 'bg-white text-gray-400 hover:bg-gray-50 border border-transparent';

        if (answer && answer.verified) {
            const isCorrect = isAnswerCorrect(idx);
            statusClass = isCorrect ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200';
        } else if (answer && answer.selected.length > 0) {
            statusClass = 'bg-brand-primary/10 text-brand-primary border-brand-primary/30';
        }

        if (idx === state.currentQuestionIndex) {
            statusClass = 'bg-brand-primary text-white shadow-md shadow-brand-primary/30 ring-2 ring-offset-1 ring-brand-primary';
        }

        return `<button onclick="jumpToQuestion(${idx})" class="w-full aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-200 ${statusClass}">
            ${idx + 1}
        </button>`;
    }).join('');
}

function isAnswerCorrect(index) {
    const question = state.quizData[index];
    const answer = state.answers[index];
    if (!answer || !answer.verified) return false;

    const correctIndices = question.correct_indices || [];
    const selected = answer.selected.slice().sort().join(',');
    const correct = correctIndices.slice().sort().join(',');
    return selected === correct;
}

window.jumpToQuestion = function (index) {
    state.currentQuestionIndex = index;
    renderQuizView();
};

function renderQuestion(index) {
    if (!containers.question) return;
    const question = state.quizData[index];
    if (!question) return;

    const answerState = state.answers[index] || { selected: [], verified: false };
    const correctIndices = question.correct_indices || [];
    const isMultiple = correctIndices.length > 1;

    // Answers HTML
    const answersHtml = question.answers.map((ansHtml, ansIdx) => {
        const isSelected = answerState.selected.includes(ansIdx);
        const isCorrect = correctIndices.includes(ansIdx);

        let containerClass = "p-5 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-4 hover:bg-stone-50 group relative overflow-hidden";
        let indicatorClass = "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10";

        if (answerState.verified) {
            containerClass += " cursor-default";
            if (isCorrect) {
                containerClass += " bg-green-50 border-green-200";
                indicatorClass += " border-green-500 bg-green-500 text-white";
            } else if (isSelected && !isCorrect) {
                containerClass += " bg-red-50 border-red-200";
                indicatorClass += " border-red-500 bg-red-500 text-white";
            } else {
                containerClass += " border-gray-100 opacity-60";
                indicatorClass += " border-gray-300";
            }
        } else {
            if (isSelected) {
                containerClass += " border-brand-primary bg-brand-primary/5 shadow-md";
                indicatorClass += " border-brand-primary bg-brand-primary text-white";
            } else {
                containerClass += " border-gray-200 hover:border-brand-primary/50";
                indicatorClass += " border-gray-300 group-hover:border-brand-primary/50";
            }
        }

        return `
            <div class="${containerClass}" onclick="${answerState.verified ? '' : `toggleAnswer(${ansIdx})`}">
                <div class="flex-shrink-0 pt-0.5">
                    <div class="${indicatorClass}">
                        ${(isSelected || (answerState.verified && isCorrect)) ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                    </div>
                </div>
                <div class="prose prose-sm max-w-none text-gray-700 select-none z-10 font-medium">
                    ${ansHtml}
                </div>
            </div>
        `;
    }).join('');

    // Buttons
    const prevBtn = `<button ${index === 0 ? 'disabled' : ''} onclick="jumpToQuestion(${index - 1})" class="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors">Indietro</button>`;

    let actionBtn;
    if (!answerState.verified) {
        actionBtn = `<button onclick="verifyAnswer(${index})" class="w-full md:w-auto px-10 py-3 bg-brand-primary text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5" ${answerState.selected.length === 0 ? 'disabled' : ''}>VERIFICA RISPOSTA</button>`;
    } else {
        actionBtn = `<button onclick="jumpToQuestion(${index + 1})" class="w-full md:w-auto px-10 py-3 bg-brand-text text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">PROSSIMA &rarr;</button>`;
        if (index === state.quizData.length - 1) {
            actionBtn = `<button onclick="finishQuiz()" class="w-full md:w-auto px-10 py-3 bg-brand-text text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">RIEPILOGO</button>`;
        }
    }

    // Explanation
    const explanationHtml = answerState.verified ? `
        <div class="mt-8 p-8 bg-green-50 rounded-2xl border border-green-100 animate-fade-in-up">
            <h4 class="text-lg font-bold text-green-800 mb-3 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Spiegazione
            </h4>
            <div class="prose prose-sm prose-green max-w-none text-gray-700">
                ${question.explanation}
            </div>
        </div>
    ` : '';

    containers.question.innerHTML = `
        <div class="space-y-6">
            <div class="flex flex-col gap-4">
                <div class="mb-2">
                     <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${isMultiple ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                        ${isMultiple ? 'RISPOSTA MULTIPLA' : 'RISPOSTA SINGOLA'}
                    </span>
                    <span class="inline-block ml-2 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        Domanda ${index + 1}
                    </span>
                </div>
                <h2 class="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">${question.question}</h2>
            </div>

            <div class="grid gap-3">
                ${answersHtml}
            </div>

            <div class="pt-8 mt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                ${prevBtn}
                ${actionBtn}
            </div>

            ${explanationHtml}
        </div>
    `;
}

// Helper: Toggle answer selection
window.toggleAnswer = function (ansIdx) {
    const answer = state.answers[state.currentQuestionIndex] || { selected: [], verified: false };
    if (answer.verified) return;

    const question = state.quizData[state.currentQuestionIndex];
    const correctIndices = question.correct_indices || [];
    const isMulti = correctIndices.length > 1;

    if (isMulti) {
        const idx = answer.selected.indexOf(ansIdx);
        if (idx > -1) {
            answer.selected.splice(idx, 1);
        } else {
            answer.selected.push(ansIdx);
        }
    } else {
        answer.selected = [ansIdx];
    }

    state.answers[state.currentQuestionIndex] = answer;
    renderQuizView();
};

window.verifyAnswer = function () {
    const answer = state.answers[state.currentQuestionIndex];
    if (!answer || answer.selected.length === 0) return;

    answer.verified = true;
    state.answers[state.currentQuestionIndex] = answer;
    saveProgress();
    renderQuizView();
};

window.finishQuiz = function () {
    alert("Quiz completato! (Funzionalità riepilogo da implementare)");
    switchView('dashboard');
};

function updateProgress() {
    if (!containers.progressText) return;
    const total = state.quizData.length;
    const answered = Object.values(state.answers).filter(a => a.selected.length > 0).length;
    containers.progressText.innerText = `Domanda ${state.currentQuestionIndex + 1} di ${total}`;
}

function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.elapsedSeconds++;
        const hours = Math.floor(state.elapsedSeconds / 3600);
        const minutes = Math.floor((state.elapsedSeconds % 3600) / 60);
        const seconds = state.elapsedSeconds % 60;

        if (containers.timerDisplay) {
            containers.timerDisplay.innerText =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        if (state.elapsedSeconds % 5 === 0) saveProgress();
    }, 1000);
}

function saveProgress() {
    if (!state.currentQuizId) return;
    const dataToSave = {
        quizDataLength: state.quizData ? state.quizData.length : 0,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        elapsedSeconds: state.elapsedSeconds
    };
    localStorage.setItem(`quiz_progress_${state.currentQuizId}`, JSON.stringify(dataToSave));
}
