const DEFAULT_GRID = { cols: 3, rows: 3 };
const SVG_NS = "http://www.w3.org/2000/svg";
const PIECE_PAD_RATIO = 0.23;
const PIECE_OFFSCREEN_RATIO = 0.46;
const MOBILE_LOOSE_BOTTOM_RESERVE = 148;
const BRUSH_SIZE = 42;
const COLOR_COMPLETE_RATIO = 0.68;
const PLUS_CHECKOUT_URL = "";
const EARLY_ACCESS_URL = "mailto:hello@colorcut.studio?subject=ColorCut%20Plus%20early%20access";

const categories = [
  { id: "animals", name: "Animals", tier: "free" },
  { id: "landmarks", name: "Landmarks", tier: "free" },
  { id: "dinosaurs", name: "Dinosaurs", tier: "plus" },
  { id: "space", name: "Space", tier: "plus" }
];

const difficultyOptions = [
  { id: "easy", name: "Easy", label: "4 pieces", grid: { cols: 2, rows: 2 }, tier: "free" },
  { id: "classic", name: "Classic", label: "Standard", grid: null, tier: "free" },
  { id: "plus", name: "Plus", label: "25 pieces", grid: { cols: 5, rows: 5 }, tier: "plus" }
];

const startPatterns = {
  9: [
    { x: 0.69, y: 0.59, r: 6 },
    { x: 0.05, y: 0.57, r: -5 },
    { x: 0.39, y: 0.04, r: 4 },
    { x: 0.68, y: 0.08, r: -6 },
    { x: 0.06, y: 0.28, r: 5 },
    { x: 0.39, y: 0.62, r: -4 },
    { x: 0.08, y: 0.04, r: -6 },
    { x: 0.68, y: 0.35, r: 5 },
    { x: 0.36, y: 0.34, r: -3 }
  ],
  16: [
    { x: 0.72, y: 0.65, r: 6 },
    { x: 0.05, y: 0.59, r: -5 },
    { x: 0.39, y: 0.05, r: 4 },
    { x: 0.68, y: 0.08, r: -6 },
    { x: 0.07, y: 0.31, r: 5 },
    { x: 0.39, y: 0.64, r: -4 },
    { x: 0.08, y: 0.05, r: -6 },
    { x: 0.69, y: 0.37, r: 5 },
    { x: 0.36, y: 0.35, r: -3 },
    { x: 0.04, y: 0.74, r: 4 },
    { x: 0.22, y: 0.08, r: -5 },
    { x: 0.58, y: 0.76, r: 6 },
    { x: 0.75, y: 0.23, r: -4 },
    { x: 0.22, y: 0.66, r: 5 },
    { x: 0.5, y: 0.18, r: -5 },
    { x: 0.54, y: 0.5, r: 3 }
  ]
};

const libraryItems = [
  {
    id: "red-panda",
    name: "Red Panda",
    category: "animals",
    src: "assets/red-panda.png",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "sea-turtle",
    name: "Sea Turtle",
    category: "animals",
    src: "assets/sea-turtle.png",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "tiger",
    name: "Tiger",
    category: "animals",
    src: "assets/tiger.png",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "deer",
    name: "Deer",
    category: "animals",
    src: "assets/deer.png",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    category: "landmarks",
    src: "assets/eiffel-tower.png",
    aspect: 2 / 3,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.84
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    category: "landmarks",
    src: "assets/taj-mahal.png",
    aspect: 3 / 2,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "statue-of-liberty",
    name: "Statue of Liberty",
    category: "landmarks",
    src: "assets/statue-of-liberty.png",
    aspect: 941 / 1672,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "sydney-opera-house",
    name: "Sydney Opera House",
    category: "landmarks",
    src: "assets/sydney-opera-house.png",
    aspect: 3 / 2,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "t-rex",
    name: "T-Rex",
    category: "dinosaurs",
    src: "assets/t-rex.png",
    aspect: 941 / 1672,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "triceratops",
    name: "Triceratops",
    category: "dinosaurs",
    src: "assets/triceratops.png",
    aspect: 1470 / 1070,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "rocket",
    name: "Rocket",
    category: "space",
    src: "assets/rocket.png",
    aspect: 1054 / 1492,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "astronaut",
    name: "Astronaut",
    category: "space",
    src: "assets/astronaut.png",
    aspect: 2 / 3,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  }
];

