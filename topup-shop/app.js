const danaNumber = "085707058873";
const whatsappNumber = "6285707058873";

const games = [
  {
    id: "mlbb",
    shortName: "MLBB",
    name: "Mobile Legends",
    currency: "Diamonds",
    tone: "lime",
    needsZone: true,
    packages: [
      { id: "ml-86", label: "86 Diamonds", price: 19000 },
      { id: "ml-172", label: "172 Diamonds", price: 38000 },
      { id: "ml-257", label: "257 Diamonds", price: 57000 },
      { id: "ml-344", label: "344 Diamonds", price: 76000 },
      { id: "ml-514", label: "514 Diamonds", price: 114000 },
      { id: "ml-878", label: "878 Diamonds", price: 190000 },
    ],
  },
  {
    id: "free-fire",
    shortName: "FREE\nFIRE",
    name: "Free Fire",
    currency: "Diamonds",
    tone: "orange",
    needsZone: false,
    packages: [
      { id: "ff-70", label: "70 Diamonds", price: 10000 },
      { id: "ff-140", label: "140 Diamonds", price: 20000 },
      { id: "ff-355", label: "355 Diamonds", price: 49000 },
      { id: "ff-720", label: "720 Diamonds", price: 96000 },
      { id: "ff-1450", label: "1.450 Diamonds", price: 190000 },
    ],
  },
  {
    id: "pubg",
    shortName: "PUBG",
    name: "PUBG Mobile",
    currency: "Unknown Cash",
    tone: "blue",
    needsZone: false,
    packages: [
      { id: "pubg-60", label: "60 UC", price: 16000 },
      { id: "pubg-325", label: "325 UC", price: 79000 },
      { id: "pubg-660", label: "660 UC", price: 155000 },
      { id: "pubg-1800", label: "1.800 UC", price: 390000 },
    ],
  },
];

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const gameList = document.querySelector("#game-list");
const packageList = document.querySelector("#package-list");
const gameSearch = document.querySelector("#game-search");
const packageTitle = document.querySelector("#package-title");
const selectedPackageSummary = document.querySelector("#selected-package");
const orderForm = document.querySelector("#order-form");
const playerIdInput = document.querySelector("#player-id");
const zoneIdInput = document.querySelector("#zone-id");
const zoneField = document.querySelector("#zone-field");
const paymentDetails = document.querySelector("#payment-details");
const orderTotal = document.querySelector("#order-total");
const sendOrderLink = document.querySelector("#send-order");
const formMessage = document.querySelector("#form-message");
const toast = document.querySelector("#toast");

let selectedGame = games[0];
let selectedPackage = selectedGame.packages[0];
let activeOrder = null;
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function renderGames(filter = "") {
  const normalizedFilter = filter.trim().toLocaleLowerCase("id-ID");
  const visibleGames = games.filter((game) =>
    `${game.name} ${game.currency}`.toLocaleLowerCase("id-ID").includes(normalizedFilter),
  );

  gameList.replaceChildren();

  if (visibleGames.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Game tidak ditemukan.";
    gameList.append(emptyState);
    return;
  }

  for (const game of visibleGames) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-option";
    button.setAttribute("aria-pressed", String(game.id === selectedGame.id));
    button.setAttribute("aria-label", game.name);

    const art = document.createElement("span");
    art.className = "game-art";
    art.dataset.tone = game.tone;
    art.setAttribute("aria-hidden", "true");
    art.textContent = game.shortName;

    const copy = document.createElement("span");
    copy.className = "game-copy";
    const name = document.createElement("strong");
    name.textContent = game.name;
    const currency = document.createElement("span");
    currency.textContent = game.currency;
    copy.append(name, currency);
    button.append(art, copy);

    button.addEventListener("click", () => selectGame(game));
    gameList.append(button);
  }
}

function renderPackages() {
  packageTitle.textContent = `${selectedGame.currency} ${selectedGame.name}`;
  packageList.replaceChildren();

  for (const item of selectedGame.packages) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "package-card";
    button.setAttribute("aria-pressed", String(item.id === selectedPackage.id));

    const label = document.createElement("strong");
    label.textContent = item.label;
    const currency = document.createElement("span");
    currency.textContent = selectedGame.currency;
    const price = document.createElement("b");
    price.textContent = money.format(item.price);
    button.append(label, currency, price);
    button.addEventListener("click", () => {
      selectedPackage = item;
      renderPackages();
      updateOrderSummary();
      formMessage.textContent = "";
    });
    packageList.append(button);
  }

  zoneField.hidden = !selectedGame.needsZone;
  zoneIdInput.required = selectedGame.needsZone;
  zoneIdInput.value = "";
  updateOrderSummary();
}

function updateOrderSummary() {
  const gameName = document.createElement("span");
  gameName.textContent = selectedGame.name;
  const details = document.createElement("strong");
  details.textContent = `${selectedPackage.label} · ${money.format(selectedPackage.price)}`;
  selectedPackageSummary.replaceChildren(gameName, details);
}

function selectGame(game) {
  selectedGame = game;
  selectedPackage = game.packages[0];
  activeOrder = null;
  paymentDetails.hidden = true;
  orderForm.hidden = false;
  formMessage.textContent = "";
  renderGames(gameSearch.value);
  renderPackages();
}

function makeOrderMessage(order) {
  const zoneLine = order.zoneId ? `\nZone ID: ${order.zoneId}` : "";
  return [
    "Halo admin, saya ingin konfirmasi pesanan top-up.",
    `Kode: ${order.code}`,
    `Game: ${order.game}`,
    `Paket: ${order.package}`,
    `User ID: ${order.playerId}${zoneLine}`,
    `Total sementara: ${money.format(order.price)}`,
    "Saya menunggu konfirmasi stok dan harga sebelum transfer DANA.",
  ].join("\n");
}

gameSearch.addEventListener("input", () => renderGames(gameSearch.value));

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const playerId = playerIdInput.value.trim();
  const zoneId = zoneIdInput.value.trim();

  if (!/^[A-Za-z0-9_-]{4,24}$/.test(playerId)) {
    formMessage.textContent = "Masukkan Player ID 4-24 karakter (huruf/angka).";
    playerIdInput.focus();
    return;
  }

  if (selectedGame.needsZone && !/^[A-Za-z0-9_-]{1,12}$/.test(zoneId)) {
    formMessage.textContent = "Masukkan Zone ID yang tertera di profil game.";
    zoneIdInput.focus();
    return;
  }

  const orderCode = `LU-${Date.now().toString(36).toUpperCase()}`;
  activeOrder = {
    code: orderCode,
    game: selectedGame.name,
    package: selectedPackage.label,
    playerId,
    zoneId: selectedGame.needsZone ? zoneId : "",
    price: selectedPackage.price,
  };

  orderTotal.textContent = money.format(activeOrder.price);
  const orderMessage = makeOrderMessage(activeOrder);
  sendOrderLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
  orderForm.hidden = true;
  paymentDetails.hidden = false;
  paymentDetails.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.querySelector("#copy-number").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(danaNumber);
    showToast("Nomor DANA disalin.");
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = danaNumber;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    document.execCommand("copy");
    temporaryInput.remove();
    showToast("Nomor DANA disalin.");
  }
});

document.querySelector("#edit-order").addEventListener("click", () => {
  paymentDetails.hidden = true;
  orderForm.hidden = false;
  activeOrder = null;
  formMessage.textContent = "";
  playerIdInput.focus();
});

renderGames();
renderPackages();