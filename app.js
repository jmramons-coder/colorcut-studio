const VIEWBOX = 640;
const GRID = { cols: 3, rows: 2 };

const clips = [
  "polygon(0% 0%, 88% 0%, 100% 16%, 92% 100%, 0% 100%, 8% 46%)",
  "polygon(7% 0%, 100% 0%, 94% 45%, 100% 100%, 0% 100%, 8% 55%, 0% 18%)",
  "polygon(0% 0%, 100% 0%, 100% 100%, 9% 100%, 0% 83%, 7% 40%)",
  "polygon(0% 0%, 93% 0%, 100% 18%, 91% 100%, 0% 100%, 0% 0%)",
  "polygon(0% 0%, 100% 0%, 92% 46%, 100% 100%, 7% 100%, 0% 84%, 8% 36%)",
  "polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%, 8% 58%, 0% 18%)"
];

const startFractions = [
  { x: 0.67, y: 0.54, r: 5 },
  { x: 0.04, y: 0.56, r: -4 },
  { x: 0.36, y: 0.04, r: 4 },
  { x: 0.66, y: 0.08, r: -5 },
  { x: 0.04, y: 0.18, r: 3 },
  { x: 0.38, y: 0.53, r: -3 }
];

const animals = [
  {
    id: "fox",
    name: "Rainbow Fox",
    color: () => foxSvg("color"),
    line: () => foxSvg("line")
  },
  {
    id: "turtle",
    name: "Mosaic Turtle",
    color: () => turtleSvg("color"),
    line: () => turtleSvg("line")
  }
];

const dom = {
  pickerView: document.querySelector("#pickerView"),
  drawingGrid: document.querySelector("#drawingGrid"),
  studioView: document.querySelector("#studioView"),
  galleryButton: document.querySelector("#galleryButton"),
  brand: document.querySelector(".brand"),
  puzzleBoard: document.querySelector("#puzzleBoard"),
  colorBoard: document.querySelector("#colorBoard"),
  ghostArt: document.querySelector("#ghostArt"),
  slotLayer: document.querySelector("#slotLayer"),
  pieceLayer: document.querySelector("#pieceLayer"),
  completePop: document.querySelector("#completePop"),
  colorArt: document.querySelector("#colorArt"),
  colorCanvas: document.querySelector("#colorCanvas"),
  brushSize: document.querySelector("#brushSize"),
  resetColorButton: document.querySelector("#resetColorButton"),
  stepDots: Array.from(document.querySelectorAll(".step-dot"))
};

const state = {
  stage: "pick",
  animal: null,
  pieces: [],
  activePiece: null,
  lineUrl: "",
  colorUrl: "",
  brushSize: Number(dom.brushSize.value),
  colorContext: null,
  deviceScale: 1,
  isColoring: false,
  lastColorPoint: null,
  scratch: null,
  resizeTimer: 0
};

renderPicker();
bindControls();
setStage("pick");

function renderPicker() {
  const arrow =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.3 20 12l-6.8 6.7-1.7-1.7 3.9-3.8H4v-2.4h11.4L11.5 7l1.7-1.7Z"/></svg>';

  dom.drawingGrid.innerHTML = animals
    .map((animal) => {
      const preview = svgToData(animal.color());
      return `
        <button class="drawing-card" type="button" data-animal="${animal.id}" aria-label="${animal.name}">
          <img class="drawing-preview" src="${preview}" alt="" />
          <span class="drawing-name">${animal.name}${arrow}</span>
        </button>
      `;
    })
    .join("");

  dom.drawingGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-animal]");
    if (!card) return;
    selectAnimal(card.dataset.animal);
  });
}

function bindControls() {
  dom.galleryButton.addEventListener("click", showPicker);
  dom.brand.addEventListener("click", (event) => {
    event.preventDefault();
    showPicker();
  });
  dom.brushSize.addEventListener("input", () => {
    state.brushSize = Number(dom.brushSize.value);
  });
  dom.resetColorButton.addEventListener("click", () => {
    if (state.stage === "color") prepareColorCanvas();
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
      if (state.stage === "color" && state.animal) prepareColorCanvas();
    }, 180);
  });
}

function showPicker() {
  state.stage = "pick";
  state.animal = null;
  state.pieces = [];
  state.activePiece = null;
  stopScratch();
  setStage("pick");
  dom.pickerView.classList.remove("is-hidden");
  dom.studioView.classList.add("is-hidden");
  dom.completePop.classList.remove("is-visible");
}

function selectAnimal(id) {
  const animal = animals.find((item) => item.id === id);
  if (!animal) return;

  state.animal = animal;
  state.lineUrl = svgToData(animal.line());
  state.colorUrl = svgToData(animal.color());
  state.pieces = [];
  state.activePiece = null;

  dom.pickerView.classList.add("is-hidden");
  dom.studioView.classList.remove("is-hidden");
  dom.puzzleBoard.style.display = "";
  dom.colorBoard.classList.add("is-hidden");
  dom.completePop.classList.remove("is-visible");
  dom.ghostArt.src = state.lineUrl;
  dom.colorArt.src = state.colorUrl;
  setStage("build");

  requestAnimationFrame(buildPuzzle);
}