const dom = {
  appShell: document.querySelector(".app-shell"),
  pickerView: document.querySelector("#pickerView"),
  categoryTabs: document.querySelector("#categoryTabs"),
  difficultyTabs: document.querySelector("#difficultyTabs"),
  drawingGrid: document.querySelector("#drawingGrid"),
  studioView: document.querySelector("#studioView"),
  parentButton: document.querySelector("#parentButton"),
  galleryButton: document.querySelector("#galleryButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  brand: document.querySelector(".brand"),
  puzzleBoard: document.querySelector("#puzzleBoard"),
  colorBoard: document.querySelector("#colorBoard"),
  ghostArt: document.querySelector("#ghostArt"),
  slotLayer: document.querySelector("#slotLayer"),
  pieceLayer: document.querySelector("#pieceLayer"),
  completePop: document.querySelector("#completePop"),
  spreadButton: document.querySelector("#spreadButton"),
  colorArt: document.querySelector("#colorArt"),
  colorCanvas: document.querySelector("#colorCanvas"),
  finishTray: document.querySelector("#finishTray"),
  finishLibraryButton: document.querySelector("#finishLibraryButton"),
  finishRestartButton: document.querySelector("#finishRestartButton"),
  parentModal: document.querySelector("#parentModal"),
  parentBackdrop: document.querySelector("#parentBackdrop"),
  parentCloseButton: document.querySelector("#parentCloseButton"),
  parentGateStep: document.querySelector("#parentGateStep"),
  parentPanelStep: document.querySelector("#parentPanelStep"),
  parentGateQuestion: document.querySelector("#parentGateQuestion"),
  parentGateAnswer: document.querySelector("#parentGateAnswer"),
  parentGateSubmit: document.querySelector("#parentGateSubmit"),
  parentGateError: document.querySelector("#parentGateError"),
  parentCheckoutButton: document.querySelector("#parentCheckoutButton")
};

const state = {
  stage: "pick",
  animal: null,
  category: "animals",
  difficulty: "classic",
  pieces: [],
  activePiece: null,
  lineUrl: "",
  colorUrl: "",
  brushSize: BRUSH_SIZE,
  colorContext: null,
  maskPixelCount: 0,
  colorComplete: false,
  colorCheckTimer: 0,
  deviceScale: 1,
  isColoring: false,
  lastColorPoint: null,
  audioContext: null,
  scratch: null,
  galleryActiveIndex: 0,
  galleryDrag: null,
  gallerySuppressClick: false,
  galleryScrollTimer: 0,
  resizeTimer: 0,
  parentGateAnswer: 0,
  parentUnlocked: false
};

installBrowserInteractionGuards();
registerServiceWorker();
renderPicker();
bindControls();
setStage("pick");

function installBrowserInteractionGuards() {
  let lastTouchEnd = 0;
  const guardedEvents = [
    "contextmenu",
    "dblclick",
    "dragstart",
    "gesturestart",
    "gesturechange",
    "gestureend",
    "selectstart"
  ];
  const preventBrowserDefault = (event) => {
    if (event.cancelable) event.preventDefault();
  };

  guardedEvents.forEach((eventName) => {
    document.addEventListener(eventName, preventBrowserDefault, { capture: true, passive: false });
  });

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length > 1) preventBrowserDefault(event);
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (event) => {
      const now = performance.now();
      if (now - lastTouchEnd < 320) preventBrowserDefault(event);
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

function renderPicker() {
  renderCategoryTabs();
  renderDifficultyTabs();
  renderDrawingCards();

  dom.categoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button || button.dataset.category === state.category) return;
    const category = categories.find((item) => item.id === button.dataset.category);
    if (!category) return;

    state.category = category.id;
    state.galleryActiveIndex = 0;
    renderCategoryTabs();
    renderDrawingCards();
    dom.drawingGrid.scrollLeft = 0;
    ensureAudioContext();
    playArrivalSound();
  });

  dom.difficultyTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-difficulty]");
    if (!button || button.dataset.difficulty === state.difficulty) return;

    const option = difficultyOptions.find((item) => item.id === button.dataset.difficulty);
    if (!option) return;

    ensureAudioContext();
    playPickSound();

    if (option.tier === "plus") {
      showParentModal();
      return;
    }

    state.difficulty = option.id;
    renderDifficultyTabs();
  });

  dom.drawingGrid.addEventListener("click", (event) => {
    if (state.gallerySuppressClick) {
      state.gallerySuppressClick = false;
      return;
    }
    const card = event.target.closest("[data-animal]");
    if (!card) return;
    if (card.dataset.locked === "true") {
      ensureAudioContext();
      playPickSound();
      showParentModal();
      return;
    }
    selectAnimal(card.dataset.animal);
  });
  dom.drawingGrid.addEventListener("pointerdown", beginGalleryDrag);
  dom.drawingGrid.addEventListener("pointermove", continueGalleryDrag);
  dom.drawingGrid.addEventListener("pointerup", endGalleryDrag);
  dom.drawingGrid.addEventListener("pointercancel", endGalleryDrag);
  dom.drawingGrid.addEventListener("mousedown", beginGalleryMouseDrag);
  window.addEventListener("mousemove", continueGalleryMouseDrag);
  window.addEventListener("mouseup", endGalleryMouseDrag);
  dom.drawingGrid.addEventListener("wheel", handleGalleryWheel, { passive: false });
  dom.drawingGrid.addEventListener("scroll", handleGalleryScroll, { passive: true });
}

function renderCategoryTabs() {
  dom.categoryTabs.innerHTML = categories
    .map((category) => {
      const active = category.id === state.category;
      const locked = category.tier === "plus";
      return `
        <button class="category-tab${active ? " is-active" : ""}${locked ? " is-locked" : ""}" type="button" data-category="${category.id}" role="tab" aria-selected="${active}" aria-label="${category.name}${locked ? ", ColorCut Plus preview" : ""}">
          ${category.name}
        </button>
      `;
    })
    .join("");
}

function renderDifficultyTabs() {
  dom.difficultyTabs.innerHTML = difficultyOptions
    .map((option) => {
      const active = option.id === state.difficulty;
      const locked = option.tier === "plus";
      return `
        <button class="difficulty-tab${active ? " is-active" : ""}${locked ? " is-locked" : ""}" type="button" data-difficulty="${option.id}" role="tab" aria-selected="${active}" aria-label="${option.name}, ${option.label}${locked ? ", ColorCut Plus" : ""}">
          <span>${option.name}</span>
          <small>${option.label}</small>
        </button>
      `;
    })
    .join("");
}

