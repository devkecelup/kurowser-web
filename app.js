(() => {
  const RELEASE_META = {
    version: "v1.1.1",
    setup: {
      sizeLabel: "2.73 MiB (2,866,176 bytes)",
      sha256: "862EDEC815C274D9FF2C9CABDD584DE9B1FDBA3E1231ACC642D4A5A0A4D195A6",
    },
    portable: {
      sizeLabel: "1.83 MiB (1,923,072 bytes)",
      sha256: "E202BFB6BDAA99DBDF45D71320ABFB3D67A5E219D4F28951D512C654DE16AA1B",
    },
  };

  const root = document.documentElement;
  const mockupFrame = document.getElementById("mockup-frame");
  if (mockupFrame) mockupFrame.removeAttribute("inert");

  // Release labels synced with built binaries
  const setupSizeEl = document.getElementById("setup-size");
  const portableSizeEl = document.getElementById("portable-size");
  const setupHashEl = document.querySelector('[data-hash="setup"]');
  const portableHashEl = document.querySelector('[data-hash="portable"]');

  if (setupSizeEl) setupSizeEl.textContent = RELEASE_META.setup.sizeLabel;
  if (portableSizeEl) portableSizeEl.textContent = RELEASE_META.portable.sizeLabel;
  if (setupHashEl) setupHashEl.textContent = RELEASE_META.setup.sha256;
  if (portableHashEl) portableHashEl.textContent = RELEASE_META.portable.sha256;

  // Graphite (dark) <-> Paper (light) theme switch
  const themeToggle = document.getElementById("theme-toggle");
  const themeColor = document.getElementById("theme-color");

  function applyTheme(theme) {
    const isDark = theme !== "light";
    root.dataset.theme = isDark ? "dark" : "light";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Ganti ke tema Paper (terang)" : "Ganti ke tema Graphite (gelap)"
      );
      themeToggle.setAttribute(
        "title",
        isDark ? "Sedang aktif: Graphite (klik untuk Paper)" : "Sedang aktif: Paper (klik untuk Graphite)"
      );
    }
    if (themeColor) {
      themeColor.setAttribute("content", isDark ? "#0f1217" : "#ffffff");
    }
  }

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
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

  // Interactive browser preview (matches 50px slim rail default + hover-to-expand 240px + pin toggle)
  const mockSidebar = document.getElementById("mock-sidebar");
  const collapseBtn = document.getElementById("mock-collapse");
  const railSearchBtn = document.getElementById("mock-rail-search");
  const railShieldBtn = document.getElementById("mock-rail-shield");
  const railSettingsBtn = document.getElementById("mock-rail-settings");
  const railNewTabBtn = document.getElementById("mock-rail-newtab");
  const backBtn = document.getElementById("mock-back");
  const fwdBtn = document.getElementById("mock-fwd");
  const reloadBtn = document.getElementById("mock-reload");
  const folderBtn = document.getElementById("mock-folder-btn");
  const toggleAllBtn = document.getElementById("mock-toggle-all");
  const folderChildren = document.getElementById("mock-folder-children");
  const folderArrow = document.getElementById("mock-folder-arrow");
  const shieldToggle = document.getElementById("mock-shield-toggle");
  const shieldLabel = document.getElementById("mock-shield-label");
  const urlDisplay = document.getElementById("mock-url");
  const stageTitle = document.getElementById("mock-stage-title");
  const liveHint = document.getElementById("mock-live-hint");
  const newTabBtn = document.getElementById("mock-newtab");
  const trimBtn = document.getElementById("mock-trim-btn");
  const ramStat = document.getElementById("mock-ram-stat");
  const searchPreviewEl = document.getElementById("mock-search-preview");
  const linkTiles = Array.from(document.querySelectorAll(".mock-link"));
  const tabs = Array.from(document.querySelectorAll(".mock-tab"));

  let sidebarPinned = false;
  let sidebarHoverOpen = false;
  let sidebarHoldOpen = false;
  let hoverEnterTimer = 0;
  let hoverLeaveTimer = 0;
  let folderCollapsed = false;
  let shieldsEnabled = true;
  let activeState = { url: "kurowser://start", title: "Kurowser Start", blocked: 0 };
  const navHistory = [activeState];
  let navIndex = 0;

  function setHintParts(textPrefix, strongText, textSuffix) {
    if (!liveHint) return;
    liveHint.textContent = "";
    if (textPrefix) liveHint.appendChild(document.createTextNode(textPrefix));
    if (strongText) {
      const strongEl = document.createElement("strong");
      strongEl.textContent = strongText;
      liveHint.appendChild(strongEl);
    }
    if (textSuffix) liveHint.appendChild(document.createTextNode(textSuffix));
  }

  function updateNavButtons() {
    if (backBtn) backBtn.disabled = navIndex <= 0;
    if (fwdBtn) fwdBtn.disabled = navIndex >= navHistory.length - 1;
  }

  function renderShieldState() {
    const isInternal = activeState.url.startsWith("kurowser://");
    if (shieldToggle && shieldLabel) {
      shieldToggle.setAttribute("aria-pressed", String(shieldsEnabled));
      if (shieldsEnabled) {
        shieldToggle.classList.remove("is-off");
        shieldLabel.textContent = isInternal || activeState.blocked === 0 ? "ON" : `ON · ${activeState.blocked}`;
      } else {
        shieldToggle.classList.add("is-off");
        shieldLabel.textContent = "OFF";
      }
    }
    if (railShieldBtn) {
      railShieldBtn.setAttribute("aria-pressed", String(shieldsEnabled));
      railShieldBtn.classList.toggle("is-active", shieldsEnabled);
      railShieldBtn.classList.toggle("is-off", !shieldsEnabled);
    }
  }

  function syncActiveState(nextState, pushHistory) {
    activeState = { ...nextState };
    if (pushHistory) {
      navHistory.splice(navIndex + 1);
      navHistory.push(activeState);
      navIndex = navHistory.length - 1;
    }
    if (urlDisplay) urlDisplay.textContent = activeState.url;
    if (stageTitle) stageTitle.textContent = activeState.title;

    tabs.forEach((tab) => {
      const match = tab.getAttribute("data-url") === activeState.url;
      tab.classList.toggle("is-active", match);
      if (match) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });

    updateNavButtons();
    renderShieldState();
  }

  function isSidebarExpanded() {
    return sidebarPinned || sidebarHoverOpen || sidebarHoldOpen;
  }

  function syncSidebarLayout(announceHint) {
    const expanded = isSidebarExpanded();
    if (mockupFrame) mockupFrame.classList.toggle("is-collapsed", !expanded);
    if (collapseBtn) {
      collapseBtn.setAttribute("aria-expanded", String(expanded));
      collapseBtn.setAttribute("aria-pressed", String(sidebarPinned));
      collapseBtn.classList.toggle("is-pinned", sidebarPinned);
      collapseBtn.setAttribute(
        "title",
        sidebarPinned ? "Lepas kunci sidebar ke mode rail 50px (Ctrl+B)" : "Sematkan sidebar tetap terbuka (Ctrl+B)"
      );
    }
    if (announceHint) {
      if (sidebarPinned) {
        setHintParts("Sidebar disematkan ", "terbuka penuh", " (240px di desktop) sampai kunci dilepas.");
      } else if (!expanded) {
        setHintParts("Sidebar kembali menyusut ke ", "rail 50px", " dan melebar otomatis saat kursor masuk.");
      } else {
        setHintParts("Sidebar melebar sementara untuk ", "pencarian dan navigasi", ".");
      }
    }
  }

  function toggleFolder() {
    folderCollapsed = !folderCollapsed;
    if (folderChildren) folderChildren.classList.toggle("is-collapsed", folderCollapsed);
    if (folderArrow) folderArrow.textContent = folderCollapsed ? "▸" : "▾";
    if (folderBtn) folderBtn.setAttribute("aria-expanded", String(!folderCollapsed));
    if (folderCollapsed) {
      setHintParts("Folder ", "Workspace Ku", " dilipat untuk menghemat ruang daftar tab.");
    } else {
      setHintParts("Folder ", "Workspace Ku", " terbuka dengan 2 tab di dalamnya.");
    }
  }

  function openNewTabPreview() {
    syncActiveState({ url: "kurowser://start", title: "Kurowser Start", blocked: 0 }, true);
    if (searchPreviewEl) searchPreviewEl.textContent = "Ketik goo untuk google.com, atau cari di web";
    setHintParts("Tab baru dibuka ke ", "kurowser://start", " langsung dari skema internal.");
  }

  function toggleShieldsPreview() {
    shieldsEnabled = !shieldsEnabled;
    renderShieldState();
    if (shieldsEnabled) {
      setHintParts("", "Kurowser Shields aktif.", " Domain iklan, pelacak, dan payload iklan YouTube diblokir.");
    } else {
      setHintParts("", "Kurowser Shields dijeda.", " Bisa dinyalakan kembali per situs atau global.");
    }
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      window.clearTimeout(hoverEnterTimer);
      window.clearTimeout(hoverLeaveTimer);
      sidebarPinned = !sidebarPinned;
      if (!sidebarPinned) {
        sidebarHoverOpen = false;
        sidebarHoldOpen = false;
      }
      syncSidebarLayout(true);
    });
  }

  if (railSearchBtn) {
    railSearchBtn.addEventListener("click", () => {
      window.clearTimeout(hoverLeaveTimer);
      sidebarHoldOpen = true;
      syncSidebarLayout(true);
    });
  }

  const pointerHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (mockSidebar) {
    mockSidebar.addEventListener("mouseenter", () => {
      if (!pointerHoverQuery.matches || sidebarPinned) return;
      window.clearTimeout(hoverLeaveTimer);
      if (!sidebarHoverOpen) {
        hoverEnterTimer = window.setTimeout(() => {
          sidebarHoverOpen = true;
          syncSidebarLayout(false);
        }, 110);
      }
    });

    mockSidebar.addEventListener("mouseleave", () => {
      window.clearTimeout(hoverEnterTimer);
      if (sidebarPinned) return;
      hoverLeaveTimer = window.setTimeout(() => {
        sidebarHoverOpen = false;
        sidebarHoldOpen = false;
        syncSidebarLayout(false);
      }, 180);
    });

    mockSidebar.addEventListener("focusout", (event) => {
      if (sidebarPinned || sidebarHoverOpen || !sidebarHoldOpen) return;
      if (event.relatedTarget && mockSidebar.contains(event.relatedTarget)) return;
      sidebarHoldOpen = false;
      syncSidebarLayout(false);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (navIndex > 0) {
        navIndex -= 1;
        syncActiveState(navHistory[navIndex], false);
        setHintParts("Kembali ke ", activeState.url, ".");
      }
    });
  }

  if (fwdBtn) {
    fwdBtn.addEventListener("click", () => {
      if (navIndex < navHistory.length - 1) {
        navIndex += 1;
        syncActiveState(navHistory[navIndex], false);
        setHintParts("Maju ke ", activeState.url, ".");
      }
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      if (shieldsEnabled && !activeState.url.startsWith("kurowser://")) {
        activeState = { ...activeState, blocked: activeState.blocked + 1 };
        renderShieldState();
        setHintParts("Halaman dimuat ulang. Shields memblokir ", `${activeState.blocked} permintaan`, ".");
      } else {
        setHintParts("Halaman ", activeState.url, " dimuat ulang dari memori lokal.");
      }
    });
  }

  if (folderBtn) folderBtn.addEventListener("click", toggleFolder);
  if (toggleAllBtn) toggleAllBtn.addEventListener("click", toggleFolder);
  if (newTabBtn) newTabBtn.addEventListener("click", openNewTabPreview);
  if (railNewTabBtn) railNewTabBtn.addEventListener("click", openNewTabPreview);
  if (shieldToggle) shieldToggle.addEventListener("click", toggleShieldsPreview);
  if (railShieldBtn) railShieldBtn.addEventListener("click", toggleShieldsPreview);
  if (railSettingsBtn) {
    railSettingsBtn.addEventListener("click", () => {
      syncActiveState({ url: "kurowser://settings", title: "Pengaturan", blocked: 0 }, true);
      setHintParts("Membuka ", "kurowser://settings", " untuk mengatur tema, batas RAM LRU, dan mode hover sidebar.");
    });
  }

  const tileUrls = {
    GitHub: { url: "https://github.com/devkecelup/kurowser", title: "GitHub · Kurowser", blocked: 2 },
    YouTube: { url: "https://youtube.com", title: "YouTube", blocked: 6 },
    Google: { url: "https://www.google.com", title: "Google", blocked: 1 },
  };

  linkTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const key = tile.getAttribute("data-link") || "";
      const info = tileUrls[key];
      if (!info) return;
      syncActiveState(info, true);
      setHintParts("Membuka ", info.url, " dengan bilah alamat terpasang di sidebar.");
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const url = tab.getAttribute("data-url") || "kurowser://start";
      const title = tab.getAttribute("data-title") || url;
      const blocked = Number(tab.getAttribute("data-shields") || "0");
      syncActiveState({ url, title, blocked }, true);
      setHintParts("Berpindah ke ", url, ". Tab tidak aktif tetap dibatasi oleh LRU Tab Cap.");
    });
  });

  if (trimBtn) {
    trimBtn.addEventListener("click", () => {
      if (ramStat) ramStat.textContent = "1 aktif · Hemat ON";
      setHintParts("", "Hemat RAM dijalankan:", " renderer tab yang tidak aktif ditidurkan ke target memori rendah.");
    });
  }

  syncSidebarLayout(false);
  syncActiveState(activeState, false);

  // Honest comparison panel: baseline measured memory, exact v1.1.1 release sizes, and factual 7-browser architecture
  const METRIC_PANELS = {
    mem: {
      kind: "bars",
      title: "Jejak memori baseline Kurowser pada kurowser://start (MB)",
      sub: "Satuan MB Windows (1024 x 1024 byte). Nilai lebih kecil berarti jejak lebih hemat.",
      max: 420,
      unit: "MB",
      note: "Baseline diukur langsung di Windows memakai measure_memory.ps1 pada sesi bersih kurowser://start (v1.0.0): proses host kurowser.exe memakan 6.47 MB Private (34.86 MB Working Set) dan total pohon bersama 6 sub-proses msedgewebview2 sebesar 185.87 MB Private (386.74 MB Working Set).",
      rows: [
        { name: "Host Rust + Win32 (Private)", val: 6.47, kurowser: true },
        { name: "Host Rust + Win32 (Working Set)", val: 34.86, kurowser: true },
        { name: "Total Pohon Start (Private)", val: 185.87, kurowser: true },
        { name: "Total Pohon Start (Working Set)", val: 386.74, kurowser: true },
      ],
    },
    size: {
      kind: "bars",
      title: "Ukuran paket rilis resmi Kurowser v1.1.1 (MB)",
      sub: "Ukuran aktual berkas executable Windows x64 tanpa paket browser engine terbundel.",
      max: 4,
      unit: "MB",
      note: "Portable kurowser.exe (1.83 MB / 1,923,072 bytes) dan installer KurowserSetup.exe (2.73 MB / 2,866,176 bytes) berukuran kecil karena memanfaatkan Microsoft Edge WebView2 Runtime yang sudah tersedia di Windows 10 dan Windows 11.",
      rows: [
        { name: "kurowser.exe (Portabel)", val: 1.83, kurowser: true },
        { name: "KurowserSetup.exe (Installer)", val: 2.73, kurowser: true },
      ],
    },
    arch: {
      kind: "arch",
      title: "Perbandingan arsitektur 7 browser Windows",
      sub: "Ringkasan arsitektur engine, UI host, dan model tab tanpa perkiraan angka RAM.",
      note: "Untuk detail perbandingan lengkap antar fitur, lihat tabel 7 browser di bawah.",
      items: [
        {
          name: "Kurowser v1.1.1",
          tag: "WebView2 OS · Rust Win32",
          detail: "Rail 50px default (melebar ke 240px saat hover atau pin) + Tab Folders, tombol kanan atas, Kurowser Shields ON bawaan, LRU Cap 2 sampai 4 renderer, auto-updater SHA-256, dan skema kurowser:// tanpa localhost.",
          kurowser: true,
        },
        {
          name: "Brave",
          tag: "Bundled Chromium",
          detail: "UI Chromium, mendukung grup tab serta opsional tab vertikal, Brave Shields bawaan, dan fitur Memory Saver.",
        },
        {
          name: "Microsoft Edge",
          tag: "Chromium · Edge OS",
          detail: "UI Chromium terintegrasi Windows, mendukung tab vertikal serta Workspaces, Tracking Prevention dasar, dan Sleeping Tabs.",
        },
        {
          name: "Google Chrome",
          tag: "Bundled Chromium",
          detail: "UI Chromium horizontal dengan Grup Tab, pemblokiran iklan mengandalkan ekstensi terpisah, dan Memory Saver.",
        },
        {
          name: "Mozilla Firefox",
          tag: "Bundled Gecko",
          detail: "UI Gecko / XUL dengan Enhanced Tracking Protection bawaan, grup tab, opsional tab vertikal, dan Auto Tab Unload.",
        },
        {
          name: "Zen Browser",
          tag: "Bundled Gecko",
          detail: "UI Gecko dimodifikasi CSS dengan fokus sidebar vertikal, Workspace dan Folders, serta ekstensi eksternal untuk adblock penuh.",
        },
        {
          name: "Arc (Windows)",
          tag: "Chromium · Swift / WinUI",
          detail: "Sidebar kiri dengan Spaces dan Tab Folders native, menggunakan Chromium terbundel serta ekstensi eksternal untuk adblock.",
        },
      ],
    },
  };

  const chartTitleEl = document.getElementById("chart-title");
  const chartSubEl = document.getElementById("chart-sub");
  const chartBarsEl = document.getElementById("chart-bars");
  const chartNoteEl = document.getElementById("chart-note");
  const chartTabBtns = Array.from(document.querySelectorAll(".chart-tab"));

  function renderPanel(metricKey) {
    const data = METRIC_PANELS[metricKey];
    if (!data || !chartBarsEl) return;

    if (chartTitleEl) chartTitleEl.textContent = data.title;
    if (chartSubEl) chartSubEl.textContent = data.sub;
    if (chartNoteEl) chartNoteEl.textContent = data.note;

    chartBarsEl.textContent = "";

    if (data.kind === "arch") {
      const listEl = document.createElement("div");
      listEl.className = "arch-list";
      data.items.forEach((item) => {
        const card = document.createElement("div");
        card.className = item.kurowser ? "arch-item is-kurowser" : "arch-item";

        const head = document.createElement("div");
        head.className = "arch-title";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.name;
        const tagSpan = document.createElement("span");
        tagSpan.className = "arch-tag";
        tagSpan.textContent = item.tag;
        head.append(nameSpan, tagSpan);

        const body = document.createElement("p");
        body.className = "arch-detail";
        body.textContent = item.detail;

        card.append(head, body);
        listEl.appendChild(card);
      });
      chartBarsEl.appendChild(listEl);
      return;
    }

    if (!Array.isArray(data.rows) || data.rows.length === 0) {
      const err = document.createElement("p");
      err.className = "chart-error";
      err.textContent = "Belum ada data untuk metrik ini.";
      chartBarsEl.appendChild(err);
      return;
    }

    data.rows.forEach((row) => {
      const pct = Math.max(2.2, Math.min(100, (row.val / data.max) * 100));
      const barRow = document.createElement("div");
      barRow.className = row.kurowser ? "bar-row is-kurowser" : "bar-row";

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
      valEl.textContent = `${row.val.toFixed(2)} ${data.unit}`;

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
    renderPanel(button.getAttribute("data-metric") || "mem");
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

  // SHA-256 copy button
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

  // Scroll-reveal (MOTION 2)
  // Purpose: guide reading flow; elements fade-in-up as they enter the viewport.
  // Above-the-fold and scrolled-past elements (e.g. URL hash navigation) show immediately.
  // All transitions are disabled when prefers-reduced-motion: reduce is set.
  const revealItems = Array.from(
    document.querySelectorAll(".reveal:not(.reveal-hero):not(.reveal-hero-product)")
  );
  const markVisible = (el) => el.classList.add("is-visible");

  if (typeof IntersectionObserver !== "undefined" && revealItems.length > 0) {
    const revealVisibleInViewport = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of revealItems) {
        if (el.classList.contains("is-visible")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.96) {
          markVisible(el);
        }
      }
      if (revealItems.every((el) => el.classList.contains("is-visible"))) {
        window.removeEventListener("scroll", revealVisibleInViewport);
        window.removeEventListener("hashchange", revealVisibleInViewport);
      }
    };

    revealVisibleInViewport();

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight) {
            markVisible(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -12px 0px" }
    );

    revealItems.forEach((el) => {
      if (!el.classList.contains("is-visible")) {
        revealObserver.observe(el);
      }
    });

    document.documentElement.classList.add("js-reveal");
    window.addEventListener("scroll", revealVisibleInViewport, { passive: true });
    window.addEventListener("hashchange", revealVisibleInViewport, { passive: true });
  } else {
    revealItems.forEach(markVisible);
  }
})();
