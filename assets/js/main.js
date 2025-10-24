// ===============================
// HaRié Boutique — main.js
// ===============================

// 1️⃣ AUTO-UPDATE YEAR IN FOOTER
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// 2️⃣ SMOOTH SCROLL FOR FOOTER LINKS
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// 3️⃣ FADE-IN EFFECT FOR PRODUCT CARDS (on scroll)
const fadeEls = document.querySelectorAll(".product-card");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up");
      }
    });
  },
  { threshold: 0.1 }
);

fadeEls.forEach((el) => observer.observe(el));

// 4️⃣ MODAL ENHANCEMENT: CLOSE ON BACKDROP CLICK
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();
    }
  });
});

// 5️⃣ OPTIONAL: AUTO FOCUS ON FIRST BUTTON WHEN MODAL OPENS
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("shown.bs.modal", () => {
    const btn = modal.querySelector(".btn");
    if (btn) btn.focus();
  });
});

// ===============================
// 6️⃣ FULLSCREEN PRODUCT IMAGE ZOOM
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modal img").forEach((img) => {
    img.addEventListener("click", () => {
      // Create zoom overlay
      const overlay = document.createElement("div");
      overlay.classList.add("zoom-overlay");

      const zoomedImg = document.createElement("img");
      zoomedImg.src = img.src;
      zoomedImg.alt = img.alt || "Zoomed Image";

      overlay.appendChild(zoomedImg);
      document.body.appendChild(overlay);
      document.body.classList.add("zoom-active");

      // Close when clicked
      overlay.addEventListener("click", () => {
        overlay.remove();
        document.body.classList.remove("zoom-active");
      });
    });
  });
});