function renderDrawingCards() {
  dom.drawingGrid.innerHTML = libraryItems
    .filter((item) => item.category === state.category)
    .map((animal) => {
      const locked = animal.tier === "plus";
      return `
        <button class="drawing-card${locked ? " is-locked" : ""}" type="button" data-animal="${animal.id}" data-locked="${locked}" aria-label="${animal.name}${locked ? ", ColorCut Plus" : ""}">
          ${
            locked
              ? `<span class="drawing-lock" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7.2 10V8.2a4.8 4.8 0 0 1 9.6 0V10h1.1c.72 0 1.3.58 1.3 1.3v7.1c0 .72-.58 1.3-1.3 1.3H6.1c-.72 0-1.3-.58-1.3-1.3v-7.1c0-.72.58-1.3 1.3-1.3h1.1Zm2.4 0h4.8V8.2a2.4 2.4 0 0 0-4.8 0V10Z" />
                  </svg>
                  <span>Plus</span>
                </span>`
              : ""
          }
          <img class="drawing-preview" src="${animal.src}" alt="" draggable="false" />
          <span class="drawing-name">${animal.name}</span>
        </button>
      `;
    })
    .join("");
}

function bindControls() {
  dom.parentButton.addEventListener("click", showParentModal);
  dom.galleryButton.addEventListener("click", showPicker);
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);
  dom.spreadButton.addEventListener("click", spreadLoosePieces);
  dom.finishLibraryButton.addEventListener("click", showPicker);
  dom.finishRestartButton.addEventListener("click", restartCurrentAnimal);
  dom.parentBackdrop.addEventListener("click", hideParentModal);
  dom.parentCloseButton.addEventListener("click", hideParentModal);
  dom.parentGateSubmit.addEventListener("click", checkParentGate);
  dom.parentGateAnswer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkParentGate();
  });
  dom.parentCheckoutButton.addEventListener("click", openPlusCheckout);
  dom.brand.addEventListener("click", (event) => {
    event.preventDefault();
    showPicker();
  });
  dom.colorCanvas.addEventListener("pointerdown", beginColorStroke);
  dom.colorCanvas.addEventListener("pointermove", continueColorStroke);
  dom.colorCanvas.addEventListener("pointerup", endColorStroke);
  dom.colorCanvas.addEventListener("pointercancel", endColorStroke);
  dom.colorCanvas.addEventListener("pointerleave", endColorStroke);

  window.addEventListener("resize", () => {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      if (state.stage === "build" && state.animal) buildPuzzle();
      if (state.stage === "color" && state.animal && !state.colorComplete) prepareColorCanvas();
    }, 180);
  });

  document.addEventListener("fullscreenchange", syncFullscreenButton);
  document.addEventListener("webkitfullscreenchange", syncFullscreenButton);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideParentModal();
  });
}

function showParentModal() {
  dom.parentModal.hidden = false;
  dom.parentModal.setAttribute("aria-hidden", "false");
  dom.parentModal.classList.toggle("is-unlocked", state.parentUnlocked);
  if (state.parentUnlocked) {
    dom.parentCheckoutButton.focus();
    return;
  }

  resetParentGate();
  window.setTimeout(() => dom.parentGateAnswer.focus(), 40);
}

function hideParentModal() {
  if (dom.parentModal.hidden) return;
  dom.parentModal.hidden = true;
  dom.parentModal.setAttribute("aria-hidden", "true");
  dom.parentGateError.textContent = "";
}

function resetParentGate() {
  const first = 4 + Math.floor(Math.random() * 6);
  const second = 3 + Math.floor(Math.random() * 7);
  state.parentGateAnswer = first + second;
  dom.parentGateQuestion.textContent = `${first} + ${second} = ?`;
  dom.parentGateAnswer.value = "";
  dom.parentGateError.textContent = "";
  dom.parentModal.classList.remove("is-unlocked");
}

function checkParentGate() {
  const answer = Number(dom.parentGateAnswer.value);
  if (answer !== state.parentGateAnswer) {
    dom.parentGateError.textContent = "Try again.";
    dom.parentGateAnswer.select();
    return;
  }

  state.parentUnlocked = true;
  dom.parentGateError.textContent = "";
  dom.parentModal.classList.add("is-unlocked");
  dom.parentCheckoutButton.focus();
}

function openPlusCheckout() {
  const target = PLUS_CHECKOUT_URL || EARLY_ACCESS_URL;
  window.open(target, "_blank", "noopener,noreferrer");
}

function beginGalleryDrag(event) {
  ensureAudioContext();
  if (event.button !== undefined && event.button !== 0) return;
  if (event.pointerType === "mouse") return;

  startGalleryDrag(event.clientX, event.pointerId);
  dom.drawingGrid.setPointerCapture?.(event.pointerId);
}

function continueGalleryDrag(event) {
  const drag = state.galleryDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  moveGalleryDrag(event.clientX, event);
}

function endGalleryDrag(event) {
  const drag = state.galleryDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  dom.drawingGrid.releasePointerCapture?.(event.pointerId);
  finishGalleryDrag(drag);
}

function beginGalleryMouseDrag(event) {
  ensureAudioContext();
  if (event.button !== 0 || state.galleryDrag) return;
  startGalleryDrag(event.clientX, null);
}

function continueGalleryMouseDrag(event) {
  const drag = state.galleryDrag;
  if (!drag || drag.pointerId !== null) return;
  moveGalleryDrag(event.clientX, event);
}

function endGalleryMouseDrag() {
  const drag = state.galleryDrag;
  if (!drag || drag.pointerId !== null) return;
  finishGalleryDrag(drag);
}

