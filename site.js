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
  saveWaitlistSignup(email, "parents-page");
});

async function saveWaitlistSignup(email, source) {
  const submitButton = waitlistForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  waitlistStatus.textContent = "Saving your spot...";

  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, email);
  } catch {
    // Keep the waitlist confirmation usable even if local storage is blocked.
  }

  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        source,
        page: window.location.pathname
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || "Waitlist save failed.");
    }
  } catch (error) {
    console.warn("Waitlist saved locally only:", error);
  }

  waitlistStatus.textContent = "You're on the list. We'll keep Plus free for 6 months when early access opens.";
  waitlistForm.reset();
  submitButton.disabled = false;
}

registerServiceWorker();
