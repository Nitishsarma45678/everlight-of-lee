const scenes = [...document.querySelectorAll(".scene")];
const progress = document.querySelector(".story-progress");
const progressItems = [...document.querySelectorAll(".story-progress li")];
const progressFill = document.getElementById("progressFill");
const nextButtons = [...document.querySelectorAll("[data-next]")];
const soundToggle = document.getElementById("soundToggle");
const soundLabel = soundToggle.querySelector(".sound-label");

let currentScene = 0;
let transitionLocked = false;
let audioContext = null;
let ambientNodes = [];
let soundOn = false;

function showScene(index, immediate = false) {
  if (transitionLocked || index < 0 || index >= scenes.length) return;

  const previous = scenes[currentScene];
  const next = scenes[index];
  transitionLocked = true;

  const reveal = () => {
    previous.hidden = true;
    previous.classList.remove("is-active", "is-leaving");
    next.hidden = false;
    next.scrollTop = 0;
    currentScene = index;
    updateProgress();

    if (currentScene === 4) {
      resetConstellation();
    }
    if (currentScene === 6) {
      resetWaxSeal();
    }
    if (currentScene === 7) {
      revealLetterProgressively();
    }

    requestAnimationFrame(() => {
      next.classList.add("is-active");
      window.setTimeout(() => {
        transitionLocked = false;
      }, immediate ? 20 : 900);
    });
  };

  if (immediate || previous === next) {
    reveal();
    return;
  }

  previous.classList.add("is-leaving");
  window.setTimeout(reveal, 650);
  playChime(index);
}

function updateProgress() {
  const storyStep = Math.min(Math.max(currentScene, 1), 6);
  const fill = currentScene === 0 ? 0 : ((storyStep - 1) / 5) * 100;
  progressFill.style.width = `${fill}%`;

  progressItems.forEach((item, index) => {
    item.classList.toggle("is-current", index === storyStep - 1);
    item.classList.toggle("is-complete", index < storyStep - 1);
  });

  progress.classList.toggle("is-hidden", currentScene === 0 || currentScene === 8);
}

nextButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (currentScene === 0 && !soundOn) {
      await setSound(true);
    }
    showScene(currentScene + 1);
  });
});

const runeStone = document.getElementById("runeStone");
const nameRevelation = document.getElementById("nameRevelation");

runeStone.addEventListener("click", () => {
  if (runeStone.classList.contains("is-awake")) return;
  runeStone.classList.add("is-awake");
  nameRevelation.classList.add("is-visible");
  runeStone.closest(".chapter-card").querySelector(".chapter-next").disabled = false;
  burstFrom(runeStone, 20);
  playChime(2);
});

const virtueMessages = {
  kindness: "Where she walked, even wounded things remembered how to trust.",
  heart: "She felt the ache in others as if every heart spoke a language she understood.",
  truth: "She spoke plainly and loved honestly; there were no hidden mazes in her heart.",
  fire: "And yes, her temper could summon thunder. Even queens are allowed a little weather."
};

const virtueCards = [...document.querySelectorAll(".virtue-card")];
const virtueMessage = document.getElementById("virtueMessage");
const crownReveal = document.getElementById("crownReveal");
const awakenedVirtues = new Set();

virtueCards.forEach((card) => {
  card.addEventListener("click", () => {
    const virtue = card.dataset.virtue;
    card.classList.add("is-awake");
    awakenedVirtues.add(virtue);
    virtueMessage.innerHTML = `<p>${virtueMessages[virtue]}</p>`;
    burstFrom(card, 10);
    playChime(awakenedVirtues.size + 1);

    if (awakenedVirtues.size === virtueCards.length) {
      window.setTimeout(() => {
        crownReveal.classList.add("is-visible");
        card.closest(".chapter-card").querySelector(".chapter-next").disabled = false;
        burstFrom(crownReveal, 28);
      }, 450);
    }
  });
});

const lanternMessages = [
  "The first light said: she found me while I was still learning how to be found.",
  "The second said: her love made even difficult days feel survivable.",
  "The third said: after all this time, she is still the first place my heart runs."
];

const lanterns = [...document.querySelectorAll(".lantern")];
const lanternMessage = document.getElementById("lanternMessage");
const litLanterns = new Set();

lanterns.forEach((lantern) => {
  lantern.addEventListener("click", () => {
    const index = Number(lantern.dataset.lantern);
    lantern.classList.add("is-lit");
    litLanterns.add(index);
    lanternMessage.innerHTML = `<p>${lanternMessages[index]}</p>`;
    burstFrom(lantern, 12);
    playChime(index + 3);

    if (litLanterns.size === lanterns.length) {
      window.setTimeout(() => {
        lanternMessage.innerHTML = "<p>Together, the lights revealed what the traveler had been searching for.</p>";
        lantern.closest(".chapter-card").querySelector(".chapter-next").disabled = false;
      }, 550);
    }
  });
});

