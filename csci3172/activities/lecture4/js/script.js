// Three fictional persons (one student, one not)
const people = [
  { name: "Ana",   age: 30, isStudent: true  },  // original
  { name: "Ben",   age: 22, isStudent: true  },  // student
  { name: "Clara", age: 35, isStudent: false }   // not a student
];

function describePerson(p) {
  // conditional: check student status
  const studentText = p.isStudent ? "is a student" : "is not a student";
  // compute age in 8 years
  const ageInEightYears = p.age + 8;
  // compose message
  return `${p.name} is ${p.age} years old and ${studentText}. In 8 years they will be ${ageInEightYears}.`;
}

document.addEventListener("DOMContentLoaded", () => {
  const firstLine = describePerson(people[0]);
  const outputP = document.getElementById("output");
  if (outputP) outputP.textContent = firstLine;

  // append the rest as new <p> elements next to the first one
  const parent = outputP ? outputP.parentElement : document.body;
  for (let i = 1; i < people.length; i++) {
    const p = document.createElement("p");
    p.textContent = describePerson(people[i]);
    parent.appendChild(p);
  }
});