function setStage(stage) {
  state.stage = stage;
  dom.stepDots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.step === stage);
  });
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
  const targetSize = Math.min(boardW, boardH) * 0.86;
  const targetX = (boardW - targetSize) / 2;
  const targetY = (boardH - targetSize) / 2;
  const tileW = targetSize / GRID.cols;
  const tileH = targetSize / GRID.rows;

  dom.slotLayer.innerHTML = "";
  dom.pieceLayer.innerHTML = "";
  state.pieces = [];
  dom.ghostArt.style.left = `${targetX}px`;
  dom.ghostArt.style.top = `${targetY}px`;
  dom.ghostArt.style.width = `${targetSize}px`;
  dom.ghostArt.style.height = `${targetSize}px`;

  for (let index = 0; index < GRID.cols * GRID.rows; index += 1) {
    const col = index % GRID.cols;
    const row = Math.floor(index / GRID.cols);
    const cellX = col * tileW;
    const cellY = row * tileH;
    const snapX = targetX + cellX;
    const snapY = targetY + cellY;
    const clip = clips[index];

    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.width = `${tileW}px`;
    slot.style.height = `${tileH}px`;
    slot.style.left = `${snapX}px`;
    slot.style.top = `${snapY}px`;
    slot.style.clipPath = clip;
    dom.slotLayer.append(slot);

    const start = startFractions[index];
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.setAttribute("role", "button");
    piece.setAttribute("aria-label", `${state.animal.name} piece ${index + 1}`);
    piece.style.width = `${tileW}px`;
    piece.style.height = `${tileH}px`;
    piece.style.backgroundImage = `url("${state.lineUrl}")`;
    piece.style.backgroundSize = `${targetSize}px ${targetSize}px`;
    piece.style.backgroundPosition = `${-cellX}px ${-cellY}px`;
    piece.style.clipPath = clip;

    const model = {
      element: piece,
      index,
      x: clamp(start.x * boardW, 0, boardW - tileW),
      y: clamp(start.y * boardH, 0, boardH - tileH),
      targetX: snapX,
      targetY: snapY,
      width: tileW,
      height: tileH,
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

  piece.element.addEventListener("pointermove", dragPiece);
  piece.element.addEventListener("pointerup", dropPiece);
  piece.element.addEventListener("pointercancel", dropPiece);
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

  piece.element.releasePointerCapture(event.pointerId);
  piece.element.classList.remove("is-dragging");
  piece.element.removeEventListener("pointermove", dragPiece);
  piece.element.removeEventListener("pointerup", dropPiece);
  piece.element.removeEventListener("pointercancel", dropPiece);

  const distance = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
  const snapDistance = Math.min(piece.width, piece.height) * 0.32;
  if (distance <= snapDistance) {
    piece.x = piece.targetX;
    piece.y = piece.targetY;
    piece.rotation = 0;
    piece.snapped = true;
    piece.element.classList.add("is-snapped");
    piece.element.style.zIndex = String(5 + piece.index);
    setPieceTransform(piece);
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

  dom.completePop.classList.add("is-visible");
  window.setTimeout(() => {
    if (state.stage === "build") beginColoringMode();
  }, 760);
}

function beginColoringMode() {
  setStage("color");
  dom.puzzleBoard.style.display = "none";
  dom.colorBoard.classList.remove("is-hidden");
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

  const context = canvas.getContext("2d", { willReadFrequently: false });
  state.colorContext = context;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";

  const image = new Image();
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
  image.src = state.lineUrl;
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
}

function endColorStroke(event) {
  if (!state.isColoring) return;
  if (event.pointerId !== undefined && dom.colorCanvas.hasPointerCapture(event.pointerId)) {
    dom.colorCanvas.releasePointerCapture(event.pointerId);
  }
  state.isColoring = false;
  state.lastColorPoint = null;
  stopScratch();
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

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext();
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

function svgToData(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function foxSvg(mode) {
  const line = mode === "line";
  const stroke = "#24313a";
  const softStroke = line ? "#313d45" : "#273941";
  const body = line ? "#fffdf7" : "url(#foxBody)";
  const chest = line ? "#f7f4ec" : "#fff3de";
  const tail = line ? "#fffdf7" : "url(#foxTail)";
  const tailTip = line ? "#f8f5ed" : "#fff7e8";
  const ear = line ? "#fffdf7" : "url(#foxEar)";
  const paw = line ? "#f2efe7" : "#3b4650";
  const accent = line ? "#f1eee6" : "url(#foxAccent)";
  const speckles = line ? "#d8d3c8" : "url(#foxSpeckles)";
  const texture = line ? "" : 'filter="url(#paperTexture)"';
  const defs = line
    ? foxLineDefs()
    : `
      <defs>
        <linearGradient id="foxBody" x1="132" y1="142" x2="510" y2="508" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ff7c60"/>
          <stop offset=".45" stop-color="#ffb65f"/>
          <stop offset="1" stop-color="#f85f7b"/>
        </linearGradient>
        <linearGradient id="foxTail" x1="360" y1="266" x2="558" y2="424" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ff8d62"/>
          <stop offset=".42" stop-color="#ffd166"/>
          <stop offset=".7" stop-color="#62c6c4"/>
          <stop offset="1" stop-color="#6ea8fe"/>
        </linearGradient>
        <linearGradient id="foxEar" x1="184" y1="124" x2="376" y2="275" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ff715f"/>
          <stop offset="1" stop-color="#ffbd63"/>
        </linearGradient>
        <linearGradient id="foxAccent" x1="172" y1="314" x2="462" y2="500" gradientUnits="userSpaceOnUse">
          <stop stop-color="#62c6c4"/>
          <stop offset=".55" stop-color="#8ad879"/>
          <stop offset="1" stop-color="#ffd166"/>
        </linearGradient>
        <pattern id="foxSpeckles" width="38" height="38" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="11" r="3" fill="#ffffff" opacity=".38"/>
          <circle cx="28" cy="27" r="2.4" fill="#26353d" opacity=".12"/>
          <circle cx="32" cy="8" r="1.8" fill="#ffffff" opacity=".42"/>
        </pattern>
        <filter id="paperTexture" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="8" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .12"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
      </defs>
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" role="img" aria-label="Rainbow fox drawing">
      ${defs}
      <g ${texture} stroke="${stroke}" stroke-width="${line ? 8 : 5}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M365 384c58-50 76-115 148-128 34-6 68 5 91 28-41 23-45 66-67 101-31 51-89 63-142 40-19-8-32-22-30-41Z" fill="${tail}"/>
        <path d="M523 276c35 19 51 45 55 77-18-14-46-19-79-12-10-30-1-52 24-65Z" fill="${tailTip}"/>
        <path d="M180 429c7-95 66-164 157-171 94-7 168 49 178 140 9 85-52 131-164 135-114 4-177-22-171-104Z" fill="${body}"/>
        <path d="M217 415c18 60 64 91 139 93 63 1 106-23 128-73-19 77-72 105-148 107-83 2-126-33-119-127Z" fill="${accent}" opacity="${line ? ".26" : ".92"}"/>
        <path d="M222 513c-1 32 16 52 46 56 23 3 43-4 62-20-39-3-54-21-56-52l-52 16Z" fill="${paw}"/>
        <path d="M383 502c4 34 26 53 61 51 22-1 39-11 53-30-38 4-58-12-66-45l-48 24Z" fill="${paw}"/>
        <path d="M263 402c14 54 48 82 96 82 48 0 84-27 108-82-65 30-134 30-204 0Z" fill="${chest}"/>
        <path d="M180 276c-23-91 32-171 123-177 93-6 161 69 142 162-11 54-59 91-128 95-71 4-122-27-137-80Z" fill="${body}"/>
        <path d="M203 187 171 76l103 62c-28 7-51 23-71 49Z" fill="${ear}"/>
        <path d="m373 137 103-61-32 111c-19-26-43-43-71-50Z" fill="${ear}"/>
        <path d="M221 192 203 121l61 41c-16 6-30 16-43 30Z" fill="${chest}"/>
        <path d="m386 162 61-41-18 71c-12-14-27-24-43-30Z" fill="${chest}"/>
        <path d="M238 295c19 38 50 56 93 54 39-2 67-23 83-61-25 9-54 14-86 14-34 0-64-2-90-7Z" fill="${chest}"/>
        <path d="M281 285c16 14 47 14 63 0 2 28-11 45-33 45s-34-17-30-45Z" fill="${tailTip}"/>
        <path d="M298 273c10-8 26-8 36 0-3 12-9 18-18 18-9 0-15-6-18-18Z" fill="${stroke}"/>
        <path d="M316 291v22" fill="none"/>
        <path d="M296 318c12 12 28 12 40 0" fill="none"/>
        <circle cx="249" cy="244" r="12" fill="${stroke}"/>
        <circle cx="383" cy="244" r="12" fill="${stroke}"/>
        <path d="M208 236c-23-3-42 2-58 15" fill="none"/>
        <path d="M207 262c-26 2-47 11-63 27" fill="none"/>
        <path d="M426 236c23-3 42 2 58 15" fill="none"/>
        <path d="M427 262c26 2 47 11 63 27" fill="none"/>
        <path d="M207 371c46 24 92 31 139 22" fill="none" opacity=".22"/>
        <path d="M384 362c38 11 74 12 107 2" fill="none" opacity=".22"/>
        <path d="M196 427c25 18 54 27 88 27" fill="none" opacity=".25"/>
        <path d="M364 384c36 24 80 30 132 17" fill="none" opacity=".28"/>
        <path d="M195 150c33-39 75-56 128-51" fill="none" opacity=".24"/>
        <path d="M361 100c47 6 83 33 106 80" fill="none" opacity=".24"/>
        <path d="M191 426c26 16 58 25 96 27" fill="none" opacity=".18"/>
        <path d="M186 278c41 22 84 33 130 31 48-2 89-15 122-39" fill="none" opacity=".14"/>
        <path d="M193 276c41 44 185 50 243 2" fill="none" opacity=".12"/>
        <path d="M178 430c53 42 241 44 306 1" fill="none" opacity=".12"/>
        <path d="M391 287c28 4 55 13 82 26" fill="none" opacity=".18"/>
        <path d="M242 286c-26 5-50 14-74 27" fill="none" opacity=".18"/>
        <path d="M186 205c-11 25-13 50-5 75" fill="none" opacity=".16"/>
        <path d="M449 205c11 25 13 50 5 75" fill="none" opacity=".16"/>
        <path d="M210 412c58 20 121 20 189 0" fill="none" opacity=".14"/>
        <path d="M400 422c40 8 77 4 112-12" fill="none" opacity=".14"/>
        <path d="M160 178c21-35 54-58 99-71" fill="none" opacity=".12"/>
        <path d="M476 178c-21-35-54-58-99-71" fill="none" opacity=".12"/>
        <path d="M184 274c4-17 16-29 35-36" fill="none" opacity=".18"/>
        <path d="M451 274c-4-17-16-29-35-36" fill="none" opacity=".18"/>
        <path d="M195 474c36 28 83 42 140 42" fill="none" opacity=".14"/>
        <path d="M366 514c50-3 91-21 122-54" fill="none" opacity=".14"/>
        <path d="M210 161c33-24 69-34 109-30" fill="none" opacity=".12"/>
        <path d="M351 130c39 3 68 20 87 52" fill="none" opacity=".12"/>
        <path d="M203 186c24-14 48-21 73-20" fill="none" opacity=".12"/>
        <path d="M362 166c26-1 50 6 73 20" fill="none" opacity=".12"/>
        <path d="M202 524c39 23 87 32 144 28" fill="none" opacity=".11"/>
        <path d="M368 548c54-1 98-20 132-57" fill="none" opacity=".11"/>
        <path d="M386 372c40 16 79 14 116-5" fill="none" opacity=".12"/>
        <path d="M207 371c39 22 82 28 130 18" fill="none" opacity=".12"/>
        <path d="M234 387c30 12 66 14 107 6" fill="none" opacity=".1"/>
        <path d="M407 392c30 8 60 7 90-5" fill="none" opacity=".1"/>
        <path d="M370 383c42 23 83 28 122 15" fill="none" opacity=".1"/>
        <path d="M383 416c47 17 90 11 129-18" fill="none" opacity=".1"/>
        <path d="M213 456c43 19 92 23 146 12" fill="none" opacity=".1"/>
        <path d="M226 482c40 21 90 28 149 20" fill="none" opacity=".1"/>
        <path d="M424 484c26 6 52 3 77-9" fill="none" opacity=".1"/>
        <path d="M227 198c27-16 56-22 88-17" fill="none" opacity=".1"/>
        <path d="M346 181c33 5 60 22 80 50" fill="none" opacity=".1"/>
        <path d="M232 221c21-9 45-11 72-6" fill="none" opacity=".1"/>
        <path d="M355 216c24 6 44 18 60 36" fill="none" opacity=".1"/>
        <path d="M201 332c66 28 141 29 225 4" fill="none" opacity=".1"/>
        <path d="M213 348c55 26 119 29 191 9" fill="none" opacity=".1"/>
        <path d="M236 515c17 6 35 9 55 9" fill="none" opacity=".1"/>
        <path d="M414 519c20 3 39 1 57-6" fill="none" opacity=".1"/>
        <path d="M185 257c20 14 48 23 84 27" fill="none" opacity=".1"/>
        <path d="M365 284c34-5 61-15 82-30" fill="none" opacity=".1"/>
        <path d="M195 138c31-26 66-39 105-39" fill="none" opacity=".1"/>
        <path d="M335 99c41 4 77 22 108 53" fill="none" opacity=".1"/>
        <path d="M202 161c20-15 42-25 67-30" fill="none" opacity=".1"/>
        <path d="M376 131c25 6 47 19 66 38" fill="none" opacity=".1"/>
        <path d="M181 281c13 42 42 67 87 75" fill="none" opacity=".1"/>
        <path d="M364 355c45-9 73-35 84-79" fill="none" opacity=".1"/>
        <path d="M212 301c35 25 75 37 119 35" fill="none" opacity=".09"/>
        <path d="M350 336c35-6 65-21 88-43" fill="none" opacity=".09"/>
        <path d="M169 309c24 20 50 35 78 44" fill="none" opacity=".09"/>
        <path d="M389 352c36-7 67-22 93-45" fill="none" opacity=".09"/>
        <path d="M202 396c47 21 104 26 170 14" fill="none" opacity=".09"/>
        <path d="M384 409c48 12 91 6 128-18" fill="none" opacity=".09"/>
        <path d="M209 432c41 18 91 21 150 10" fill="none" opacity=".09"/>
        <path d="M392 444c38 10 72 5 103-15" fill="none" opacity=".09"/>
        <path d="M220 463c36 17 80 20 132 11" fill="none" opacity=".09"/>
        <path d="M401 475c29 6 57 3 83-9" fill="none" opacity=".09"/>
        <path d="M240 494c28 14 62 18 101 12" fill="none" opacity=".09"/>
        <path d="M419 502c19 4 38 3 56-4" fill="none" opacity=".09"/>
        <path d="M354 389c39 29 83 38 132 29" fill="none" opacity=".09"/>
        <path d="M375 363c44 22 89 25 137 10" fill="none" opacity=".09"/>
        <path d="M411 337c31 9 63 7 95-6" fill="none" opacity=".09"/>
        <path d="M453 305c17 2 34-1 51-8" fill="none" opacity=".09"/>
        <path d="M151 251c11-13 25-23 41-29" fill="none" opacity=".09"/>
        <path d="M484 251c-12-13-25-23-42-29" fill="none" opacity=".09"/>
        <path d="M224 239c18-11 38-17 60-18" fill="none" opacity=".09"/>
        <path d="M351 222c22 3 41 13 58 29" fill="none" opacity=".09"/>
        <path d="M188 222c7-17 20-31 38-43" fill="none" opacity=".09"/>
        <path d="M445 222c-8-17-20-31-38-43" fill="none" opacity=".09"/>
        <path d="M214 150c22-12 45-18 71-17" fill="none" opacity=".09"/>
        <path d="M349 133c25 3 47 13 66 31" fill="none" opacity=".09"/>
        <path d="M243 120c23-7 48-8 73-2" fill="none" opacity=".09"/>
        <path d="M328 118c26 4 50 15 72 33" fill="none" opacity=".09"/>
        <path d="M204 118c18-15 40-27 66-35" fill="none" opacity=".09"/>
        <path d="M433 118c-18-15-40-27-66-35" fill="none" opacity=".09"/>
        <path d="M183 102c23 11 43 26 60 46" fill="none" opacity=".09"/>
        <path d="M454 102c-23 11-43 26-60 46" fill="none" opacity=".09"/>
        <path d="M226 163c23-8 47-11 72-7" fill="none" opacity=".09"/>
        <path d="M340 156c28 4 52 18 72 41" fill="none" opacity=".09"/>
        <path d="M202 255c28 17 62 26 102 26" fill="none" opacity=".09"/>
        <path d="M340 281c38-3 70-16 96-39" fill="none" opacity=".09"/>
        <path d="M236 268c21 6 43 8 67 5" fill="none" opacity=".09"/>
        <path d="M349 272c23-5 43-15 60-29" fill="none" opacity=".09"/>
        <path d="M223 326c52 18 108 19 168 3" fill="none" opacity=".09"/>
        <path d="M247 344c40 15 83 16 130 3" fill="none" opacity=".09"/>
        <path d="M246 366c37 13 77 14 120 2" fill="none" opacity=".09"/>
        <path d="M261 383c29 10 61 11 96 2" fill="none" opacity=".09"/>
        <path d="M283 401c19 5 39 5 59 0" fill="none" opacity=".09"/>
        <path d="M209 544c34 14 72 19 115 14" fill="none" opacity=".09"/>
        <path d="M380 558c44-3 81-18 112-45" fill="none" opacity=".09"/>
        <path d="M219 562c28 9 59 11 94 6" fill="none" opacity=".09"/>
        <path d="M395 574c34-5 62-17 84-37" fill="none" opacity=".09"/>
        <path d="M224 416c39 12 81 14 127 5" fill="none" opacity=".09"/>
        <path d="M400 421c30 5 59 2 87-8" fill="none" opacity=".09"/>
        <path d="M231 438c35 11 73 12 114 4" fill="none" opacity=".09"/>
        <path d="M403 442c27 5 53 2 78-8" fill="none" opacity=".09"/>
        <path d="M242 460c30 10 63 11 98 4" fill="none" opacity=".09"/>
        <path d="M409 462c21 4 42 2 62-5" fill="none" opacity=".09"/>
        <path d="M253 481c25 8 52 9 80 4" fill="none" opacity=".09"/>
        <path d="M417 482c16 3 32 2 48-3" fill="none" opacity=".09"/>
        <path d="M265 501c18 5 37 6 56 2" fill="none" opacity=".09"/>
        <path d="M429 500c11 2 23 2 34-1" fill="none" opacity=".09"/>
        <path d="M186 416c19 18 43 31 72 39" fill="none" opacity=".09"/>
        <path d="M466 454c22-9 40-24 53-43" fill="none" opacity=".09"/>
        <path d="M188 446c19 16 42 28 68 35" fill="none" opacity=".09"/>
        <path d="M461 483c20-8 36-21 48-38" fill="none" opacity=".09"/>
        <path d="M193 475c18 14 38 25 62 31" fill="none" opacity=".09"/>
        <path d="M454 506c17-7 31-18 42-31" fill="none" opacity=".09"/>
        <path d="M202 502c16 12 34 21 55 26" fill="none" opacity=".09"/>
        <path d="M445 525c14-6 26-15 35-26" fill="none" opacity=".09"/>
        <path d="M222 293c26 13 57 19 94 18" fill="none" opacity=".09"/>
        <path d="M348 309c34-4 62-15 84-33" fill="none" opacity=".09"/>
        <path d="M227 305c24 10 52 14 84 12" fill="none" opacity=".09"/>
        <path d="M351 317c28-4 52-14 71-30" fill="none" opacity=".09"/>
        <path d="M239 317c19 6 42 9 68 7" fill="none" opacity=".09"/>
        <path d="M359 326c22-4 40-12 55-24" fill="none" opacity=".09"/>
        <path d="M239 174c21-6 42-7 63-3" fill="none" opacity=".09"/>
        <path d="M344 172c23 4 42 14 58 32" fill="none" opacity=".09"/>
        <path d="M247 190c17-4 34-5 52-1" fill="none" opacity=".09"/>
        <path d="M345 191c18 4 34 13 47 27" fill="none" opacity=".09"/>
        <path d="M253 207c14-3 29-3 44 0" fill="none" opacity=".09"/>
        <path d="M346 209c14 4 26 11 37 22" fill="none" opacity=".09"/>
        <path d="M362 392c40 19 81 22 123 8" fill="none" opacity=".09"/>
        <path d="M380 374c40 15 80 15 120 0" fill="none" opacity=".09"/>
        <path d="M401 356c33 9 66 6 99-8" fill="none" opacity=".09"/>
        <path d="M428 335c26 4 52 1 77-11" fill="none" opacity=".09"/>
        <path d="M460 314c17 1 33-3 49-10" fill="none" opacity=".09"/>
        <path d="M494 289c11-1 21-4 30-9" fill="none" opacity=".09"/>
        <path d="M520 266c12 5 23 12 32 21" fill="none" opacity=".09"/>
        <path d="M506 291c18 8 33 20 44 35" fill="none" opacity=".09"/>
        <path d="M500 320c16 8 29 19 38 34" fill="none" opacity=".09"/>
        <path d="M493 348c12 9 22 20 29 33" fill="none" opacity=".09"/>
        <path d="M480 373c11 8 19 18 25 30" fill="none" opacity=".09"/>
        <path d="M455 393c11 7 20 16 26 27" fill="none" opacity=".09"/>
        <path d="M430 400c11 6 20 14 27 24" fill="none" opacity=".09"/>
        <path d="M399 393c12 6 22 13 31 22" fill="none" opacity=".09"/>
        <path d="M374 376c12 6 23 13 32 22" fill="none" opacity=".09"/>
        <path d="M355 353c13 6 24 14 34 24" fill="none" opacity=".09"/>
        <path d="M338 333c14 6 26 13 37 23" fill="none" opacity=".09"/>
        <path d="M320 321c14 4 28 10 41 18" fill="none" opacity=".09"/>
        <path d="M296 318c13 2 26 6 39 11" fill="none" opacity=".09"/>
        <path d="M270 315c13 1 26 3 39 7" fill="none" opacity=".09"/>
        <path d="M244 309c13 1 25 3 38 7" fill="none" opacity=".09"/>
        <path d="M220 300c12 2 23 5 35 10" fill="none" opacity=".09"/>
        <path d="M199 287c11 3 22 8 32 14" fill="none" opacity=".09"/>
        <path d="M185 266c10 6 19 13 28 22" fill="none" opacity=".09"/>
        <path d="M184 242c10 8 19 17 27 28" fill="none" opacity=".09"/>
        <path d="M190 219c10 9 18 20 26 32" fill="none" opacity=".09"/>
        <path d="M202 197c9 10 17 21 24 34" fill="none" opacity=".09"/>
        <path d="M218 177c8 10 15 21 22 34" fill="none" opacity=".09"/>
        <path d="M237 160c7 10 13 21 19 33" fill="none" opacity=".09"/>
        <path d="M262 148c5 9 10 20 14 32" fill="none" opacity=".09"/>
        <path d="M289 144c3 9 6 18 8 29" fill="none" opacity=".09"/>
        <path d="M318 146c1 8 1 17 1 27" fill="none" opacity=".09"/>
        <path d="M346 152c-1 8-2 16-4 25" fill="none" opacity=".09"/>
        <path d="M371 165c-3 7-6 15-11 23" fill="none" opacity=".09"/>
        <path d="M394 184c-5 6-11 13-18 19" fill="none" opacity=".09"/>
        <path d="M413 207c-7 5-14 10-23 15" fill="none" opacity=".09"/>
        <path d="M428 235c-8 3-17 6-27 8" fill="none" opacity=".09"/>
        <path d="M434 263c-9 1-19 2-30 1" fill="none" opacity=".09"/>
        <path d="M428 291c-10-1-20-3-31-6" fill="none" opacity=".09"/>
        <path d="M410 315c-10-3-20-7-30-13" fill="none" opacity=".09"/>
        <path d="M386 335c-9-5-18-12-27-20" fill="none" opacity=".09"/>
        <path d="M358 348c-8-7-16-15-23-25" fill="none" opacity=".09"/>
        <path d="M328 353c-5-8-10-18-14-29" fill="none" opacity=".09"/>
        <path d="M299 350c-3-9-5-18-6-28" fill="none" opacity=".09"/>
        <path d="M272 342c0-8 1-17 3-27" fill="none" opacity=".09"/>
        <path d="M247 328c3-8 7-16 12-24" fill="none" opacity=".09"/>
        <path d="M227 310c6-7 12-14 20-20" fill="none" opacity=".09"/>
        <path d="M212 288c8-6 16-11 26-16" fill="none" opacity=".09"/>
        <path d="M203 264c9-4 19-7 30-9" fill="none" opacity=".09"/>
        <path d="M202 239c10-2 21-2 32-1" fill="none" opacity=".09"/>
        <path d="M208 215c10 1 20 3 31 7" fill="none" opacity=".09"/>
        <path d="M221 192c9 4 19 9 28 15" fill="none" opacity=".09"/>
        <path d="M239 174c8 6 16 13 23 21" fill="none" opacity=".09"/>
        <path d="M260 160c7 7 13 15 18 24" fill="none" opacity=".09"/>
        <path d="M284 153c5 7 9 15 12 24" fill="none" opacity=".09"/>
        <path d="M309 153c2 7 3 15 3 24" fill="none" opacity=".09"/>
        <path d="M333 158c0 7-1 15-4 23" fill="none" opacity=".09"/>
        <path d="M356 169c-3 6-7 13-12 19" fill="none" opacity=".09"/>
        <path d="M376 186c-5 5-10 11-17 16" fill="none" opacity=".09"/>
        <path d="M393 208c-6 4-13 8-21 11" fill="none" opacity=".09"/>
        <path d="M404 232c-7 3-15 5-24 6" fill="none" opacity=".09"/>
        <path d="M407 257c-8 1-17 1-26-1" fill="none" opacity=".09"/>
        <path d="M402 282c-8-1-16-4-25-7" fill="none" opacity=".09"/>
        <path d="M390 304c-7-3-15-8-22-14" fill="none" opacity=".09"/>
        <path d="M372 322c-6-5-12-12-18-19" fill="none" opacity=".09"/>
        <path d="M350 335c-5-7-9-14-12-23" fill="none" opacity=".09"/>
        <path d="M326 340c-2-7-3-15-4-23" fill="none" opacity=".09"/>
        <path d="M303 338c0-7 1-14 3-22" fill="none" opacity=".09"/>
        <path d="M281 330c2-6 5-13 10-20" fill="none" opacity=".09"/>
        <path d="M263 316c5-6 10-11 16-16" fill="none" opacity=".09"/>
        <path d="M249 299c6-5 12-9 20-12" fill="none" opacity=".09"/>
        <path d="M240 279c7-3 14-5 22-6" fill="none" opacity=".09"/>
        <path d="M237 258c7-1 15 0 23 1" fill="none" opacity=".09"/>
        <path d="M240 238c8 1 15 3 23 6" fill="none" opacity=".09"/>
        <path d="M250 220c7 3 13 7 20 13" fill="none" opacity=".09"/>
        <path d="M263 205c6 5 11 10 16 17" fill="none" opacity=".09"/>
        <path d="M280 194c4 6 8 12 11 19" fill="none" opacity=".09"/>
        <path d="M298 190c3 5 5 12 6 19" fill="none" opacity=".09"/>
        <path d="M317 191c1 5 1 12 0 19" fill="none" opacity=".09"/>
        <path d="M334 197c-1 5-4 11-7 17" fill="none" opacity=".09"/>
        <path d="M350 207c-4 5-8 10-14 14" fill="none" opacity=".09"/>
        <path d="M361 221c-5 4-11 7-18 10" fill="none" opacity=".09"/>
        <path d="M369 238c-6 2-13 4-20 4" fill="none" opacity=".09"/>
        <path d="M371 256c-7 1-14 0-21-1" fill="none" opacity=".09"/>
        <path d="M367 273c-7-1-13-3-20-6" fill="none" opacity=".09"/>
        <path d="M357 289c-6-3-12-7-17-12" fill="none" opacity=".09"/>
        <path d="M344 302c-5-4-9-9-13-15" fill="none" opacity=".09"/>
        <path d="M329 310c-3-5-6-11-8-18" fill="none" opacity=".09"/>
        <path d="M312 312c-2-6-2-12-2-18" fill="none" opacity=".09"/>
        <path d="M296 309c0-5 2-11 4-17" fill="none" opacity=".09"/>
        <path d="M281 301c3-5 6-10 11-15" fill="none" opacity=".09"/>
        <path d="M270 290c4-4 9-8 15-11" fill="none" opacity=".09"/>
        <path d="M263 276c5-3 11-5 18-7" fill="none" opacity=".09"/>
        <path d="M260 261c6-1 12-1 19 0" fill="none" opacity=".09"/>
        <path d="M263 247c6 1 12 3 18 6" fill="none" opacity=".09"/>
        <path d="M270 234c5 3 10 7 15 12" fill="none" opacity=".09"/>
        <path d="M281 224c4 4 8 9 11 15" fill="none" opacity=".09"/>
        <path d="M294 218c3 5 5 10 6 16" fill="none" opacity=".09"/>
        <path d="M308 217c1 5 1 10 0 16" fill="none" opacity=".09"/>
        <path d="M322 220c-1 5-3 10-6 15" fill="none" opacity=".09"/>
        <path d="M334 228c-3 4-7 8-12 11" fill="none" opacity=".09"/>
        <path d="M343 239c-4 3-9 6-15 8" fill="none" opacity=".09"/>
        <path d="M348 252c-5 2-11 2-17 2" fill="none" opacity=".09"/>
        <path d="M347 266c-6 0-11-1-17-3" fill="none" opacity=".09"/>
        <path d="M342 278c-5-2-10-5-14-9" fill="none" opacity=".09"/>
        <path d="M333 288c-4-3-8-8-11-13" fill="none" opacity=".09"/>
        <path d="M321 294c-3-5-5-10-6-16" fill="none" opacity=".09"/>
        <path d="M308 295c-1-5-1-11 0-16" fill="none" opacity=".09"/>
        <path d="M295 291c1-5 3-10 7-15" fill="none" opacity=".09"/>
        <path d="M285 283c3-4 8-8 13-11" fill="none" opacity=".09"/>
        <path d="M279 272c5-3 10-5 16-6" fill="none" opacity=".09"/>
        <path d="M278 260c5-1 11 0 17 2" fill="none" opacity=".09"/>
        <path d="M282 248c5 2 10 5 15 9" fill="none" opacity=".09"/>
        <path d="M290 239c4 4 8 8 11 14" fill="none" opacity=".09"/>
        <path d="M301 234c2 5 4 10 4 16" fill="none" opacity=".09"/>
        <path d="M313 234c0 5-1 10-4 15" fill="none" opacity=".09"/>
        <path d="M324 239c-3 4-7 8-12 11" fill="none" opacity=".09"/>
        <path d="M331 248c-4 3-9 5-15 6" fill="none" opacity=".09"/>
        <path d="M334 259c-5 1-11 0-16-2" fill="none" opacity=".09"/>
        <path d="M331 270c-5-2-9-5-13-9" fill="none" opacity=".09"/>
        <path d="M323 278c-4-4-6-8-8-13" fill="none" opacity=".09"/>
        <path d="M312 281c-1-5-1-10 1-15" fill="none" opacity=".09"/>
        <path d="M302 278c2-5 5-9 10-12" fill="none" opacity=".09"/>
        <path d="M296 270c4-4 8-6 14-8" fill="none" opacity=".09"/>
        <path d="M295 259c5-1 10 0 15 3" fill="none" opacity=".09"/>
        <path d="M300 250c4 3 7 7 10 12" fill="none" opacity=".09"/>
        <path d="M309 247c2 5 3 10 1 15" fill="none" opacity=".09"/>
        <path d="M319 250c-2 5-5 9-10 12" fill="none" opacity=".09"/>
        <path d="M324 259c-5 3-10 3-15 1" fill="none" opacity=".09"/>
        <path d="M319 268c-5 2-10 0-14-4" fill="none" opacity=".09"/>
        <path d="M310 270c-4-4-5-9-3-14" fill="none" opacity=".09"/>
        <path d="M302 264c2-5 6-8 11-8" fill="none" opacity=".09"/>
        <path d="M306 255c5-2 9 0 12 5" fill="none" opacity=".09"/>
        <path d="M315 256c4 4 4 8 0 12" fill="none" opacity=".09"/>
        <path d="M308 267c-4-4-4-8 0-12" fill="none" opacity=".09"/>
        <path d="M315 255c4 4 4 8 0 12" fill="none" opacity=".09"/>
        <path d="M198 426c48 39 238 45 307-5" fill="${speckles}" opacity="${line ? ".18" : ".42"}" stroke="none"/>
      </g>
    </svg>
  `;
}

function foxLineDefs() {
  return `
    <defs>
      <pattern id="foxSpeckles" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="9" r="2" fill="#d9d4cb" opacity=".55"/>
        <circle cx="28" cy="25" r="1.7" fill="#d9d4cb" opacity=".35"/>
      </pattern>
    </defs>
  `;
}

function turtleSvg(mode) {
  const line = mode === "line";
  const stroke = "#24313a";
  const shellStroke = line ? "#303c44" : "#253640";
  const skin = line ? "#fffdf7" : "url(#turtleSkin)";
  const shell = line ? "#fffdf7" : "url(#turtleShell)";
  const shellA = line ? "#f6f2e9" : "#62c6c4";
  const shellB = line ? "#fbf7ef" : "#ffd166";
  const shellC = line ? "#f2efe7" : "#ff806e";
  const shellD = line ? "#f8f5ed" : "#82c785";
  const shellE = line ? "#f4f1ea" : "#6ea8fe";
  const texture = line ? "" : 'filter="url(#turtleTexture)"';
  const defs = line
    ? ""
    : `
      <defs>
        <linearGradient id="turtleSkin" x1="110" y1="158" x2="542" y2="524" gradientUnits="userSpaceOnUse">
          <stop stop-color="#9be07f"/>
          <stop offset=".42" stop-color="#62c6c4"/>
          <stop offset="1" stop-color="#69a6ff"/>
        </linearGradient>
        <linearGradient id="turtleShell" x1="180" y1="178" x2="480" y2="482" gradientUnits="userSpaceOnUse">
          <stop stop-color="#304c89"/>
          <stop offset=".46" stop-color="#1f836c"/>
          <stop offset="1" stop-color="#403d78"/>
        </linearGradient>
        <filter id="turtleTexture" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="12" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values=".25"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .13"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
      </defs>
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" role="img" aria-label="Mosaic turtle drawing">
      ${defs}
      <g ${texture} stroke="${stroke}" stroke-width="${line ? 8 : 5}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M447 314c27-65 83-97 139-74 29 12 46 40 43 72-49-18-89-5-120 38-22 31-49 24-62-36Z" fill="${skin}"/>
        <path d="M178 317c-28-61-85-88-139-62-29 14-43 43-38 74 46-21 87-12 121 29 24 29 50 20 56-41Z" fill="${skin}"/>
        <path d="M198 455c-45 33-58 82-28 119 18 22 52 29 84 17-31-36-27-73 10-110 24-24 8-49-66-26Z" fill="${skin}"/>
        <path d="M435 454c48 27 68 74 43 115-15 25-48 36-81 28 25-40 15-77-27-108-27-20-15-47 65-35Z" fill="${skin}"/>
        <path d="M289 164c-9-60 22-112 77-119 35-4 68 16 83 49-51 8-78 39-80 92-2 34-30 43-80-22Z" fill="${skin}"/>
        <path d="M124 340c0-121 86-214 202-214s202 93 202 214-86 213-202 213-202-92-202-213Z" fill="${shell}"/>
        <path d="M211 272c24-57 67-87 129-91 57 9 94 40 112 93-35 22-75 34-120 36-47 1-87-11-121-38Z" fill="${shellA}"/>
        <path d="M185 315c32 29 74 44 127 47-4 48-22 88-55 119-55-21-91-63-107-125 7-16 19-30 35-41Z" fill="${shellB}"/>
        <path d="M465 316c-31 28-72 44-124 47 4 48 22 88 55 119 54-22 90-64 106-127-7-15-19-28-37-39Z" fill="${shellC}"/>
        <path d="M285 363h86c4 50 20 90 49 120-25 18-56 28-94 28-36 0-68-10-94-29 31-31 49-70 53-119Z" fill="${shellD}"/>
        <path d="M215 271c37 25 77 38 121 38 42 0 80-12 114-35 11 15 17 30 18 46-37 30-83 46-137 48-58 2-108-15-149-51 4-18 15-33 33-46Z" fill="${shellE}"/>
        <path d="M211 272c-26 23-43 51-51 84" fill="none" stroke="${shellStroke}"/>
        <path d="M452 274c27 22 44 49 50 81" fill="none" stroke="${shellStroke}"/>
        <path d="M312 361c-4 49-22 89-55 120" fill="none" stroke="${shellStroke}"/>
        <path d="M341 363c4 48 22 88 55 119" fill="none" stroke="${shellStroke}"/>
        <path d="M184 317c40 36 89 53 147 51 55-2 101-18 137-48" fill="none" stroke="${shellStroke}"/>
        <path d="M232 482c26 19 58 29 94 29 38 0 69-10 94-28" fill="none" stroke="${shellStroke}"/>
        <path d="M290 165c24 18 51 26 80 23" fill="none"/>
        <path d="M322 97c27 5 49 20 66 45" fill="none" opacity=".22"/>
        <circle cx="396" cy="94" r="11" fill="${stroke}"/>
        <circle cx="356" cy="83" r="11" fill="${stroke}"/>
        <path d="M381 131c-13 9-28 11-45 5" fill="none"/>
        <path d="M507 350c22-14 47-20 75-17" fill="none" opacity=".35"/>
        <path d="M512 312c25-11 50-12 75-4" fill="none" opacity=".35"/>
        <path d="M120 359c-23-13-48-17-75-12" fill="none" opacity=".35"/>
        <path d="M115 321c-25-9-50-8-75 2" fill="none" opacity=".35"/>
        <path d="M218 570c-11-22-12-46-1-72" fill="none" opacity=".35"/>
        <path d="M428 574c7-24 3-48-12-71" fill="none" opacity=".35"/>
        <circle cx="234" cy="228" r="9" fill="${line ? "#ebe7df" : "#ffffff"}" opacity="${line ? ".85" : ".8"}" stroke="none"/>
        <circle cx="414" cy="230" r="7" fill="${line ? "#ebe7df" : "#ffffff"}" opacity="${line ? ".85" : ".75"}" stroke="none"/>
        <circle cx="266" cy="429" r="8" fill="${line ? "#ebe7df" : "#ffffff"}" opacity="${line ? ".85" : ".8"}" stroke="none"/>
        <circle cx="388" cy="418" r="10" fill="${line ? "#ebe7df" : "#ffffff"}" opacity="${line ? ".85" : ".75"}" stroke="none"/>
        <path d="M194 235c36-36 81-55 134-58 52 4 95 24 128 60" fill="none" opacity=".16"/>
        <path d="M163 303c46 54 102 81 168 79 67-2 121-29 163-81" fill="none" opacity=".15"/>
        <path d="M151 375c44 59 103 88 177 88 74 0 132-29 174-88" fill="none" opacity=".15"/>
        <path d="M190 466c42 39 88 59 137 59 50 0 95-20 135-60" fill="none" opacity=".15"/>
        <path d="M171 260c44 20 96 30 154 30 57 0 107-10 151-31" fill="none" opacity=".1"/>
        <path d="M152 336c54 27 114 39 180 37 62-2 115-15 160-39" fill="none" opacity=".1"/>
        <path d="M165 411c50 30 104 44 162 44 59 0 113-15 162-45" fill="none" opacity=".1"/>
        <path d="M207 499c37 22 77 33 120 33 42 0 81-11 118-34" fill="none" opacity=".1"/>
        <path d="M244 188c-16 39-20 79-10 121" fill="none" opacity=".1"/>
        <path d="M326 181c-8 44-7 88 2 132" fill="none" opacity=".1"/>
        <path d="M408 193c9 38 6 77-9 117" fill="none" opacity=".1"/>
        <path d="M213 326c-11 44-6 87 17 128" fill="none" opacity=".1"/>
        <path d="M326 367c-4 43-1 85 9 126" fill="none" opacity=".1"/>
        <path d="M441 324c11 43 5 86-18 129" fill="none" opacity=".1"/>
        <path d="M156 292c38 32 83 52 136 61" fill="none" opacity=".09"/>
        <path d="M363 351c51-10 94-31 129-63" fill="none" opacity=".09"/>
        <path d="M157 385c47 26 96 40 146 42" fill="none" opacity=".09"/>
        <path d="M355 426c51-4 98-20 139-47" fill="none" opacity=".09"/>
        <path d="M190 475c37 12 77 18 119 17" fill="none" opacity=".09"/>
        <path d="M343 491c41-2 78-10 112-26" fill="none" opacity=".09"/>
      </g>
    </svg>
  `;
}