document.getElementById("sealButton").addEventListener("click", (event) => {
  burstFrom(event.currentTarget, 45);
  playWishChord();
  window.setTimeout(() => showScene(8), 500);
});

function resetAllChapters() {
  // 1. Chapter I (Rune Stone)
  const runeStone = document.getElementById("runeStone");
  const nameRevelation = document.getElementById("nameRevelation");
  if (runeStone) runeStone.classList.remove("is-awake");
  if (nameRevelation) nameRevelation.classList.remove("is-visible");
  
  // Disable next buttons on chapters
  const nextButtonsList = document.querySelectorAll(".chapter-next");
  nextButtonsList.forEach(btn => btn.disabled = true);

  // 2. Chapter II (Virtues)
  const virtueCardsList = document.querySelectorAll(".virtue-card");
  const virtueMessage = document.getElementById("virtueMessage");
  const crownReveal = document.getElementById("crownReveal");
  virtueCardsList.forEach(card => card.classList.remove("is-awake"));
  if (virtueMessage) virtueMessage.innerHTML = "<p>Select each piece of her magic.</p>";
  if (crownReveal) crownReveal.classList.remove("is-visible");
  if (typeof awakenedVirtues !== "undefined") awakenedVirtues.clear();

  // 3. Chapter III (Lanterns)
  const lanternsList = document.querySelectorAll(".lantern");
  const lanternMessage = document.getElementById("lanternMessage");
  lanternsList.forEach(l => l.classList.remove("is-lit"));
  if (lanternMessage) lanternMessage.innerHTML = "<p>Light each lantern.</p>";
  if (typeof litLanterns !== "undefined") litLanterns.clear();

  // 4. Chapter VIII (Wish Chapter pocket spell reset)
  const pocketSpell = document.getElementById("pocketSpell");
  const pocketSpellBtn = document.getElementById("pocketSpellButton");
  if (pocketSpell) pocketSpell.classList.remove("is-visible");
  if (pocketSpellBtn) {
    pocketSpellBtn.setAttribute("aria-expanded", "false");
    if (pocketSpellBtn.firstChild) {
      pocketSpellBtn.firstChild.textContent = "A spell for difficult days ";
    }
  }
}

document.getElementById("replayButton").addEventListener("click", () => {
  resetAllChapters();
  showScene(0);
});

const pocketSpellButton = document.getElementById("pocketSpellButton");
const pocketSpell = document.getElementById("pocketSpell");

pocketSpellButton.addEventListener("click", () => {
  const isVisible = pocketSpell.classList.toggle("is-visible");
  pocketSpellButton.setAttribute("aria-expanded", String(isVisible));
  pocketSpellButton.firstChild.textContent = isVisible
    ? "Keep this spell close "
    : "A spell for difficult days ";

  if (isVisible) {
    burstFrom(pocketSpellButton, 18);
    playChime(4);
  }
});

function updateBirthdayCountdown() {
  const output = document.getElementById("birthdayCountdown");
  const now = new Date();
  let birthday = new Date(now.getFullYear(), 6, 4);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const birthdayStart = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate());

  if (todayStart.getTime() === birthdayStart.getTime()) {
    output.innerHTML = "<strong>Today, the whole realm celebrates you.</strong>";
    return;
  }

  if (birthday < now) {
    birthday = new Date(now.getFullYear() + 1, 6, 4);
  }

  const difference = birthday.getTime() - now.getTime();
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);

  output.innerHTML = `The realm celebrates in <strong>${days} days · ${hours} hours · ${minutes} minutes</strong>`;
}

updateBirthdayCountdown();
window.setInterval(updateBirthdayCountdown, 60000);

function burstFrom(element, amount = 14, isHeart = false) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < amount; i += 1) {
    const spark = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 85;
    spark.className = isHeart ? "spark heart-spark" : "spark";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    spark.style.animationDuration = `${650 + Math.random() * 550}ms`;
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

// ==========================================
// Chapter IV — Constellation Mode Logic
// ==========================================

function playConstellationChime(frequency) {
  if (!soundOn || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 1.3);
}

function playErrorSound() {
  if (!soundOn || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "triangle";
  osc.frequency.value = 125;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.14, audioContext.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.55);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.6);
}

function playCompletionChord() {
  if (!soundOn || !audioContext) return;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
  notes.forEach((freq, idx) => {
    window.setTimeout(() => playConstellationChime(freq), idx * 130);
  });
}