function startGalleryDrag(clientX, pointerId) {
  state.galleryDrag = {
    pointerId,
    startX: clientX,
    scrollLeft: dom.drawingGrid.scrollLeft,
    moved: false
  };
}

function moveGalleryDrag(clientX, event) {
  const drag = state.galleryDrag;
  if (!drag) return;

  const delta = clientX - drag.startX;
  if (Math.abs(delta) > 5) {
    drag.moved = true;
    dom.drawingGrid.classList.add("is-dragging");
    event.preventDefault();
  }

  if (drag.moved) {
    dom.drawingGrid.scrollLeft = drag.scrollLeft - delta;
  }
}

function finishGalleryDrag(drag) {
  dom.drawingGrid.classList.remove("is-dragging");
  state.galleryDrag = null;

  if (drag.moved) {
    state.gallerySuppressClick = true;
    window.setTimeout(() => {
      state.gallerySuppressClick = false;
    }, 220);
    handleGalleryScroll();
  }
}

function handleGalleryWheel(event) {
  ensureAudioContext();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!delta) return;
  dom.drawingGrid.scrollLeft += delta;
  event.preventDefault();
}

function handleGalleryScroll() {
  window.clearTimeout(state.galleryScrollTimer);
  state.galleryScrollTimer = window.setTimeout(() => {
    if (state.stage !== "pick") return;
    const activeIndex = closestGalleryIndex();
    if (activeIndex !== state.galleryActiveIndex) {
      state.galleryActiveIndex = activeIndex;
      playArrivalSound();
    }
  }, 90);
}

function closestGalleryIndex() {
  const cards = Array.from(dom.drawingGrid.querySelectorAll(".drawing-card"));
  if (!cards.length) return 0;

  const railRect = dom.drawingGrid.getBoundingClientRect();
  const railCenter = railRect.left + railRect.width / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - railCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function showFinishTray() {
  dom.finishTray.classList.add("is-visible");
  dom.finishTray.setAttribute("aria-hidden", "false");
}

function hideFinishTray() {
  dom.finishTray.classList.remove("is-visible");
  dom.finishTray.setAttribute("aria-hidden", "true");
}

function restartCurrentAnimal() {
  if (!state.animal) {
    showPicker();
    return;
  }

  selectAnimal(state.animal.id);
}

function showPicker() {
  state.stage = "pick";
  state.animal = null;
  state.pieces = [];
  state.activePiece = null;
  state.colorComplete = false;
  stopScratch();
  setStage("pick");
  dom.pickerView.classList.remove("is-hidden");
  dom.studioView.classList.add("is-hidden");
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideFinishTray();
  dom.completePop.classList.remove("is-visible");
  dom.puzzleBoard.classList.remove("is-complete");
}

function selectAnimal(id) {
  const animal = libraryItems.find((item) => item.id === id);
  if (!animal) return;

  playPickSound();
  state.animal = animal;
  state.category = animal.category;
  state.lineUrl = animal.src;
  state.colorUrl = animal.src;
  state.pieces = [];
  state.activePiece = null;
  state.colorComplete = false;

  dom.pickerView.classList.add("is-hidden");
  dom.studioView.classList.remove("is-hidden");
  dom.puzzleBoard.style.display = "";
  dom.puzzleBoard.classList.remove("is-complete");
  dom.colorBoard.classList.add("is-hidden");
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideFinishTray();
  dom.completePop.classList.remove("is-visible");
  dom.ghostArt.src = state.lineUrl;
  dom.colorArt.src = state.colorUrl;
  setStage("build");

  requestAnimationFrame(buildPuzzle);
}

function setStage(stage) {
  state.stage = stage;
  dom.appShell.dataset.stage = stage;
}

function itemGrid() {
  const difficulty = difficultyOptions.find((option) => option.id === state.difficulty);
  if (difficulty?.grid) return difficulty.grid;
  return state.animal?.grid || DEFAULT_GRID;
}

function itemAspect() {
  return state.animal?.aspect || 1;
}

function itemTargetRatio() {
  return state.animal?.targetRatio || 0.78;
}

function artLayout(rect) {
  const ratio = itemTargetRatio();
  const aspect = itemAspect();
  const maxW = rect.width * ratio;
  const maxH = rect.height * ratio;
  let width = maxW;
  let height = width / aspect;

  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }

  return {
    x: (rect.width - width) / 2,
    y: (rect.height - height) / 2,
    width,
    height
  };
}

function applyArtLayout(element, layout) {
  element.style.left = `${layout.x}px`;
  element.style.top = `${layout.y}px`;
  element.style.width = `${layout.width}px`;
  element.style.height = `${layout.height}px`;
}

function cutSign(primary, secondary, offset) {
  return (primary + secondary + offset) % 2 === 0 ? 1 : -1;
}

function cutBias(primary, secondary, offset) {
  const values = [0.06, -0.04, 0.03, -0.05, 0.05, -0.06];
  return values[(primary * 3 + secondary * 5 + offset) % values.length];
}

function startFraction(index, total) {
  const pattern = startPatterns[total];
  if (pattern?.[index]) return pattern[index];

  return {
    x: 0.08 + ((index * 0.27) % 0.68),
    y: 0.05 + ((index * 0.19) % 0.72),
    r: index % 2 === 0 ? 5 : -5
  };
}

