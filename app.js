const DEFAULT_GRID = { cols: 3, rows: 3 };
const SVG_NS = "http://www.w3.org/2000/svg";
const PIECE_PAD_RATIO = 0.32;
const PIECE_OFFSCREEN_RATIO = 0.46;
const MOBILE_PIECE_OFFSCREEN_RATIO = 0.28;
const MOBILE_LOOSE_BOTTOM_RESERVE = 148;
const BRUSH_SIZE = 42;
const COLOR_COMPLETE_RATIO = 0.68;
const PROFILE_STORAGE_KEY = "snapuzzle-profile-v1";
const WAITLIST_STORAGE_KEY = "snapuzzle-waitlist-email";
const PARENT_AUTH_STORAGE_KEY = "snapuzzle-parent-auth-v1";
const LOGIN_EMAIL_COOLDOWN_MS = 90000;

const avatarOptions = [
  { id: "core", label: "C", color: "#172026" },
  { id: "sun", label: "S", color: "#f5b82e" },
  { id: "leaf", label: "L", color: "#4f9f70" },
  { id: "wave", label: "W", color: "#3f93bd" },
  { id: "rose", label: "R", color: "#d96a6a" },
  { id: "violet", label: "V", color: "#7d6ad9" }
];

const categories = [
  { id: "animals", name: "Animals", tier: "free" },
  { id: "landmarks", name: "Landmarks", tier: "free" },
  { id: "nature", name: "Nature", tier: "free" },
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
    src: "assets/red-panda.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "sea-turtle",
    name: "Sea Turtle",
    category: "animals",
    src: "assets/sea-turtle.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "tiger",
    name: "Tiger",
    category: "animals",
    src: "assets/tiger.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "deer",
    name: "Deer",
    category: "animals",
    src: "assets/deer.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "koala",
    name: "Koala",
    category: "animals",
    src: "assets/koala.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "penguin",
    name: "Penguin",
    category: "animals",
    src: "assets/penguin.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "elephant",
    name: "Elephant",
    category: "animals",
    src: "assets/elephant.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "owl",
    name: "Owl",
    category: "animals",
    src: "assets/owl.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "giraffe",
    name: "Giraffe",
    category: "animals",
    src: "assets/giraffe.webp",
    aspect: 1,
    grid: { cols: 3, rows: 3 },
    targetRatio: 0.78
  },
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    category: "landmarks",
    src: "assets/eiffel-tower.webp",
    aspect: 2 / 3,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.84
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    category: "landmarks",
    src: "assets/taj-mahal.webp",
    aspect: 3 / 2,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "statue-of-liberty",
    name: "Statue of Liberty",
    category: "landmarks",
    src: "assets/statue-of-liberty.webp",
    aspect: 941 / 1672,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "sydney-opera-house",
    name: "Sydney Opera House",
    category: "landmarks",
    src: "assets/sydney-opera-house.webp",
    aspect: 3 / 2,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86
  },
  {
    id: "alpine-mirror-lake",
    name: "Alpine Mirror Lake",
    category: "nature",
    src: "assets/alpine-mirror-lake.webp",
    aspect: 1,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86,
    style: "photo"
  },
  {
    id: "aurora-pine-forest",
    name: "Aurora Pine Forest",
    category: "nature",
    src: "assets/aurora-pine-forest.webp",
    aspect: 1,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86,
    style: "photo"
  },
  {
    id: "tropical-coral-reef",
    name: "Tropical Coral Reef",
    category: "nature",
    src: "assets/tropical-coral-reef.webp",
    aspect: 1,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86,
    style: "photo"
  },
  {
    id: "desert-canyon-glow",
    name: "Desert Canyon Glow",
    category: "nature",
    src: "assets/desert-canyon-glow.webp",
    aspect: 1,
    grid: { cols: 4, rows: 4 },
    targetRatio: 0.86,
    style: "photo"
  },
  {
    id: "t-rex",
    name: "T-Rex",
    category: "dinosaurs",
    src: "assets/t-rex.webp",
    aspect: 941 / 1672,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "triceratops",
    name: "Triceratops",
    category: "dinosaurs",
    src: "assets/triceratops.webp",
    aspect: 1470 / 1070,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "rocket",
    name: "Rocket",
    category: "space",
    src: "assets/rocket.webp",
    aspect: 1054 / 1492,
    grid: { cols: 5, rows: 5 },
    targetRatio: 0.88,
    tier: "plus"
  },
  {
    id: "astronaut",
    name: "Astronaut",
    category: "space",
    src: "assets/astronaut.webp",
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
  galleryPrevButton: document.querySelector("#galleryPrevButton"),
  galleryNextButton: document.querySelector("#galleryNextButton"),
  studioView: document.querySelector("#studioView"),
  parentButton: document.querySelector("#parentButton"),
  profileButton: document.querySelector("#profileButton"),
  profileButtonAvatar: document.querySelector("#profileButtonAvatar"),
  galleryButton: document.querySelector("#galleryButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  brand: document.querySelector(".brand"),
  puzzleBoard: document.querySelector("#puzzleBoard"),
  colorBoard: document.querySelector("#colorBoard"),
  ghostArt: document.querySelector("#ghostArt"),
  slotLayer: document.querySelector("#slotLayer"),
  pieceLayer: document.querySelector("#pieceLayer"),
  completePop: document.querySelector("#completePop"),
  loadingSurface: document.querySelector("#loadingSurface"),
  spreadButton: document.querySelector("#spreadButton"),
  colorArt: document.querySelector("#colorArt"),
  colorCanvas: document.querySelector("#colorCanvas"),
  scratchComplete: document.querySelector("#scratchComplete"),
  finishSuggestions: document.querySelector("#finishSuggestions"),
  finishTray: document.querySelector("#finishTray"),
  finishLibraryButton: document.querySelector("#finishLibraryButton"),
  finishRestartButton: document.querySelector("#finishRestartButton"),
  activityHint: document.querySelector("#activityHint"),
  parentModal: document.querySelector("#parentModal"),
  parentBackdrop: document.querySelector("#parentBackdrop"),
  parentCloseButton: document.querySelector("#parentCloseButton"),
  parentGateStep: document.querySelector("#parentGateStep"),
  parentPanelStep: document.querySelector("#parentPanelStep"),
  parentGateQuestion: document.querySelector("#parentGateQuestion"),
  parentGateAnswer: document.querySelector("#parentGateAnswer"),
  parentGateSubmit: document.querySelector("#parentGateSubmit"),
  parentGateError: document.querySelector("#parentGateError"),
  plusSubscribeButton: document.querySelector("#plusSubscribeButton"),
  billingToggle: document.querySelector("#billingToggle"),
  plusPriceLabel: document.querySelector("#plusPriceLabel"),
  plusPriceNote: document.querySelector("#plusPriceNote"),
  parentCheckoutStatus: document.querySelector("#parentCheckoutStatus"),
  parentPanelLoginButton: document.querySelector("#parentPanelLoginButton"),
  parentAuthModal: document.querySelector("#parentAuthModal"),
  parentAuthBackdrop: document.querySelector("#parentAuthBackdrop"),
  parentAuthCloseButton: document.querySelector("#parentAuthCloseButton"),
  parentAuthForm: document.querySelector("#parentAuthForm"),
  parentAuthCopy: document.querySelector("#parentAuthCopy"),
  parentAuthFooter: document.querySelector("#parentAuthFooter"),
  parentAuthSummary: document.querySelector("#parentAuthSummary"),
  parentAuthEmailLabel: document.querySelector("#parentAuthEmailLabel"),
  parentAuthEditEmailButton: document.querySelector("#parentAuthEditEmailButton"),
  parentAuthManageBillingButton: document.querySelector("#parentAuthManageBillingButton"),
  parentAuthCancelPlanButton: document.querySelector("#parentAuthCancelPlanButton"),
  parentAuthLogoutButton: document.querySelector("#parentAuthLogoutButton"),
  parentAuthSubscribeButton: document.querySelector("#parentAuthSubscribeButton"),
  parentAuthEmailStep: document.querySelector("#parentAuthEmailStep"),
  parentAuthEmail: document.querySelector("#parentAuthEmail"),
  parentAuthSendButton: document.querySelector("#parentAuthSendButton"),
  parentAuthStatus: document.querySelector("#parentAuthStatus"),
  waitlistModal: document.querySelector("#waitlistModal"),
  waitlistBackdrop: document.querySelector("#waitlistBackdrop"),
  waitlistCloseButton: document.querySelector("#waitlistCloseButton"),
  waitlistForm: document.querySelector("#waitlistForm"),
  waitlistEmail: document.querySelector("#waitlistEmail"),
  waitlistStatus: document.querySelector("#waitlistStatus"),
  profileModal: document.querySelector("#profileModal"),
  profileBackdrop: document.querySelector("#profileBackdrop"),
  profileCloseButton: document.querySelector("#profileCloseButton"),
  profileAvatarPreview: document.querySelector("#profileAvatarPreview"),
  profileTitle: document.querySelector("#profileTitle"),
  profileEditNameButton: document.querySelector("#profileEditNameButton"),
  avatarPrevButton: document.querySelector("#avatarPrevButton"),
  avatarNextButton: document.querySelector("#avatarNextButton"),
  profileParentAuth: document.querySelector("#profileParentAuth"),
  profileParentAuthLabel: document.querySelector("#profileParentAuthLabel"),
  profileParentAuthButton: document.querySelector("#profileParentAuthButton"),
  profileSubscribeButton: document.querySelector("#profileSubscribeButton"),
  profileStats: document.querySelector("#profileStats"),
  profileDetail: document.querySelector("#profileDetail"),
  profilePuzzleGrid: document.querySelector("#profilePuzzleGrid")
};

const state = {
  stage: "pick",
  animal: null,
  category: "animals",
  difficulty: "classic",
  pieces: [],
  activePiece: null,
  activeSlot: null,
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
  gallerySilentScroll: false,
  galleryLoopCount: 0,
  resizeTimer: 0,
  parentGateAnswer: 0,
  parentUnlocked: false,
  parentIntent: null,
  parentAuth: loadParentAuth(),
  parentAuthPendingEmail: "",
  parentAuthCooldownUntil: 0,
  parentAuthCooldownTimer: 0,
  parentAuthBusy: false,
  parentCheckoutBusy: false,
  billingPlan: "monthly",
  profile: loadProfile(),
  profileSelectedPuzzleId: null,
  profileEditingName: false,
  activityStartedAt: 0,
  finishPromptTimer: 0,
  imagePromises: new Map()
};

installBrowserInteractionGuards();
registerServiceWorker();
renderPicker();
bindControls();
renderProfileButton();
renderParentAuth();
renderBillingPlan();
consumeParentAuthRedirect();
consumeCheckoutRedirect();
consumeBillingRedirect();
refreshParentAuth();
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

function loadProfile() {
  const fallback = createDefaultProfile();
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") return fallback;

    return {
      version: 1,
      name: sanitizeProfileName(stored.name) || fallback.name,
      avatar: avatarOptions.some((avatar) => avatar.id === stored.avatar) ? stored.avatar : fallback.avatar,
      completions: stored.completions && typeof stored.completions === "object" ? stored.completions : {}
    };
  } catch {
    return fallback;
  }
}

function loadParentAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(PARENT_AUTH_STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") return null;
    if (!stored.session?.accessToken || !stored.session?.refreshToken || !stored.user?.email) return null;
    return stored;
  } catch {
    return null;
  }
}

function saveParentAuth(auth) {
  state.parentAuth = auth;
  try {
    if (auth) {
      localStorage.setItem(PARENT_AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(PARENT_AUTH_STORAGE_KEY);
    }
  } catch {
    // Parent auth stays in memory if local storage is unavailable.
  }
}

function createDefaultProfile() {
  const names = ["Color Maker", "Puzzle Star", "Cut Artist", "Bright Builder"];
  const index = Math.floor(Math.random() * names.length);
  return {
    version: 1,
    name: names[index],
    avatar: avatarOptions[index % avatarOptions.length].id,
    completions: {}
  };
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profile));
  } catch {
    // Progress is local-only for free profiles; if storage is unavailable, keep the session state.
  }
}

function sanitizeProfileName(name) {
  return String(name || "").replace(/\s+/g, " ").trim().slice(0, 18);
}

function avatarById(id) {
  return avatarOptions.find((avatar) => avatar.id === id) || avatarOptions[0];
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
  dom.galleryPrevButton?.addEventListener("click", () => scrollGalleryByStep(-1));
  dom.galleryNextButton?.addEventListener("click", () => scrollGalleryByStep(1));
}

function renderCategoryTabs() {
  dom.categoryTabs.innerHTML = categories
    .map((category) => {
      const active = category.id === state.category;
      const locked = category.tier === "plus";
      return `
        <button class="category-tab${active ? " is-active" : ""}${locked ? " is-locked" : ""}" type="button" data-category="${category.id}" role="tab" aria-selected="${active}" aria-label="${category.name}${locked ? ", Snapuzzle Plus preview" : ""}">
          ${categoryIcon(category.id)}
          <span>${category.name}</span>
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
        <button class="difficulty-tab${active ? " is-active" : ""}${locked ? " is-locked" : ""}" type="button" data-difficulty="${option.id}" role="tab" aria-selected="${active}" aria-label="${option.name}, ${option.label}${locked ? ", Snapuzzle Plus" : ""}">
          ${difficultyIcon(option.id)}
          <span>${option.name}</span>
          <small>${option.label}</small>
        </button>
      `;
    })
    .join("");
}

function categoryIcon(id) {
  const icons = {
    animals: `<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 11.2c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5Zm9.4 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5ZM12 19.3c-3 0-5.4-1.5-5.4-3.5 0-2.2 2.2-4.7 5.4-4.7s5.4 2.5 5.4 4.7c0 2-2.4 3.5-5.4 3.5Z"/></svg>`,
    landmarks: `<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.2 5.4 8v1.9h13.2V8L12 4.2Zm-4.7 7.1v6.2H5.4v2.1h13.2v-2.1h-1.9v-6.2h-2v6.2h-1.8v-6.2h-1.8v6.2H9.3v-6.2h-2Z"/></svg>`,
    nature: `<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 19.6c-4.5 0-7.5-2.4-7.5-6.2 0-4.6 4.5-7.9 12.9-8.8 1.2 8.2-1.7 15-5.4 15Zm-.8-3.4c1.6-3.3 3.3-5.6 5.4-7.6-3.2 1.1-5.8 3.3-7.7 6.4l2.3 1.2Z"/></svg>`,
    dinosaurs: `<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 15.8c0-4.2 3.2-7.4 7.7-7.4h2.5l1.8-2.2 2 .9-1.3 3.2 2.1 1.8-1.1 1.8-2.7-.8c-.6 3.8-3.5 6.5-7.1 6.5-2.3 0-3.9-1.4-3.9-3.8Zm3.1-.1c0 1 .7 1.5 1.6 1.5 1.5 0 2.7-1.1 3.1-2.9H9.1c-.5.3-.8.8-.8 1.4Z"/></svg>`,
    space: `<svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.1 4.2c2.3 1 3.8 2.9 4.5 5.3l2.2 1.2-1.5 2.2c-.2 2.1-1 3.9-2.5 5.3l-2.5-.8-3.2 3.1-1.3-1.3 1.2-3.6-3.6 1.2-1.3-1.3 3.1-3.2-.8-2.5c1.4-1.5 3.2-2.3 5.3-2.5l2.2-1.5-1.8-1.6Zm1.5 5.2a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z"/></svg>`
  };
  return icons[id] || icons.animals;
}