const starCoords0407 = [
  { x: 10, y: 38 }, { x: 16, y: 26 }, { x: 21, y: 44 }, { x: 16, y: 64 }, { x: 10, y: 56 }, { x: 6, y: 44 },
  { x: 33, y: 26 }, { x: 28, y: 44 }, { x: 37, y: 44 }, { x: 37, y: 26 }, { x: 37, y: 64 },
  { x: 48, y: 48 },
  { x: 62, y: 38 }, { x: 68, y: 26 }, { x: 73, y: 44 }, { x: 68, y: 64 }, { x: 62, y: 56 }, { x: 58, y: 44 },
  { x: 82, y: 26 }, { x: 92, y: 26 }, { x: 88, y: 44 }, { x: 84, y: 64 }
];

const starCoordsNL = [
  { x: 14, y: 62 }, { x: 14, y: 45 }, { x: 14, y: 28 }, { x: 21, y: 45 }, { x: 28, y: 28 }, { x: 28, y: 62 },
  { x: 50, y: 72 }, { x: 42, y: 58 }, { x: 38, y: 44 }, { x: 42, y: 30 }, { x: 46, y: 36 }, 
  { x: 50, y: 38 }, { x: 54, y: 36 }, { x: 58, y: 30 }, { x: 62, y: 44 }, { x: 58, y: 58 },
  { x: 78, y: 28 }, { x: 78, y: 45 }, { x: 78, y: 62 }, { x: 87, y: 62 },
  { x: 125, y: -25 }, { x: 135, y: -15 }
];

const connectionsNL = [
  [2, 1], [1, 0], [2, 3], [3, 5], [5, 4],
  [11, 10], [10, 9], [9, 8], [8, 7], [7, 6], [6, 15], [15, 14], [14, 13], [13, 12], [12, 11],
  [16, 17], [17, 18], [18, 19]
];

const digitStarsConfig = [
  { stars: [0, 1, 2, 3, 4, 5], path: [0, 1, 2, 3, 4, 5, 0], completed: false },
  { stars: [6, 7, 8, 9, 10], path: [9, 6, 7, 8, 10], completed: false },
  { stars: [11], path: [11], completed: false },
  { stars: [12, 13, 14, 15, 16, 17], path: [12, 13, 14, 15, 16, 17, 12], completed: false },
  { stars: [18, 19, 20, 21], path: [18, 19, 20, 21], completed: false }
];

let activeDigitIndex = 0;
let currentPathStep = 0;
let lastClickedStarIndex = null;
let constellationCompleted = false;
let digitLines = [[], [], [], [], []];
let starElements = [];
let easterEggStarTimer = null;

function resetConstellation() {
  activeDigitIndex = 0;
  currentPathStep = 0;
  lastClickedStarIndex = null;
  constellationCompleted = false;
  digitLines = [[], [], [], [], []];
  starElements = [];
  
  digitStarsConfig.forEach(digit => {
    digit.completed = false;
  });

  const constellationStars = document.getElementById("constellationStars");
  const constellationSvg = document.getElementById("constellationSvg");
  const constellationNext = document.getElementById("constellationNext");
  const constellationMessage = document.getElementById("constellationMessage");
  const constellationRevealMessage = document.getElementById("constellationRevealMessage");
  const readRefusedButton = document.getElementById("readRefusedButton");
  const secretMessageElement = document.getElementById("secretMessage");
  const easterEggTooltip = document.getElementById("easterEggTooltip");

  if (easterEggTooltip) easterEggTooltip.classList.remove("is-visible");
  if (constellationNext) constellationNext.disabled = true;
  if (constellationMessage) {
    constellationMessage.style.display = "block";
    constellationMessage.innerHTML = `<p class="interaction-hint">Trace her birthday: <strong>04 • 07</strong> by connecting the stars in order.</p>`;
  }
  
  if (constellationRevealMessage) {
    const quoteText = constellationRevealMessage.querySelector(".quote-text");
    if (quoteText) {
      quoteText.textContent = "";
      quoteText.classList.remove("is-visible");
    }
  }
  if (readRefusedButton) readRefusedButton.style.display = "none";
  if (secretMessageElement) {
    secretMessageElement.innerHTML = "";
    secretMessageElement.classList.remove("is-visible");
  }

  if (constellationStars) constellationStars.innerHTML = "";
  if (constellationSvg) constellationSvg.innerHTML = "";

  drawFaintGuidelines();

  if (constellationStars) {
    for (let i = 0; i < starCoords0407.length; i++) {
      const starData = starCoords0407[i];
      const star = document.createElement("button");
      star.type = "button";
      star.className = "constellation-star";
      star.style.left = `${starData.x}%`;
      star.style.top = `${starData.y}%`;
      star.setAttribute("aria-label", `Star ${i + 1}`);
      
      star.addEventListener("click", () => handleStarClick(i));
      
      constellationStars.appendChild(star);
      starElements.push(star);
    }
  }

  updateGameplayUI();
}