function loosePiecePosition(index, total, pieceWidth, pieceHeight, boardWidth, boardHeight, layout) {
  const margin = Math.max(14, Math.min(boardWidth, boardHeight) * 0.035);
  const bounds = pieceDragBounds(pieceWidth, pieceHeight, boardWidth, boardHeight, {
    reserveBottom: loosePieceBottomReserve(boardWidth, boardHeight)
  });
  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;
  const angle = -Math.PI / 2 + (index / Math.max(1, total)) * Math.PI * 2 + ((index % 3) - 1) * 0.08;
  const radiusX = layout.width / 2 + pieceWidth * 0.86 + boardWidth * 0.025;
  const radiusY = layout.height / 2 + pieceHeight * (total > 12 ? 0.64 : 0.5) + boardHeight * 0.012;
  let x = centerX + Math.cos(angle) * radiusX - pieceWidth / 2;
  let y = centerY + Math.sin(angle) * radiusY - pieceHeight / 2;

  if (x > layout.x - pieceWidth * 0.4 && x < layout.x + layout.width - pieceWidth * 0.6) {
    x += Math.cos(angle) >= 0 ? pieceWidth * 0.42 : -pieceWidth * 0.42;
  }

  if (y > layout.y - pieceHeight * 0.4 && y < layout.y + layout.height - pieceHeight * 0.6) {
    y += Math.sin(angle) >= 0 ? pieceHeight * 0.28 : -pieceHeight * 0.28;
  }

  return {
    x: clampWithFallback(x, bounds.minX + margin, bounds.maxX - margin),
    y: clampWithFallback(y, bounds.minY + margin, bounds.maxY - margin),
    rotation: startFraction(index, total).r
  };
}

function loosePieceBottomReserve(boardWidth, boardHeight) {
  if (Math.min(window.innerWidth || boardWidth, boardWidth) > 820) return 0;
  return Math.min(MOBILE_LOOSE_BOTTOM_RESERVE, Math.max(84, boardHeight * 0.21));
}

function pieceDragBounds(pieceWidth, pieceHeight, boardWidth, boardHeight, options = {}) {
  const overflowX = Math.min(pieceWidth * PIECE_OFFSCREEN_RATIO, boardWidth * 0.42);
  const overflowY = Math.min(pieceHeight * PIECE_OFFSCREEN_RATIO, boardHeight * 0.42);
  const reserveBottom = options.reserveBottom || 0;

  return {
    minX: -overflowX,
    maxX: boardWidth - pieceWidth + overflowX,
    minY: -overflowY,
    maxY: boardHeight - pieceHeight + overflowY - reserveBottom
  };
}

function clampWithFallback(value, min, max) {
  if (max < min) return (min + max) / 2;
  return clamp(value, min, max);
}

function piecePath(col, row, width, height, pad, grid) {
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + width;
  const y1 = pad + height;
  const amp = Math.min(width, height) * 0.2;
  const isTop = row === 0;
  const isRight = col === grid.cols - 1;
  const isBottom = row === grid.rows - 1;
  const isLeft = col === 0;
  const topProfile = row > 0 ? cutBias(row - 1, col, 1) : 0;
  const rightProfile = col < grid.cols - 1 ? cutBias(row, col, 2) : 0;
  const bottomProfile = row < grid.rows - 1 ? cutBias(row, col, 1) : 0;
  const leftProfile = col > 0 ? cutBias(row, col - 1, 2) : 0;

  return [
    `M ${x0} ${y0}`,
    isTop ? outerTop(x0, y0, x1, col) : horizontalEdge(x0, x1, y0, cutSign(row - 1, col, 0), amp, topProfile),
    isRight ? outerRight(x1, y0, y1, row) : verticalEdge(x1, y0, y1, cutSign(row, col, 1), amp, rightProfile),
    isBottom ? outerBottom(x1, x0, y1, col) : horizontalEdge(x1, x0, y1, cutSign(row, col, 0), amp, bottomProfile),
    isLeft ? outerLeft(x0, y1, y0, row) : verticalEdge(x0, y1, y0, cutSign(row, col - 1, 1), amp, leftProfile),
    "Z"
  ].join(" ");
}

function horizontalEdge(fromX, toX, y, sign, amp, bias) {
  const span = toX - fromX;
  const center = 0.5 + bias;
  const shoulder = 0.19;
  const neck = 0.115;
  const x = (point) => fromX + span * point;

  return [
    `L ${x(center - shoulder)} ${y}`,
    `C ${x(center - neck * 1.18)} ${y} ${x(center - neck * 1.06)} ${y + sign * amp * 0.42} ${x(center - neck * 0.78)} ${y + sign * amp * 0.55}`,
    `C ${x(center - neck * 0.48)} ${y + sign * amp * 1.15} ${x(center + neck * 0.48)} ${y + sign * amp * 1.15} ${x(center + neck * 0.78)} ${y + sign * amp * 0.55}`,
    `C ${x(center + neck * 1.06)} ${y + sign * amp * 0.42} ${x(center + neck * 1.18)} ${y} ${x(center + shoulder)} ${y}`,
    `L ${toX} ${y}`
  ].join(" ");
}

function verticalEdge(x, fromY, toY, sign, amp, bias) {
  const span = toY - fromY;
  const center = 0.5 + bias;
  const shoulder = 0.19;
  const neck = 0.115;
  const y = (point) => fromY + span * point;

  return [
    `L ${x} ${y(center - shoulder)}`,
    `C ${x} ${y(center - neck * 1.18)} ${x + sign * amp * 0.42} ${y(center - neck * 1.06)} ${x + sign * amp * 0.55} ${y(center - neck * 0.78)}`,
    `C ${x + sign * amp * 1.15} ${y(center - neck * 0.48)} ${x + sign * amp * 1.15} ${y(center + neck * 0.48)} ${x + sign * amp * 0.55} ${y(center + neck * 0.78)}`,
    `C ${x + sign * amp * 0.42} ${y(center + neck * 1.06)} ${x} ${y(center + neck * 1.18)} ${x} ${y(center + shoulder)}`,
    `L ${x} ${toY}`
  ].join(" ");
}