function difficultyIcon(id) {
  const icons = {
    easy: `<svg class="tab-icon difficulty-icon difficulty-icon-easy" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 6.2h4.4c.3 0 .5.2.5.5v2.1c.7-.2 1.5.3 1.5 1.1s-.8 1.3-1.5 1.1v4.2c0 .3-.2.5-.5.5H7.2c-.3 0-.5-.2-.5-.5v-3.5c0-.5.5-.8.9-.5.7.4 1.5-.1 1.5-.9s-.8-1.3-1.5-.9c-.4.3-.9 0-.9-.5V6.7c0-.3.2-.5.5-.5Z"/></svg>`,
    classic: `<svg class="tab-icon difficulty-icon difficulty-icon-classic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.2h4.3c.3 0 .5.2.5.5v1.6c.7-.2 1.4.3 1.4 1.1s-.7 1.3-1.4 1.1v3.8c0 .3-.2.5-.5.5H6.5c-.3 0-.5-.2-.5-.5v-3.1c0-.5.5-.8.9-.5.7.4 1.5-.1 1.5-.9s-.8-1.3-1.5-.9c-.4.3-.9 0-.9-.5V8.7c0-.3.2-.5.5-.5Z"/><path d="M12.9 5.4h4.2c.3 0 .5.2.5.5v3.3c0 .5-.5.8-.9.5-.7-.4-1.5.1-1.5.9s.8 1.3 1.5.9c.4-.3.9 0 .9.5v3.2c0 .3-.2.5-.5.5h-4.2c-.3 0-.5-.2-.5-.5v-1.8c-.8.3-1.6-.3-1.6-1.1s.8-1.4 1.6-1.1V5.9c0-.3.2-.5.5-.5Z"/></svg>`,
    plus: `<svg class="tab-icon difficulty-icon difficulty-icon-plus" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 8.3h4c.3 0 .5.2.5.5v1.4c.7-.2 1.4.3 1.4 1s-.7 1.2-1.4 1v3.5c0 .3-.2.5-.5.5h-4c-.3 0-.5-.2-.5-.5v-2.8c0-.5.5-.8.9-.5.7.4 1.4-.1 1.4-.8s-.7-1.2-1.4-.8c-.4.3-.9 0-.9-.5v-3c0-.3.2-.5.5-.5Z"/><path d="M10.5 5.5h4c.3 0 .5.2.5.5v3c0 .5-.5.8-.9.5-.7-.4-1.4.1-1.4.8s.7 1.2 1.4.8c.4-.3.9 0 .9.5v3c0 .3-.2.5-.5.5h-4c-.3 0-.5-.2-.5-.5v-1.5c-.7.2-1.4-.3-1.4-1s.7-1.2 1.4-1V6c0-.3.2-.5.5-.5Z"/><path d="M15 8.7h3.9c.3 0 .5.2.5.5v3c.7-.2 1.4.3 1.4 1s-.7 1.2-1.4 1v2.9c0 .3-.2.5-.5.5H15c-.3 0-.5-.2-.5-.5v-1.6c-.7.2-1.4-.3-1.4-1s.7-1.2 1.4-1V9.2c0-.3.2-.5.5-.5Z"/></svg>`
  };
  return icons[id] || icons.classic;
}

function renderDrawingCards() {
  const visibleItems = libraryItems.filter((item) => item.category === state.category);
  state.galleryLoopCount = visibleItems.length;
  dom.drawingGrid.innerHTML = visibleItems
    .map((animal, index) => {
      const locked = animal.tier === "plus";
      const styleClass = animal.style ? ` is-${animal.style}` : "";
      const recommended = state.category === "animals" && index === 0;
      return `
        <button class="drawing-card${styleClass}${locked ? " is-locked" : ""}${recommended ? " is-recommended" : ""}" type="button" data-animal="${animal.id}" data-category="${animal.category}" data-locked="${locked}" aria-label="${animal.name}${locked ? ", Snapuzzle Plus" : ""}">
          ${recommended ? `<span class="drawing-recommend">Start here</span>` : ""}
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
          <span class="drawing-preview" style="background-image: url('${animal.src}')" aria-hidden="true"></span>
          <span class="drawing-name">${animal.name}</span>
        </button>
      `;
    })
    .join("");
  scheduleImageWarmup(visibleItems.slice(0, 3).map((item) => item.src));
  state.galleryActiveIndex = Math.max(0, Math.min(state.galleryActiveIndex, Math.max(visibleItems.length - 1, 0)));
  jumpGalleryToCard(state.galleryActiveIndex);
  updateGalleryArrows();
}

function scheduleImageWarmup(srcList) {
  const run = () => srcList.forEach((src) => warmImage(src));
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 900 });
    return;
  }
  window.setTimeout(run, 120);
}

function bindControls() {
  dom.profileButton.addEventListener("click", showProfileModal);
  dom.parentButton.addEventListener("click", showParentModal);
  dom.galleryButton.addEventListener("click", handleGalleryButtonClick);
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);
  dom.spreadButton.addEventListener("click", spreadLoosePieces);
  dom.finishLibraryButton.addEventListener("click", showPicker);
  dom.finishRestartButton.addEventListener("click", restartCurrentAnimal);
  dom.finishSuggestions.addEventListener("click", handleFinishSuggestionClick);
  dom.parentBackdrop.addEventListener("click", hideParentModal);
  dom.parentCloseButton.addEventListener("click", hideParentModal);
  dom.profileBackdrop.addEventListener("click", hideProfileModal);
  dom.profileCloseButton.addEventListener("click", hideProfileModal);
  dom.profileEditNameButton.addEventListener("click", showProfileNameEditor);
  dom.profileTitle.addEventListener("input", updateProfileName);
  dom.profileTitle.addEventListener("blur", hideProfileNameEditor);
  dom.profileTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dom.profileTitle.blur();
    }
  });
  dom.parentGateSubmit.addEventListener("click", checkParentGate);
  dom.parentGateAnswer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkParentGate();
  });
  dom.parentPanelLoginButton.addEventListener("click", () => showParentAuthModal());
  dom.parentAuthBackdrop.addEventListener("click", hideParentAuthModal);
  dom.parentAuthCloseButton.addEventListener("click", hideParentAuthModal);
  dom.parentAuthSendButton.addEventListener("click", startParentAuth);
  dom.parentAuthEditEmailButton.addEventListener("click", editParentAccountEmail);
  dom.parentAuthManageBillingButton.addEventListener("click", openBillingPortal);
  dom.parentAuthCancelPlanButton.addEventListener("click", openBillingPortal);
  dom.parentAuthLogoutButton.addEventListener("click", logoutParentAccount);
  dom.parentAuthSubscribeButton.addEventListener("click", openSubscribeFromAuth);
  dom.parentAuthEmail.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      startParentAuth();
    }
  });
  dom.plusSubscribeButton.addEventListener("click", () => handleParentCheckout(state.billingPlan));
  dom.billingToggle.addEventListener("click", updateBillingPlan);
  dom.waitlistBackdrop.addEventListener("click", hideWaitlistModal);
  dom.waitlistCloseButton.addEventListener("click", hideWaitlistModal);
  dom.waitlistForm.addEventListener("submit", saveWaitlistEmail);
  dom.avatarPrevButton.addEventListener("click", () => cycleProfileAvatar(-1));
  dom.avatarNextButton.addEventListener("click", () => cycleProfileAvatar(1));
  dom.profileParentAuthButton.addEventListener("click", handleProfileAuthButton);
  dom.profileSubscribeButton.addEventListener("click", handleProfileBillingAction);
  dom.profilePuzzleGrid.addEventListener("click", selectProfilePuzzle);
  dom.profileDetail.addEventListener("click", handleProfileDetailClick);
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
    if (event.key === "Escape") {
      hideParentModal();
      hideProfileModal();
    }
  });
}

function showProfileModal() {
  state.profileEditingName = false;
  renderProfilePanel();
  document.body.classList.add("is-profile-modal-open");
  dom.profileModal.hidden = false;
  dom.profileModal.setAttribute("aria-hidden", "false");
}

