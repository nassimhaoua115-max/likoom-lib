/* lk.js generated 2026-11-10T08:08:33.161Z */
try {
(function () {
  if (window.__likoomAdsRuntime) {
    if (document.readyState !== "loading") window.__likoomAdsRuntime.boot();
    return;
  }
  var endpoints = ["https://hub.likoom.com/api/public","https://likoom-hub.nassim-haoua115.workers.dev/api/public"];
  function attempt(i, query) {
    if (i >= endpoints.length) return Promise.reject(new Error("unreachable"));
    var ctl = window.AbortController ? new AbortController() : null;
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { if (ctl) ctl.abort(); reject(new Error("timeout")); }, 4000);
      fetch(endpoints[i] + "/lk-serve?" + query, ctl ? { signal: ctl.signal, credentials: "omit" } : { credentials: "omit" })
        .then(function (res) {
          if (res.status >= 500) throw new Error("server");
          return res.ok ? res.json() : { d: null };
        })
        .then(function (p) { clearTimeout(timer); resolve(p); }, function (e) { clearTimeout(timer); reject(e); });
    }).then(function (p) {
      var d = p && p.d;
      if (d && d.type === "image") { d.type = "banner"; d.image = d.src; }
      return d || null;
    }, function () { return attempt(i + 1, query); });
  }
  function request(query) { return attempt(0, query); }

  var pageId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) { var r = Math.random()*16|0; return (c === "x" ? r : (r&3|8)).toString(16); });
  var mounted = [];
  var edgeEntries = [];
  var bodyBase = null;
  var neighbors = [];
  var pageDismissals = {};
  var resetSites = {};
  var resetRequested = new URL(window.location.href).searchParams.get("likoom_reset") === "1";
  var scrollHidden = function e(e,t,n,r,i,a){return!e.startsWith(`fixed-`)||t===`always`?!1:t===`collapse`?r>=n:e!==`fixed-top`&&e!==`fixed-bottom`||r<=0?!1:Math.abs(i)<2?a:i>0};
  var lastScrollY = Math.max(0, window.scrollY || 0);

  function updateScrollVisibility(delta) {
    var y = Math.max(0, window.scrollY || 0);
    edgeEntries.forEach(function(entry) {
      if (entry.closed) return;
      var hidden = scrollHidden(entry.slot.position, entry.slot.scrollBehavior || "always", entry.slot.scrollThreshold == null ? 200 : entry.slot.scrollThreshold, y, delta || 0, !!entry.scrollHidden);
      entry.scrollHidden = hidden;
      entry.box.classList.toggle("likoom-scroll-hidden", hidden);
      entry.wrap.style.pointerEvents = hidden ? "none" : "";
      if (hidden) entry.wrap.setAttribute("inert", ""); else entry.wrap.removeAttribute("inert");
    });
    updateOffsets();
  }
  window.addEventListener("scroll", function() {
    var y = Math.max(0, window.scrollY || 0);
    var delta = y - lastScrollY;
    lastScrollY = y;
    updateScrollVisibility(delta);
  }, {passive:true});

  function dismissalKey(site, slot) { return "likoom-dismiss-" + site + ":" + slot; }
  function storage(name) { try { return window[name]; } catch (e) { return null; } }
  function resetDismissals(site) {
    if (!resetRequested || resetSites[site]) return;
    resetSites[site] = true;
    var prefix = "likoom-dismiss-" + site + ":";
    var legacyKeys = {};
    document.querySelectorAll("[data-likoom-slot]").forEach(function(host) {
      if (host.getAttribute("data-likoom-site") === site)
        legacyKeys["likoom-closed-" + host.getAttribute("data-likoom-slot")] = true;
    });
    ["sessionStorage", "localStorage"].forEach(function(name) {
      var store = storage(name);
      if (!store) return;
      try {
        for (var i = store.length - 1; i >= 0; i--) {
          var key = store.key(i);
          // Legacy keys have no site identifier; reset only ones known to belong to this site's hosts.
          if (key && (key.indexOf(prefix) === 0 || legacyKeys[key])) store.removeItem(key);
        }
      } catch (e) {}
    });
    Object.keys(pageDismissals).forEach(function(key) { if (key.indexOf(prefix) === 0) delete pageDismissals[key]; });
  }
  function isDismissed(site, slot) {
    var key = dismissalKey(site, slot);
    if (pageDismissals[key]) return true;
    var session = storage("sessionStorage");
    var persistent = storage("localStorage");
    try { if (session && (session.getItem(key) || session.getItem("likoom-closed-" + slot))) return true; } catch (e) {}
    try {
      var raw = persistent && persistent.getItem(key);
      if (raw) {
        var expires = Number(raw);
        if (Number.isFinite(expires) && expires > Date.now()) return true;
        persistent.removeItem(key);
      }
    } catch (e) {}
    return false;
  }
  function rememberDismissal(site, slot, mode) {
    var key = dismissalKey(site, slot);
    pageDismissals[key] = true;
    var session = storage("sessionStorage");
    var persistent = storage("localStorage");
    try { if (session) { session.removeItem(key); session.removeItem("likoom-closed-" + slot); } } catch (e) {}
    try { if (persistent) persistent.removeItem(key); } catch (e) {}
    if (mode === "page") return;
    if (mode === "24h" || mode === "7d") {
      try { if (persistent) persistent.setItem(key, String(Date.now() + (mode === "7d" ? 7 : 1) * 86400000)); } catch (e) {}
    } else {
      try { if (session) session.setItem(key, "1"); } catch (e) {}
    }
  }

  function injectStyles() {
    if (document.getElementById("likoom-ads-style")) return;
    var style = document.createElement("style");
    style.id = "likoom-ads-style";
    style.textContent = [
      ".likoom-ad{box-sizing:border-box;overflow:hidden;margin:0;opacity:0;transition:max-height .45s ease,opacity .45s ease,margin .45s ease,transform .45s ease}",
      ".likoom-ad *{box-sizing:border-box}",
      ".likoom-anim-expand{max-height:0}",
      ".likoom-anim-slide-top{transform:translateY(-100%)}",
      ".likoom-anim-slide-bottom{transform:translateY(100%)}",
      ".likoom-anim-slide-left{transform:translateX(-100%)}",
      ".likoom-anim-slide-right{transform:translateX(100%)}",
      ".likoom-ad.is-visible{opacity:1;transform:none;margin:12px 0}",
      ".likoom-fixed .likoom-ad.is-visible{margin:0}",
      ".likoom-ad.likoom-scroll-hidden{opacity:0!important;transform:translateY(-100%)!important;pointer-events:none!important}",
      ".likoom-fixed-bottom .likoom-scroll-hidden{transform:translateY(100%)!important}",
      ".likoom-fixed-left .likoom-scroll-hidden{transform:translateX(-100%)!important}",
      ".likoom-fixed-right .likoom-scroll-hidden{transform:translateX(100%)!important}",
      ".likoom-ad--vertical{display:inline-block;vertical-align:top}",
      ".likoom-banner a{display:block}",
      ".likoom-banner img{display:block;width:100%;height:auto;max-width:none}",
      ".likoom-ticker{position:relative;white-space:nowrap;display:flex;align-items:center}",
      ".likoom-ticker-track{display:inline-flex;align-items:center;flex:none;will-change:transform;animation:likoom-scroll linear infinite}",
      ".likoom-pausable:hover .likoom-ticker-track{animation-play-state:paused}",
      ".likoom-ticker-vertical{display:block;white-space:normal}",
      ".likoom-ticker-vertical .likoom-ticker-track{display:flex;flex-direction:column;width:100%;animation-name:likoom-scroll-vertical}",
      ".likoom-ticker-vertical a{display:flex;align-items:center;justify-content:center;text-align:center;white-space:normal;overflow-wrap:anywhere;overflow:hidden;padding:4px 12px;line-height:1.4;max-height:5.6em}",
      ".likoom-ticker-vertical a span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;width:100%}",
      ".likoom-ticker-vtext{white-space:nowrap}",
      ".likoom-ticker-vtext .likoom-ticker-track{display:flex;flex-direction:column;align-items:center;width:100%}",
      ".likoom-vtext{writing-mode:vertical-rl;text-orientation:mixed;display:flex;flex-direction:row;align-items:center;direction:ltr;white-space:nowrap;flex:none;width:max-content;height:max-content}",
      ".likoom-vtext-ccw{transform:rotate(180deg)}",
      ".likoom-ticker a,.likoom-slide a{text-decoration:none;color:inherit;font:inherit}",
      ".likoom-ticker a{display:inline-block;padding:0 4px}",
      ".likoom-sep{display:inline-block;padding:0 24px;opacity:.7}",
      ".likoom-vtext a{display:block;flex:none;padding:0;white-space:nowrap}",
      ".likoom-vtext .likoom-sep{display:block;flex:none;padding:24px 0;text-align:center}",
      ".likoom-cycle a{padding:0}",
      "@keyframes likoom-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}",
      "@keyframes likoom-scroll-vertical{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}",
      ".likoom-slide{position:relative;overflow:hidden}",
      ".likoom-slide a{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;padding:0 12px;white-space:normal;transform:translateY(110%);transition:transform .6s cubic-bezier(.22,.61,.36,1)}",
      ".likoom-slide a.is-up{transform:translateY(0)}",
      ".likoom-fixed{position:fixed;z-index:2147483000;pointer-events:none}",
      ".likoom-fixed>*{pointer-events:auto}",
      ".likoom-fixed-top{top:0;left:0;right:0;padding-top:env(safe-area-inset-top)}",
      ".likoom-fixed-bottom{bottom:0;left:0;right:0;padding-bottom:env(safe-area-inset-bottom)}",
      ".likoom-fixed-left{left:0;top:50%;transform:translateY(-50%);padding-left:env(safe-area-inset-left)}",
      ".likoom-fixed-right{right:0;top:50%;transform:translateY(-50%);padding-right:env(safe-area-inset-right)}",
      ".likoom-fixed-left .likoom-ad,.likoom-fixed-right .likoom-ad{max-height:100vh}",
      ".likoom-fixed-left .likoom-ad img,.likoom-fixed-right .likoom-ad img{max-height:100%}",
      ".likoom-close{position:absolute;top:4px;right:4px;z-index:2;width:22px;height:22px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font:14px/22px sans-serif;text-align:center;cursor:pointer;padding:0}",
      "@media (prefers-reduced-motion:reduce){.likoom-ad,.likoom-slide a{transition:none!important}.likoom-ticker-track{animation:none!important}}",
      "@media (max-width:768px){.likoom-hide-small{display:none!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  function updateOffsets() {
    if (!bodyBase) return;
    var offsets = {top:0,bottom:0,left:0,right:0};
    edgeEntries.forEach(function(entry) {
      var edge = entry.slot.position.replace("fixed-", "");
      var size = 0;
      if (!entry.closed && !entry.scrollHidden && entry.wrap.isConnected && getComputedStyle(entry.wrap).display !== "none") {
        var rect = entry.box.getBoundingClientRect();
        size = edge === "left" || edge === "right" ? rect.width : rect.height;
      }
      entry.wrap.style[edge] = offsets[edge] + "px";
      if (entry.slot.pageBehavior !== "overlay") offsets[edge] += size;
    });
    ["top","bottom","left","right"].forEach(function(edge) {
      document.documentElement.style.setProperty("--likoom-offset-" + edge, offsets[edge] + "px");
      var key = "padding" + edge.charAt(0).toUpperCase() + edge.slice(1);
      document.body.style.transition = bodyBase.transition;
      document.body.style[key] = offsets[edge] ? (bodyBase.values[edge] + offsets[edge]) + "px" : bodyBase.inline[key];
    });
    neighbors.forEach(function(n) {
      if (!n.el.isConnected) return;
      n.el.style.transition = n.transition;
      ["top","bottom","left","right"].forEach(function(edge) {
        if (n.edges[edge] == null) return;
        n.el.style[edge] = offsets[edge] ? (n.edges[edge] + offsets[edge]) + "px" : n.inline[edge];
      });
    });
    clearTimeout(bodyBase.restoreTimer);
    if (!Object.values(offsets).some(function(v){ return v > 0; })) {
      bodyBase.restoreTimer = setTimeout(function() {
        document.body.style.transition = bodyBase.inline.transition;
        neighbors.forEach(function(n){ n.el.style.transition = n.inline.transition; });
      }, 500);
    }
  }

  function registerEdge(wrap, box, slot) {
    if (!bodyBase) {
      var computed = getComputedStyle(document.body);
      bodyBase = {values:{},inline:{},transition:computed.transition === "all 0s ease 0s" ? "" : computed.transition + ","};
      ["top","bottom","left","right"].forEach(function(edge) {
        var key = "padding" + edge.charAt(0).toUpperCase() + edge.slice(1);
        bodyBase.values[edge] = parseFloat(computed[key]) || 0;
        bodyBase.inline[key] = document.body.style[key];
        bodyBase.transition += "padding-" + edge + " .45s ease,";
      });
      bodyBase.inline.transition = document.body.style.transition;
      bodyBase.transition = bodyBase.transition.replace(/,$/, "");
      var elements = document.body.querySelectorAll("*");
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (el.closest(".likoom-fixed")) continue;
        var c = getComputedStyle(el);
        if (c.position !== "fixed" && c.position !== "sticky") continue;
        var n = {el:el,edges:{},inline:{transition:el.style.transition},transition:(c.transition === "all 0s ease 0s" ? "" : c.transition + ",") + "top .45s ease,bottom .45s ease,left .45s ease,right .45s ease"};
        ["top","bottom","left","right"].forEach(function(edge) {
          // Move only explicitly edge-anchored elements; full-width headers' left/right anchors are not sidebars.
          var relevant = edge === "top" || edge === "bottom" || el.getBoundingClientRect().width < document.documentElement.clientWidth / 2;
          if (relevant && c[edge] !== "auto" && Math.abs(parseFloat(c[edge])) < 2) {
            n.edges[edge] = parseFloat(c[edge]) || 0; n.inline[edge] = el.style[edge];
          }
        });
        if (Object.keys(n.edges).length) neighbors.push(n);
      }
    }
    var entry = {wrap:wrap,box:box,slot:slot,closed:false};
    edgeEntries.push(entry);
    box._likoomEdge = entry;
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(updateOffsets);
      observer.observe(box); box._likoomResize = observer;
    }
    updateScrollVisibility(0);
  }

  function dismiss(box) {
    if (box._likoomClosed) return;
    box._likoomClosed = true;
    if (box._likoomEdge) box._likoomEdge.closed = true;
    if (box._likoomResize) box._likoomResize.disconnect();
    var h = box.getBoundingClientRect().height;
    box.style.maxHeight = h + "px";
    box.offsetHeight;
    box.classList.remove("is-visible");
    box.style.maxHeight = "0px";
    updateOffsets();
    setTimeout(function() {
      if (box._likoomEdge) box._likoomEdge.wrap.remove(); else box.remove();
    }, 500);
  }
  window.addEventListener("resize", updateOffsets);

  function isFixed(slot) {
    return slot && /^fixed-/.test(slot.position || "");
  }

  function setupBox(box, slot) {
    slot = slot || {};
    var anim = slot.animation || "expand";
    box.classList.add("likoom-anim-" + anim);
    box.classList.add("likoom-ad--" + (slot.orientation || "horizontal"));
    box.classList.add("likoom-pos-" + (slot.position || "in-content"));
    var pos = slot.position || "";
    var mode = slot.widthMode || "fixed";
    if (pos === "fixed-top" || pos === "fixed-bottom") {
      box.style.width = "100%";
    } else if (pos === "fixed-left" || pos === "fixed-right") {
      box.style.width = (slot.width || 160) + "px";
      if (slot.heightMode === "full") {
        box.setAttribute("data-likoom-fullheight", "1");
        box.style.height = "100vh";
        box.style.maxHeight = "100vh";
      } else {
        box.style.height = (slot.height || 600) + "px";
      }
    } else if (mode === "fill") {
      box.style.width = "100%";
    } else if (mode === "full") {
      box.setAttribute("data-likoom-full", "1");
    } else if (slot.orientation === "vertical") {
      box.style.width = (slot.width || 160) + "px";
    } else {
      box.style.width = "100%";
      box.style.maxWidth = (slot.width || 728) + "px";
    }
  }

  function fitFullWidth(box) {
    if (!box.getAttribute("data-likoom-full")) return;
    var vw = document.documentElement.clientWidth; // excludes scrollbar
    box.style.width = vw + "px";
    box.style.maxWidth = "none";
    box.style.marginLeft = "0px";
    var left = box.getBoundingClientRect().left;
    box.style.marginLeft = -left + "px";
  }

  var fullBoxes = [];
  window.addEventListener("resize", function () {
    for (var i = 0; i < fullBoxes.length; i++) fitFullWidth(fullBoxes[i]);
  });

  function reveal(node, targetHeight) {
    if (node.getAttribute("data-likoom-full")) {
      fullBoxes.push(node);
      fitFullWidth(node);
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var side = node.classList.contains("likoom-pos-fixed-left") || node.classList.contains("likoom-pos-fixed-right");
        var h = node.getAttribute("data-likoom-fullheight") ? window.innerHeight : (targetHeight || node.scrollHeight || 2000);
        if (side) h = Math.min(h, window.innerHeight);
        if (node.classList.contains("likoom-anim-expand"))
          node.style.maxHeight = h + "px";
        if (node._likoomClosed) return;
        node.classList.add("is-visible");
        updateOffsets();
        if (node.classList.contains("likoom-anim-expand")) {
          setTimeout(function () { if (!node._likoomClosed) node.style.maxHeight = node.getAttribute("data-likoom-fullheight") ? "100vh" : side ? h + "px" : "none"; node._likoomRevealed = true; }, 500);
        } else node._likoomRevealed = true;
      });
    });
  }

  function mount(host, box, slot) {
    if (!isFixed(slot)) {
      if (slot.hideOnSmall) box.classList.add("likoom-hide-small");
      host.appendChild(box);
      return;
    }
    var siteId = host.getAttribute("data-likoom-site");
    var slotId = host.getAttribute("data-likoom-slot");
    if (isDismissed(siteId, slotId)) return false;
    var wrap = document.createElement("div");
    wrap.className = "likoom-fixed likoom-" + slot.position;
    if (slot.hideOnSmall) wrap.classList.add("likoom-hide-small");
    wrap.appendChild(box);
    if (slot.showClose !== false) {
      box.style.position = "relative";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "likoom-close";
      btn.setAttribute("aria-label", "Close advertisement");
      btn.textContent = "\u00d7";
      btn.addEventListener("click", function () {
        var currentSlot = box._likoomEdge ? box._likoomEdge.slot : slot;
        rememberDismissal(siteId, slotId, currentSlot.rememberClose || "session");
        dismiss(box);
      });
      box.appendChild(btn);
    }
    document.body.appendChild(wrap);
    registerEdge(wrap, box, slot);
  }

  function renderBanner(host, ad) {
    var slot = ad.slot || {};
    var box = document.createElement("div");
    box.className = "likoom-ad likoom-banner";
    setupBox(box, slot);
    var link = document.createElement("a");
    link.href = ad.clickUrl;
    link.target = "_blank";
    link.rel = "noopener sponsored";
    var img = document.createElement("img");
    img.alt = "Advertisement";
    img.src = ad.image;
    var sidePinned = slot.position === "fixed-left" || slot.position === "fixed-right";
    if (slot.heightMode === "fixed" || sidePinned) {
      img.style.height = slot.heightMode === "full" && sidePinned ? "100%" : (slot.height || 90) + "px";
      img.style.objectFit = slot.imageFit === "stretch" ? "fill" : (slot.imageFit || "contain");
      link.style.height = "100%";
    }
    link.appendChild(img);
    box.appendChild(link);
    if (mount(host, box, slot) === false) return;
    function loaded() { reveal(box); }
    img.addEventListener("load", loaded);
    img.addEventListener("error", function(){ dismiss(box); });
    if (img.complete && img.naturalWidth) loaded();
    mounted.push({host:host,box:box,campaignId:ad.campaignId});
  }

  function applyTickerBar(box, style, slot) {
    var h = style.barHeight || (slot.height && slot.height > 0 ? slot.height : 44);
    if (!box.getAttribute("data-likoom-fullheight")) box.style.height = h + "px";
    if (style.background) box.style.background = style.background;
    if (style.color) box.style.color = style.color;
    if (style.fontSize) box.style.fontSize = style.fontSize + "px";
    if (style.bold) box.style.fontWeight = "700";
    if (style.border) box.style.border = (style.borderWidth || 1) + "px solid " + (style.borderColor || "currentColor");
    var fonts = ["Cairo", "Tajawal", "Almarai", "Noto Kufi Arabic", "Amiri"];
    if (fonts.indexOf(style.font) >= 0) {
      box.style.fontFamily = '"' + style.font + '",system-ui,sans-serif';
      if (!document.querySelector('link[data-likoom-font="' + style.font + '"]')) {
        var fontLink = document.createElement("link");
        fontLink.rel = "stylesheet"; fontLink.setAttribute("data-likoom-font", style.font);
        fontLink.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(style.font) + ":wght@400;700&display=swap";
        document.head.appendChild(fontLink);
      }
    }
    if (style.pauseOnHover !== false) box.classList.add("likoom-pausable");
    return h;
  }

  function styleItem(el, s) {
    if (!s) return;
    if (s.color) el.style.color = s.color;
    if (s.background) el.style.background = s.background;
    if (s.fontSize) el.style.fontSize = s.fontSize + "px";
    el.style.fontWeight = s.bold ? "700" : "";
  }

  function makeLink(item) {
    var link = document.createElement("a");
    link.href = item.clickUrl;
    link.target = "_blank";
    link.rel = "noopener sponsored";
    link.textContent = item.text;
    link.setAttribute("dir", "auto");
    link.style.unicodeBidi = "isolate";
    styleItem(link, item.style);
    return link;
  }

  function buildGroup(ad, style, vertical, cycleMode) {
    var group = document.createDocumentFragment();
    ad.items.forEach(function (item, index) {
      var link = makeLink(item);
      if (vertical) {
        link.style.minHeight = Math.max(32, (style.fontSize || 16) * 2.8) + "px";
        var text = document.createElement("span"); text.textContent = link.textContent; link.textContent = ""; link.appendChild(text);
      }
      group.appendChild(link);
      if (vertical || (cycleMode && index === ad.items.length - 1)) return;
      var sep = document.createElement("span");
      sep.className = "likoom-sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = style.separator == null ? "\u2022" : style.separator;
      group.appendChild(sep);
    });
    return group;
  }

  function renderTickerScroll(host, ad) {
    var slot = ad.slot || {};
    var style = ad.style || {};
    var box = document.createElement("div");
    box.className = "likoom-ad likoom-ticker";
    setupBox(box, slot);
    var vtext = style.textOrientation === "vertical-cw" || style.textOrientation === "vertical-ccw";
    var h = applyTickerBar(box, style, slot);
    var direction = style.direction || "auto";
    if (direction === "auto") direction = ad.items.some(function(item) { return /\p{Script=Arabic}/u.test(item.text); }) ? "ltr" : "rtl";
    // Vertical text strips only move along their length; horizontal choices fall back to rising.
    if (vtext && direction !== "down") direction = "up";
    var vertical = vtext || direction === "up" || direction === "down";
    if (vtext) box.classList.add("likoom-ticker-vtext");
    else if (vertical) box.classList.add("likoom-ticker-vertical");
    var track = document.createElement("div");
    track.className = "likoom-ticker-track";
    var speed = style.speed && style.speed > 0 ? style.speed : 80;
    var pause = typeof style.pauseBetweenCycles === "number" && isFinite(style.pauseBetweenCycles)
      ? Math.min(10, Math.max(0, style.pauseBetweenCycles)) : 1.5;
    // The motion origin is the entry edge, never the flex-centered position of a full-height child.
    track.style.position = "absolute";
    track.style.top = "0";
    track.style.left = "0";
    if (!vertical) track.style.height = "100%";
    if (pause > 0) box.classList.add("likoom-cycle");

    function makeStrip() {
      var strip = document.createElement("div");
      var content = strip;
      if (vtext) {
        // The rotation lives on an inner wrapper so the cycle animation's transform never overrides it.
        strip.style.display = "flex";
        strip.style.flexDirection = "column";
        strip.style.alignItems = "center";
        strip.style.flex = "none";
        var rot = document.createElement("div");
        rot.className = "likoom-vtext" + (style.textOrientation === "vertical-ccw" ? " likoom-vtext-ccw" : "");
        strip.appendChild(rot);
        content = rot;
      } else {
        strip.style.display = vertical ? "block" : "inline-flex";
        strip.style.flex = "none";
        if (vertical) strip.style.width = "100%";
        strip.style.alignItems = "center";
      }
      content.appendChild(buildGroup(ad, style, vertical && !vtext, pause > 0));
      strip._likoomContent = content;
      return strip;
    }
    var strip = makeStrip();
    track.appendChild(strip);
    box.appendChild(track);
    if (mount(host, box, slot) === false) return;

    function containerSize() { return vertical ? box.clientHeight : (box.clientWidth || document.documentElement.clientWidth); }
    // Fractional (unrounded) sizes so motion paths and loop copies never fall short by a sub-pixel.
    // Layout sizes from computed style: fractional and unaffected by entry-animation transforms.
    function layoutSize(el) { var cs = getComputedStyle(el); var v = parseFloat(vertical ? cs.height : cs.width); if (!(v > 0)) { var r = el.getBoundingClientRect(); v = vertical ? r.height : r.width; } return v || 0; }
    function stripSize() { var r = strip.getBoundingClientRect(); return vertical ? r.height : r.width; }
    function boxSize() { var cs = getComputedStyle(box); return Math.max(0, layoutSize(box) - (parseFloat(vertical ? cs.borderTopWidth : cs.borderLeftWidth) || 0) - (parseFloat(vertical ? cs.borderBottomWidth : cs.borderRightWidth) || 0)) || (vertical ? 0 : document.documentElement.clientWidth); }
    // Resolve once web fonts have settled (loaded or failed); a cap keeps a stalled font from blocking forever.
    function fontsSettled(fn) {
      var done = false; function go() { if (!done) { done = true; fn(); } }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(go, 0); }, go); else go();
      setTimeout(go, 3000);
    }

    if (pause > 0) {
      // Cycle mode: the whole strip enters fully from beyond one edge, crosses at constant
      // speed, leaves fully beyond the other edge, then the bar stays empty for the pause.
      track.style.animation = "none";
      var anim = null;
      var waitTimer = 0;
      var hovered = false;
      var measured = null;
      var resting = false;
      if (style.pauseOnHover !== false) {
        box.addEventListener("mouseenter", function () { hovered = true; if (anim) anim.pause(); });
        box.addEventListener("mouseleave", function () { hovered = false; if (anim) anim.play(); });
      }
      function wait(ms, next) {
        var remaining = ms;
        var previous = Date.now();
        function tick() {
          if (box._likoomClosed) return;
          var now = Date.now();
          if (!hovered) remaining -= now - previous;
          previous = now;
          if (remaining <= 0) next(); else waitTimer = setTimeout(tick, 50);
        }
        waitTimer = setTimeout(tick, 50);
      }
      function cycle() {
        if (box._likoomClosed) return;
        // Measure only the fully expanded bar, never one still growing in its entry animation.
        if (!box._likoomRevealed) { waitTimer = setTimeout(cycle, 60); return; }
        var c = boxSize();
        var s = stripSize();
        if (!c || !s) { wait(300, cycle); return; }
        measured = [c, s];
        resting = false;
        var axis = vertical ? "Y" : "X";
        var entersPositive = direction === "rtl" || direction === "up";
        var from = "translate" + axis + "(" + (entersPositive ? c + 0.01 : -s - 0.01) + "px)";
        var to = "translate" + axis + "(" + (entersPositive ? -s - 0.01 : c + 0.01) + "px)";
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          strip.style.transform = "translate" + axis + "(0px)";
          return;
        }
        strip.style.transform = from;
        anim = strip.animate(
          [{ transform: from }, { transform: to }],
          { duration: (c + s) / speed * 1000, easing: "linear" }
        );
        if (hovered) anim.pause();
        anim.onfinish = function () {
          // Rest at the fully-outside start pose during the pause; cancel drops the finished animation.
          strip.style.transform = from;
          var done = anim;
          anim = null;
          resting = true;
          if (done) done.cancel();
          wait(pause * 1000, cycle);
        };
      }
      function restart() {
        if (box._likoomClosed) return;
        if (anim) { anim.cancel(); anim = null; }
        clearTimeout(waitTimer);
        cycle();
      }
      // Restart only when the measured bar or strip length actually changed (late font, fallback, resize).
      function remeasure() {
        if (box._likoomClosed) return;
        if (measured && Math.abs(measured[0] - boxSize()) < 0.01 && Math.abs(measured[1] - stripSize()) < 0.01) return;
        // Font/resize notifications must not shorten or extend an already-running empty pause.
        if (resting) {
          var outside = direction === "rtl" || direction === "up" ? boxSize() + 0.01 : -stripSize() - 0.01;
          strip.style.transform = "translate" + (vertical ? "Y" : "X") + "(" + outside + "px)";
          return;
        }
        restart();
      }
      // Never start with an unmeasured strip: wait until fonts settle; park it fully outside meanwhile.
      strip.style.transform = "translate" + (vertical ? "Y" : "X") + "(" + (direction === "rtl" || direction === "up" ? "100000" : "-100000") + "px)";
      var started = false;
      fontsSettled(function () {
        started = true; cycle();
        if (window.ResizeObserver) {
          var cycleObserver = new ResizeObserver(function () {
            if (box._likoomClosed) { cycleObserver.disconnect(); return; }
            remeasure();
          });
          cycleObserver.observe(box); cycleObserver.observe(strip);
        }
      });
      if (document.fonts && document.fonts.addEventListener) {
        var onFont = function () { if (started) setTimeout(remeasure, 0); };
        document.fonts.addEventListener("loadingdone", onFont);
        document.fonts.addEventListener("loadingerror", onFont);
      }
    } else {
      // Seamless loop (pause = 0): repeat content until one half exceeds the bar, duplicate, loop.
      if (vertical) track.style.animationName = "likoom-scroll-vertical";
      function build() {
        while (track.children.length > 1) track.removeChild(track.lastChild);
        var container = boxSize();
        var guard = 0;
        // Each copy must be at least the bar's exact fractional length (+1px overlap margin);
        // the track then loops by exactly one copy (-50%), so no gap can open.
        while (stripSize() < container + 1 && guard < 40) {
          strip._likoomContent.appendChild(buildGroup(ad, style, vertical && !vtext));
          guard++;
        }
        var copy = strip.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        var links = copy.querySelectorAll("a");
        for (var i = 0; i < links.length; i++) links[i].tabIndex = -1;
        track.appendChild(copy);
        track.style.animationDuration = Math.max(4, stripSize() / speed) + "s";
        lastBuilt = [boxSize(), stripSize()];
        track.style.animationDirection = direction === "ltr" || direction === "down" ? "reverse" : "normal";
      }
      var lastBuilt = null;
      function rebuildIfChanged() {
        if (box._likoomClosed) return;
        if (lastBuilt && Math.abs(lastBuilt[0] - boxSize()) < 0.01 && Math.abs(lastBuilt[1] - stripSize()) < 0.01) return;
        build();
      }
      build();
      fontsSettled(rebuildIfChanged);
      if (document.fonts && document.fonts.addEventListener) {
        document.fonts.addEventListener("loadingdone", function(){ setTimeout(rebuildIfChanged, 0); });
        document.fonts.addEventListener("loadingerror", function(){ setTimeout(rebuildIfChanged, 0); });
      }
      if (window.ResizeObserver) {
        var scrollObserver = new ResizeObserver(function() { if (!box._likoomClosed) rebuildIfChanged(); else scrollObserver.disconnect(); });
        scrollObserver.observe(box); scrollObserver.observe(strip);
      }
    }
    reveal(box, h);
    mounted.push({host:host,box:box,campaignId:ad.items[0].campaignId});
  }

  function renderTickerSlide(host, ad) {
    var slot = ad.slot || {};
    var style = ad.style || {};
    var box = document.createElement("div");
    box.className = "likoom-ad likoom-slide";
    setupBox(box, slot);
    var h = applyTickerBar(box, style, slot);
    var links = ad.items.map(function (item) {
      var link = makeLink(item);
      box.appendChild(link);
      return link;
    });
    if (mount(host, box, slot) === false) return;
    reveal(box, h);
    mounted.push({host:host,box:box,campaignId:ad.items[0].campaignId});
    var index = 0;
    var paused = false;
    box.addEventListener("mouseenter", function() { if (style.pauseOnHover !== false) paused = true; });
    box.addEventListener("mouseleave", function() { paused = false; });
    var speedFactor = 80 / (style.speed > 0 ? style.speed : 80);
    links.forEach(function(link) { link.style.transitionDuration = (0.6 * speedFactor) + "s"; });
    function wait(ms, next) {
      var remaining = ms;
      var previous = Date.now();
      function tick() {
        if (box._likoomClosed) return;
        var now = Date.now(); if (!paused) remaining -= now - previous; previous = now;
        if (remaining <= 0) next(); else setTimeout(tick, 50);
      }
      setTimeout(tick, 50);
    }
    function cycle() {
      if (box._likoomClosed) return;
      var link = links[index % links.length];
      link.classList.add("is-up");
      wait(4200 * speedFactor, function () {
        link.classList.remove("is-up");
        index = (index + 1) % links.length;
        wait(900 * speedFactor, cycle);
      });
    }
    setTimeout(cycle, 400);
  }

  function load(host) {
    var site = host.getAttribute("data-likoom-site");
    var slot = host.getAttribute("data-likoom-slot");
    if (!site || !slot || host.getAttribute("data-likoom-loaded")) return Promise.resolve();
    resetDismissals(site);
    host.setAttribute("data-likoom-loaded", "1");
    if (isDismissed(site, slot)) return Promise.resolve();

    return request("site=" + encodeURIComponent(site) + "&slot=" + encodeURIComponent(slot) + "&page=" + encodeURIComponent(pageId))
      .then(function (ad) {
        if (!ad) return;
        injectStyles();
        if (ad.type === "banner") renderBanner(host, ad);
        else if (ad.type === "ticker" && ad.items && ad.items.length) {
          var st = (ad.slot && ad.slot.tickerStyle) || "horizontal-scroll";
          if (st === "vertical-slide") renderTickerSlide(host, ad);
          else renderTickerScroll(host, ad);
        }
      })
      .catch(function () {});
  }

  function boot() {
    var hosts = document.querySelectorAll("[data-likoom-slot]");
    var chain = Promise.resolve();
    for (var i = 0; i < hosts.length; i++) (function(host){ chain = chain.then(function(){ return load(host); }); })(hosts[i]);
  }

  setInterval(function() {
    mounted.forEach(function(entry) {
      if (entry.box._likoomClosed || !entry.box.isConnected) return;
      var site = entry.host.getAttribute("data-likoom-site");
      var slot = entry.host.getAttribute("data-likoom-slot");
      request("site=" + encodeURIComponent(site) + "&slot=" + encodeURIComponent(slot) + "&check=1&campaign=" + encodeURIComponent(entry.campaignId), true)
        .then(function(ad){
          if (!ad) dismiss(entry.box);
          else if (entry.box._likoomEdge) {
            var edge = entry.box._likoomEdge;
            edge.slot = ad.slot;
            edge.wrap.classList.toggle("likoom-hide-small", !!edge.slot.hideOnSmall);
            updateScrollVisibility(0);
          }
        }).catch(function(){});
    });
  }, 15000);

  window.__likoomAdsRuntime = { boot: boot };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

} catch (e) {}
