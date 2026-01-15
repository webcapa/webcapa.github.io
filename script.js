const API = "https://webcapaapi.azurewebsites.net/api";
let algorithms = {};
let history = [];

async function loadAlgorithms() {
  const res = await fetch(`${API}/algorithms`);
  algorithms = await res.json();

  const selectAssignment = document.getElementById("assignment");
  const option = document.createElement("option");
  option.value = 1;
  option.textContent = "Assignment 1";
  selectAssignment.appendChild(option);

  const selectAlgorithm = document.getElementById("algorithm");
  for (const key in algorithms) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = algorithms[key].label;
    selectAlgorithm.appendChild(option);
  }
}

async function fetchAnswer() {
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
  const output = document.getElementById("result");
  const debug = document.getElementById("debug");
  const debugCard = document.querySelector(".debug-card")
  const historyEl = document.getElementById("history");

  try {
    const res = await fetchAnswer();
    const resultString = res.answers
                        .map((val, i) => `${val} ${res.units[i]}`)
                        .join("\n");

    output.textContent = resultString;

    history.unshift(`<span class="history-subheading">${res.label}</span>\n${resultString}`);
    if (history.length > 5) history.pop();
    historyEl.innerHTML = history.join("<br><br>");

    debug.textContent = "";
    debugCard.hidden = true;

  } catch (err) {
    console.log(err.message);
    output.textContent = "Something Went Wrong, Try Again";
    debug.textContent = err.message;
    debugCard.hidden = false;
  }

  const cards = document.querySelectorAll(".card-animation");
  for (const card of cards) {
    card.classList.remove("animate");
    void card.offsetWidth; // force reflow
    card.classList.add("animate");
  }

});

document.getElementById("algorithm").addEventListener("change", () => {
  const inputCard = document.querySelector(".input-card");

  inputCard.classList.remove("context-change");
  void inputCard.offsetWidth; // reflow
  inputCard.classList.add("context-change");
});

//################################################################################################################
const canvas = document.getElementById("dot-grid");

document.getElementById("toggleCSS").addEventListener("click", async () => {
  const sheet = document.querySelector('link[rel="stylesheet"]');
  sheet.disabled = !sheet.disabled;
  if (sheet.disabled) {
    canvas.style.display = "none";
  } else {
    canvas.style.display = "flex";
  }
});

const ctx = canvas.getContext("2d");
const spacing = 40;
const dots = [];

function buildGrid() {
  dots.length = 0;
  for (let y = 0; y < window.innerHeight; y += spacing) {
    for (let x = 0; x < window.innerWidth; x += spacing) {
      dots.push({
        ox: x,
        oy: y,
        x: x,
        y: y,
        vx: 0,
        vy: 0
      });
    }
  }
}

function updateDots() {
  for (const dot of dots) {
    const dx = dot.x - mouse.x;
    const dy = dot.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const influence = Math.max(0, 1 - dist / 500);

    // Mouse repulsion
    const force = influence * 0.25;
    dot.vx += (dx / dist) * force;
    dot.vy += (dy / dist) * force;

    // Spring back to origin
    dot.vx += (dot.ox - dot.x) * 0.03;
    dot.vy += (dot.oy - dot.y) * 0.03;

    // Damping
    dot.vx *= 0.5;
    dot.vy *= 0.5;

    dot.x += dot.vx;
    dot.y += dot.vy;
  }
}

function drawDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const dot of dots) {
    const dx = dot.x - mouse.x;
    const dy = dot.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const influence = Math.max(0, 1 - dist / 120);
    const radius = 1.5 + influence * 1.5;
    const alpha = 0.12 + influence * 0.4;

    ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildGrid();
}

window.addEventListener("resize", resizeCanvas);
const mouse = { x: 200, y: -200 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  updateDots();
  drawDots();
  requestAnimationFrame(animate);
}

loadAlgorithms();
resizeCanvas();
animate();
