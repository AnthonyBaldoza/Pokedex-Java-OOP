const API = "/pokemon";
let allPokemon = [];
let currentTab = "all";
let searchTimeout;
const shinySet = new Set();
let compareMode = false;
let compareIds = [];

const STATS = [
  { key: "hp", label: "HP", cls: "sf-hp", max: 255 },
  { key: "attack", label: "ATK", cls: "sf-atk", max: 190 },
  { key: "defense", label: "DEF", cls: "sf-def", max: 230 },
  { key: "specialAttack", label: "SpA", cls: "sf-spa", max: 194 },
  { key: "specialDefense", label: "SpD", cls: "sf-spd", max: 230 },
  { key: "speed", label: "SPD", cls: "sf-spe", max: 200 },
];

const typeColors = {
  Normal: "#A8A878",
  Fire: "#F08030",
  Water: "#6890F0",
  Electric: "#F8D030",
  Grass: "#78C850",
  Ice: "#98D8D8",
  Fighting: "#C03028",
  Poison: "#A040A0",
  Ground: "#E0C068",
  Flying: "#A890F0",
  Psychic: "#F85888",
  Bug: "#A8B820",
  Rock: "#B8A038",
  Ghost: "#705898",
  Dragon: "#7038F8",
  Steel: "#B8B8D0",
  Dark: "#705848",
  Fairy: "#EE99AC",
};

/* ── UTILS ── */
function getSpriteUrl(num, isShiny = false) {
  const base =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
  return isShiny ? `${base}/shiny/${num}.png` : `${base}/${num}.png`;
}

function typeColorRgb(t) {
  const map = {
    Normal: "168,168,120",
    Fire: "240,128,48",
    Water: "104,144,240",
    Electric: "248,208,48",
    Grass: "120,200,80",
    Ice: "152,216,216",
    Fighting: "192,48,40",
    Poison: "160,64,160",
    Ground: "224,192,104",
    Flying: "168,144,240",
    Psychic: "248,88,136",
    Bug: "168,184,32",
    Rock: "184,160,56",
    Ghost: "112,88,152",
    Dragon: "112,56,248",
    Steel: "184,184,208",
    Dark: "112,88,72",
    Fairy: "238,153,172",
  };
  return map[t] ? `rgba(${map[t]},0.2)` : "rgba(70,104,245,0.2)";
}

function typeColorRgbRaw(t) {
  const map = {
    Normal: "168,168,120",
    Fire: "240,128,48",
    Water: "104,144,240",
    Electric: "248,208,48",
    Grass: "120,200,80",
    Ice: "152,216,216",
    Fighting: "192,48,40",
    Poison: "160,64,160",
    Ground: "224,192,104",
    Flying: "168,144,240",
    Psychic: "248,88,136",
    Bug: "168,184,32",
    Rock: "184,160,56",
    Ghost: "112,88,152",
    Dragon: "112,56,248",
    Steel: "184,184,208",
    Dark: "112,88,72",
    Fairy: "238,153,172",
  };
  return map[t] || "70,104,245";
}

function highlightName(name, search) {
  if (!search) return name;
  const idx = name.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return name;
  return (
    name.slice(0, idx) +
    "<mark>" +
    name.slice(idx, idx + search.length) +
    "</mark>" +
    name.slice(idx + search.length)
  );
}

function totalStats(p) {
  return (
    (p.hp || 0) +
    (p.attack || 0) +
    (p.defense || 0) +
    (p.specialAttack || 0) +
    (p.specialDefense || 0) +
    (p.speed || 0)
  );
}

/* ── SHINY ── */
function toggleShiny(event, id) {
  event.stopPropagation();
  const p = allPokemon.find((x) => x.id === id);
  if (!p) return;
  const num = p.pokemonNumber || p.id;
  const img = document.getElementById("sprite-" + id);
  const btn = document.getElementById("shinybtn-" + id);
  const card = btn.closest(".pokemon-card");
  if (!img) return;
  if (shinySet.has(id)) {
    shinySet.delete(id);
    img.src = getSpriteUrl(num, false);
    btn.classList.remove("active");
    card.classList.remove("is-shiny");
  } else {
    shinySet.add(id);
    img.src = getSpriteUrl(num, true);
    btn.classList.add("active");
    card.classList.add("is-shiny");
    showToast("✨ Shiny " + p.name + "!", "success");
  }
}