function drawSvgLine(x1, y1, x2, y2, className) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", `${x1}%`);
  line.setAttribute("y1", `${y1}%`);
  line.setAttribute("x2", `${x2}%`);
  line.setAttribute("y2", `${y2}%`);
  line.setAttribute("class", className);
  const svg = document.getElementById("constellationSvg");
  if (svg) svg.appendChild(line);
  return line;
}

function drawFaintGuidelines() {
  const guidelines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [9, 6], [6, 7], [7, 8], [8, 10],
    [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 12],
    [18, 19], [19, 20], [20, 21]
  ];
  guidelines.forEach(([from, to]) => {
    const s1 = starCoords0407[from];
    const s2 = starCoords0407[to];
    drawSvgLine(s1.x, s1.y, s2.x, s2.y, "constellation-line");
  });
}

function updateGameplayUI() {
  if (constellationCompleted) return;

  starElements.forEach(star => {
    star.classList.remove("is-next", "is-pulse-start");
  });

  const digit = digitStarsConfig[activeDigitIndex];
  if (!digit) return;
  const expectedStarIdx = digit.path[currentPathStep];
  const expectedStar = starElements[expectedStarIdx];

  if (expectedStar) {
    expectedStar.classList.add("is-next");
    if (currentPathStep === 0) {
      expectedStar.classList.add("is-pulse-start");
    }
  }
}

function handleStarClick(starIndex) {
  if (constellationCompleted) return;

  const digit = digitStarsConfig[activeDigitIndex];
  if (!digit) return;
  const expectedStarIdx = digit.path[currentPathStep];

  if (starIndex === expectedStarIdx) {
    const chimeFreqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    const chimeIdx = currentPathStep + activeDigitIndex * 2;
    playConstellationChime(chimeFreqs[chimeIdx % chimeFreqs.length]);

    const star = starElements[starIndex];
    star.classList.remove("is-next", "is-pulse-start");
    star.classList.add("is-lit");

    burstFrom(star, 6);

    if (currentPathStep > 0 && lastClickedStarIndex !== null) {
      const s1 = starCoords0407[lastClickedStarIndex];
      const s2 = starCoords0407[starIndex];
      const line = drawSvgLine(s1.x, s1.y, s2.x, s2.y, "constellation-line is-active");
      digitLines[activeDigitIndex].push(line);
    }

    lastClickedStarIndex = starIndex;
    currentPathStep++;

    if (currentPathStep === digit.path.length) {
      digit.completed = true;
      playConstellationChime(880);
      
      digit.stars.forEach(idx => {
        burstFrom(starElements[idx], 10);
      });

      activeDigitIndex++;
      currentPathStep = 0;
      lastClickedStarIndex = null;

      if (activeDigitIndex === digitStarsConfig.length) {
        triggerGrandCompletion();
        return;
      }
    }

    updateGameplayUI();
  } else {
    const star = starElements[starIndex];
    playErrorSound();
    star.classList.add("is-error");
    window.setTimeout(() => {
      star.classList.remove("is-error");
    }, 400);

    resetActiveDigit();
  }
}

function resetActiveDigit() {
  const digit = digitStarsConfig[activeDigitIndex];
  if (!digit) return;

  digit.stars.forEach(idx => {
    const star = starElements[idx];
    star.classList.remove("is-lit", "is-next", "is-pulse-start");
  });

  digitLines[activeDigitIndex].forEach(line => {
    line.remove();
  });
  digitLines[activeDigitIndex] = [];

  currentPathStep = 0;
  lastClickedStarIndex = null;
  
  updateGameplayUI();
}

