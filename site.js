const WAITLIST_STORAGE_KEY = "colorcut-waitlist-email";

const waitlistModal = document.querySelector("#waitlistModal");
const waitlistEmail = document.querySelector("#waitlistEmail");
const waitlistStatus = document.querySelector("#waitlistStatus");
const waitlistForm = document.querySelector("#waitlistForm");

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

function showWaitlist(event) {
  event?.preventDefault();
  waitlistModal.hidden = false;
  waitlistModal.setAttribute("aria-hidden", "false");
  waitlistStatus.textContent = "";
  window.setTimeout(() => waitlistEmail.focus(), 40);
}

function hideWaitlist() {
  waitlistModal.hidden = true;
  waitlistModal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-waitlist-open]").forEach((trigger) => {
  trigger.addEventListener("click", showWaitlist);
});

document.querySelector("#waitlistBackdrop").addEventListener("click", hideWaitlist);
document.querySelector("#waitlistCloseButton").addEventListener("click", hideWaitlist);

waitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = waitlistEmail.value.trim();
  if (!email) return;
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, email);
  } catch {
    // Keep the waitlist confirmation usable even if local storage is blocked.
  }
  waitlistStatus.textContent = "You're on the list. We'll keep Plus free for 6 months when early access opens.";
  waitlistForm.reset();
});

registerServiceWorker();