function outerTop(x0, y, x1, variant) {
  const lift = variant === 1 ? -4 : -2;
  return `C ${x0 + (x1 - x0) * 0.25} ${y + lift} ${x0 + (x1 - x0) * 0.72} ${y + 3} ${x1} ${y}`;
}

function outerRight(x, y0, y1, variant) {
  const push = variant === 0 ? 3 : -2;
  return `C ${x + push} ${y0 + (y1 - y0) * 0.28} ${x - 2} ${y0 + (y1 - y0) * 0.72} ${x} ${y1}`;
}

function outerBottom(x1, x0, y, variant) {
  const lift = variant === 1 ? 4 : 2;
  return `C ${x0 + (x1 - x0) * 0.72} ${y + lift} ${x0 + (x1 - x0) * 0.24} ${y - 3} ${x0} ${y}`;
}

function outerLeft(x, y1, y0, variant) {
  const push = variant === 0 ? -3 : 2;
  return `C ${x + push} ${y0 + (y1 - y0) * 0.72} ${x + 2} ${y0 + (y1 - y0) * 0.28} ${x} ${y0}`;
}

function toggleFullscreen() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  if (fullscreenElement) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
    const exitPromise = exitFullscreen?.call(document);
    exitPromise?.catch?.(() => {});
    return;
  }

  const requestFullscreen =
    dom.appShell.requestFullscreen || dom.appShell.webkitRequestFullscreen;
  const requestPromise = requestFullscreen?.call(dom.appShell);
  requestPromise?.catch?.(() => {});
}

function syncFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  dom.fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
  dom.fullscreenButton.title = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
}

function buildPuzzle() {
  if (!state.animal) return;

  const rect = dom.puzzleBoard.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) {
    requestAnimationFrame(buildPuzzle);
    return;
  }

  const boardW = rect.width;
  const boardH = rect.height;
  const grid = itemGrid();
  const layout = artLayout(rect);
  const targetX = layout.x;
  const targetY = layout.y;
  const targetW = layout.width;
  const targetH = layout.height;
  const tileW = targetW / grid.cols;
  const tileH = targetH / grid.rows;

  dom.slotLayer.innerHTML = "";
  dom.pieceLayer.innerHTML = "";
  state.pieces = [];
  dom.puzzleBoard.classList.remove("is-complete");
  applyArtLayout(dom.ghostArt, layout);

  for (let index = 0; index < grid.cols * grid.rows; index += 1) {
    const col = index % grid.cols;
    const row = Math.floor(index / grid.cols);
    const cellX = col * tileW;
    const cellY = row * tileH;
    const pad = Math.min(tileW, tileH) * PIECE_PAD_RATIO;
    const visualW = tileW + pad * 2;
    const visualH = tileH + pad * 2;
    const snapX = targetX + cellX - pad;
    const snapY = targetY + cellY - pad;

    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.width = `${tileW}px`;
    slot.style.height = `${tileH}px`;
    slot.style.left = `${targetX + cellX}px`;
    slot.style.top = `${targetY + cellY}px`;
    dom.slotLayer.append(slot);

    const totalPieces = grid.cols * grid.rows;
    const piece = document.createElementNS(SVG_NS, "svg");
    const pieceShape = piecePath(col, row, tileW, tileH, pad, grid);
    const clipId = `piece-clip-${state.animal.id}-${index}`;
    const defs = document.createElementNS(SVG_NS, "defs");
    const clipPath = document.createElementNS(SVG_NS, "clipPath");
    const clipPathShape = document.createElementNS(SVG_NS, "path");
    const image = document.createElementNS(SVG_NS, "image");
    const outlineHalo = document.createElementNS(SVG_NS, "path");
    const outline = document.createElementNS(SVG_NS, "path");

    piece.setAttribute("class", "piece");
    piece.setAttribute("role", "button");
    piece.setAttribute("aria-label", `${state.animal.name} piece ${index + 1}`);
    piece.setAttribute("viewBox", `0 0 ${visualW} ${visualH}`);
    piece.style.width = `${visualW}px`;
    piece.style.height = `${visualH}px`;
    piece.style.zIndex = String(10 + index);

    clipPath.setAttribute("id", clipId);
    clipPathShape.setAttribute("d", pieceShape);
    clipPath.append(clipPathShape);
    defs.append(clipPath);

    image.setAttribute("href", state.lineUrl);
    image.setAttribute("x", String(pad - cellX));
    image.setAttribute("y", String(pad - cellY));
    image.setAttribute("width", String(targetW));
    image.setAttribute("height", String(targetH));
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("clip-path", `url(#${clipId})`);

    outlineHalo.setAttribute("class", "piece-outline-halo");
    outlineHalo.setAttribute("d", pieceShape);
    outlineHalo.setAttribute("vector-effect", "non-scaling-stroke");

    outline.setAttribute("class", "piece-outline");
    outline.setAttribute("d", pieceShape);
    outline.setAttribute("vector-effect", "non-scaling-stroke");

    piece.append(defs, image, outlineHalo, outline);

    const start = loosePiecePosition(index, totalPieces, visualW, visualH, boardW, boardH, layout);
    const model = {
      element: piece,
      index,
      x: start.x,
      y: start.y,
      targetX: snapX,
      targetY: snapY,
      width: visualW,
      height: visualH,
      rotation: start.rotation,
      snapped: false,
      pointerId: null,
      dragOffsetX: 0,
      dragOffsetY: 0
    };

    piece.addEventListener("pointerdown", (event) => grabPiece(event, model));
    setPieceTransform(model);
    dom.pieceLayer.append(piece);
    state.pieces.push(model);
  }
}

