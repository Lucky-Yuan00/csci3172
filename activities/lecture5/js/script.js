/* L5 Program Structure Activity
 * Magic 8-Ball + Fortune Cookie
 * - Two arrays (8-ball answers + fortune cookie sayings)
 * - getAnswer() randomly selects from either list and returns the result
 * - Uses return and console.log()
 * - Input validation and Enter-key trigger
 */

(() => {
  // ===== Data: Magic 8-Ball answers =====
  const eightBallAnswers = Object.freeze([
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes - definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
  ]);

  // ===== Data: Fortune Cookie sayings (sample) =====
  const fortuneCookies = Object.freeze([
    "A beautiful, smart, and loving person will be coming into your life.",
    "A fresh start will put you on your way.",
    "All your hard work will soon pay off.",
    "Adventure can be real happiness.",
    "Believe in yourself and others will too.",
    "Big journeys begin with a single step.",
    "Chance favors the prepared mind.",
    "Do not be afraid to take that big step.",
    "Good news will come to you by mail.",
    "Now is a good time to try something new.",
    "Opportunities are on the horizon.",
    "Patience is the key to joy.",
    "Soon life will become more interesting.",
    "Something you lost will soon turn up.",
    "Your abilities will shortly bring you fame."
  ]);

  // ===== Utilities =====
  const $ = (sel) => document.querySelector(sel);
  const getRandomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ===== Core: pick an answer from one of the two lists =====
  function getAnswer() {
    const lists = [eightBallAnswers, fortuneCookies];
    const which = Math.floor(Math.random() * lists.length); // 0 or 1
    const chosenList = lists[which];
    const source = which === 0 ? "Magic 8-Ball" : "Fortune Cookie";
    const text = getRandomFrom(chosenList);
    return { text, source };
  }

  // ===== Interaction: click or press Enter =====
  function askQuestion() {
    const input = $("#userQuestion");
    const question = input.value.trim();

    if (!question) {
      $("#answer").textContent = "Please type a question first :)";
      $("#source").textContent = "";
      console.log("No question provided.");
      return;
    }

    const { text, source } = getAnswer();

    $("#answer").textContent = text;
    $("#source").textContent = `— ${source}`;

    console.log(`Q: ${question} | A: ${text} (${source})`);

    input.value = "";
  }

  // Bind events
  $("#askBtn").addEventListener("click", askQuestion);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") askQuestion();
  });

  // Optionally expose to global:
  // window.askQuestion = askQuestion;
})();