function spawnSparkles(card) {
  if (compareMode) return;
  const syms = ["✦", "★", "·", "◆", "✸"];
  for (let i = 0; i < 4; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = syms[Math.floor(Math.random() * syms.length)];
    const a = (i / 4) * 360 + Math.random() * 25,
      d = 28 + Math.random() * 28;
    s.style.cssText = `--tx:${Math.cos((a * Math.PI) / 180) * d}px;--ty:${Math.sin((a * Math.PI) / 180) * d}px;left:${15 + Math.random() * 70}%;top:${20 + Math.random() * 50}%;color:${Object.values(typeColors)[Math.floor(Math.random() * 18)]};animation-delay:${i * 0.07}s`;
    card.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

/* ── COMPARE MODE ── */
function toggleCompareMode() {
  compareMode = !compareMode;
  compareIds = [];
  const btn = document.getElementById("compareBtn");
  const banner = document.getElementById("compareBanner");
  if (compareMode) {
    btn.classList.add("selecting");
    banner.classList.add("active");
    showToast("Click two Pokémon to compare", "success");
    document
      .querySelectorAll(".pokemon-card")
      .forEach((c) => c.classList.add("compare-mode-active"));
    resetSlots();
  } else {
    btn.classList.remove("selecting");
    banner.classList.remove("active");
    document.querySelectorAll(".pokemon-card").forEach((c) => {
      c.classList.remove("compare-mode-active");
      c.classList.remove("compare-selected");
    });
  }
}

function cancelCompare() {
  compareMode = false;
  compareIds = [];
  document.getElementById("compareBtn").classList.remove("selecting");
  document.getElementById("compareBanner").classList.remove("active");
  document.querySelectorAll(".pokemon-card").forEach((c) => {
    c.classList.remove("compare-mode-active");
    c.classList.remove("compare-selected");
  });
}

function resetSlots() {
  [0, 1].forEach((i) => {
    const slot = document.getElementById("slot" + i);
    slot.className = "compare-slot";
    slot.innerHTML = `<span style="font-size:16px">?</span><span id="slotLabel${i}">Pick Pokémon ${i + 1}</span>`;
  });
  document.getElementById("goCompareBtn").disabled = true;
}

function selectForCompare(id) {
  if (!compareMode) return false;
  const p = allPokemon.find((x) => x.id === id);
  if (!p) return true;
  const idx = compareIds.indexOf(id);
  if (idx > -1) {
    compareIds.splice(idx, 1);
    document.getElementById("slot" + idx).className = "compare-slot";
    document.getElementById("slot" + idx).innerHTML =
      `<span style="font-size:16px">?</span><span id="slotLabel${idx}">Pick Pokémon ${idx + 1}</span>`;
    document.querySelectorAll(".pokemon-card").forEach((c) => {
      if (parseInt(c.dataset.id) === id) c.classList.remove("compare-selected");
    });
  } else {
    if (compareIds.length >= 2) {
      showToast("Already have 2 Pokémon selected", "error");
      return true;
    }
    const slotIdx = compareIds.length;
    compareIds.push(id);
    const num = p.pokemonNumber || p.id;
    const slot = document.getElementById("slot" + slotIdx);
    slot.className = "compare-slot filled";
    slot.innerHTML = `<img class="slot-img" src="${getSpriteUrl(num)}" alt="${p.name}" onerror="this.style.display='none'"/><span>${p.name}</span><button class="slot-remove" onclick="removeFromCompare(${id})">✕</button>`;
    document.querySelectorAll(".pokemon-card").forEach((c) => {
      if (parseInt(c.dataset.id) === id) c.classList.add("compare-selected");
    });
  }
  document.getElementById("goCompareBtn").disabled = compareIds.length < 2;
  return true;
}

function removeFromCompare(id) {
  selectForCompare(id);
}

/* ── COMPARE MODAL ── */
async function openCompareModal() {
  if (compareIds.length < 2) return;
  try {
    const [p1, p2] = await Promise.all([
      fetch(`${API}/${compareIds[0]}`).then((r) => r.json()),
      fetch(`${API}/${compareIds[1]}`).then((r) => r.json()),
    ]);
    renderCompare(p1, p2);
    openModal("compareModal");
  } catch {
    showToast("Failed to load comparison", "error");
  }
}

function renderCompare(p1, p2) {
  const n1 = p1.pokemonNumber || p1.id;
  const n2 = p2.pokemonNumber || p2.id;
  const t1 = totalStats(p1),
    t2 = totalStats(p2);
  const isP1Winner = t1 > t2;
  const isP2Winner = t2 > t1;

  const wins = {};
  let p1wins = 0,
    p2wins = 0,
    ties = 0;
  STATS.forEach((s) => {
    const v1 = p1[s.key] || 0,
      v2 = p2[s.key] || 0;
    if (v1 > v2) {
      wins[s.key] = n1;
      p1wins++;
    } else if (v2 > v1) {
      wins[s.key] = n2;
      p2wins++;
    } else {
      wins[s.key] = "tie";
      ties++;
    }
  });

  const advLeft = document.getElementById("advLeft");
  const advRight = document.getElementById("advRight");
  const advTie = document.getElementById("advTie");
  advLeft.textContent = `${p1.name}: ${p1wins} wins`;
  advLeft.style.flex = String(Math.max(p1wins, 0.5));
  advRight.textContent = `${p2.name}: ${p2wins} wins`;
  advRight.style.flex = String(Math.max(p2wins, 0.5));
  if (ties > 0) {
    advTie.textContent = `${ties} tie${ties > 1 ? "s" : ""}`;
    advTie.style.flex = "1";
    advTie.style.display = "flex";
  } else {
    advTie.style.flex = "0";
    advTie.style.display = "none";
  }

  document.getElementById("compareContent").innerHTML = `
    ${buildCmpCard(p1, n1, n2, wins, isP1Winner, t1, t2)}
    <div class="cmp-vs-col">
      <div class="vs-line"></div>
      <div class="cmp-vs-badge">VS</div>
      <div class="vs-line"></div>
    </div>
    ${buildCmpCard(p2, n2, n1, wins, isP2Winner, t2, t1)}`;

  requestAnimationFrame(() =>
    setTimeout(() => {
      document.querySelectorAll(".cmp-stat-fill").forEach((b) => {
        b.style.width = b.dataset.v + "%";
      });
      countUpCmp("bst-" + n1, t1, isP1Winner);
      countUpCmp("bst-" + n2, t2, isP2Winner);
    }, 80),
  );
}

function buildCmpCard(p, myNum, otherNum, wins, isWinner, myTotal, otherTotal) {
  const num = p.pokemonNumber || p.id;
  return `
    <div class="cmp-card ${isWinner ? "winner" : "loser"}">
      <div class="winner-banner ${isWinner ? "show" : ""}">
        <div class="winner-dot"></div>WINNER<div class="winner-dot"></div>
      </div>
      <div class="cmp-hero" style="--tc:rgba(${typeColorRgbRaw(p.type)},0.15)">
        <div class="cmp-num">#${String(num).padStart(3, "0")}</div>
        <div class="cmp-sprite-wrap">
          <img class="cmp-sprite" src="${getSpriteUrl(num)}" alt="${p.name}" onerror="this.style.display='none'"/>
          <div class="cmp-crown ${isWinner ? "show" : ""}">👑</div>
        </div>
        <div class="cmp-name">${p.name}</div>
        <div class="cmp-types">
          <span class="type-pill tp-${p.type}">${p.type}</span>
          ${p.type2 ? `<span class="type-pill tp-${p.type2}">${p.type2}</span>` : ""}
        </div>
        ${p.legendary ? '<div class="cmp-legendary-badge">★ Legendary</div>' : ""}
      </div>
      <div class="cmp-stats">
        ${STATS.map((s) => {
          const val = p[s.key] || 0;
          const isWin = wins[s.key] === myNum;
          const isTie = wins[s.key] === "tie";
          const pct = Math.min(Math.round((val / s.max) * 100), 100);
          return `
            <div class="cmp-stat-row">
              <span class="cmp-stat-lbl">${s.label}</span>
              <span class="cmp-stat-val ${isWin ? "winning" : ""}">${val}</span>
              <div class="cmp-stat-track ${isWin ? "win-track" : ""}">
                <div class="cmp-stat-fill ${s.cls} ${isWin ? "winning-bar" : ""}"
                     data-v="${pct}" style="width:0%"></div>
              </div>
              <div class="cmp-stat-win-icon ${isWin ? "show" : ""}">${isWin ? "▲" : isTie ? "=" : ""}</div>
            </div>`;
        }).join("")}
      </div>
      <div class="cmp-meta">
        <div class="cmp-meta-item"><div class="cmp-meta-lbl">Height</div><div class="cmp-meta-val">${p.height}m</div></div>
        <div class="cmp-meta-item"><div class="cmp-meta-lbl">Weight</div><div class="cmp-meta-val">${p.weight}kg</div></div>
      </div>
      <div class="cmp-total">
        <span class="cmp-total-lbl">Total BST</span>
        <span class="cmp-total-val ${isWinner ? "winner-total" : "loser-total"}" id="bst-${num}">0</span>
      </div>
    </div>`;
}

function countUpCmp(id, target, isWinner) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.ceil(target / 45);
  const t = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n + (n === target ? (isWinner ? " 🏆" : "") : "");
    if (n >= target) clearInterval(t);
  }, 16);
}

