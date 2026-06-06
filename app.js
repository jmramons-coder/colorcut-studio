const GRID = { cols: 3, rows: 3 };
const SVG_NS = "http://www.w3.org/2000/svg";
const PIECE_PAD_RATIO = 0.23;
const BRUSH_SIZE = 42;
const COLOR_COMPLETE_RATIO = 0.68;
const verticalCutSigns = [
  [1, -1],
  [-1, 1],
  [1, -1]
];
const horizontalCutSigns = [
  [-1, 1, -1],
  [1, -1, 1]
];
const verticalCutProfiles = [
  [-0.04, 0.06],
  [0.05, -0.05],
  [-0.03, 0.04]
];
const horizontalCutProfiles = [
  [0.06, -0.04, 0.03],
  [-0.05, 0.05, -0.06]
];

const startFractions = [
  { x: 0.69, y: 0.59, r: 6 },
  { x: 0.05, y: 0.57, r: -5 },
  { x: 0.39, y: 0.04, r: 4 },
  { x: 0.68, y: 0.08, r: -6 },
  { x: 0.06, y: 0.28, r: 5 },
  { x: 0.39, y: 0.62, r: -4 },
  { x: 0.08, y: 0.04, r: -6 },
  { x: 0.68, y: 0.35, r: 5 },
  { x: 0.36, y: 0.34, r: -3 }
];

const animals = [
  {
    id: "red-panda",
    name: "Red Panda",
    src: "assets/red-panda.png"
  },
  {
    id: "sea-turtle",
    name: "Sea Turtle",
    src: "assets/sea-turtle.png"
  },
  {
    id: "tiger",
    name: "Tiger",
    src: "assets/tiger.png"
  },
  {
    id: "deer",
    name: "Deer",
    src: "assets/deer.png"
  }
];

const dom = {
  appShell: document.querySelector(".app-shell"),
  pickerView: document.querySelector("#pickerView"),
  drawingGrid: document.querySelector("#drawingGrid"),
  studioView: document.querySelector("#studioView"),
  galleryButton: document.querySelector("#galleryButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  brand: document.querySelector(".brand"),
  puzzleBoard: document.querySelector("#puzzleBoard"),
  colorBoard: document.querySelector("#colorBoard"),
  ghostArt: document.querySelector("#ghostArt"),
  slotLayer: document.querySelector("#slotLayer"),
  pieceLayer: document.querySelector("#pieceLayer"),
  completePop: document.querySelector("#completePop"),
  colorArt: document.querySelector("#colorArt"),
  colorCanvas: document.querySelector("#colorCanvas"),
  finishTray: document.querySelector("#finishTray"),
  finishLibraryButton: document.querySelector("#finishLibraryButton"),
  finishRestartButton: document.querySelector("#finishRestartButton")
};

const state = {
  stage: "pick",
  animal: null,
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
  resizeTimer: 0
};

renderPicker();
bindControls();
setStage("pick");

function renderPicker() {
  dom.drawingGrid.innerHTML = animals
    .map((animal) => {
      return `
        <button class="drawing-card" type="button" data-animal="${animal.id}" aria-label="${animal.name}">
          <img class="drawing-preview" src="${animal.src}" alt="" draggable="false" />
          <span class="drawing-name">${animal.name}</span>
        </button>
      `;
    })
    .join("");

  dom.drawingGrid.addEventListener("click", (event) => {
    if (state.gallerySuppressClick) {
      state.gallerySuppressClick = false;
      return;
    }
    const card = event.target.closest("[data-animal]");
    if (!card) return;
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

function bindControls() {
  dom.galleryButton.addEventListener("click", showPicker);
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);
  dom.finishLibraryButton.addEventListener("click", showPicker);
  dom.finishRestartButton.addEventListener("click", restartCurrentAnimal);
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
  const animal = animals.find((item) => item.id === id);
  if (!animal) return;

  playPickSound();
  state.animal = animal;
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

function piecePath(col, row, width, height, pad) {
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + width;
  const y1 = pad + height;
  const amp = Math.min(width, height) * 0.2;
  const isTop = row === 0;
  const isRight = col === GRID.cols - 1;
  const isBottom = row === GRID.rows - 1;
  const isLeft = col === 0;
  const topProfile = row > 0 ? horizontalCutProfiles[row - 1][col] : 0;
  const rightProfile = col < GRID.cols - 1 ? verticalCutProfiles[row][col] : 0;
  const bottomProfile = row < GRID.rows - 1 ? horizontalCutProfiles[row][col] : 0;
  const leftProfile = col > 0 ? verticalCutProfiles[row][col - 1] : 0;

  return [
    `M ${x0} ${y0}`,
    isTop ? outerTop(x0, y0, x1, col) : horizontalEdge(x0, x1, y0, horizontalCutSigns[row - 1][col], amp, topProfile),
    isRight ? outerRight(x1, y0, y1, row) : verticalEdge(x1, y0, y1, verticalCutSigns[row][col], amp, rightProfile),
    isBottom ? outerBottom(x1, x0, y1, col) : horizontalEdge(x1, x0, y1, horizontalCutSigns[row][col], amp, bottomProfile),
    isLeft ? outerLeft(x0, y1, y0, row) : verticalEdge(x0, y1, y0, verticalCutSigns[row][col - 1], amp, leftProfile),
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
  const targetSize = Math.min(boardW, boardH) * 0.78;
  const targetX = (boardW - targetSize) / 2;
  const targetY = (boardH - targetSize) / 2;
  const tileW = targetSize / GRID.cols;
  const tileH = targetSize / GRID.rows;

  dom.slotLayer.innerHTML = "";
  dom.pieceLayer.innerHTML = "";
  state.pieces = [];
  dom.puzzleBoard.classList.remove("is-complete");
  dom.ghostArt.style.left = `${targetX}px`;
  dom.ghostArt.style.top = `${targetY}px`;
  dom.ghostArt.style.width = `${targetSize}px`;
  dom.ghostArt.style.height = `${targetSize}px`;

  for (let index = 0; index < GRID.cols * GRID.rows; index += 1) {
    const col = index % GRID.cols;
    const row = Math.floor(index / GRID.cols);
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

    const start = startFractions[index];
    const piece = document.createElementNS(SVG_NS, "svg");
    const pieceShape = piecePath(col, row, tileW, tileH, pad);
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
    image.setAttribute("width", String(targetSize));
    image.setAttribute("height", String(targetSize));
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("clip-path", `url(#${clipId})`);

    outlineHalo.setAttribute("class", "piece-outline-halo");
    outlineHalo.setAttribute("d", pieceShape);
    outlineHalo.setAttribute("vector-effect", "non-scaling-stroke");

    outline.setAttribute("class", "piece-outline");
    outline.setAttribute("d", pieceShape);
    outline.setAttribute("vector-effect", "non-scaling-stroke");

    piece.append(defs, image, outlineHalo, outline);

    const model = {
      element: piece,
      index,
      x: clamp(start.x * boardW, 0, boardW - visualW),
      y: clamp(start.y * boardH, 0, boardH - visualH),
      targetX: snapX,
      targetY: snapY,
      width: visualW,
      height: visualH,
      rotation: start.r,
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
  piece.x = clamp(point.x - piece.dragOffsetX, 0, rect.width - piece.width);
  piece.y = clamp(point.y - piece.dragOffsetY, 0, rect.height - piece.height);
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
  }, 760);
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
