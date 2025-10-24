document.addEventListener("DOMContentLoaded", () => {
  const homeGrid = document.querySelector("#homeProductGrid");
  const shopGrid = document.querySelector("#product-grid");
  const isShop = !!shopGrid;
  const grid = isShop ? shopGrid : homeGrid;
  if (!grid) return;

  const dataSource = "data/products.json";

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

      // Determine seasonal badge
      const month = new Date().getMonth() + 1;
      let seasonalBadge = "", badgeClass = "";
      if (month >= 8 && month <= 10) { seasonalBadge = "Special Offer"; badgeClass = "special"; }
      else if (month === 11) { seasonalBadge = "Black Friday Deal"; badgeClass = "black-friday"; }
      else if (month === 12) { seasonalBadge = "Christmas Deal"; badgeClass = "christmas"; }
      else if (month === 1) { seasonalBadge = "New Year Offer"; badgeClass = "special"; }

      displayProducts.forEach(p => {
        const inStock = p.in_stock !== false; // Default true if not specified
        const badgeLabel = p.badge || seasonalBadge || "";
        const customClass = p.badge ? "" : badgeClass;

        // Price logic
        const discounted = p.discount
          ? Math.round(p.price * (1 - p.discount / 100))
          : null;
        const priceDisplay = p.discount
          ? `<span class="old-price">UGX ${p.price.toLocaleString()}</span>
             <span class="new-price">UGX ${discounted.toLocaleString()}</span>`
          : `<span class="new-price">UGX ${p.price.toLocaleString()}</span>`;

        // Stock visuals
        const outOfStockBadge = !inStock
          ? `<span class="stock-badge">Out of Stock</span>`
          : "";
        const stockDim = !inStock ? "opacity-50" : "";

        // Product card
        const card = `
          <div class="col position-relative" data-category="${p.category.toLowerCase()}">
            <div class="product-card text-center position-relative ${stockDim}"
                 ${inStock ? `data-bs-toggle="modal" data-bs-target="#modal-${p.id}"` : ""}>
              ${badgeLabel ? `<span class="promo-badge ${customClass}">${badgeLabel}</span>` : ""}
              ${outOfStockBadge}
              <img src="${p.image}" class="img-fluid" alt="${p.name}" />
              <h5 class="mt-3">${p.name}</h5>
              <p class="text-muted">${p.category} Collection</p>
              <div class="price-block">${priceDisplay}</div>
            </div>
          </div>
        `;

        // Product modal (only if in stock)
        const modal = inStock
          ? `
            <div class="modal fade" id="modal-${p.id}" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 shadow-lg">
                  <button type="button" class="modal-back-btn" data-bs-dismiss="modal">← Back</button>
                  <button type="button" class="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">×</button>
                  <div class="row g-0">
                    <div class="col-md-6">
                      <img src="${p.image}" class="img-fluid rounded-start" alt="${p.name}" />
                    </div>
                    <div class="col-md-6 p-4 d-flex flex-column justify-content-center">
                      <h4 class="fw-bold mb-2">${p.name}</h4>
                      <p class="text-muted mb-2">${p.category} Collection</p>
                      <p>${p.description}</p>
                      <div class="price-block mb-3">${priceDisplay}</div>
                      <div class="d-flex gap-2">
                        <a href="tel:+256762268702" class="btn btn-outline-dark flex-grow-1">
                          <i class="bi bi-telephone"></i> Call
                        </a>
                        <a href="https://wa.me/256776118772?text=Hello! I'm interested in ${encodeURIComponent(
                          p.name
                        )}" class="btn btn-success flex-grow-1">
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

        grid.insertAdjacentHTML("beforeend", card);
        if (modal) document.body.insertAdjacentHTML("beforeend", modal);
      });

      // Filtering (shop page)
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