/* ── LOAD ── */
async function loadPokemon() {
  try {
    const res = await fetch(API);
    allPokemon = await res.json();
    document.getElementById("apiDot").classList.add("green");
    document.getElementById("apiLabel").textContent = "API Connected";
    updateCounters();
    applyCurrentView();
    setTimeout(
      () => document.getElementById("loadingScreen").classList.add("hide"),
      600,
    );
  } catch {
    document.getElementById("apiDot").classList.add("red");
    document.getElementById("apiLabel").textContent = "API Offline";
    document.getElementById("loadingScreen").classList.add("hide");
    document.getElementById("pokemonGrid").innerHTML =
      `<div class="empty-state"><div class="empty-icon">⚠</div><div class="empty-title">Connection Failed</div><div class="empty-sub">Make sure Spring Boot is running on port 8080</div></div>`;
  }
}

function updateCounters() {
  const fav = allPokemon.filter((p) => p.favorite).length;
  const caught = allPokemon.filter((p) => p.caught).length;
  const legendary = allPokemon.filter((p) => p.legendary).length;
  const total = allPokemon.length;
  const pct = total ? Math.round((caught / total) * 100) : 0;
  document.getElementById("countAll").textContent = total;
  document.getElementById("countFav").textContent = fav;
  document.getElementById("countCaught").textContent = caught;
  document.getElementById("countLegendary").textContent = legendary;
  document.getElementById("showingCount").textContent = total;
  document.getElementById("trackFill").style.width = pct + "%";
  document.getElementById("trackPct").textContent = pct + "%";
}

