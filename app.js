(() => {
  const RELEASE_META = {
    version: "v1.0.0",
    setup: {
      sizeLabel: "2.58 MiB (2,709,504 bytes)",
      sha256: "8710E1823E4EB63165C6FEEE321E7FE5B2287EE61A2771A562527250D1D1E1ED",
    },
    portable: {
      sizeLabel: "1.69 MiB (1,773,056 bytes)",
      sha256: "882D719682289927423960EB7AE685A04DA3E5D33BE4BE352BA265C0B3C96189",
    },
  };

  // Populate hash / size labels
  const setupSizeEl = document.getElementById("setup-size");
  const portableSizeEl = document.getElementById("portable-size");
  const setupHashEl = document.querySelector('[data-hash="setup"]');
  const portableHashEl = document.querySelector('[data-hash="portable"]');

  if (setupSizeEl) setupSizeEl.textContent = RELEASE_META.setup.sizeLabel;
  if (portableSizeEl) portableSizeEl.textContent = RELEASE_META.portable.sizeLabel;
  if (setupHashEl) setupHashEl.textContent = RELEASE_META.setup.sha256;
  if (portableHashEl) portableHashEl.textContent = RELEASE_META.portable.sha256;

  // Interactive Hero Browser Preview
  const folderBtn = document.getElementById("mock-folder-btn");
  const toggleAllBtn = document.getElementById("mock-toggle-all");
  const folderChildren = document.getElementById("mock-folder-children");
  const folderArrow = document.getElementById("mock-folder-arrow");
  const shieldToggle = document.getElementById("mock-shield-toggle");
  const shieldLabel = document.getElementById("mock-shield-label");
  const urlDisplay = document.getElementById("mock-url");
  const liveHint = document.getElementById("mock-live-hint");
  const newTabBtn = document.getElementById("mock-newtab");
  const searchPreviewEl = document.getElementById("mock-search-preview");
  const linkTiles = Array.from(document.querySelectorAll(".mock-link-tile"));
  const tabs = Array.from(document.querySelectorAll(".mock-tab"));

  let folderCollapsed = false;
  let shieldsEnabled = true;
  let currentBlocked = 2;

  function renderShieldState() {
    if (!shieldToggle || !shieldLabel) return;
    if (shieldsEnabled) {
      shieldToggle.classList.remove("off");
      shieldLabel.textContent = `Shields ON · ${currentBlocked}`;
    } else {
      shieldToggle.classList.add("off");
      shieldLabel.textContent = "Shields OFF";
    }
  }

  function toggleFolder() {
    folderCollapsed = !folderCollapsed;
    if (folderChildren) folderChildren.classList.toggle("collapsed", folderCollapsed);
    if (folderArrow) folderArrow.textContent = folderCollapsed ? "▸" : "▾";
    if (folderBtn) folderBtn.setAttribute("aria-expanded", String(!folderCollapsed));
    if (liveHint) {
      liveHint.innerHTML = folderCollapsed
        ? "Folder <strong>Workspace Ku</strong> dilipat — klik lagi untuk membuka daftar tab di dalamnya."
        : "Folder <strong>Workspace Ku</strong> terbuka dengan 2 tab terorganisir rapi.";
    }
  }

  if (folderBtn) folderBtn.addEventListener("click", toggleFolder);
  if (toggleAllBtn) toggleAllBtn.addEventListener("click", toggleFolder);

  if (newTabBtn) {
    newTabBtn.addEventListener("click", () => {
      tabs.forEach((t, idx) => t.classList.toggle("active", idx === 0));
      currentBlocked = 0;
      if (urlDisplay) urlDisplay.textContent = "kurowser://start";
      if (searchPreviewEl) searchPreviewEl.textContent = "Ketik goo -> google.com atau cari di web...";
      renderShieldState();
      if (liveHint) {
        liveHint.innerHTML = "Tab baru dibuka ke <strong>kurowser://start</strong> — aman tanpa server localhost.";
      }
    });
  }

  const tileUrls = {
    GitHub: { url: "https://github.com/devkecelup/kurowser", blocked: 2 },
    YouTube: { url: "https://youtube.com", blocked: 6 },
    Docs: { url: "https://developer.mozilla.org", blocked: 1 },
  };
  linkTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const info = tileUrls[tile.textContent.trim()];
      if (!info) return;
      currentBlocked = info.blocked;
      if (urlDisplay) urlDisplay.textContent = info.url;
      renderShieldState();
      if (liveHint) {
        liveHint.textContent = `Akses Cepat membuka ${info.url} dengan Kurowser Shields aktif.`;
      }
    });
  });

  if (shieldToggle) {
    shieldToggle.addEventListener("click", () => {
      shieldsEnabled = !shieldsEnabled;
      renderShieldState();
      if (liveHint) {
        liveHint.innerHTML = shieldsEnabled
          ? "<strong>Kurowser Shields AKTIF</strong> — domain iklan, tracker &amp; popunder diblokir sebelum keluar jaringan."
          : "<strong>Kurowser Shields Dijeda</strong> — Anda dapat menyalakannya kembali kapan saja per-situs atau global.";
      }
    });
  }

  tabs.forEach((tab) => {
    const activate = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const url = tab.getAttribute("data-url") || "kurowser://start";
      currentBlocked = Number(tab.getAttribute("data-shields") || "0");
      if (urlDisplay) urlDisplay.textContent = url;
      renderShieldState();
      if (liveHint) {
        liveHint.textContent = `Membuka ${url} — dibatasi LRU RAM Cap agar sistem tetap responsif.`;
      }
    };
    tab.addEventListener("click", activate);
    tab.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  renderShieldState();

  // Comparison Bar Chart Data (Zen Browser & Arc explicitly included)
  const CHART_DATASETS = {
    ram4: {
      title: "Private RAM — 4 Tab Aktif incl. GitHub + Settings (MB, Lebih Kecil Lebih Hemat)",
      max: 1200,
      unit: "MB",
      note: "Data Kurowser Start (171.7 MB Private) dan Kurowser 4 Tab incl. GitHub + Settings + LRU Cap 3/3 (498.7 MB Private, Rust host 7.5 MB) diukur langsung pada Windows 11 x64 menggunakan measure_memory.ps1. Angka browser lain merupakan baseline estimasi umum Windows x64 tanpa LRU Cap ketat.",
      rows: [
        { name: "Kurowser (Start)", val: 172, kurowser: true },
        { name: "Kurowser (4 Tab)", val: 499, kurowser: true },
        { name: "Microsoft Edge", val: 680 },
        { name: "Brave", val: 720 },
        { name: "Mozilla Firefox", val: 820 },
        { name: "Zen Browser", val: 880 },
        { name: "Google Chrome", val: 980 },
        { name: "Arc (Windows)", val: 1150 },
      ],
    },
    ram1: {
      title: "Private RAM — Startup / 1 Tab Idle (MB, Lebih Kecil Lebih Hemat)",
      max: 650,
      unit: "MB",
      note: "Saat start 1 tab di Windows 11 x64, host Rust + Win32 GDI Kurowser hanya memakai ~7.5 MB Private RAM sehingga total memori termasuk WebView2 renderer hanya 171.7 MB.",
      rows: [
        { name: "Kurowser (1 Tab)", val: 172, kurowser: true },
        { name: "Microsoft Edge", val: 340 },
        { name: "Brave", val: 370 },
        { name: "Mozilla Firefox", val: 380 },
        { name: "Google Chrome", val: 410 },
        { name: "Zen Browser", val: 450 },
        { name: "Arc (Windows)", val: 580 },
      ],
    },
    size: {
      title: "Ukuran Paket Distribusi Desktop Windows x64 (MB, Lebih Kecil Lebih Cepat Diunduh)",
      max: 480,
      unit: "MB",
      note: "Kurowser memanfaatkan Microsoft Edge WebView2 Runtime yang sudah ada di Windows 10/11 modern sehingga binary portable-nya hanya 1.77 MB.",
      rows: [
        { name: "Kurowser Portable", val: 1.77, kurowser: true },
        { name: "Mozilla Firefox", val: 250 },
        { name: "Zen Browser", val: 270 },
        { name: "Brave", val: 350 },
        { name: "Google Chrome", val: 350 },
        { name: "Microsoft Edge", val: 420 },
        { name: "Arc (Windows)", val: 450 },
      ],
    },
  };

  const chartTitleEl = document.getElementById("chart-title");
  const chartBarsEl = document.getElementById("chart-bars");
  const chartNoteEl = document.getElementById("chart-note");
  const chartTabBtns = Array.from(document.querySelectorAll(".chart-tab"));

  function renderChart(metricKey) {
    const data = CHART_DATASETS[metricKey] || CHART_DATASETS.ram4;
    if (chartTitleEl) chartTitleEl.textContent = data.title;
    if (chartNoteEl) chartNoteEl.textContent = data.note;
    if (!chartBarsEl) return;

    chartBarsEl.innerHTML = "";
    data.rows.forEach((row) => {
      const pct = Math.max(2, Math.min(100, (row.val / data.max) * 100));
      const div = document.createElement("div");
      div.className = "bar-row" + (row.kurowser ? " is-kurowser" : "");

      const nameEl = document.createElement("div");
      nameEl.className = "bar-name";
      nameEl.textContent = row.name;

      const trackEl = document.createElement("div");
      trackEl.className = "bar-track";

      const fillEl = document.createElement("div");
      fillEl.className = "bar-fill";
      fillEl.style.width = `${pct.toFixed(1)}%`;
      trackEl.appendChild(fillEl);

      const valEl = document.createElement("div");
      valEl.className = "bar-val";
      valEl.textContent = `${row.val} ${data.unit}`;

      div.append(nameEl, trackEl, valEl);
      chartBarsEl.appendChild(div);
    });
  }

  chartTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      chartTabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderChart(btn.getAttribute("data-metric") || "ram4");
    });
  });

  renderChart("ram4");

  // Copy SHA-256 Action
  document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetKey = btn.getAttribute("data-copy-target");
      const text = targetKey && RELEASE_META[targetKey] ? RELEASE_META[targetKey].sha256 : "";
      if (!text) return;

      const original = btn.textContent;
      let ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = false;
        }
      }
      if (!ok) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
        document.body.removeChild(ta);
      }
      btn.textContent = ok ? "Tersalin!" : "Gagal";
      setTimeout(() => {
        btn.textContent = original;
      }, 1600);
    });
  });
})();