function triggerGrandCompletion() {
  constellationCompleted = true;
  playCompletionChord();

  const constellationSvg = document.getElementById("constellationSvg");
  const constellationMessage = document.getElementById("constellationMessage");
  
  if (constellationMessage) constellationMessage.style.display = "none";
  if (constellationSvg) constellationSvg.innerHTML = "";

  for (let i = 0; i < starElements.length; i++) {
    const star = starElements[i];
    const target = starCoordsNL[i];
    
    star.style.left = `${target.x}%`;
    star.style.top = `${target.y}%`;

    if (i >= 20) {
      star.style.opacity = "0";
      star.style.transform = "translate(-50%, -50%) scale(0.2)";
    }
  }

  window.setTimeout(() => {
    connectionsNL.forEach(([from, to]) => {
      const s1 = starCoordsNL[from];
      const s2 = starCoordsNL[to];
      drawSvgLine(s1.x, s1.y, s2.x, s2.y, "constellation-line is-morphed");
    });

    for (let i = 0; i < 20; i++) {
      starElements[i].classList.remove("is-lit");
      starElements[i].classList.add("is-morphed");
      burstFrom(starElements[i], 5, true);
    }

    window.setTimeout(() => {
      const revealContainer = document.getElementById("constellationRevealMessage");
      if (revealContainer) {
        const quoteText = revealContainer.querySelector(".quote-text");
        const readButton = document.getElementById("readRefusedButton");

        if (quoteText) {
          quoteText.innerHTML = `Some people look at the stars and see constellations.<br><br>I look at the sky and see every road that led me to you.`;
          quoteText.classList.add("is-visible");
        }
        
        window.setTimeout(() => {
          if (readButton) {
            readButton.style.display = "block";
            readButton.classList.add("animate-glow");
          }
        }, 1200);
      }
    }, 800);

  }, 1400);
}

const eggStar = document.getElementById("easterEggStar");
const tooltip = document.getElementById("easterEggTooltip");

if (eggStar) {
  eggStar.addEventListener("click", () => {
    playConstellationChime(1174.66);
    playConstellationChime(1318.51);
    burstFrom(eggStar, 18, true);

    if (tooltip) {
      tooltip.innerHTML = `<strong>March 5, 2023 · 6:15 PM</strong>The moment our stars aligned.`;
      tooltip.classList.add("is-visible");
    }

    if (easterEggStarTimer) window.clearTimeout(easterEggStarTimer);
    easterEggStarTimer = window.setTimeout(() => {
      if (tooltip) tooltip.classList.remove("is-visible");
    }, 4500);
  });
}

const readButton = document.getElementById("readRefusedButton");
const secretMessageElement = document.getElementById("secretMessage");
const constellationNext = document.getElementById("constellationNext");

if (readButton) {
  readButton.addEventListener("click", () => {
    playConstellationChime(783.99);
    playConstellationChime(1046.50);
    
    burstFrom(readButton, 20, true);

    readButton.style.transform = "scale(0.5) translateY(10px)";
    readButton.style.filter = "brightness(2) blur(4px)";
    readButton.style.opacity = "0";

    window.setTimeout(() => {
      readButton.style.display = "none";

      if (secretMessageElement) {
        // We set up a container for the text and attach the quill at the end
        secretMessageElement.innerHTML = `<span id="typedPoem"></span><span class="magic-quill">🪶</span>`;
        secretMessageElement.classList.add("is-visible");

        // The exact lines of the poem, neatly organized
        const poemLines = [
          "I spent years surviving.",
          "",
          "Then you came along",
          "",
          "Not like a sunrise.",
          "Not like salvation.",
          "",
          "More quietly than that.",
          "",
          "You simply reached for the burden",
          "and somehow,",
          "without asking,",
          "made it lighter.",
          "",
          "and taught me",
          "there was more to life",
          "than carrying things alone."
        ];
        
        const poemStr = poemLines.join('\n');
        const typedPoem = document.getElementById("typedPoem");
        const magicQuill = document.querySelector(".magic-quill");
        let i = 0;

        function typeWriter() {
          if (i < poemStr.length) {
            let char = poemStr.charAt(i);
            
            // Convert newline characters into HTML line breaks
            if (char === '\n') {
              typedPoem.innerHTML += '<br>';
            } else {
              typedPoem.innerHTML += char;
            }
            
            i++;
            
            // Randomize typing speed to look like a real human hand (40ms - 90ms)
            let speed = Math.random() * 50 + 40;
            
            // Make the pen pause at punctuation and line breaks
            if (char === '.' || char === ',' || char === '—') speed += 350;
            if (char === '\n') speed += 400;
            
            window.setTimeout(typeWriter, speed);
          } else {
            // Typing is finished! Fade out the quill and show the next button
            magicQuill.style.opacity = "0";
            
            if (constellationNext) {
              window.setTimeout(() => {
                constellationNext.disabled = false;
                burstFrom(constellationNext, 20);
              }, 1000);
            }
          }
        }

        // Wait 1.2 seconds for the paper to swing down before starting to write
        window.setTimeout(typeWriter, 1200);
      }
    }, 300);
  });
}
function createAudio() {
  if (audioContext) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    soundToggle.hidden = true;
    return;
  }

  audioContext = new AudioContext();
}

