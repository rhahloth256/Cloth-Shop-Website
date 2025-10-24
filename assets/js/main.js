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

// FLASH PROMOTION BANNER
document.addEventListener("DOMContentLoaded", () => {
  const promos = [
    "🚚 Free Delivery within Lira",
    "💥 Discounts on Selected Products",
    "📞 Call or Whatsapp Us to Order"
  ];

  const flashText = document.getElementById("flashText");
  let i = 0;

  function showPromo() {
    flashText.textContent = promos[i];
    flashText.classList.add("flash-in");
    setTimeout(() => flashText.classList.remove("flash-in"), 800);
    i = (i + 1) % promos.length;
  }

  showPromo(); // Show the first immediately
  setInterval(showPromo, 3000);
});

// === BACK TO TOP BUTTON ===
document.addEventListener("DOMContentLoaded", () => {
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.style.display = "flex";
    } else {
      backToTop.style.display = "none";
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});


