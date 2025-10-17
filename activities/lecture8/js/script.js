// Get the current time and hour
// HINT: you will have to first get the full date and then get the time and hour of the day
// You may explore the use of JS built-in functions

const now = new Date();
const hour = now.getHours();

// Create a variable to store your greeting message 

let greetingMessage = "";

// Based on the hour you get, you need to set the conditions you want your script to check
// in order to render a specific message
// for now we want to say 'Good Morning' if it is earlier than 12PM

if (hour < 12) {
  greetingMessage = "Good Morning";
}

// otherwise we want to check if it is earlier than 3PM and let the visitor know
// 'Hey! I think we are in class!'

else if (hour < 15) {
  greetingMessage = "Hey! I think we are in class!";
}

// For any other time (i.e., later than 3PM, we just want to say 'Welcome'

else {
  greetingMessage = "Welcome";
}

// This is an example of an if statement, or a conditional statement
// the JS interpreter checks if a conditions is true, if it is then it executes the code
// If the condition is FALSE, then it skips the code and moves onto the next one (i.e., our else if conditional)
// If that second condition is also FALSE then it moves to our last conditional, our else statement
// IF statements always end in an ELSE statement, if you want to give options in-between we always use ELSE IF



// Then, we use the DOM, and calling the 'getElementById( )' method and its innerHTML property to add some HTML for us onto our webpage
// we basically want to show the return result in <h2 id="greeting"></h2>

const greetingEl = document.getElementById("greeting");
if (greetingEl) {
  greetingEl.textContent = greetingMessage;
}

// In this section of our script, we want to access the values the user entered into our form
// and add them together
// First we declare our variables for the two values

let number1Value;
let number2Value;

// Now, let's use the DOM now to access a value in our form and show it back to us in an alert( ) box
// First, we'll creatr a function to store the input values into the variables we declared
// We'll enclose that code block in a function, getNumbers( )

function getNumbers() {
    // Store the values from the form into the variables we declared above
    const n1Input = document.getElementById("number1");
    const n2Input = document.getElementById("number2");

    number1Value = parseFloat(n1Input ? n1Input.value : "");
    number2Value = parseFloat(n2Input ? n2Input.value : "");
}

// A universal result display: prioritise writing to #result; if unavailable, use alert as a fallback
function showResult(message) {
  const out = document.getElementById("result");
  if (out) {
    out.textContent = message;
  } else {
    alert(message);
  }
}

// If the form still uses `<input type="submit">`, prevent the default submit action from triggering a page refresh
const formEl = document.querySelector("form");
if (formEl) {
  formEl.addEventListener("submit", (e) => e.preventDefault());
}


//	// Call the getNumbers() function to import the values the user enteres into the form into 
//	// this function
//	
//	// We perform our addition on the two values
//	
//	// Display the result of the calculation

function addition() {
  getNumbers();
  if (Number.isNaN(number1Value) || Number.isNaN(number2Value)) {
    showResult("Please enter two valid numbers.");
    return;
  }
  const sum = number1Value + number2Value;
  showResult(`Result: ${sum}`);
}

// —— Extended to include arithmetic operations
function subtraction() {
  getNumbers();
  if (Number.isNaN(number1Value) || Number.isNaN(number2Value)) {
    showResult("Please enter two valid numbers.");
    return;
  }
  const diff = number1Value - number2Value;
  showResult(`Result: ${diff}`);
}

function multiplication() {
  getNumbers();
  if (Number.isNaN(number1Value) || Number.isNaN(number2Value)) {
    showResult("Please enter two valid numbers.");
    return;
  }
  const prod = number1Value * number2Value;
  showResult(`Result: ${prod}`);
}

function division() {
  getNumbers();
  if (Number.isNaN(number1Value) || Number.isNaN(number2Value)) {
    showResult("Please enter two valid numbers.");
    return;
  }
  if (number2Value === 0) {
    showResult("Cannot divide by zero.");
    return;
  }
  const quo = number1Value / number2Value;
  showResult(`Result: ${quo}`);
}

function calculate(op) {
  switch (op) {
    case 'add': addition(); break;
    case 'sub': subtraction(); break;
    case 'mul': multiplication(); break;
    case 'div': division(); break;
    default: showResult("Unknown operation");
  }
}