function startAmbientSound() {
  createAudio();
  if (!audioContext || ambientNodes.length) return;

  const master = audioContext.createGain();
  master.gain.setValueAtTime(0, audioContext.currentTime);
  master.gain.linearRampToValueAtTime(0.055, audioContext.currentTime + 2.5);
  master.connect(audioContext.destination);

  [110, 164.81, 220].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index * 3 - 3;
    gain.gain.value = index === 0 ? 0.38 : 0.16;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    oscillator.connect(gain);
    gain.connect(filter);
    filter.connect(master);
    oscillator.start();
    ambientNodes.push(oscillator);
  });

  ambientNodes.push(master);
}

function stopAmbientSound() {
  if (!audioContext || !ambientNodes.length) return;
  const master = ambientNodes[ambientNodes.length - 1];
  master.gain.cancelScheduledValues(audioContext.currentTime);
  master.gain.setValueAtTime(master.gain.value, audioContext.currentTime);
  master.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
  window.setTimeout(() => {
    ambientNodes.slice(0, -1).forEach((node) => node.stop());
    ambientNodes = [];
  }, 700);
}

async function setSound(enabled) {
  soundOn = enabled;

  if (enabled) {
    createAudio();
    if (audioContext?.state === "suspended") await audioContext.resume();
    startAmbientSound();
  } else {
    stopAmbientSound();
  }

  soundToggle.classList.toggle("is-on", soundOn);
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundLabel.textContent = soundOn ? "Music awake" : "Music sleeping";
}

// The magical sweep sound for waking the forest
function playAwakenGlimmer() {
  if (!soundOn || !audioContext) return;
  const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  freqs.forEach((freq, i) => {
    window.setTimeout(() => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 1.6);
    }, i * 60); // Staggers the notes to sound like a harp sweep
  });
}

soundToggle.addEventListener("click", async () => {
  await setSound(!soundOn);
  
  // If the sound was just turned ON, play the glimmer effect!
  if (soundOn) {
    playAwakenGlimmer();
  }
});

function playChime(step = 1) {
  if (!soundOn || !audioContext) return;

  const notes = [523.25, 659.25, 783.99, 880, 1046.5];
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = notes[step % notes.length];
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.7);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1.8);
}

function playWishChord() {
  if (!soundOn || !audioContext) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
    window.setTimeout(() => playChime(index), index * 180);
  });
}

const canvas = document.getElementById("fireflies");
const context = canvas.getContext("2d");
let fireflies = [];
let canvasWidth = 0;
let canvasHeight = 0;

// --- NEW: Track her magic touch ---
let pointerX = null;
let pointerY = null;

window.addEventListener("mousemove", (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
});

window.addEventListener("touchmove", (e) => {
  pointerX = e.touches[0].clientX;
  pointerY = e.touches[0].clientY;
});

// Let them drift away naturally when she stops touching/leaves the screen
window.addEventListener("mouseout", () => { pointerX = null; pointerY = null; });
window.addEventListener("touchend", () => { pointerX = null; pointerY = null; });
function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createFireflies();
}

function createFireflies() {
  const count = Math.min(48, Math.max(20, Math.floor(canvasWidth / 28)));
  fireflies = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: 0.5 + Math.random() * 1.5,
    speedX: -0.12 + Math.random() * 0.24,
    speedY: -0.16 - Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
    pulse: 0.006 + Math.random() * 0.014
  }));
}

function drawFireflies(time) {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  fireflies.forEach((firefly) => {
    // Determine the base speed
    let currentSpeedX = firefly.speedX;
    let currentSpeedY = firefly.speedY;

    // --- NEW: The Magic Pull ---
    // If she is touching the screen or moving the mouse, draw the fireflies near her
    if (pointerX !== null && pointerY !== null) {
      const diffX = pointerX - firefly.x;
      const diffY = pointerY - firefly.y;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);
      
      // If a firefly is within 250px of her pointer, it gently floats toward it
      if (dist < 250) {
        currentSpeedX += (diffX / dist) * 0.6;
        currentSpeedY += (diffY / dist) * 0.6;
      }
    }

    firefly.x += currentSpeedX;
    firefly.y += currentSpeedY;

    // Keep them wrapping around the screen seamlessly
    if (firefly.y < -15) {
      firefly.y = canvasHeight + 15;
      firefly.x = Math.random() * canvasWidth;
    }
    if (firefly.x < -15) firefly.x = canvasWidth + 15;
    if (firefly.x > canvasWidth + 15) firefly.x = -15;

    // The glowing render
    const alpha = 0.18 + (Math.sin(time * firefly.pulse + firefly.phase) + 1) * 0.3;
    const glow = context.createRadialGradient(
      firefly.x, firefly.y, 0,
      firefly.x, firefly.y, firefly.radius * 6
    );
    glow.addColorStop(0, `rgba(245, 224, 144, ${alpha})`);
    glow.addColorStop(0.2, `rgba(218, 238, 157, ${alpha * 0.8})`);
    glow.addColorStop(1, "rgba(178, 225, 147, 0)");
    
    context.fillStyle = glow;
    context.beginPath();
    context.arc(firefly.x, firefly.y, firefly.radius * 6, 0, Math.PI * 2);
    context.fill();
  });

  window.requestAnimationFrame(drawFireflies);
}

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
window.requestAnimationFrame(drawFireflies);
updateProgress();

