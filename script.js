//const API = "http://127.0.0.1:8000";
const API = "https://webcapaapi.azurewebsites.net/api";
let algorithms = {};

function extractNumbers(text) {
  const regex = /(?<![\w.])[-+]?\d*\.?\d+(?!\w)/g;
  return text.match(regex)?.map(Number) || [];
}

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

  const values = extractNumbers(text);
  const paramNames = algorithms[algorithm].params;

  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = values[i];
  });
  console.log(params)

  const res = await fetch(`${API}/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, params })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

document.getElementById("run").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "Computing...";

  try {
    const res = await computeFromText();
    output.textContent = String(res.result)
  } catch (err) {
    console.log(err.message)
    output.textContent = "Something Went Wrong, Try Again";
  }
});

loadAlgorithms();
