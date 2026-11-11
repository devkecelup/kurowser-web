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

  const root = document.documentElement;
  const mockupFrame = document.querySelector(".mockup-frame");

  if (mockupFrame) mockupFrame.removeAttribute("inert");

  // Release labels
  const setupSizeEl = document.getElementById("setup-size");
  const portableSizeEl = document.getElementById("portable-size");
  const setupHashEl = document.querySelector('[data-hash="setup"]');
  const portableHashEl = document.querySelector('[data-hash="portable"]');

  if (setupSizeEl) setupSizeEl.textContent = RELEASE_META.setup.sizeLabel;
  if (portableSizeEl) portableSizeEl.textContent = RELEASE_META.portable.sizeLabel;
  if (setupHashEl) setupHashEl.textContent = RELEASE_META.setup.sha256;
  if (portableHashEl) portableHashEl.textContent = RELEASE_META.portable.sha256;

  // Theme
  const themeToggle = document.getElementById("theme-toggle");
  const themeColor = document.getElementById("theme-color");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#121016" : "#f5f2ea");
    }
  }

  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("kurowser-theme", next);
      } catch (error) {}
    });
  }

  // Mobile navigation
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-open", open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 941px)");
    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) setNavOpen(false);
    });
  }

  // Hero preview
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
  const linkTiles = Array.from(document.querySelectorAll(".mock-link"));
  const tabs = Array.from(document.querySelectorAll(".mock-tab"));

  let folderCollapsed = false;
  let shieldsEnabled = true;
  let currentBlocked = 0;

  function renderShieldState() {
    if (!shieldToggle || !shieldLabel) return;
    shieldToggle.setAttribute("aria-pressed", String(shieldsEnabled));
    if (shieldsEnabled) {
      shieldToggle.classList.remove("is-off");
      shieldLabel.textContent = `Shields ON · ${currentBlocked}`;
    } else {
      shieldToggle.classList.add("is-off");
      shieldLabel.textContent = "Shields OFF";
    }
  }

  function toggleFolder() {
    folderCollapsed = !folderCollapsed;
    if (folderChildren) folderChildren.classList.toggle("is-collapsed", folderCollapsed);
    if (folderArrow) folderArrow.textContent = folderCollapsed ? "▸" : "▾";
    if (folderBtn) folderBtn.setAttribute("aria-expanded", String(!folderCollapsed));
    if (liveHint) {
      liveHint.innerHTML = folderCollapsed
        ? "Folder <strong>Workspace Ku</strong> dilipat. Klik lagi untuk membuka daftar tab."
        : "Folder <strong>Workspace Ku</strong> terbuka dengan 2 tab.";
    }
  }

  if (folderBtn) folderBtn.addEventListener("click", toggleFolder);
  if (toggleAllBtn) toggleAllBtn.addEventListener("click", toggleFolder);

  function setActiveTab(activeTab) {
    tabs.forEach((tab) => {
      const active = tab === activeTab;
      tab.classList.toggle("is-active", active);
      if (active) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  }

  if (newTabBtn) {
    newTabBtn.addEventListener("click", () => {
      setActiveTab(tabs[0]);
      currentBlocked = 0;
      if (urlDisplay) urlDisplay.textContent = "kurowser://start";
      if (searchPreviewEl) searchPreviewEl.textContent = "Ketik goo untuk google.com, atau cari di web";
      renderShieldState();
      if (liveHint) {
        liveHint.innerHTML = "Tab baru dibuka ke <strong>kurowser://start</strong>, tanpa server localhost.";
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
        liveHint.textContent = `Akses cepat membuka ${info.url} dengan Kurowser Shields aktif.`;
      }
    });
  });

  if (shieldToggle) {
    shieldToggle.addEventListener("click", () => {
      shieldsEnabled = !shieldsEnabled;
      renderShieldState();
      if (liveHint) {
        liveHint.innerHTML = shieldsEnabled
          ? "<strong>Kurowser Shields aktif.</strong> Domain iklan, tracker, dan popunder diblokir sebelum keluar jaringan."
          : "<strong>Kurowser Shields dijeda.</strong> Bisa dinyalakan lagi per situs atau global.";
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveTab(tab);
      const url = tab.getAttribute("data-url") || "kurowser://start";
      currentBlocked = Number(tab.getAttribute("data-shields") || "0");
      if (urlDisplay) urlDisplay.textContent = url;
      renderShieldState();
      if (liveHint) {
        liveHint.textContent = `Membuka ${url}. Tab lain ditidurkan oleh LRU RAM Cap.`;
      }
    });
  });

  renderShieldState();

  // Comparison chart
  const CHART_DATASETS = {
    ram4: {
      title: "Private RAM: start dan 4 tab aktif termasuk GitHub dan Settings (MB)",
      max: 1200,
      unit: "MB",
      note: "Kurowser memakai 171.7 MB saat start dan 498.7 MB dengan 4 tab aktif (host Rust 7.5 MB), diukur di Windows 11 x64 dengan measure_memory.ps1. Nilai pembanding adalah estimasi kasar, bukan hasil uji yang sama.",
      rows: [
        { name: "Kurowser (start)", val: 172, kurowser: true },
        { name: "Kurowser (4 tab)", val: 499, kurowser: true },
        { name: "Microsoft Edge", val: 680, estimate: true },
        { name: "Brave", val: 720, estimate: true },
        { name: "Mozilla Firefox", val: 820, estimate: true },
        { name: "Zen Browser", val: 880, estimate: true },
        { name: "Google Chrome", val: 980, estimate: true },
        { name: "Arc (Windows)", val: 1150, estimate: true },
      ],
    },
    ram1: {
      title: "Private RAM saat start, 1 tab idle (MB)",
      max: 650,
      unit: "MB",
      note: "Host Rust + Win32 memakai sekitar 7.5 MB private RAM. Total 171.7 MB sudah termasuk renderer WebView2 pada Windows 11 x64. Nilai pembanding adalah estimasi kasar.",
      rows: [
        { name: "Kurowser (1 tab)", val: 172, kurowser: true },
        { name: "Microsoft Edge", val: 340, estimate: true },
        { name: "Brave", val: 370, estimate: true },
        { name: "Mozilla Firefox", val: 380, estimate: true },
        { name: "Google Chrome", val: 410, estimate: true },
        { name: "Zen Browser", val: 450, estimate: true },
        { name: "Arc (Windows)", val: 580, estimate: true },
      ],
    },
    size: {
      title: "Ukuran paket distribusi Windows x64 (MB)",
      max: 480,
      unit: "MB",
      note: "Binary portable Kurowser hanya 1.77 MB karena memakai Microsoft Edge WebView2 Runtime yang sudah ada di Windows 10 dan 11. Nilai pembanding adalah estimasi kasar ukuran unduhan.",
      rows: [
        { name: "Kurowser portable", val: 1.77, kurowser: true },
        { name: "Mozilla Firefox", val: 250, estimate: true },
        { name: "Zen Browser", val: 270, estimate: true },
        { name: "Brave", val: 350, estimate: true },
        { name: "Google Chrome", val: 350, estimate: true },
        { name: "Microsoft Edge", val: 420, estimate: true },
        { name: "Arc (Windows)", val: 450, estimate: true },
      ],
    },
  };

  const chartTitleEl = document.getElementById("chart-title");
  const chartBarsEl = document.getElementById("chart-bars");
  const chartNoteEl = document.getElementById("chart-note");
  const chartTabBtns = Array.from(document.querySelectorAll(".chart-tab"));

  function renderChart(metricKey) {
    const data = CHART_DATASETS[metricKey];
    if (!data || !Array.isArray(data.rows) || data.rows.length === 0) {
      if (chartBarsEl) {
        chartBarsEl.innerHTML = '<p class="chart-error">Belum ada data untuk metrik ini.</p>';
      }
      return;
    }

    if (chartTitleEl) chartTitleEl.textContent = data.title;
    if (chartNoteEl) chartNoteEl.textContent = data.note;
    if (!chartBarsEl) return;

    chartBarsEl.innerHTML = "";
    data.rows.forEach((row) => {
      const pct = Math.max(1.5, Math.min(100, (row.val / data.max) * 100));
      const barRow = document.createElement("div");
      barRow.className = "bar-row";
      if (row.kurowser) barRow.classList.add("is-kurowser");
      if (row.estimate) {
        barRow.classList.add("is-estimate");
        barRow.title = "Estimasi kasar, bukan hasil uji dengan kondisi yang sama.";
      }

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
      valEl.textContent = row.estimate
        ? `${row.val} ${data.unit} (est.)`
        : `${row.val} ${data.unit}`;

      barRow.append(nameEl, trackEl, valEl);
      chartBarsEl.appendChild(barRow);
    });
  }

  function selectChartTab(button) {
    chartTabBtns.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    if (chartBarsEl && button.id) {
      chartBarsEl.setAttribute("aria-labelledby", button.id);
    }
    renderChart(button.getAttribute("data-metric") || "ram4");
  }

  chartTabBtns.forEach((button) => {
    button.addEventListener("click", () => selectChartTab(button));
    button.addEventListener("keydown", (event) => {
      const index = chartTabBtns.indexOf(button);
      let next = null;
      if (event.key === "ArrowRight") next = chartTabBtns[(index + 1) % chartTabBtns.length];
      if (event.key === "ArrowLeft") next = chartTabBtns[(index - 1 + chartTabBtns.length) % chartTabBtns.length];
      if (event.key === "Home") next = chartTabBtns[0];
      if (event.key === "End") next = chartTabBtns[chartTabBtns.length - 1];
      if (next) {
        event.preventDefault();
        selectChartTab(next);
        next.focus();
      }
    });
  });

  if (chartTabBtns.length) {
    selectChartTab(chartTabBtns[0]);
  }

  // SHA-256 copy
  const copyStatus = document.getElementById("copy-status");

  function announceCopy(message) {
    if (copyStatus) copyStatus.textContent = message;
  }

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.dataset.label = button.textContent;

    button.addEventListener("click", async () => {
      const targetKey = button.getAttribute("data-copy-target");
      const text = targetKey && RELEASE_META[targetKey] ? RELEASE_META[targetKey].sha256 : "";
      if (!text) return;

      window.clearTimeout(button._resetTimer);
      button.disabled = true;
      button.textContent = "Menyalin";
      announceCopy("Menyalin SHA-256 ke clipboard.");

      let ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (error) {
          ok = false;
        }
      }

      if (!ok) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          ok = document.execCommand("copy");
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(textarea);
      }

      button.disabled = false;
      button.textContent = ok ? "Tersalin" : "Gagal";
      announceCopy(
        ok
          ? `SHA-256 ${targetKey} disalin ke clipboard.`
          : `Gagal menyalin SHA-256 ${targetKey}. Salin manual dari teks di atas.`
      );
      button._resetTimer = window.setTimeout(() => {
        button.textContent = button.dataset.label;
      }, 1800);
    });
  });
})();