// ==========================================
// Ending Sequence — Royal Messenger & Seal Break
// ==========================================

function playCrackSound() {
  if (!soundOn || !audioContext) return;

  const bufferSize = audioContext.sampleRate * 0.08;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 2800;
  noiseFilter.Q.value = 4;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.2, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noise.start();

  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.05);

  oscGain.gain.setValueAtTime(0.15, audioContext.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

  osc.connect(oscGain);
  oscGain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.06);
}

function resetWaxSeal() {
  const seal = document.getElementById("royalWaxSeal");
  const scroll = document.getElementById("sealedParchment");

  if (seal) {
    seal.classList.remove("is-cracked", "is-glowing");
    seal.style.pointerEvents = "auto";
  }
  if (scroll) {
    scroll.classList.remove("is-unfolding");
    scroll.style.pointerEvents = "auto";
  }
}

function revealLetterProgressively() {
  // Grab all the individual elements of the letter
  const date = document.querySelector(".letter-date");
  const title = document.querySelector(".letter-title");
  const paragraphs = Array.from(document.querySelectorAll(".letter-body p"));
  const signature = document.querySelector(".signature");
  const countdown = document.querySelector(".birthday-countdown");
  const button = document.getElementById("sealButton");
  const corners = Array.from(document.querySelectorAll(".letter-corner"));
  
  // Stop the letter body from fading in as one giant block
  const bodyWrapper = document.querySelector(".letter-body");
  if (bodyWrapper) {
    bodyWrapper.classList.remove("letter-delayed-reveal");
    bodyWrapper.style.opacity = "1"; 
  }

  // Group them in the exact order they should ignite
  const sequence = [
    [...corners, date],
    [title],
    ...paragraphs.map(p => [p]), // Each paragraph gets its own step
    [signature],
    [countdown, button]
  ];

// Reset and hide everything first
  sequence.flat().forEach(el => {
    if(el) {
      el.classList.remove("is-visible");
      el.style.opacity = ""; /* FIX: Clears inline styles so the CSS can fade it in! */
      
      // Assign the magic ink class to text elements (exclude borders/button)
      if (el !== button && !el.classList.contains("letter-corner")) {
        el.classList.add("magic-ink-text");
      }
    }
  });

  // Start the cascading reveal after the letter lands on screen
  window.setTimeout(() => {
    sequence.forEach((group, index) => {
      window.setTimeout(() => {
        group.forEach(el => {
          if(!el) return;
          el.classList.add("is-visible");
          
          // Shoot golden sparks from the text as it catches fire
          if (el.classList.contains("magic-ink-text")) {
            burstFrom(el, 10);
          }
        });
        
        // A soft chime that rises in pitch as the magic reads down the page
        playConstellationChime(440 + (index * 40)); 
        
      }, index * 1400); // 1.4 seconds between each paragraph igniting
    });
  }, 1500); // Delay for the 3D letter landing animation to finish
}

function triggerSealBreak() {
  const royalWaxSeal = document.getElementById("royalWaxSeal");
  const sealedParchment = document.getElementById("sealedParchment");

  if (royalWaxSeal && royalWaxSeal.classList.contains("is-cracked")) return;

  // 1. Play the crack/rumble sound
  playCrackSound();

  // 2. Start the magic glow/rumble
  if (royalWaxSeal) royalWaxSeal.classList.add("is-glowing");

  const sparkSource = royalWaxSeal || sealedParchment;
  if (sparkSource) {
    burstFrom(sparkSource, 30, true);
    burstFrom(sparkSource, 25);
  }

  // Disable clicks
  if (royalWaxSeal) royalWaxSeal.style.pointerEvents = "none";
  if (sealedParchment) sealedParchment.style.pointerEvents = "none";

  // 3. The Sequence Timers
  window.setTimeout(() => {
    if (royalWaxSeal) {
      royalWaxSeal.classList.remove("is-glowing");
      royalWaxSeal.classList.add("is-cracked"); // Seal flies away
    }
    
    if (sealedParchment) {
      sealedParchment.classList.add("is-opened"); // Flap opens & letter pulls out
    }

    // Wait exactly 2.4 seconds for the letter to hit the camera before loading Scene 7
    window.setTimeout(() => {
      showScene(7);
    }, 2400); 

  }, 300);
}