function applyCurrentView() {
  let list = [...allPokemon];
  if (currentTab === "favorites") list = list.filter((p) => p.favorite);
  if (currentTab === "caught") list = list.filter((p) => p.caught);
  if (currentTab === "legendary") list = list.filter((p) => p.legendary);
  const search = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  if (search) list = list.filter((p) => p.name.toLowerCase().includes(search));
  const type = document.getElementById("typeFilter").value;
  if (type) list = list.filter((p) => p.type === type || p.type2 === type);
  const sort = document.getElementById("sortSelect").value;
  list.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "hp") return (b.hp || 0) - (a.hp || 0);
    if (sort === "atk") return (b.attack || 0) - (a.attack || 0);
    if (sort === "total") return totalStats(b) - totalStats(a);
    return (a.pokemonNumber || a.id) - (b.pokemonNumber || b.id);
  });
  document.getElementById("showingCount").textContent = list.length;
  renderGrid(list);
}

function setTab(tab, btn) {
  currentTab = tab;
  document
    .querySelectorAll(".nav-tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  applyCurrentView();
}

function renderGrid(list) {
  const grid = document.getElementById("pokemonGrid");
  const search = document.getElementById("searchInput").value.trim();
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No results</div><div class="empty-sub">Try a different search or filter</div></div>`;
    return;
  }
  grid.innerHTML = list
    .map((p, i) => {
      const num = p.pokemonNumber || p.id;
      const t1 = p.type,
        t2 = p.type2;
      const delay = (i % 24) * 35;
      const isShiny = shinySet.has(p.id);
      const isSelected = compareIds.includes(p.id);
      const classes = [
        "pokemon-card",
        `tc-${t1}`,
        p.caught ? "is-caught" : "",
        p.favorite ? "is-fav" : "",
        isShiny ? "is-shiny" : "",
        p.legendary ? "is-legendary" : "",
        compareMode ? "compare-mode-active" : "",
        isSelected ? "compare-selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const displayName = highlightName(p.name, search);
      return `<div class="${classes}" style="animation-delay:${delay}ms" data-id="${p.id}"
       onclick="handleCardClick(${p.id},event)" onmouseenter="spawnSparkles(this)"
       tabindex="0" onkeydown="if(event.key==='Enter')handleCardClick(${p.id},event)">
  <div class="card-strip"></div>
  <div class="card-badges">
    ${p.legendary ? '<span class="cbadge cbadge-legendary">★ Legendary</span>' : ""}
    ${p.favorite ? '<span class="cbadge cbadge-fav">♥</span>' : ""}
    ${p.caught ? '<span class="cbadge cbadge-caught">✓</span>' : ""}
  </div>
  <div class="card-num">#${String(num).padStart(3, "0")}</div>
  <div class="card-sprite-wrap">
    <img class="card-sprite" id="sprite-${p.id}" src="${getSpriteUrl(num, isShiny)}" alt="${p.name}"
         onerror="this.outerHTML='<div class=\\'card-sprite-missing\\'>?</div>'"/>
    <button class="shiny-btn ${isShiny ? "active" : ""}" id="shinybtn-${p.id}"
            onclick="toggleShiny(event,${p.id})" title="Toggle shiny sprite">✨</button>
  </div>
  <div class="card-name">${displayName}</div>
  <div class="card-types">
    <span class="type-pill tp-${t1}">${t1}</span>
    ${t2 ? `<span class="type-pill tp-${t2}">${t2}</span>` : ""}
  </div>
  <div class="card-actions">
    <button class="caction caction-fav"    onclick="event.stopPropagation();toggleFav(${p.id},'${p.name}',${p.favorite})"   title="${p.favorite ? "Unfav" : "Fav"}">${p.favorite ? "💔" : "❤"}</button>
    <button class="caction caction-caught" onclick="event.stopPropagation();toggleCaught(${p.id},'${p.name}',${p.caught})"  title="${p.caught ? "Release" : "Catch"}">${p.caught ? "🔓" : "✓"}</button>
    <button class="caction caction-edit"   onclick="event.stopPropagation();openEditModal(${p.id})"  title="Edit">✏</button>
    <button class="caction caction-del"    onclick="event.stopPropagation();deletePokemon(${p.id},'${p.name}',this)" title="Delete">✕</button>
  </div>
</div>`;
    })
    .join("");
}

function handleCardClick(id, event) {
  if (compareMode) {
    selectForCompare(id);
    if (compareIds.length === 2) openCompareModal();
  } else {
    showDetail(id);
  }
}

/* ── SEARCH & FILTER EVENTS ── */
document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyCurrentView, 180);
});
document
  .getElementById("typeFilter")
  .addEventListener("change", applyCurrentView);
document
  .getElementById("sortSelect")
  .addEventListener("change", applyCurrentView);

/* ── DETAIL MODAL ── */
async function showDetail(id) {
  try {
    const p = await (await fetch(`${API}/${id}`)).json();
    const num = p.pokemonNumber || p.id;
    const total = totalStats(p);
    document.getElementById("detailContent").innerHTML = `
      <div class="detail-hero tc-${p.type}" style="--tc:${typeColorRgb(p.type)}">
        <div class="detail-num">#${String(num).padStart(3, "0")}</div>
        <img class="detail-sprite" src="${getSpriteUrl(num)}" alt="${p.name}" onerror="this.style.display='none'"/>
        <div class="detail-name">${p.name}</div>
        <div class="detail-types">
          <span class="type-pill tp-${p.type}">${p.type}</span>
          ${p.type2 ? `<span class="type-pill tp-${p.type2}">${p.type2}</span>` : ""}
        </div>
        ${p.legendary ? '<div style="margin-top:8px;display:flex;justify-content:center"><div class="legendary-hero-badge">★ Legendary Pokémon</div></div>' : ""}
      </div>
      ${p.description ? `<div class="detail-desc-box" style="--tc:${typeColorRgb(p.type)}">"${p.description}"</div>` : ""}
      <div class="detail-meta-grid">
        <div class="meta-card"><div class="meta-lbl">Height</div><div class="meta-v">${p.height}m</div></div>
        <div class="meta-card"><div class="meta-lbl">Weight</div><div class="meta-v">${p.weight}kg</div></div>
      </div>
      <div class="stats-header">
        <span class="stats-title">Base Stats</span>
        <span class="stats-total" id="detailTotal">— BST</span>
      </div>
      ${sBar("HP", p.hp, "sf-hp", 255)}
      ${sBar("Attack", p.attack, "sf-atk", 190)}
      ${sBar("Defense", p.defense, "sf-def", 230)}
      ${sBar("Sp.Atk", p.specialAttack, "sf-spa", 194)}
      ${sBar("Sp.Def", p.specialDefense, "sf-spd", 230)}
      ${sBar("Speed", p.speed, "sf-spe", 200)}
      <div class="detail-cta">
        <button class="btn-cta btn-cta-fav ${p.favorite ? "active" : ""}" onclick="toggleFavDetail(${p.id})">
          ${p.favorite ? "💔 Unfavorite" : "❤ Favorite"}
        </button>
        <button class="btn-cta btn-cta-caught ${p.caught ? "active" : ""}" onclick="toggleCaughtDetail(${p.id})">
          ${p.caught ? "🔓 Release" : "✓ Mark Caught"}
        </button>
      </div>`;
    document.getElementById("detailEditBtn").onclick = () => {
      closeModal("detailModal");
      openEditModal(id);
    };
    openModal("detailModal");
    setTimeout(() => {
      document.querySelectorAll(".stat-fill").forEach((b) => {
        b.style.width = b.dataset.v + "%";
      });
      countUp("detailTotal", total, " BST");
    }, 80);
  } catch {
    showToast("Failed to load entry", "error");
  }
}

function sBar(label, val, cls, max) {
  const pct = Math.min(Math.round(((val || 0) / max) * 100), 100);
  return `<div class="stat-row"><span class="stat-lbl">${label}</span><span class="stat-v">${val || 0}</span><div class="stat-track"><div class="stat-fill ${cls}" data-v="${pct}" style="width:0%"></div></div></div>`;
}

function countUp(id, target, suffix = "") {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.ceil(target / 40);
  const t = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n + suffix;
    if (n >= target) clearInterval(t);
  }, 18);
}

/* ── ACTIONS ── */
async function toggleFav(id, name, cur) {
  try {
    const res = await fetch(`${API}/${id}/favorite`, { method: "PATCH" });
    if (res.ok) {
      await loadPokemon();
      showToast(
        cur ? `Removed ${name} from favorites` : `Added ${name} to favorites`,
        "success",
      );
    }
  } catch {
    showToast("Request failed", "error");
  }
}

async function toggleCaught(id, name, cur) {
  try {
    const res = await fetch(`${API}/${id}/caught`, { method: "PATCH" });
    if (res.ok) {
      await loadPokemon();
      showToast(cur ? `${name} released` : `${name} caught!`, "success");
    }
  } catch {
    showToast("Request failed", "error");
  }
}

async function toggleFavDetail(id) {
  try {
    await fetch(`${API}/${id}/favorite`, { method: "PATCH" });
    await loadPokemon();
    closeModal("detailModal");
    showDetail(id);
  } catch {}
}

async function toggleCaughtDetail(id) {
  try {
    await fetch(`${API}/${id}/caught`, { method: "PATCH" });
    await loadPokemon();
    closeModal("detailModal");
    showDetail(id);
  } catch {}
}

/* ── FORM ── */
function openAddModal() {
  document.getElementById("modalTitle").textContent = "New Pokémon";
  document.getElementById("editId").value = "";
  [
    "fNumber",
    "fName",
    "fHeight",
    "fWeight",
    "fDesc",
    "fHp",
    "fAttack",
    "fDefense",
    "fSpeed",
    "fSpAtk",
    "fSpDef",
  ].forEach((i) => (document.getElementById(i).value = ""));
  document.getElementById("fType").value = "";
  document.getElementById("fType2").value = "";
  document.getElementById("fLegendary").checked = false;
  openModal("formModal");
}

async function openEditModal(id) {
  try {
    const p = await (await fetch(`${API}/${id}`)).json();
    document.getElementById("modalTitle").textContent = "Edit Pokémon";
    document.getElementById("editId").value = p.id;
    document.getElementById("fNumber").value = p.pokemonNumber || "";
    document.getElementById("fName").value = p.name;
    document.getElementById("fType").value = p.type;
    document.getElementById("fType2").value = p.type2 || "";
    document.getElementById("fHeight").value = p.height;
    document.getElementById("fWeight").value = p.weight;
    document.getElementById("fDesc").value = p.description || "";
    document.getElementById("fHp").value = p.hp || 0;
    document.getElementById("fAttack").value = p.attack || 0;
    document.getElementById("fDefense").value = p.defense || 0;
    document.getElementById("fSpeed").value = p.speed || 0;
    document.getElementById("fSpAtk").value = p.specialAttack || 0;
    document.getElementById("fSpDef").value = p.specialDefense || 0;
    document.getElementById("fLegendary").checked = p.legendary || false;
    openModal("formModal");
  } catch {
    showToast("Could not load data", "error");
  }
}

async function savePokemon() {
  const id = document.getElementById("editId").value;
  const name = document.getElementById("fName").value.trim();
  const type = document.getElementById("fType").value;
  if (!name || !type) {
    showToast("Name and Primary Type are required", "error");
    return;
  }
  const body = {
    pokemonNumber: parseInt(document.getElementById("fNumber").value) || null,
    name,
    type,
    type2: document.getElementById("fType2").value || null,
    height: parseFloat(document.getElementById("fHeight").value) || 0,
    weight: parseFloat(document.getElementById("fWeight").value) || 0,
    description: document.getElementById("fDesc").value.trim(),
    hp: parseInt(document.getElementById("fHp").value) || 0,
    attack: parseInt(document.getElementById("fAttack").value) || 0,
    defense: parseInt(document.getElementById("fDefense").value) || 0,
    speed: parseInt(document.getElementById("fSpeed").value) || 0,
    specialAttack: parseInt(document.getElementById("fSpAtk").value) || 0,
    specialDefense: parseInt(document.getElementById("fSpDef").value) || 0,
    legendary: document.getElementById("fLegendary").checked,
  };
  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      closeModal("formModal");
      await loadPokemon();
      showToast(id ? `${name} updated` : `${name} added to Pokédex`, "success");
    } else {
      showToast("Save failed — check all fields", "error");
    }
  } catch {
    showToast("Connection error", "error");
  }
}

let pendingDelete = { id: null, name: null, btn: null };

function deletePokemon(id, name, btn) {
  pendingDelete = { id, name, btn };
  document.getElementById("deleteText").textContent =
    `Remove ${name} from the Pokédex?`;
  document.getElementById("confirmDeleteBtn").onclick = confirmDelete;
  openModal("deleteModal");
}

async function confirmDelete() {
  const { id, name, btn } = pendingDelete;
  closeModal("deleteModal");
  const card = btn.closest(".pokemon-card");
  card.classList.add("shaking");
  await new Promise((r) => setTimeout(r, 460));
  card.classList.remove("shaking");
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      card.classList.add("exploding");
      await new Promise((r) => setTimeout(r, 420));
      await loadPokemon();
      showToast(`${name} removed`, "success");
    }
  } catch {
    showToast("Delete failed", "error");
  }
}

/* ── MODALS ── */
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

document.querySelectorAll(".modal-overlay").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (e.target === el) el.classList.remove("active");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (compareMode) {
      cancelCompare();
      return;
    }
    document
      .querySelectorAll(".modal-overlay.active")
      .forEach((m) => m.classList.remove("active"));
  }
});

/* ── TOAST ── */
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ── THEME ── */
function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light");
  }
})();

/* ── INIT ── */
loadPokemon();