function spreadLoosePieces() {
  if (state.stage !== "build" || !state.pieces.length) return;

  const rect = dom.puzzleBoard.getBoundingClientRect();
  const layout = artLayout(rect);
  const loosePieces = state.pieces.filter((piece) => !piece.snapped);
  loosePieces.forEach((piece, looseIndex) => {
    const position = loosePiecePosition(
      looseIndex,
      loosePieces.length,
      piece.width,
      piece.height,
      rect.width,
      rect.height,
      layout
    );
    piece.x = position.x;
    piece.y = position.y;
    piece.rotation = position.rotation;
    piece.element.style.zIndex = String(10 + piece.index);
    setPieceTransform(piece);
  });
  playArrivalSound();
}

function grabPiece(event, piece) {
  if (piece.snapped || state.stage !== "build") return;

  event.preventDefault();
  const point = boardPoint(event, dom.puzzleBoard);
  piece.pointerId = event.pointerId;
  piece.dragOffsetX = point.x - piece.x;
  piece.dragOffsetY = point.y - piece.y;
  piece.element.setPointerCapture(event.pointerId);
  piece.element.classList.add("is-dragging");
  piece.element.style.zIndex = String(30 + piece.index);
  state.activePiece = piece;

  window.addEventListener("pointermove", dragPiece);
  window.addEventListener("pointerup", dropPiece);
  window.addEventListener("pointercancel", dropPiece);
}

function dragPiece(event) {
  const piece = state.activePiece;
  if (!piece || event.pointerId !== piece.pointerId) return;

  const rect = dom.puzzleBoard.getBoundingClientRect();
  const point = boardPoint(event, dom.puzzleBoard);
  const bounds = pieceDragBounds(piece.width, piece.height, rect.width, rect.height, {
    reserveBottom: loosePieceBottomReserve(rect.width, rect.height)
  });
  piece.x = clampWithFallback(point.x - piece.dragOffsetX, bounds.minX, bounds.maxX);
  piece.y = clampWithFallback(point.y - piece.dragOffsetY, bounds.minY, bounds.maxY);
  setPieceTransform(piece);
}

function dropPiece(event) {
  const piece = state.activePiece;
  if (!piece || event.pointerId !== piece.pointerId) return;

  if (piece.element.hasPointerCapture?.(event.pointerId)) {
    piece.element.releasePointerCapture(event.pointerId);
  }
  piece.element.classList.remove("is-dragging");
  window.removeEventListener("pointermove", dragPiece);
  window.removeEventListener("pointerup", dropPiece);
  window.removeEventListener("pointercancel", dropPiece);

  const distance = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
  const snapDistance = Math.min(piece.width, piece.height) * 0.32;
  if (distance <= snapDistance) {
    piece.x = piece.targetX;
    piece.y = piece.targetY;
    piece.rotation = 0;
    piece.snapped = true;
    piece.element.classList.add("is-snapped");
    piece.element.style.zIndex = String(1 + piece.index);
    setPieceTransform(piece);
    playSnapSound();
    checkPuzzleComplete();
  } else {
    piece.element.style.zIndex = String(10 + piece.index);
  }

  piece.pointerId = null;
  state.activePiece = null;
}

