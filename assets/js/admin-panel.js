const PRODUCTS_FILE = "data/products.json";
let products = [];
let currentProducts = [];
let editId = null;

document.addEventListener("DOMContentLoaded", loadProducts);

// ---------- Helpers ----------
function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Prefer a single text "size", but gracefully read other fields if present
function getSizeText(p = {}) {
  if (typeof p.size === "string" && p.size.trim()) return p.size.trim();
  if (typeof p.size_label === "string" && p.size_label.trim()) return p.size_label.trim();
  if (typeof p.dimensions === "string" && p.dimensions.trim()) return p.dimensions.trim();
  if (Array.isArray(p.sizes) && p.sizes.length) return p.sizes.join(", ");
  if (typeof p.size_options === "string" && p.size_options.trim()) return p.size_options.trim();
  return "";
}

// ✅ PREVIEW SELECTED IMAGE
document.addEventListener("change", (e) => {
  if (e.target.id === "productFile") {
    const file = e.target.files[0];
    const preview = document.getElementById("imagePreview");
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = "none";
    }
  }
});

// ✅ Upload helper
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/upload-image", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

// ✅ Load products
async function loadProducts() {
  try {
    showStatus("Loading products...", "info");
    const res = await fetch(PRODUCTS_FILE + "?t=" + Date.now());
    const data = await res.json();
    products = data.products || [];
    currentProducts = [...products];
    displayProducts(products);
    showStatus("✅ Products loaded", "success");
  } catch (err) {
    console.error(err);
    showStatus("❌ Failed to load products", "danger");
  }
}

// ✅ Display table
function displayProducts(arr) {
  const table = document.getElementById("productsTable");
  if (arr.length === 0) {
    table.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted">No products yet</td></tr>';
    return;
  }
  table.innerHTML = arr
    .map((p) => {
      const sizeTxt = getSizeText(p);
      return `
      <tr class="${p.in_stock === false ? "out-of-stock" : ""}">
        <td>${p.image ? `<img src="${escapeHTML(p.image)}" class="product-image-preview rounded">` : "-"}</td>
        <td>
          <strong>${escapeHTML(p.name || "")}</strong>
          ${p.badge ? ` <span class="badge bg-info ms-1">${escapeHTML(p.badge)}</span>` : ""}
          ${sizeTxt ? `<br><small class="text-muted">Size: ${escapeHTML(sizeTxt)}</small>` : ""}
        </td>
        <td><span class="badge bg-secondary">${escapeHTML(p.category || "")}</span></td>
        <td>
          UGX ${(p.price ?? 0).toLocaleString()}
          ${p.discount ? `<br><small class="text-success">${p.discount}% off</small>` : ""}
        </td>
        <td>
          <span class="badge ${p.in_stock === false ? "bg-danger" : "bg-success"}">
            ${p.in_stock === false ? "Out of Stock" : "In Stock"}
          </span>
        </td>
        <td>${p.featured ? '<span class="badge featured-badge">⭐</span>' : ""}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>`;
    })
    .join("");
}

function openAddModal() {
  editId = null;
  document.querySelector("#addProductModal .modal-title").textContent = "Add Product";
  document.getElementById("productForm").reset();
  document.getElementById("productInStock").checked = true;
  document.getElementById("productFeatured").checked = false;
  document.getElementById("imagePreview").style.display = "none";
  const sizeInput = document.getElementById("productSize");
  if (sizeInput) sizeInput.value = "";
}

// ✅ Add / Edit product
async function addProduct() {
  try {
    const fileInput = document.getElementById("productFile");
    let imageUrl = document.getElementById("productImage").value.trim();

    if (fileInput.files.length > 0) {
      showStatus("Uploading image...", "info");
      const uploadedUrl = await uploadImage(fileInput.files[0]);
      imageUrl = uploadedUrl;
      showStatus("✅ Image uploaded successfully!", "success");
    }

    const productFromForm = {
      id: editId || Date.now().toString(),
      name: document.getElementById("productName").value.trim(),
      category: document.getElementById("productCategory").value,
      price: parseInt(document.getElementById("productPrice").value, 10),
      description: document.getElementById("productDescription").value.trim(),
      image: imageUrl || "/assets/img/placeholder.jpg",
      featured: document.getElementById("productFeatured").checked,
      in_stock: document.getElementById("productInStock").checked,
      discount: document.getElementById("productDiscount").value
        ? parseInt(document.getElementById("productDiscount").value, 10)
        : null,
      badge: document.getElementById("productBadge").value.trim() || null,
      // 👇 NEW: size saved as plain text
      size: document.getElementById("productSize").value.trim() || null
    };

    if (!productFromForm.name || isNaN(productFromForm.price)) {
      showStatus("Please enter valid name and price.", "warning");
      return;
    }

    if (editId) {
      const i = products.findIndex((p) => p.id === editId);
      if (i !== -1) {
        const old = products[i] || {};
        // Merge to preserve any unknown fields (e.g., size_label/dimensions) unless overwritten
        products[i] = { ...old, ...productFromForm };
      }
      showStatus(`Product "${productFromForm.name}" updated locally.`, "warning");
    } else {
      // Add new product at the top of the list
      products.unshift(productFromForm);
      showStatus(`🆕 Product "${productFromForm.name}" added locally at the top.`, "success");
    }

    displayProducts(products);
    bootstrap.Modal.getInstance(document.getElementById("addProductModal")).hide();
    document.getElementById("productForm").reset();
    editId = null;
  } catch (err) {
    console.error(err);
    showStatus("❌ Upload failed: " + err.message, "danger");
  }
}

// ✅ Edit existing
function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;

  editId = p.id;
  document.querySelector("#addProductModal .modal-title").textContent = "Edit Product";
  document.getElementById("productName").value = p.name || "";
  document.getElementById("productCategory").value = p.category || "men";
  document.getElementById("productPrice").value = p.price ?? 0;
  document.getElementById("productDiscount").value = p.discount ?? "";
  document.getElementById("productImage").value =
    p.image && p.image !== "/assets/img/placeholder.jpg" ? p.image : "";
  document.getElementById("productBadge").value = p.badge ?? "";
  document.getElementById("productFeatured").checked = !!p.featured;
  document.getElementById("productInStock").checked = p.in_stock !== false;
  document.getElementById("productDescription").value = p.description || "";

  // 👇 NEW: prefill Size using the same priority used in display
  const sizeInput = document.getElementById("productSize");
  if (sizeInput) sizeInput.value = getSizeText(p);

  const preview = document.getElementById("imagePreview");
  if (p.image) {
    preview.src = p.image;
    preview.style.display = "block";
  }

  const modalEl = document.getElementById("addProductModal");
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// ✅ Delete
function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    products = products.filter((p) => p.id !== id);
    displayProducts(products);
    showStatus("Product deleted locally.", "warning");
  }
}

// ✅ Save to GitHub
async function saveToGitHub() {
  try {
    showStatus("Saving via Cloudflare Function...", "info");
    document.body.classList.add("loading");

    const res = await fetch("/save-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");

    currentProducts = [...products];
    showStatus("✅ Products saved successfully!", "success");
  } catch (err) {
    console.error(err);
    showStatus("❌ Save failed: " + err.message, "danger");
  } finally {
    document.body.classList.remove("loading");
  }
}

// ✅ Alert helper
function showStatus(message, type) {
  const alert = document.getElementById("statusAlert");
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.classList.remove("d-none");
  setTimeout(() => alert.classList.add("d-none"), 5000);
}
