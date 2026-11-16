let catalog = [];
let selectedGame = null;
let selectedPackage = null;

const rupiah = value => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(value);

async function loadProducts() {
  try {
    const response = await fetch("./products.json");
    if (!response.ok) throw new Error("products.json tidak ditemukan");
    const data = await response.json();
    catalog = data.games || [];
    renderGames();
  } catch (error) {
    document.getElementById("gameGrid").innerHTML =
      '<p class="empty-state">Gagal memuat katalog. Jalankan melalui local server dan periksa products.json.</p>';
  }
}

function renderGames() {
  const grid = document.getElementById("gameGrid");
  grid.innerHTML = "";
  catalog.forEach(game => {
    const button = document.createElement("button");
    button.className = "game-card" + (selectedGame?.id === game.id ? " active" : "");
    button.type = "button";
    button.innerHTML = `<span class="game-icon">${game.icon}</span><strong>${game.name}</strong><small>${game.subtitle}</small>`;
    button.addEventListener("click", () => {
      selectedGame = game;
      selectedPackage = null;
      renderGames();
      renderPackages();
      updateSummary();
      document.getElementById("order").scrollIntoView({behavior:"smooth", block:"start"});
    });
    grid.appendChild(button);
  });
}

function renderPackages() {
  const grid = document.getElementById("packageGrid");
  grid.innerHTML = "";
  if (!selectedGame) {
    grid.innerHTML = '<div class="empty-state">Pilih game terlebih dahulu.</div>';
    return;
  }
  selectedGame.packages.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "package";
    button.innerHTML = `<strong>${item.name}</strong><small>${rupiah(item.price)}</small>`;
    button.addEventListener("click", () => {
      selectedPackage = item;
      document.querySelectorAll(".package").forEach(el => el.classList.remove("selected"));
      button.classList.add("selected");
      updateSummary();
    });
    grid.appendChild(button);
  });
}

function updateSummary() {
  const playerId = document.getElementById("playerId").value.trim();
  const payment = document.getElementById("payment").value;
  document.getElementById("summaryProduct").innerHTML = selectedGame
    ? `<div class="summary-symbol">${selectedGame.icon}</div><div><strong>${selectedGame.name}</strong><small>${selectedGame.subtitle}</small></div>`
    : '<div class="summary-symbol">N</div><div><strong>Belum ada produk</strong><small>Pilih game dan nominal</small></div>';
  document.getElementById("summaryId").textContent = playerId || "—";
  document.getElementById("summaryPackage").textContent = selectedPackage?.name || "—";
  document.getElementById("summaryPayment").textContent = payment || "—";
  document.getElementById("summaryPrice").textContent = selectedPackage ? rupiah(selectedPackage.price) : "Rp0";
}

["playerId","payment"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateSummary)
);

document.getElementById("orderButton").addEventListener("click", () => {
  const playerId = document.getElementById("playerId").value.trim();
  const serverId = document.getElementById("serverId").value.trim();
  const payment = document.getElementById("payment").value;
  if (!selectedGame) return alert("Pilih game terlebih dahulu.");
  if (!playerId) return alert("Masukkan User ID / Player ID.");
  if (!selectedPackage) return alert("Pilih nominal top up.");
  if (!payment) return alert("Pilih metode pembayaran.");
  const order = {
    orderId: "NOVA-" + Date.now(),
    game: selectedGame.name,
    playerId,
    serverId: serverId || null,
    package: selectedPackage.name,
    price: selectedPackage.price,
    payment,
    status: "PENDING_DEMO"
  };
  document.getElementById("dialogText").textContent =
    `${order.orderId} · ${order.game} · ${order.package} · ${rupiah(order.price)}. Data ini belum dikirim atau dibayar.`;
  document.getElementById("orderDialog").showModal();
  console.log("Demo order:", order);
});

document.getElementById("closeDialog").addEventListener("click", () =>
  document.getElementById("orderDialog").close()
);

loadProducts();


// Smooth reveal and subtle anime-banner depth motion.
const revealTargets = document.querySelectorAll(
  ".promo-banner, .game-card, .panel, .steps article, .section-heading"
);
revealTargets.forEach(element => element.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add("visible"));
}

document.querySelectorAll(".promo-banner").forEach(banner => {
  banner.addEventListener("pointermove", event => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    const rect = banner.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    banner.style.transform = `perspective(700px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
  });
  banner.addEventListener("pointerleave", () => banner.style.transform = "");
});
