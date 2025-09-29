// Category Buttons
const generalKnowledgeCategory = document.getElementById("general-knowledge");
const sportsCategory = document.getElementById("sports");
const moviesCategory = document.getElementById("movies");
const scienceNatureCategory = document.getElementById("science-nature");

// Quiz Data
let playerName = document.getElementById("playerName");
let currentCategory = null;
let questions = [];
let currentIndex = 0;
let score = 0;

// API Token
let token = null;

// Check Player Name
function checkPlayerName() {
    if (playerName.value === "") {
        playerName.value = "Anonymous";
    }
}

// Decode Questions & Answers
function decodeHTML(html) {
    const encodedTextElement = document.createElement("textarea");
    encodedTextElement.innerHTML = html;
    return encodedTextElement.value;
}

// Fetch a session token from Open Trivia DB API so we won't get duplicate questions.
async function getToken() {
    const apiEndpoint = "https://opentdb.com/api_token.php?command=request";
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    token = data.token;
}

// Load All Questions
async function loadQuestions(category) {
    checkPlayerName();

    // Check Token
    if (!token) {
        await getToken();
    }

    // Hide the Leaderboard
    document.getElementById("leaderboard").classList.add("hidden");

    // Create an API Endpoint URL of Category
    // Fetch and Parse All Questions
    const apiEndpoint = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=easy&type=multiple&token=${token}`;
    const response = await fetch(apiEndpoint);
    const data = await response.json();

    // Handle Open Trivia DB Token Exhaustions
    if (data.response_code === 0) {
        questions = data.results;
        currentIndex = 0;
        score = 0;
    } else if (data.response_code === 4 || data.response_code === 5) {
        await fetch(
            `https://opentdb.com/api_token.php?command=reset&token=${token}`
        );
        return loadQuestions(category);
    } else {
        document.getElementById("question").textContent =
            "⚠️ Error loading questions.";
    }
}

// Render All Questions
function renderQuestions() {
    // Grab every questions one by one.
    const q = questions[currentIndex];
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const feedbackElement = document.getElementById("feedback");
    const nextButton = document.getElementById("next-button");

    // Reset: Clear answers, feedback and also hide the next button.
    feedbackElement.textContent = "";
    answersElement.textContent = "";
    nextButton.classList.add("hidden");
    nextButton.textContent = "Next";

    // Show Question
    questionElement.textContent = decodeHTML(q.question);

    // Mix Answers
    const answers = [...q.incorrect_answers, q.correct_answer]
        .map((element) => decodeHTML(element))
        .sort(() => Math.random() - 0.5);

    // Show Answer Buttons
    answers.forEach((answer) => {
        const answerButton = document.createElement("button");
        answerButton.textContent = answer;
        answerButton.className =
            "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-blue-100 transition";
        answerButton.addEventListener("click", () => {
            // Check whether the selected answer is correct or not.
            handleAnswer(answer, q.correct_answer);
        });
        answersElement.appendChild(answerButton);
    });
}

// Handle Answer
function handleAnswer(selectedAnswer, correctAnswer) {
    const feedbackElement = document.getElementById("feedback");
    const nextButton = document.getElementById("next-button");

    // If the selected answer is the correct one, then the answer is correct.
    // If not, then the answer is wrong, show the correct answer.
    if (selectedAnswer === correctAnswer) {
        score++;
        feedbackElement.textContent = "✅ Correct!";
        feedbackElement.className =
            "mt-4 text-center font-semibold text-green-600";
    } else {
        feedbackElement.textContent = `❌ Wrong! Correct Answer: ${decodeHTML(
            correctAnswer
        )}`;
        feedbackElement.className =
            "mt-4 text-center font-semibold text-red-600";
    }

    // After selecting answer, disable all buttons.
    document.querySelectorAll("#answers button").forEach((element) => {
        element.disabled = true;
        element.classList.add("opacity-60");
    });

    // Show Next button to go to the next question.
    nextButton.classList.remove("hidden");
    nextButton.onclick = nextQuestion;
}

// Render Next Question
function nextQuestion() {
    // When a question is answered then increment currentIndex by 1.
    // If the current question is the last question then show quiz results.
    currentIndex++;
    if (currentIndex < questions.length) {
        renderQuestions();
    } else {
        showResults();
    }
}

// Show Final Results
function showResults() {
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const feedbackElement = document.getElementById("feedback");
    const nextButton = document.getElementById("next-button");

    // Quiz is finished. Clear questions and answers.
    questionElement.textContent = "🎉 Quiz Finished!";
    answersElement.innerHTML = "";
    feedbackElement.textContent = `Your Score: ${score} / ${questions.length}`;
    feedbackElement.className = "mt-4 text-center font-bold";
    nextButton.textContent = "Play Again";
    nextButton.classList.remove("hidden");
    nextButton.onclick = () => {
        document.getElementById("quiz-data").classList.remove("hidden");
        document.getElementById("quiz-questions").classList.add("hidden");
        return;
    };

    // Reset input field.
    playerName.value = "";
    currentCategory = "";
}

generalKnowledgeCategory.addEventListener("click", async () => {
    currentCategory = "General Knowledge";
    await loadQuestions(9);
    document.getElementById("quiz-data").classList.add("hidden");
    document.getElementById("quiz-questions").classList.remove("hidden");
    renderQuestions();
});

sportsCategory.addEventListener("click", async () => {
    currentCategory = "Sports";
    await loadQuestions(21);
    document.getElementById("quiz-data").classList.add("hidden");
    document.getElementById("quiz-questions").classList.remove("hidden");
    renderQuestions();
});

moviesCategory.addEventListener("click", async () => {
    currentCategory = "Movies";
    await loadQuestions(11);
    document.getElementById("quiz-data").classList.add("hidden");
    document.getElementById("quiz-questions").classList.remove("hidden");
    renderQuestions();
});

scienceNatureCategory.addEventListener("click", async () => {
    currentCategory = "Science & Nature";
    await loadQuestions(17);
    document.getElementById("quiz-data").classList.add("hidden");
    document.getElementById("quiz-questions").classList.remove("hidden");
    renderQuestions();
});
