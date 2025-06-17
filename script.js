let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answers = {};
let globalTimerInterval;
let globalTimeLeft;

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-btn");
const loadingScreen = document.getElementById("loading");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const questionEl = document.getElementById("question");
const choiceButtons = document.querySelectorAll(".choice");
const nextButton = document.getElementById("next-btn");
const prevButton = document.getElementById("prev-btn");
const restartButton = document.getElementById("restart-btn");
const restartCurrentButton = document.getElementById("restart-current-btn");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("time-left");

const correctSound = new Audio("correct.mp3");
const incorrectSound = new Audio("incorrect.mp3");
const beepSound = new Audio("beep.mp3");

startButton.addEventListener("click", () => {
  startQuiz();
});

restartButton.addEventListener("click", () => {
  resultScreen.classList.add("hide");
  startScreen.classList.remove("hide");
});

restartCurrentButton.addEventListener("click", () => {
  restartCurrentQuiz();
});


nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
});

prevButton.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
});
const submitButton = document.getElementById("submit-btn");

submitButton.addEventListener("click", () => {
  submitQuiz();
});

function submitQuiz() {
  clearInterval(globalTimerInterval);
  showResult();
}


async function startQuiz() {
  const numQuestions = document.getElementById("num-questions").value;
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  const quizTimeMinutes = parseInt(document.getElementById("quiz-time").value);

  startScreen.classList.add("hide");
  loadingScreen.classList.remove("hide");

  try {
    const apiUrl = `https://opentdb.com/api.php?amount=${numQuestions}&type=multiple${category ? `&category=${category}` : ""}${difficulty ? `&difficulty=${difficulty}` : ""}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    questions = data.results.map((q) => {
      return {
        question: decodeHTML(q.question),
        choices: shuffleArray([q.correct_answer, ...q.incorrect_answers].map(decodeHTML)),
        answer: decodeHTML(q.correct_answer),
      };
    });

    currentQuestionIndex = 0;
    score = 0;
    answers = {};

    loadingScreen.classList.add("hide");
    quizScreen.classList.remove("hide");

    globalTimeLeft = quizTimeMinutes * 60;
    startGlobalTimer();

    showQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    loadingScreen.innerHTML = "<h2>Failed to load questions. Please try again later.</h2>";
  }
}

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`;
  progressEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  choiceButtons.forEach((button, index) => {
    button.textContent = currentQuestion.choices[index];
    button.disabled = false;
    button.classList.remove("correct", "incorrect");

    if (answers[currentQuestionIndex] === button.textContent) {
      if (button.textContent === currentQuestion.answer) {
        button.classList.add("correct");
      } else {
        button.classList.add("incorrect");
      }
    }

    button.onclick = () => selectAnswer(button);
  });

  updateNavButtons();
}

function selectAnswer(button) {
  const selectedAnswer = button.textContent;
  answers[currentQuestionIndex] = selectedAnswer;

  choiceButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === questions[currentQuestionIndex].answer) {
      btn.classList.add("correct");
    } else if (btn.textContent === selectedAnswer) {
      btn.classList.add("incorrect");
    }
  });

  if (selectedAnswer === questions[currentQuestionIndex].answer) {
    correctSound.play();
    score++;
  } else {
    incorrectSound.play();
  }

  updateNavButtons();
}

function updateNavButtons() {
  prevButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  nextButton.style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";

  // If user selected answer, still allow navigating next/prev
  // Buttons are controlled separately from answer selection
}

function showResult() {
  quizScreen.classList.add("hide");
  resultScreen.classList.remove("hide");
  scoreEl.textContent = `${score} / ${questions.length}`;
}

function startGlobalTimer() {
  clearInterval(globalTimerInterval);

  updateGlobalTimerDisplay();

  globalTimerInterval = setInterval(() => {
    globalTimeLeft--;

    updateGlobalTimerDisplay();

    if (globalTimeLeft <= 5 && globalTimeLeft > 0) {
      beepSound.play();
    }

    if (globalTimeLeft <= 0) {
      clearInterval(globalTimerInterval);
      showResult();
    }
  }, 1000);
}

function updateGlobalTimerDisplay() {
  const minutes = Math.floor(globalTimeLeft / 60);
  const seconds = globalTimeLeft % 60;
  timerEl.textContent = `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
}

function restartCurrentQuiz() {
  resultScreen.classList.add("hide");
  quizScreen.classList.remove("hide");

  currentQuestionIndex = 0;
  score = 0;
  answers = {};

  clearInterval(globalTimerInterval);
  startGlobalTimer();

  showQuestion();
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