function handleGalleryButtonClick(event) {
  event.preventDefault();
  if (!dom.profileModal.hidden) {
    hideProfileModal();
    return;
  }
  showPicker();
}

function hideProfileModal() {
  if (dom.profileModal.hidden) return;
  dom.profileModal.hidden = true;
  dom.profileModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-profile-modal-open");
  state.profileEditingName = false;
}

function renderProfileButton() {
  dom.profileButton.setAttribute("aria-label", "Profile");
}

function updateProfileAvatarSurface() {
  const avatar = avatarById(state.profile.avatar);
  dom.profileAvatarPreview.textContent = avatar.label;
  dom.profileAvatarPreview.style.setProperty("--avatar-color", avatar.color);
  renderProfileButton();
}

function renderProfilePanel() {
  const avatar = avatarById(state.profile.avatar);
  const selectedItem = selectedProfilePuzzle();
  const totals = selectedItem ? profilePuzzleTotals(selectedItem.id) : profileTotals();
  const mode = selectedItem ? "Puzzle stats" : "All puzzles";

  dom.profileModal.classList.toggle("is-editing-name", state.profileEditingName);
  dom.profileTitle.textContent = state.profile.name;
  dom.profileTitle.contentEditable = state.profileEditingName ? "plaintext-only" : "false";
  dom.profileAvatarPreview.textContent = avatar.label;
  dom.profileAvatarPreview.style.setProperty("--avatar-color", avatar.color);
  renderProfileStats(totals);

  renderProfileDetail();
  renderProfilePuzzleGrid();
  renderProfileButton();
  dom.profileStats.setAttribute("aria-label", mode);
}

function renderProfileStats(totals = selectedProfilePuzzle() ? profilePuzzleTotals(selectedProfilePuzzle().id) : profileTotals()) {
  const selectedItem = selectedProfilePuzzle();
  const mode = selectedItem ? "Puzzle stats" : "All puzzles";
  dom.profileStats.innerHTML = `
    <div>
      <strong>${totals.completed}</strong>
      <span>Completed</span>
    </div>
    <div>
      <strong>${totals.plays}</strong>
      <span>Total plays</span>
    </div>
    <div>
      <strong>${formatDuration(totals.bestTime)}</strong>
      <span>Best time</span>
    </div>
  `;
  dom.profileStats.setAttribute("aria-label", mode);
}

function renderProfileDetail() {
  const item = selectedProfilePuzzle();
  if (!item) {
    dom.profileDetail.innerHTML = "";
    return;
  }

  const stats = puzzleStats(item.id);
  const locked = item.tier === "plus";
  const completed = stats.plays > 0;

  dom.profileDetail.innerHTML = `
    <div class="profile-detail-copy">
      <span>${locked ? "Plus" : completed ? "Done" : "Open"}</span>
      <strong>${item.name}</strong>
      <small>${completed ? `${stats.plays}x · ${formatDuration(stats.bestTime)} · ${formatDate(stats.lastCompletedAt)}` : locked ? "Plus" : "0x"}</small>
    </div>
    <button class="profile-play-button" type="button" data-profile-play="${item.id}" aria-label="${locked ? `${item.name} is locked` : `Play ${item.name}`}" ${locked ? "disabled" : ""}>
      <img src="assets/icon-library-puzzles.webp" width="512" height="512" alt="" draggable="false" />
      <span>${locked ? "Locked" : completed ? "Play again" : "Play"}</span>
    </button>
  `;
}

function renderProfilePuzzleGrid() {
  const hasFilter = Boolean(state.profileSelectedPuzzleId);
  dom.profilePuzzleGrid.innerHTML = libraryItems
    .map((item) => {
      const stats = puzzleStats(item.id);
      const locked = item.tier === "plus";
      const selected = item.id === state.profileSelectedPuzzleId;
      const dimmed = hasFilter && !selected;
      const styleClass = item.style ? ` is-${item.style}` : "";
      const dimensions = imageDimensions(item);
      const unfinished = !locked && !stats.plays;
      return `
        <button class="profile-puzzle${styleClass}${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}${locked ? " is-locked" : ""}${unfinished ? " is-undone" : ""}${stats.plays ? " is-complete" : ""}" type="button" data-profile-puzzle="${item.id}" aria-label="${item.name}">
          ${
            locked
              ? `<span class="profile-lock" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7.2 10V8.2a4.8 4.8 0 0 1 9.6 0V10h1.1c.72 0 1.3.58 1.3 1.3v7.1c0 .72-.58 1.3-1.3 1.3H6.1c-.72 0-1.3-.58-1.3-1.3v-7.1c0-.72.58-1.3 1.3-1.3h1.1Zm2.4 0h4.8V8.2a2.4 2.4 0 0 0-4.8 0V10Z" />
                  </svg>
                </span>`
              : ""
          }
          <img src="${item.src}" width="${dimensions.width}" height="${dimensions.height}" alt="" loading="lazy" decoding="async" draggable="false" />
          <span>${item.name}</span>
          <small>${locked ? "Plus" : stats.plays ? `x${stats.plays}` : "0"}</small>
        </button>
      `;
    })
    .join("");
}

function updateProfileName() {
  const name = sanitizeProfileName(dom.profileTitle.textContent);
  state.profile.name = name || "Color Maker";
  saveProfile();
  renderProfileButton();
}

function imageDimensions(item) {
  const maxSide = 900;
  const aspect = item.aspect || 1;
  if (aspect >= 1) {
    return {
      width: maxSide,
      height: Math.round(maxSide / aspect)
    };
  }

  return {
    width: Math.round(maxSide * aspect),
    height: maxSide
  };
}

function showProfileNameEditor() {
  state.profileEditingName = true;
  renderProfilePanel();
  window.setTimeout(() => {
    const range = document.createRange();
    range.selectNodeContents(dom.profileTitle);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    dom.profileTitle.focus();
  }, 20);
}

function hideProfileNameEditor() {
  state.profileEditingName = false;
  dom.profileTitle.textContent = state.profile.name;
  renderProfilePanel();
}

function cycleProfileAvatar(step) {
  const index = avatarOptions.findIndex((avatar) => avatar.id === state.profile.avatar);
  const nextIndex = (index + step + avatarOptions.length) % avatarOptions.length;
  state.profile.avatar = avatarOptions[nextIndex].id;
  saveProfile();
  updateProfileAvatarSurface();
  playPickSound();
}

function selectProfilePuzzle(event) {
  const button = event.target.closest("[data-profile-puzzle]");
  if (!button) return;
  state.profileSelectedPuzzleId = state.profileSelectedPuzzleId === button.dataset.profilePuzzle ? null : button.dataset.profilePuzzle;
  renderProfileDetail();
  renderProfileStats();
  updateProfilePuzzleSelection();
  playArrivalSound();
}

function updateProfilePuzzleSelection() {
  const hasFilter = Boolean(state.profileSelectedPuzzleId);
  dom.profilePuzzleGrid.querySelectorAll("[data-profile-puzzle]").forEach((button) => {
    const item = libraryItems.find((puzzle) => puzzle.id === button.dataset.profilePuzzle);
    const stats = puzzleStats(button.dataset.profilePuzzle);
    const selected = button.dataset.profilePuzzle === state.profileSelectedPuzzleId;
    const locked = item?.tier === "plus";
    button.classList.toggle("is-selected", selected);
    button.classList.toggle("is-dimmed", hasFilter && !selected);
    button.classList.toggle("is-undone", !locked && !stats.plays);
    button.classList.toggle("is-complete", Boolean(stats.plays));
    const count = button.querySelector("small");
    if (count) count.textContent = locked ? "Plus" : stats.plays ? `x${stats.plays}` : "0";
  });
}

function handleProfileDetailClick(event) {
  const button = event.target.closest("[data-profile-play]");
  if (!button || button.disabled) return;
  hideProfileModal();
  selectAnimal(button.dataset.profilePlay);
}

function firstCompletedPuzzleId() {
  const completed = libraryItems.find((item) => puzzleStats(item.id).plays > 0);
  return completed?.id || null;
}

