//const API = "http://127.0.0.1:8000";
const API = "https://webcapaapi.azurewebsites.net/api";
let algorithms = {};
let history = [];

async function loadAlgorithms() {
  const res = await fetch(`${API}/algorithms`);
  algorithms = await res.json();

  const select = document.getElementById("algorithm");
  for (const key in algorithms) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = algorithms[key].label;
    select.appendChild(option);
  }
}

async function computeFromText() {
  const algorithm = document.getElementById("algorithm").value;
  const text = document.getElementById("textInput").value;

  console.log(JSON.stringify({ algorithm, text }));

  const res = await fetch(`${API}/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, text })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

document.getElementById("run").addEventListener("click", async () => {
  const output = document.getElementById("output");
  const historyEl = document.getElementById("history");

  try {
    const res = await computeFromText();
    const resultString = res.answers
                        .map((val, i) => `${val} ${res.units[i]}`)
                        .join("\n");

    output.textContent = resultString;

    history.push(`${res.label}\n${resultString}`);
    if (history.length > 5) history.shift();

    historyEl.textContent = history.join("\n\n");

  } catch (err) {
    console.log(err.message);
    output.textContent = "Something Went Wrong, Try Again";
  }

  const card = document.querySelector(".output-card");
  card.classList.remove("animate");
  void card.offsetWidth; // force reflow
  card.classList.add("animate");

  const historyCard = document.querySelector(".history-card");
  historyCard.classList.remove("animate");
  void historyCard.offsetWidth; // force reflow
  historyCard.classList.add("animate");

});

document.getElementById("algorithm").addEventListener("change", () => {
  const inputCard = document.querySelector(".card");

  inputCard.classList.remove("context-change");
  void inputCard.offsetWidth; // reflow
  inputCard.classList.add("context-change");
});

loadAlgorithms();