function setPieceTransform(piece) {
  const turn = piece.snapped ? 0 : piece.rotation;
  piece.element.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${turn}deg)`;
}

function checkPuzzleComplete() {
  if (!state.pieces.length || !state.pieces.every((piece) => piece.snapped)) return;

  dom.puzzleBoard.classList.add("is-complete");
  dom.completePop.classList.add("is-visible");
  playCompleteSound();
  window.setTimeout(() => {
    if (state.stage === "build") beginColoringMode();
  }, 1150);
}

function beginColoringMode() {
  setStage("color");
  dom.puzzleBoard.style.display = "none";
  dom.colorBoard.classList.remove("is-hidden");
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideFinishTray();
  prepareColorCanvas();
}

function prepareColorCanvas() {
  const canvas = dom.colorCanvas;
  const boardRect = dom.colorBoard.getBoundingClientRect();
  if (boardRect.width < 20 || boardRect.height < 20) {
    requestAnimationFrame(prepareColorCanvas);
    return;
  }

  const layout = artLayout(boardRect);
  applyArtLayout(dom.colorArt, layout);
  applyArtLayout(canvas, layout);

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) {
    requestAnimationFrame(prepareColorCanvas);
    return;
  }

  state.deviceScale = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * state.deviceScale);
  canvas.height = Math.round(rect.height * state.deviceScale);
  state.maskPixelCount = 0;
  state.colorComplete = false;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  state.colorContext = context;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideFinishTray();

  const image = new Image();
  image.onload = () => {
    state.maskPixelCount = drawGrayMask(context, image, canvas.width, canvas.height);
    dom.colorBoard.classList.add("is-mask-ready");
    dom.colorArt.classList.add("is-visible");
  };
  image.src = state.lineUrl;
}

function drawGrayMask(context, image, width, height) {
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let maskPixels = 0;
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha === 0) continue;
    maskPixels += 1;

    const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const gray = clamp((luminance - 128) * 1.16 + 104, 24, 214);
    data[index] = gray;
    data[index + 1] = gray;
    data[index + 2] = gray;
    data[index + 3] = alpha;
  }

  context.putImageData(imageData, 0, 0);
  return maskPixels;
}

function beginColorStroke(event) {
  if (state.stage !== "color" || !state.colorContext) return;

  event.preventDefault();
  dom.colorCanvas.setPointerCapture(event.pointerId);
  state.isColoring = true;
  state.lastColorPoint = canvasPoint(event);
  eraseAt(state.lastColorPoint, true);
  startScratch();
}

function continueColorStroke(event) {
  if (!state.isColoring || state.stage !== "color" || !state.colorContext) return;

  event.preventDefault();
  const point = canvasPoint(event);
  eraseLine(state.lastColorPoint, point);
  updateScratchTone(state.lastColorPoint, point);
  state.lastColorPoint = point;
  scheduleColorCompleteCheck();
}

function endColorStroke(event) {
  if (!state.isColoring) return;
  if (event.pointerId !== undefined && dom.colorCanvas.hasPointerCapture(event.pointerId)) {
    dom.colorCanvas.releasePointerCapture(event.pointerId);
  }
  state.isColoring = false;
  state.lastColorPoint = null;
  stopScratch();
  scheduleColorCompleteCheck();
}

function scheduleColorCompleteCheck() {
  if (state.colorComplete || state.stage !== "color") return;
  window.clearTimeout(state.colorCheckTimer);
  state.colorCheckTimer = window.setTimeout(checkColorComplete, 120);
}

function checkColorComplete() {
  if (state.colorComplete || state.stage !== "color" || !state.colorContext || !state.maskPixelCount) {
    return;
  }

  const canvas = dom.colorCanvas;
  const pixels = state.colorContext.getImageData(0, 0, canvas.width, canvas.height).data;
  let remaining = 0;
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] > 8) remaining += 1;
  }

  const revealed = 1 - remaining / state.maskPixelCount;
  if (revealed >= COLOR_COMPLETE_RATIO) {
    completeColoring();
  }
}

function completeColoring() {
  state.colorComplete = true;
  window.clearTimeout(state.colorCheckTimer);
  stopScratch();
  state.colorContext.clearRect(0, 0, dom.colorCanvas.width, dom.colorCanvas.height);
  dom.colorArt.classList.add("is-celebrating");
  showFinishTray();
  playColorCompleteSound();
}

function canvasPoint(event) {
  const rect = dom.colorCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * state.deviceScale,
    y: (event.clientY - rect.top) * state.deviceScale
  };
}

function eraseAt(point, withDot) {
  const context = state.colorContext;
  const radius = (state.brushSize * state.deviceScale) / 2;
  context.save();
  context.globalCompositeOperation = "destination-out";
  context.fillStyle = "#000";
  if (withDot) {
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function eraseLine(from, to) {
  const context = state.colorContext;
  context.save();
  context.globalCompositeOperation = "destination-out";
  context.strokeStyle = "#000";
  context.lineWidth = state.brushSize * state.deviceScale;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.restore();
}

function ensureAudioContext() {
  if (state.audioContext) {
    state.audioContext.resume?.();
    return state.audioContext;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  state.audioContext = new AudioContext();
  state.audioContext.resume?.();
  return state.audioContext;
}

function playSnapSound() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, 540, 920, now, 0.11, 0.06, "triangle");
}

function playPickSound() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, 430, 680, now, 0.08, 0.035, "sine");
}

function playArrivalSound() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, 360, 520, now, 0.07, 0.025, "triangle");
}

function playCompleteSound() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, 523, 660, now, 0.12, 0.045, "sine");
  playTone(context, 659, 784, now + 0.1, 0.14, 0.045, "sine");
  playTone(context, 784, 1047, now + 0.21, 0.22, 0.055, "triangle");
}

function playColorCompleteSound() {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  playTone(context, 587, 740, now, 0.12, 0.045, "sine");
  playTone(context, 740, 988, now + 0.1, 0.16, 0.05, "triangle");
  playTone(context, 988, 1318, now + 0.24, 0.24, 0.04, "sine");
}

function playTone(context, fromFrequency, toFrequency, startTime, duration, volume, type) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(fromFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, startTime + duration);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function startScratch() {
  const scratch = ensureScratch();
  if (!scratch) return;
  scratch.context.resume();
  const now = scratch.context.currentTime;
  scratch.gain.gain.cancelScheduledValues(now);
  scratch.gain.gain.setTargetAtTime(0.035, now, 0.025);
}

function updateScratchTone(from, to) {
  const scratch = state.scratch;
  if (!scratch || !from || !to) return;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const target = clamp(780 + distance * 22, 760, 2400);
  scratch.filter.frequency.setTargetAtTime(target, scratch.context.currentTime, 0.035);
}

function stopScratch() {
  const scratch = state.scratch;
  if (!scratch) return;
  const now = scratch.context.currentTime;
  scratch.gain.gain.cancelScheduledValues(now);
  scratch.gain.gain.setTargetAtTime(0.0001, now, 0.04);
}

function ensureScratch() {
  if (state.scratch) return state.scratch;

  const context = ensureAudioContext();
  if (!context) return null;

  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, sampleRate, sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * 0.45;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.9;
  gain.gain.value = 0.0001;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();

  state.scratch = { context, source, filter, gain };
  return state.scratch;
}

function boardPoint(event, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
