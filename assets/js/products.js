document.addEventListener("DOMContentLoaded", () => {
  const homeGrid = document.querySelector("#homeProductGrid");
  const shopGrid = document.querySelector("#product-grid");
  const isShop = !!shopGrid;
  const grid = isShop ? shopGrid : homeGrid;
  if (!grid) return;

  // Config
  const dataSource = "data/products.json";
  const callNumber = "+256762268702";
  const whatsappNumber = "256776118772";

  // Badge class mapping (badges only if set in JSON)
  const classMap = (lbl) => {
    const k = (lbl || "").toLowerCase();
    if (k.includes("black friday")) return "black-friday";
    if (k.includes("christmas")) return "christmas";
    if (k.includes("new year")) return "special";
    if (k.includes("special")) return "special";
    return "";
  };

  fetch(dataSource)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const products = data.products || [];
      grid.innerHTML = "";

      // Show all in shop; only featured in home
      const displayProducts = isShop ? products : products.filter(p => p.featured);

      displayProducts.forEach((p, i) => {
        const id = String(p.id || `p-${i}-${Date.now()}`);
        const category = (p.category || "misc").toLowerCase();
        const inStock = p.in_stock !== false; // default true

        // 🔖 Badge (editor-driven only)
        const badgeLabel = (typeof p.badge === "string" && p.badge.trim()) ? p.badge.trim() : "";
        const badgeClass = classMap(badgeLabel);

        // 💸 Price (reverse-calc oldPrice only for 0<discount<100)
        const hasValidDiscount = typeof p.discount === "number" && p.discount > 0 && p.discount < 100;
        const oldPrice = hasValidDiscount ? Math.round(p.price / (1 - p.discount / 100)) : null;

        const priceDisplay = hasValidDiscount
          ? `<span class="old-price">UGX ${oldPrice.toLocaleString()}</span>
             <span class="new-price">UGX ${p.price.toLocaleString()}</span>`
          : `<span class="new-price">UGX ${p.price.toLocaleString()}</span>`;

        // 📏 Size (read-only, optional)
        const sizeText = (() => {
          if (typeof p.size === "string" && p.size.trim()) return p.size.trim();
          if (typeof p.size_label === "string" && p.size_label.trim()) return p.size_label.trim();
          if (typeof p.dimensions === "string" && p.dimensions.trim()) return p.dimensions.trim();
          if (Array.isArray(p.sizes) && p.sizes.length) return p.sizes.join(", ");
          if (typeof p.size_options === "string" && p.size_options.trim()) return p.size_options.trim();
          return "";
        })();
        const sizeLine = sizeText ? `<p class="mb-2"><strong>Size:</strong> ${sizeText}</p>` : "";

        // Stock visuals
        const outOfStockBadge = !inStock ? `<span class="stock-badge">Out of Stock</span>` : "";
        const stockDim = !inStock ? "opacity-50" : "";

        // 🧱 Card
        const card = `
          <div class="col position-relative" data-category="${category}">
            <div class="product-card text-center position-relative ${stockDim}"
                 ${inStock ? `data-bs-toggle="modal" data-bs-target="#modal-${id}"` : ""}>
              ${badgeLabel ? `<span class="promo-badge ${badgeClass}">${badgeLabel}</span>` : ""}
              ${outOfStockBadge}
              <img src="${p.image}" class="img-fluid rounded-start" alt="${p.name || "Product"}" />
              <h5 class="mt-3">${p.name || ""}</h5>
              <p class="text-muted">${p.category ? `${p.category} Collection` : ""}</p>
              <div class="price-block">${priceDisplay}</div>
            </div>
          </div>
        `;

        // 🪟 Modal (only if in stock)
        const modal = inStock
          ? `
            <div class="modal fade" id="modal-${id}" tabindex="-1" aria-hidden="true" data-product-name="${p.name || ""}">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg">
                  <button type="button" class="modal-back-btn" data-bs-dismiss="modal">← Back</button>
                  <button type="button" class="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">×</button>
                  <div class="row g-0">
                    <div class="col-md-6">
                      <img src="${p.image}" class="img-fluid rounded-start" alt="${p.name || "Product"}" />
                    </div>
                    <div class="col-md-6 p-4 d-flex flex-column justify-content-center">
                      <h4 class="fw-bold mb-2">${p.name || ""}</h4>
                      <p class="text-muted mb-2">${p.category ? `${p.category} Collection` : ""}</p>
                      <p>${p.description || ""}</p>
                      ${sizeLine}
                      <div class="price-block mb-3">${priceDisplay}</div>
                      <div class="d-flex gap-2">
                        <a href="tel:${callNumber}" class="btn btn-outline-dark flex-grow-1">
                          <i class="bi bi-telephone"></i> Call
                        </a>
                        <a class="btn btn-success flex-grow-1 btn-whatsapp" id="wa-${id}" target="_blank" rel="noopener">
                          <i class="bi bi-whatsapp"></i> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `
          : "";

        // Inject
        grid.insertAdjacentHTML("beforeend", card);
        if (modal) document.body.insertAdjacentHTML("beforeend", modal);

        // 🔗 WhatsApp message (includes static size if present)
        if (inStock) {
          const modalEl = document.getElementById(`modal-${id}`);
          const waBtn = document.getElementById(`wa-${id}`);
          const name = (modalEl?.dataset?.productName || p.name || "").trim();
          const sizePart = sizeText ? ` (Size: ${sizeText})` : "";
          const msg = `Hello! I'm interested in ${name}${sizePart}`;
          waBtn.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
        }
      });

      // 🔎 Filtering (shop page)
      if (isShop) {
        const filterButtons = document.querySelectorAll(".filter-buttons button");
        filterButtons.forEach(btn => {
          btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active", "btn-dark"));
            filterButtons.forEach(b => b.classList.add("btn-outline-dark"));
            btn.classList.add("active", "btn-dark");
            btn.classList.remove("btn-outline-dark");

            const filter = btn.dataset.filter;
            const cards = grid.querySelectorAll("[data-category]");
            cards.forEach(c => {
              const match = filter === "all" || c.dataset.category === filter;
              c.style.display = match ? "block" : "none";
            });
          });
        });
      }
    })
    .catch(err => console.error("Error loading products:", err));
});