// Bind to parchment/envelope
const sealedParchmentEl = document.getElementById("sealedParchment");
if (sealedParchmentEl) {
  sealedParchmentEl.addEventListener("click", triggerSealBreak);
  
  // Accessibility check for keyboard users
  sealedParchmentEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerSealBreak();
    }
  });
}

// Ensure direct clicks on the seal itself are covered as well
const royalWaxSealEl = document.getElementById("royalWaxSeal");
if (royalWaxSealEl) {
  royalWaxSealEl.addEventListener("click", triggerSealBreak);
}

// ==========================================
// Chapter V — The Illuminated Oath Logic
// ==========================================

function playOathChime() {
  if (!soundOn || !audioContext) return;
  // A gentle, romantic upward sweep of notes like strumming a harp
  const notes = [392.00, 493.88, 587.33, 783.99]; 
  notes.forEach((freq, i) => {
    window.setTimeout(() => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 1.3);
    }, i * 120); 
  });
}

const acknowledgeDecreeBtn = document.getElementById("acknowledgeDecreeBtn");
const decreeContent = document.getElementById("decreeContent");
const royalSignature = document.getElementById("royalSignature");
const chapterFiveNext = document.getElementById("chapterFiveNext"); // We grab the next button

if (acknowledgeDecreeBtn) {
  acknowledgeDecreeBtn.addEventListener("click", () => {
    playOathChime();
    
    // Golden sparks fly from the button
    burstFrom(acknowledgeDecreeBtn, 20, false);

    // Fade out the oath button without making it jump
    acknowledgeDecreeBtn.style.opacity = "0";
    acknowledgeDecreeBtn.style.pointerEvents = "none";
    
    window.setTimeout(() => {
      acknowledgeDecreeBtn.style.display = "none";
      
      // 1. Fireflies illuminate the text
      decreeContent.classList.remove("is-shadowed");
      decreeContent.classList.add("is-illuminated");
      
      // 2. The oath is signed in gold after the light blooms
      window.setTimeout(() => {
        royalSignature.classList.add("is-signed");
        
        // 3. NEW: Unlock the door to the final page!
        window.setTimeout(() => {
          if (chapterFiveNext) {
            chapterFiveNext.disabled = false;
            chapterFiveNext.classList.add("is-unlocked");
            burstFrom(chapterFiveNext, 30); // A final magical pop to draw her eye
          }
        }, 1500); // Waits for the signature to finish writing
        
      }, 600); 
      
    }, 400);
  });
}

// ==========================================
// DEV SKIP BUTTON LOGIC (DELETE BEFORE LAUNCH)
// ==========================================
const devSkipBtn = document.getElementById("devSkipBtn");
if (devSkipBtn) {
  devSkipBtn.addEventListener("click", () => {
    // 1. Force unlock the transition just in case you click super fast
    transitionLocked = false; 
    
    // 2. Jump to the next scene instantly (bypassing the 650ms delay)
    if (currentScene < scenes.length - 1) {
      showScene(currentScene + 1, true);
    }
  });
}

// ==========================================
// Chapter 0 — The Ethereal Awakening
// ==========================================
const enterBtn = document.getElementById('enterEverwoodBtn');

if (enterBtn) {
  enterBtn.addEventListener('click', async () => {
    // 1. Automatically wake the sound if she hasn't clicked the top-right button yet!
    if (!soundOn) await setSound(true); 

    const introScene = document.querySelector('.scene-intro');
    introScene.classList.add('is-dissolving'); // Triggers the CSS animations

    // 2. A slow, deeply romantic swelling chord (C major)
    if (soundOn && audioContext) {
      const notes = [261.63, 329.63, 392.00, 523.25]; 
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        // Swells slowly over 2 seconds
        gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 2.0);
        // Fades away slowly over 5 seconds
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 5.0);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 5.5);
      });
    }

    // 3. Morph the button into a tiny glowing star
    enterBtn.style.color = "transparent";
    enterBtn.style.width = "40px";
    enterBtn.style.minWidth = "0";
    enterBtn.style.padding = "0";
    enterBtn.style.borderRadius = "50%";
    enterBtn.style.transform = "scale(0.2)";
    enterBtn.style.borderColor = "var(--gold)";
    enterBtn.style.boxShadow = "0 0 30px var(--gold)";

    // 4. Shatter the star into fireflies after 0.8 seconds
    window.setTimeout(() => {
      burstFrom(enterBtn, 40, false);
      enterBtn.style.opacity = "0";
    }, 800);

    // 5. Wait a luxurious 3.5 seconds before revealing Chapter 1
    window.setTimeout(() => {
      showScene(1, true);
    }, 3500);
  });
}