function firstFreePuzzleId() {
  return libraryItems.find((item) => item.tier !== "plus")?.id || libraryItems[0]?.id || null;
}

function selectedProfilePuzzle() {
  if (!state.profileSelectedPuzzleId) return null;
  return libraryItems.find((item) => item.id === state.profileSelectedPuzzleId) || null;
}

function puzzleStats(id) {
  return state.profile.completions[id] || {
    plays: 0,
    bestTime: 0,
    lastDuration: 0,
    lastCompletedAt: 0
  };
}

function profileTotals() {
  const values = Object.values(state.profile.completions);
  return {
    completed: values.filter((stats) => stats.plays > 0).length,
    plays: values.reduce((total, stats) => total + (stats.plays || 0), 0),
    bestTime: values.reduce((best, stats) => {
      if (!stats.bestTime) return best;
      return best ? Math.min(best, stats.bestTime) : stats.bestTime;
    }, 0)
  };
}

function profilePuzzleTotals(id) {
  const stats = puzzleStats(id);
  return {
    completed: stats.plays ? 1 : 0,
    plays: stats.plays || 0,
    bestTime: stats.bestTime || 0
  };
}

function formatDuration(ms) {
  if (!ms) return "—";
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}s`;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function parentEmail() {
  return state.parentAuth?.user?.email || state.parentAuth?.profile?.email || "";
}

function isParentSignedIn() {
  return Boolean(state.parentAuth?.session?.accessToken && parentEmail());
}

function isParentPlusActive() {
  const status = String(state.parentAuth?.profile?.subscriptionStatus || "").toLowerCase();
  return status === "plus" || status === "active" || status === "trialing";
}

function parentSubscription() {
  return state.parentAuth?.profile?.subscription || null;
}

function parentSubscriptionDateLabel() {
  const subscription = parentSubscription();
  if (!subscription?.currentPeriodEnd) return "";

  const date = new Date(subscription.currentPeriodEnd);
  if (Number.isNaN(date.getTime())) return "";

  const label = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `Access through ${label}`;
}

function parentAuthCooldownSeconds() {
  return Math.max(0, Math.ceil((state.parentAuthCooldownUntil - Date.now()) / 1000));
}

function scheduleParentAuthCooldownRender() {
  window.clearTimeout(state.parentAuthCooldownTimer);
  if (!parentAuthCooldownSeconds()) {
    renderParentAuth(dom.parentAuthStatus.textContent);
    return;
  }
  state.parentAuthCooldownTimer = window.setTimeout(() => {
    renderParentAuth(dom.parentAuthStatus.textContent);
    scheduleParentAuthCooldownRender();
  }, 1000);
}

function renderParentAuth(message = "") {
  if (!dom.parentAuthForm) return;

  const signedIn = isParentSignedIn();
  const email = parentEmail();
  const plusActive = isParentPlusActive();
  const dateLabel = parentSubscriptionDateLabel();
  const cooldownSeconds = parentAuthCooldownSeconds();
  dom.parentAuthSummary.hidden = !signedIn;
  dom.parentAuthForm.hidden = signedIn;
  dom.parentAuthFooter.hidden = signedIn;
  dom.parentAuthEmailStep.hidden = signedIn;
  dom.parentAuthEmailLabel.textContent = email || "Account";
  dom.profileParentAuthLabel.textContent = signedIn
    ? `${plusActive ? "Plus active" : "Free account"} · ${dateLabel || email}`
    : "Plus access";
  dom.profileParentAuthButton.textContent = signedIn ? "Logout" : "Login";
  dom.profileSubscribeButton.hidden = false;
  dom.profileSubscribeButton.textContent = signedIn ? "Manage" : "Subscribe";
  dom.profileSubscribeButton.dataset.billingAction = signedIn ? "account" : "subscribe";
  dom.parentButton.hidden = false;
  dom.parentAuthManageBillingButton.hidden = !plusActive;
  dom.parentAuthCancelPlanButton.hidden = !plusActive;
  dom.parentAuthSendButton.textContent = cooldownSeconds
    ? `Try again in ${cooldownSeconds}s`
    : state.parentAuthPendingEmail && !signedIn
      ? "Send again"
      : "Send link";
  dom.parentAuthSendButton.disabled = state.parentAuthBusy || Boolean(cooldownSeconds);
  dom.parentAuthEmail.disabled = state.parentAuthBusy;
  dom.parentAuthCopy.textContent = signedIn
    ? "You are logged in."
    : "Enter the email used at checkout. Open the magic link on the device you want to log in.";
  dom.parentAuthStatus.textContent = message;

  if (state.parentAuthPendingEmail && !signedIn) {
    dom.parentAuthEmail.value = state.parentAuthPendingEmail;
  }
}

function renderParentCheckoutStatus(message = "") {
  if (dom.parentCheckoutStatus) {
    dom.parentCheckoutStatus.textContent = message;
  }
}

function updateBillingPlan(event) {
  const button = event.target.closest("[data-billing-plan]");
  if (!button || button.dataset.billingPlan === state.billingPlan) return;

  state.billingPlan = button.dataset.billingPlan === "yearly" ? "yearly" : "monthly";
  renderBillingPlan();
}

function renderBillingPlan() {
  const isYearly = state.billingPlan === "yearly";
  dom.billingToggle.querySelectorAll("[data-billing-plan]").forEach((button) => {
    const active = button.dataset.billingPlan === state.billingPlan;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  dom.plusPriceLabel.textContent = isYearly ? "$29/yr" : "$5/mo";
  dom.plusPriceNote.textContent = isYearly ? "Save with annual access" : "Simple monthly access";
  dom.plusSubscribeButton.textContent = isYearly ? "Subscribe yearly" : "Subscribe monthly";
  dom.plusSubscribeButton.dataset.checkoutPlan = state.billingPlan;
}

function showParentAuthModal(message = "") {
  dom.parentAuthModal.hidden = false;
  dom.parentAuthModal.setAttribute("aria-hidden", "false");
  renderParentAuth(message);
  window.setTimeout(() => {
    if (isParentSignedIn()) {
      dom.parentAuthCloseButton.focus();
      return;
    }
    dom.parentAuthEmail.focus();
  }, 40);
}

function hideParentAuthModal() {
  if (dom.parentAuthModal.hidden) return;
  dom.parentAuthModal.hidden = true;
  dom.parentAuthModal.setAttribute("aria-hidden", "true");
}

function setParentAuthBusy(isBusy) {
  state.parentAuthBusy = isBusy;
  renderParentAuth(dom.parentAuthStatus.textContent);
}

async function parentAuthRequest(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const error = new Error(data.message || "Something went wrong.");
    error.code = data.code || "";
    error.status = response.status;
    throw error;
  }
  return data;
}

async function openBillingPortal() {
  if (!state.parentAuth?.session?.accessToken) {
    showParentAuthModal("Sign in to manage billing.");
    return;
  }

  dom.profileSubscribeButton.disabled = true;
  const previousText = dom.profileSubscribeButton.textContent;
  dom.profileSubscribeButton.textContent = "Opening...";

  try {
    const response = await fetch("/api/create-billing-portal-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.parentAuth.session.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false || !data.url) {
      throw new Error(data.message || "Could not open billing management.");
    }
    window.location.assign(data.url);
  } catch (error) {
    showParentAuthModal(error.message || "Could not open billing management.");
  } finally {
    dom.profileSubscribeButton.disabled = false;
    dom.profileSubscribeButton.textContent = previousText;
  }
}

function handleProfileBillingAction() {
  if (dom.profileSubscribeButton.dataset.billingAction === "account") {
    showParentAuthModal();
    return;
  }

  state.parentIntent = "profile-subscribe";
  showParentModal();
}

function handleProfileAuthButton() {
  if (isParentSignedIn()) {
    logoutParentAccount();
    return;
  }
  showParentAuthModal();
}

function logoutParentAccount() {
  saveParentAuth(null);
  state.parentAuthPendingEmail = "";
  dom.parentAuthEmail.value = "";
  hideParentAuthModal();
  renderParentAuth("Logged out.");
}

function editParentAccountEmail() {
  saveParentAuth(null);
  state.parentAuthPendingEmail = "";
  state.parentAuthCooldownUntil = 0;
  dom.parentAuthEmail.value = "";
  renderParentAuth("Enter the new checkout email.");
  window.setTimeout(() => dom.parentAuthEmail.focus(), 40);
}

function openSubscribeFromAuth() {
  hideParentAuthModal();
  state.parentUnlocked = true;
  state.parentIntent = "auth-subscribe";
  showParentModal();
  focusParentPanel();
}

async function startParentAuth() {
  const email = String(dom.parentAuthEmail.value || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    renderParentAuth("Enter a valid email.");
    dom.parentAuthEmail.focus();
    return;
  }

  const cooldownSeconds = parentAuthCooldownSeconds();
  if (cooldownSeconds) {
    renderParentAuth(`Use the newest magic link. You can request another in ${cooldownSeconds}s.`);
    return;
  }

  setParentAuthBusy(true);
  renderParentAuth("Sending login email...");

  try {
    await parentAuthRequest("/api/auth-start", { email });
    state.parentAuthPendingEmail = email;
    state.parentAuthCooldownUntil = Date.now() + LOGIN_EMAIL_COOLDOWN_MS;
    renderParentAuth("Check your email. Open the newest link on this device.");
    scheduleParentAuthCooldownRender();
  } catch (error) {
    if (error.code === "email_rate_limit" || error.status === 429) {
      state.parentAuthCooldownUntil = Date.now() + 5 * 60 * 1000;
      scheduleParentAuthCooldownRender();
    }
    renderParentAuth(error.message || "Could not send the login email.");
  } finally {
    setParentAuthBusy(false);
  }
}

async function refreshParentAuth() {
  if (!state.parentAuth?.session?.refreshToken) {
    renderParentAuth();
    return;
  }

  const expiresAtMs = Number(state.parentAuth.session.expiresAt || 0) * 1000;
  if (expiresAtMs && expiresAtMs > Date.now() + 120000) {
    renderParentAuth();
    return;
  }

  try {
    const data = await parentAuthRequest("/api/auth-refresh", {
      refreshToken: state.parentAuth.session.refreshToken
    });
    saveParentAuth({
      version: 1,
      user: data.user,
      session: data.session,
      profile: data.profile
    });
    renderParentAuth();
  } catch {
    saveParentAuth(null);
    renderParentAuth();
  }
}

async function consumeParentAuthRedirect() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
  const expiresAt = hashParams.get("expires_at") || queryParams.get("expires_at");
  const expiresIn = hashParams.get("expires_in") || queryParams.get("expires_in");
  const tokenHash =
    hashParams.get("token_hash") ||
    queryParams.get("token_hash") ||
    hashParams.get("token") ||
    queryParams.get("token");
  const authType = hashParams.get("type") || queryParams.get("type") || "email";

  if (!accessToken && !tokenHash) return;

  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
  showParentAuthModal("Finishing sign in...");

  try {
    let data;

    if (accessToken && refreshToken) {
      const response = await fetch("/api/auth-me", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Could not finish sign in.");
      }
    } else {
      data = await parentAuthRequest("/api/auth-link", {
        tokenHash,
        type: authType
      });
    }

    const fallbackExpiresAt = Math.floor(Date.now() / 1000) + Number(expiresIn || 3600);
    saveParentAuth({
      version: 1,
      user: data.user,
      session: {
        accessToken: data.session?.accessToken || accessToken,
        refreshToken: data.session?.refreshToken || refreshToken,
        expiresAt: Number(data.session?.expiresAt || expiresAt || fallbackExpiresAt)
      },
      profile: data.profile
    });
    state.parentAuthPendingEmail = "";
    renderParentAuth("Logged in.");
    window.setTimeout(() => {
      hideParentAuthModal();
      showPicker();
    }, 450);
  } catch (error) {
    saveParentAuth(null);
    renderParentAuth(error.message || "This magic link may have already been used. Request a new link on this device.");
  }
}

function consumeCheckoutRedirect() {
  const queryParams = new URLSearchParams(window.location.search);
  const checkout = queryParams.get("checkout");
  if (!checkout) return;

  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);

  if (checkout === "success") {
    state.parentAuthPendingEmail = "";
    showParentAuthModal("Payment complete. Log in with your checkout email.");
    return;
  }

  if (checkout === "cancel") {
    state.parentUnlocked = true;
    showParentModal();
    renderParentCheckoutStatus("Checkout was canceled. You can continue whenever you're ready.");
  }
}

function consumeBillingRedirect() {
  const queryParams = new URLSearchParams(window.location.search);
  const billing = queryParams.get("billing");
  if (!billing) return;

  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
  if (billing === "return") {
    showProfileModal();
    renderParentAuth("Billing updated.");
  }
}

async function handleParentCheckout(plan = "monthly") {
  if (state.parentCheckoutBusy) return;

  state.parentCheckoutBusy = true;
  dom.plusSubscribeButton.disabled = true;
  renderParentCheckoutStatus("Opening secure checkout...");

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: isParentSignedIn() ? parentEmail() : "",
        plan: plan === "yearly" ? "yearly" : "monthly",
        source: "app-parent-panel"
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false || !data.url) {
      throw new Error(data.message || "Stripe checkout is not ready yet.");
    }
    window.location.assign(data.url);
  } catch (error) {
    renderParentCheckoutStatus(error.message || "Stripe checkout is not ready yet.");
  } finally {
    state.parentCheckoutBusy = false;
    dom.plusSubscribeButton.disabled = false;
  }
}

function focusParentPanel(message = "") {
  state.parentIntent = null;
  dom.parentModal.classList.add("is-unlocked");
  renderParentCheckoutStatus(message);
  dom.parentPanelStep.setAttribute("tabindex", "-1");
  dom.parentPanelStep.focus({ preventScroll: true });
}

function showParentModal() {
  dom.parentModal.hidden = false;
  dom.parentModal.setAttribute("aria-hidden", "false");
  dom.parentModal.classList.toggle("is-unlocked", state.parentUnlocked);
  if (state.parentUnlocked) {
    const message = state.parentIntent === "finish-plus" ? "Continue to Stripe to unlock Plus." : "";
    focusParentPanel(message);
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
  state.parentIntent = null;
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
  const message = state.parentIntent === "finish-plus" ? "Continue to Stripe to unlock Plus." : "";
  focusParentPanel(message);
}

function showWaitlistModal() {
  dom.waitlistModal.hidden = false;
  dom.waitlistModal.setAttribute("aria-hidden", "false");
  dom.waitlistStatus.textContent = "";
  window.setTimeout(() => dom.waitlistEmail.focus(), 40);
}

function hideWaitlistModal() {
  if (dom.waitlistModal.hidden) return;
  dom.waitlistModal.hidden = true;
  dom.waitlistModal.setAttribute("aria-hidden", "true");
}

async function saveWaitlistEmail(event) {
  event.preventDefault();
  const email = dom.waitlistEmail.value.trim();
  if (!email) return;
  const submitButton = dom.waitlistForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  dom.waitlistStatus.textContent = "Saving your spot...";

  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, email);
  } catch {
    // The form still confirms the signup locally if storage is unavailable.
  }

  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        source: "app",
        page: window.location.pathname,
        completedPuzzleId: state.animal?.id || null
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || "Waitlist save failed.");
    }
  } catch (error) {
    console.warn("Waitlist saved locally only:", error);
  }

  dom.waitlistStatus.textContent = "You're on the list. We'll keep Plus free for 6 months when early access opens.";
  dom.waitlistForm.reset();
  submitButton.disabled = false;
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
      if (!state.gallerySilentScroll) playArrivalSound();
    }
    state.gallerySilentScroll = false;
    updateGalleryArrows();
  }, 90);
}

function scrollGalleryByStep(direction) {
  ensureAudioContext();
  const cards = Array.from(dom.drawingGrid.querySelectorAll(".drawing-card"));
  if (!cards.length) return;

  const currentIndex = closestGalleryIndex();
  const nextIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));
  if (nextIndex === currentIndex) return;
  centerGalleryCard(nextIndex, "smooth");

  state.galleryActiveIndex = nextIndex;
  updateGalleryArrows();
  playPickSound();
}

function centerGalleryCard(index, behavior = "smooth") {
  const cards = Array.from(dom.drawingGrid.querySelectorAll(".drawing-card"));
  const target = cards[index];
  if (!target) return;

  const railRect = dom.drawingGrid.getBoundingClientRect();
  const cardRect = target.getBoundingClientRect();
  const offset = cardRect.left + cardRect.width / 2 - (railRect.left + railRect.width / 2);
  dom.drawingGrid.scrollBy({ left: offset, behavior });
}

function jumpGalleryToCard(index) {
  const cards = Array.from(dom.drawingGrid.querySelectorAll(".drawing-card"));
  const target = cards[index];
  if (!target) return;

  state.gallerySilentScroll = true;
  const previousBehavior = dom.drawingGrid.style.scrollBehavior;
  const previousSnap = dom.drawingGrid.style.scrollSnapType;
  dom.drawingGrid.style.scrollBehavior = "auto";
  dom.drawingGrid.style.scrollSnapType = "none";
  dom.drawingGrid.scrollLeft = target.offsetLeft + target.offsetWidth / 2 - dom.drawingGrid.clientWidth / 2;
  requestAnimationFrame(() => {
    dom.drawingGrid.style.scrollBehavior = previousBehavior;
    dom.drawingGrid.style.scrollSnapType = previousSnap;
  });
}

function updateGalleryArrows() {
  const cards = dom.drawingGrid.querySelectorAll(".drawing-card");
  const hasCards = cards.length > 0;
  const activeIndex = hasCards ? Math.max(0, Math.min(cards.length - 1, state.galleryActiveIndex)) : 0;
  const atStart = !hasCards || activeIndex <= 0;
  const atEnd = !hasCards || activeIndex >= cards.length - 1;

  if (dom.galleryPrevButton) {
    dom.galleryPrevButton.disabled = atStart;
    dom.galleryPrevButton.setAttribute("aria-disabled", String(atStart));
  }
  if (dom.galleryNextButton) {
    dom.galleryNextButton.disabled = atEnd;
    dom.galleryNextButton.setAttribute("aria-disabled", String(atEnd));
  }
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

function showFinishSuggestions() {
  dom.finishSuggestions.classList.add("is-visible");
  dom.finishSuggestions.setAttribute("aria-hidden", "false");
}

function hideFinishSuggestions() {
  dom.finishSuggestions.classList.remove("is-visible");
  dom.finishSuggestions.setAttribute("aria-hidden", "true");
}

function showScratchComplete() {
  dom.scratchComplete.classList.remove("is-visible");
  void dom.scratchComplete.offsetWidth;
  dom.scratchComplete.classList.add("is-visible");
  dom.scratchComplete.setAttribute("aria-hidden", "false");
}

function hideScratchComplete() {
  dom.scratchComplete.classList.remove("is-visible");
  dom.scratchComplete.setAttribute("aria-hidden", "true");
}

function showLoadingSurface() {
  dom.loadingSurface.classList.add("is-visible");
  dom.loadingSurface.setAttribute("aria-hidden", "false");
}

function hideLoadingSurface() {
  dom.loadingSurface.classList.remove("is-visible");
  dom.loadingSurface.setAttribute("aria-hidden", "true");
}

function hideFinishExperience() {
  window.clearTimeout(state.finishPromptTimer);
  hideFinishTray();
  hideFinishSuggestions();
  hideScratchComplete();
}

function handleFinishSuggestionClick(event) {
  const button = event.target.closest("[data-premium-teaser]");
  if (!button) return;

  ensureAudioContext();
  playPickSound();
  state.parentIntent = "finish-plus";
  showParentModal();
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
  dom.colorBoard.classList.remove("is-complete");
  dom.colorBoard.classList.remove("is-entering");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideLoadingSurface();
  hideFinishExperience();
  updateActivityHint("");
  dom.completePop.classList.remove("is-visible");
  dom.puzzleBoard.classList.remove("is-complete");
  dom.puzzleBoard.classList.remove("is-exiting");
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
  state.activityStartedAt = Date.now();

  dom.pickerView.classList.add("is-hidden");
  dom.studioView.classList.remove("is-hidden");
  dom.puzzleBoard.style.display = "";
  dom.puzzleBoard.classList.remove("is-complete");
  dom.puzzleBoard.classList.remove("is-exiting");
  dom.colorBoard.classList.add("is-hidden");
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorBoard.classList.remove("is-complete");
  dom.colorBoard.classList.remove("is-entering");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  dom.colorArt.classList.remove("is-floating");
  hideFinishExperience();
  showLoadingSurface();
  updateActivityHint("");
  dom.completePop.classList.remove("is-visible");
  dom.ghostArt.src = state.lineUrl;
  dom.colorArt.src = state.colorUrl;
  setStage("build");

  warmImage(state.lineUrl).finally(() =>
    requestAnimationFrame(() => {
      if (state.stage !== "build" || state.animal?.id !== id) return;
      buildPuzzle();
    })
  );
}

function warmImage(src) {
  if (state.imagePromises.has(src)) return state.imagePromises.get(src);

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      image.decode?.().then(resolve).catch(resolve) || resolve();
    };
    image.onerror = resolve;
    image.src = src;
  });

  state.imagePromises.set(src, promise);
  return promise;
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
  if (!isMobileBoard(boardWidth)) return 0;
  return Math.min(MOBILE_LOOSE_BOTTOM_RESERVE, Math.max(84, boardHeight * 0.21));
}

function isMobileBoard(boardWidth) {
  return Math.min(window.innerWidth || boardWidth, boardWidth) <= 820;
}

function pieceDragBounds(pieceWidth, pieceHeight, boardWidth, boardHeight, options = {}) {
  const offscreenRatio = isMobileBoard(boardWidth) ? MOBILE_PIECE_OFFSCREEN_RATIO : PIECE_OFFSCREEN_RATIO;
  const overflowX = Math.min(pieceWidth * offscreenRatio, boardWidth * 0.42);
  const overflowY = Math.min(pieceHeight * offscreenRatio, boardHeight * 0.42);
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
  const startX = Math.min(fromX, toX);
  const endX = Math.max(fromX, toX);
  const center = 0.5 + bias;
  const shoulder = 0.19;
  const neck = 0.115;
  const span = endX - startX;
  const x = (point) => startX + span * point;
  const segments = [
    lineSegment(startX, y, x(center - shoulder), y),
    curveSegment(
      x(center - shoulder),
      y,
      x(center - neck * 1.18),
      y,
      x(center - neck * 1.06),
      y + sign * amp * 0.42,
      x(center - neck * 0.78),
      y + sign * amp * 0.55
    ),
    curveSegment(
      x(center - neck * 0.78),
      y + sign * amp * 0.55,
      x(center - neck * 0.48),
      y + sign * amp * 1.15,
      x(center + neck * 0.48),
      y + sign * amp * 1.15,
      x(center + neck * 0.78),
      y + sign * amp * 0.55
    ),
    curveSegment(
      x(center + neck * 0.78),
      y + sign * amp * 0.55,
      x(center + neck * 1.06),
      y + sign * amp * 0.42,
      x(center + neck * 1.18),
      y,
      x(center + shoulder),
      y
    ),
    lineSegment(x(center + shoulder), y, endX, y)
  ];

  return edgeSegmentsToPath(segments, fromX > toX);
}

function verticalEdge(x, fromY, toY, sign, amp, bias) {
  const startY = Math.min(fromY, toY);
  const endY = Math.max(fromY, toY);
  const center = 0.5 + bias;
  const shoulder = 0.19;
  const neck = 0.115;
  const span = endY - startY;
  const y = (point) => startY + span * point;
  const segments = [
    lineSegment(x, startY, x, y(center - shoulder)),
    curveSegment(
      x,
      y(center - shoulder),
      x,
      y(center - neck * 1.18),
      x + sign * amp * 0.42,
      y(center - neck * 1.06),
      x + sign * amp * 0.55,
      y(center - neck * 0.78)
    ),
    curveSegment(
      x + sign * amp * 0.55,
      y(center - neck * 0.78),
      x + sign * amp * 1.15,
      y(center - neck * 0.48),
      x + sign * amp * 1.15,
      y(center + neck * 0.48),
      x + sign * amp * 0.55,
      y(center + neck * 0.78)
    ),
    curveSegment(
      x + sign * amp * 0.55,
      y(center + neck * 0.78),
      x + sign * amp * 0.42,
      y(center + neck * 1.06),
      x,
      y(center + neck * 1.18),
      x,
      y(center + shoulder)
    ),
    lineSegment(x, y(center + shoulder), x, endY)
  ];

  return edgeSegmentsToPath(segments, fromY > toY);
}

function lineSegment(x0, y0, x1, y1) {
  return {
    type: "L",
    start: { x: x0, y: y0 },
    end: { x: x1, y: y1 }
  };
}

function curveSegment(x0, y0, cx1, cy1, cx2, cy2, x1, y1) {
  return {
    type: "C",
    start: { x: x0, y: y0 },
    control1: { x: cx1, y: cy1 },
    control2: { x: cx2, y: cy2 },
    end: { x: x1, y: y1 }
  };
}

function edgeSegmentsToPath(segments, reverse = false) {
  const ordered = reverse ? [...segments].reverse() : segments;
  return ordered
    .map((segment) => {
      if (segment.type === "L") {
        const point = reverse ? segment.start : segment.end;
        return `L ${point.x} ${point.y}`;
      }

      if (reverse) {
        return `C ${segment.control2.x} ${segment.control2.y} ${segment.control1.x} ${segment.control1.y} ${segment.start.x} ${segment.start.y}`;
      }

      return `C ${segment.control1.x} ${segment.control1.y} ${segment.control2.x} ${segment.control2.y} ${segment.end.x} ${segment.end.y}`;
    })
    .join(" ");
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
  state.activeSlot = null;
  dom.puzzleBoard.classList.remove("is-complete");
  dom.puzzleBoard.classList.remove("is-exiting");
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
    const pieceShape = piecePath(col, row, tileW, tileH, pad, grid);

    const slot = document.createElementNS(SVG_NS, "svg");
    const slotShape = document.createElementNS(SVG_NS, "path");
    slot.setAttribute("class", "slot");
    slot.setAttribute("viewBox", `0 0 ${visualW} ${visualH}`);
    slot.style.width = `${visualW}px`;
    slot.style.height = `${visualH}px`;
    slot.style.left = `${snapX}px`;
    slot.style.top = `${snapY}px`;
    slotShape.setAttribute("class", "slot-outline");
    slotShape.setAttribute("d", pieceShape);
    slotShape.setAttribute("vector-effect", "non-scaling-stroke");
    slot.append(slotShape);
    dom.slotLayer.append(slot);

    const totalPieces = grid.cols * grid.rows;
    const piece = document.createElementNS(SVG_NS, "svg");
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
      slot,
      pointerId: null,
      dragOffsetX: 0,
      dragOffsetY: 0
    };

    piece.addEventListener("pointerdown", (event) => grabPiece(event, model));
    setPieceTransform(model);
    dom.pieceLayer.append(piece);
    state.pieces.push(model);
  }

  hideLoadingSurface();
  updateActivityHint("Move the pieces near the pale picture. They snap in place.");
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
  updateSlotHint(piece);
}

function dropPiece(event) {
  const piece = state.activePiece;
  if (!piece || event.pointerId !== piece.pointerId) return;

  if (piece.element.hasPointerCapture?.(event.pointerId)) {
    piece.element.releasePointerCapture(event.pointerId);
  }
  piece.element.classList.remove("is-dragging");
  piece.element.classList.remove("is-near-snap");
  clearSlotHint();
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
    piece.element.classList.add("is-snapping");
    piece.slot.classList.add("is-filled");
    piece.element.style.zIndex = String(1 + piece.index);
    setPieceTransform(piece);
    playSnapSound();
    pulseHaptic(10);
    window.setTimeout(() => piece.element.classList.remove("is-snapping"), 360);
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

function updateSlotHint(piece) {
  const distance = Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
  const nearDistance = Math.min(piece.width, piece.height) * 0.68;
  const near = distance <= nearDistance;

  piece.element.classList.toggle("is-near-snap", near);
  if (near && state.activeSlot !== piece.slot) {
    clearSlotHint();
    state.activeSlot = piece.slot;
    piece.slot.classList.add("is-near");
  } else if (!near && state.activeSlot === piece.slot) {
    clearSlotHint();
  }
}

function clearSlotHint() {
  if (!state.activeSlot) return;
  state.activeSlot.classList.remove("is-near");
  state.activeSlot = null;
}

function checkPuzzleComplete() {
  if (!state.pieces.length || !state.pieces.every((piece) => piece.snapped)) return;

  dom.puzzleBoard.classList.add("is-complete");
  dom.completePop.classList.add("is-visible");
  playCompleteSound();
  pulseHaptic([12, 42, 18]);
  window.setTimeout(() => {
    if (state.stage === "build") dom.puzzleBoard.classList.add("is-exiting");
  }, 760);
  window.setTimeout(() => {
    if (state.stage === "build") beginColoringMode();
  }, 1150);
}

function beginColoringMode() {
  setStage("color");
  hideLoadingSurface();
  hideFinishExperience();
  updateActivityHint("Scratch over the gray picture to reveal the color.");
  dom.puzzleBoard.style.display = "none";
  dom.puzzleBoard.classList.remove("is-exiting");
  dom.colorBoard.classList.remove("is-hidden");
  dom.colorBoard.classList.add("is-entering");
  dom.colorBoard.classList.remove("is-mask-ready");
  dom.colorBoard.classList.remove("is-complete");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  dom.colorArt.classList.remove("is-floating");
  prepareColorCanvas();
  window.setTimeout(() => dom.colorBoard.classList.remove("is-entering"), 620);
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
  dom.colorBoard.classList.remove("is-complete");
  dom.colorArt.classList.remove("is-visible");
  dom.colorArt.classList.remove("is-celebrating");
  hideFinishExperience();

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
  dom.colorArt.classList.add("is-floating");
  dom.colorBoard.classList.add("is-complete");
  recordPuzzleCompletion();
  showScratchComplete();
  window.clearTimeout(state.finishPromptTimer);
  state.finishPromptTimer = window.setTimeout(() => {
    if (state.stage !== "color" || !state.colorComplete) return;
    showFinishSuggestions();
    showFinishTray();
  }, 520);
  updateActivityHint("");
  playColorCompleteSound();
  pulseHaptic([14, 36, 22]);
}

function updateActivityHint(message) {
  if (!dom.activityHint) return;
  dom.activityHint.textContent = message;
  dom.activityHint.classList.toggle("is-visible", Boolean(message));
}

function pulseHaptic(pattern) {
  navigator.vibrate?.(pattern);
}

function recordPuzzleCompletion() {
  if (!state.animal) return;

  const now = Date.now();
  const duration = state.activityStartedAt ? now - state.activityStartedAt : 0;
  const previous = puzzleStats(state.animal.id);
  state.profile.completions[state.animal.id] = {
    plays: previous.plays + 1,
    bestTime: previous.bestTime && duration ? Math.min(previous.bestTime, duration) : duration || previous.bestTime,
    lastDuration: duration || previous.lastDuration,
    lastCompletedAt: now
  };
  state.profileSelectedPuzzleId = state.animal.id;
  saveProfile();
  renderProfileButton();
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
