/* ============================================================
   QuizVerse — 📚 Assignment Library (Drive Hub) (v2 — ahw18)
   - Folder link se saari assignments auto-list (har visit par fresh)
   - Subject-wise grouping (AHW.SUBJECTS ke colors/icons se)
   - 📥 Download / 👁️ Preview / ✏️ Edit
   - .docx -> Word-style editor (A4 page + ribbon) -> .docx export
   - .cpp  -> C++ Lab (compile + run) | .txt -> text editor
   ============================================================ */
(function () {
  "use strict";

  var EXTRA_KEY = "ahw_drive_extra_v1";
  var FOLDER_KEY = "ahw_folder_cache_v1";
  var FOLDER_EXTRA_KEY = "ahw_folder_extra_v1";
  var W = { title: "", fileName: "" };
  var scanning = false;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------------- data ---------------- */
  function folderIds() {
    var ids = (globalThis.AHW_ASSIGN_FOLDERS || []).slice();
    try {
      var ex = JSON.parse(localStorage.getItem(FOLDER_EXTRA_KEY) || "[]");
      if (Array.isArray(ex)) ids = ids.concat(ex);
    } catch (e) {}
    return ids.filter(Boolean);
  }

  function folderFiles() {
    var out = [];
    try {
      var c = JSON.parse(localStorage.getItem(FOLDER_KEY) || "{}");
      (c.files || []).forEach(function (f) {
        if (!f || !f.fileId) return;
        out.push({
          id: "f_" + f.fileId, title: f.name, name: f.name, fileId: f.fileId,
          kind: f.kind || DOCXKIT.detectKind(f.name), desc: "Drive folder", fromFolder: true
        });
      });
    } catch (e) {}
    return out;
  }

  function allItems() {
    var base = (globalThis.AHW_ASSIGNMENTS || []).slice();
    try {
      var ex = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]");
      if (Array.isArray(ex)) base = base.concat(ex);
    } catch (e) {}
    var items = base.map(function (it) {
      var o = {};
      for (var k in it) o[k] = it[k];
      o.fileId = o.fileId || DOCXKIT.fileIdFromLink(o.link || o.url || "");
      o.kind = o.kind || DOCXKIT.detectKind(o.name || o.title || "");
      o.id = o.id || ("dh" + String(o.fileId || o.title || Math.random()).slice(-10));
      return o;
    }).filter(function (it) { return it.fileId; });
    return items.concat(folderFiles());
  }

  /* subject guess: "Fall 2026_CS601_1.pdf" / "CS601_Assignment1.docx" -> CS601 */
  function guessSubject(it) {
    if (it.subject) return String(it.subject).toUpperCase();
    var m = String(it.name || it.title || "").match(/([A-Za-z]{2,4}\s?\d{3})/);
    return m ? m[1].replace(/\s+/g, "").toUpperCase() : "";
  }
  function subjectMeta(code) {
    var list = (globalThis.AHW && AHW.SUBJECTS) || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].code).toUpperCase() === code) return list[i];
    }
    return null;
  }
  var FALLBACK_COLORS = ["#7c3aed", "#ec4899", "#f97316", "#10b981", "#0ea5e9", "#8b5cf6", "#ef4444", "#14b8a6"];
  function fallbackColor(code) {
    var s = 0;
    for (var i = 0; i < code.length; i++) s += code.charCodeAt(i);
    return FALLBACK_COLORS[s % FALLBACK_COLORS.length];
  }

  /* ---------------- render ---------------- */
  var KIND_ICON = { docx: "📄", pdf: "📕", cpp: "💻", text: "📝", other: "📦" };

  function agoText(ts) {
    if (!ts) return "";
    var d = Math.round((Date.now() - ts) / 60000);
    if (d < 1) return "just now";
    if (d < 60) return d + " min ago";
    var h = Math.round(d / 60);
    if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
    var dd = Math.round(h / 24);
    return dd + (dd === 1 ? " day ago" : " days ago");
  }

  function dhRender() {
    renderStats();
    renderFolderStrip();
    var box = $("dhList");
    if (!box) return;
    var q = (($("dhSearch") && $("dhSearch").value) || "").toLowerCase().trim();
    var items = allItems().filter(function (it) {
      if (!q) return true;
      return ((it.title || "") + " " + (it.subject || "") + " " + (it.name || "") + " " + (it.desc || "")).toLowerCase().indexOf(q) >= 0;
    });

    if (!items.length) {
      box.innerHTML = q ? '<div class="dhx-empty">No assignment matched your search.</div>' : "";
      return;
    }

    /* group by subject */
    var groups = {}, order = [];
    items.forEach(function (it) {
      var code = guessSubject(it) || "OTHER";
      if (!groups[code]) { groups[code] = { items: [] }; order.push(code); }
      groups[code].items.push(it);
    });
    order.sort(function (a, b) {
      if (a === "OTHER") return 1;
      if (b === "OTHER") return -1;
      return a < b ? -1 : 1;
    });

    var h = "";
    order.forEach(function (code) {
      var meta = code !== "OTHER" ? subjectMeta(code) : null;
      var color = meta ? (meta.c1 || fallbackColor(code)) : fallbackColor(code === "OTHER" ? "zz" : code);
      var icon = meta ? (meta.icon || "📚") : (code === "OTHER" ? "📁" : "📚");
      var title = meta ? meta.title : (code === "OTHER" ? "Unclassified" : "Assignments");
      h += '<section class="dhx-group">';
      h += '<div class="dhx-ghead" style="--gc:' + esc(color) + '">' +
        '<span class="dhx-gicon">' + icon + "</span>" +
        '<div class="dhx-gtitle"><b>' + esc(code === "OTHER" ? "Other Files" : code) + "</b>" +
        "<span>" + esc(title) + " &middot; " + groups[code].items.length + " assignment" + (groups[code].items.length > 1 ? "s" : "") + "</span></div>" +
        "</div>";
      groups[code].items.forEach(function (it) {
        h += '<div class="dhx-card">' +
          '<div class="dhx-ic dhx-k-' + it.kind + '">' + (KIND_ICON[it.kind] || "📦") + "</div>" +
          '<div class="dhx-info">' +
          '<div class="dhx-t">' + esc(it.title || it.name || "Assignment") + "</div>" +
          '<div class="dhx-m">' + esc([(it.name && it.name !== it.title ? it.name : ""), it.desc].filter(Boolean).join(" · ")) + "</div>" +
          "</div>" +
          '<div class="dhx-acts">' +
          '<button class="dhx-btn dhx-btn-dl" data-act="dl" data-id="' + esc(it.id) + '">Download</button>' +
          (it.kind === "pdf" ? "" : '<button class="dhx-btn dhx-btn-ed" data-act="ed" data-id="' + esc(it.id) + '">Edit</button>') +
          '<button class="dhx-btn dhx-btn-pv" data-act="pv" data-id="' + esc(it.id) + '">Preview</button>' +
          "</div></div>";
      });
      h += "</section>";
    });
    box.innerHTML = h;
    box.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = allItems().filter(function (x) { return x.id === b.dataset.id; })[0];
        if (!it) return;
        if (b.dataset.act === "dl") dhDownload(it);
        else if (b.dataset.act === "pv") dhPreview(it);
        else if (b.dataset.act === "ed") dhEdit(it);
      });
    });
  }

  function renderStats() {
    var el = $("dhStats");
    if (!el) return;
    var items = allItems();
    var subs = {};
    items.forEach(function (it) { var c = guessSubject(it); if (c) subs[c] = 1; });
    var cache = readFolderCache();
    el.innerHTML =
      '<span class="dhx-stat"><b>' + items.length + "</b> assignments</span>" +
      '<span class="dhx-stat"><b>' + Object.keys(subs).length + "</b> subjects</span>" +
      (cache.ts ? '<span class="dhx-stat dhx-upd">Updated ' + esc(agoText(cache.ts)) + "</span>" : "");
  }

  function renderFolderStrip() {
    var box = $("dhFolderBox");
    if (!box) return;
    if (!folderIds().length) { box.innerHTML = ""; return; }
    var n = folderFiles().length;
    if (n) {
      box.innerHTML = '<div class="dhx-strip">' +
        "<span>Google Drive folder &middot; " + n + " files</span>" +
        '<button class="dhx-btn dhx-btn-pv" data-fact="open">Open Drive Folder</button>' +
        "</div>";
    } else {
      box.innerHTML = '<div class="dhx-strip dhx-strip-warn">' +
        "<span>Loading the assignment list&hellip;</span>" +
        '<button class="dhx-btn dhx-btn-pv" data-fact="open">Open Drive Folder</button>' +
        "</div>" +
        '<iframe class="dhx-folder-frame" loading="lazy" src="https://drive.google.com/embeddedfoldiew?id=' +
        esc(folderIds()[0]) + '#list"></iframe>';
    }
    box.querySelectorAll("[data-fact]").forEach(function (b) {
      b.addEventListener("click", function () { dhOpenFolderView(); });
    });
  }

  /* ---------------- download / preview ---------------- */
  function driveDownloadUrl(fileId) { return "https://drive.google.com/uc?export=download&id=" + fileId; }
  function drivePreviewUrl(fileId) { return "https://drive.google.com/file/d/" + fileId + "/preview"; }

  function dhDownload(it) { window.open(driveDownloadUrl(it.fileId), "_blank", "noopener"); }

  function dhPreview(it) {
    var box = $("dhPreviewBox");
    if (!box) return;
    box.innerHTML = '<div class="dh-pv-inner">' +
      '<div class="dh-pv-bar"><b>👁️ ' + esc(it.title || "Preview") + '</b>' +
      '<button class="btn btn-gray btn-sm" onclick="dhClosePreview()">✕ Band karein</button></div>' +
      '<iframe class="dh-pv-frame" src="' + drivePreviewUrl(it.fileId) + '"></iframe></div>';
    box.style.display = "flex";
  }
  function dhClosePreview() {
    var box = $("dhPreviewBox");
    if (box) { box.style.display = "none"; box.innerHTML = ""; }
  }

  /* ---------------- fetch (direct -> CORS proxies) ---------------- */
  function proxyUrls(direct) {
    return [
      direct,
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(direct),
      "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(direct),
      "https://corsproxy.io/?" + encodeURIComponent(direct),
      "https://api.cors.lol/?url=" + encodeURIComponent(direct),
      "https://r.jina.ai/" + direct
    ];
  }
  function fetchWithTimeout(url, ms) {
    try {
      var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms || 9000) : null;
      return fetch(url, { redirect: "follow", signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { if (timer) clearTimeout(timer); return r; })
        .catch(function (e) { if (timer) clearTimeout(timer); throw e; });
    } catch (e) { return Promise.reject(e); }
  }
  async function fetchTextViaProxies(url) {
    var urls = proxyUrls(url);
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetchWithTimeout(urls[i], 9000);
        if (!r.ok) continue;
        var t = await r.text();
        if (t && t.length > 20 && t[0] === "{") {
          try {
            var j = JSON.parse(t);
            if (j && typeof j.contents === "string" && j.contents.length > 500) t = j.contents;
          } catch (e2) {}
        }
        if (t && t.length > 500) return t;
      } catch (e) { /* next */ }
    }
    return null;
  }
  function bytesLookValid(b, kind) {
    if (!b || b.length < 200) return false;
    var s = String.fromCharCode(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7]).toLowerCase();
    if (b[0] === 0x50 && b[1] === 0x4b) return true;             // zip (.docx)
    if (b[0] === 0xD0 && b[1] === 0xCF) return true;             // OLE (.doc)
    if (kind === "pdf") return s.indexOf("%pdf") === 0;
    if (s.indexOf("<") === 0) return false;                       // html error page
    if (s.indexOf("{") === 0) return false;                       // json error
    return true;
  }
  function fetchDriveBytes(fileId, kind) {
    var directs = [
      "https://drive.google.com/uc?export=download&confirm=t&id=" + fileId,
      "https://drive.usercontent.google.com/download?id=" + fileId + "&export=download"
    ];
    var urls = [];
    directs.forEach(function (d) {
      urls.push(d);
      urls.push("https://api.allorigins.win/raw?url=" + encodeURIComponent(d));
      urls.push("https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(d));
      urls.push("https://corsproxy.io/?" + encodeURIComponent(d));
      urls.push("https://api.cors.lol/?url=" + encodeURIComponent(d));
    });
    return new Promise(function (resolve) {
      var done = false;
      if (typeof fetch !== "function") { resolve(null); return; }
      var left = urls.length;
      var finish = function (b) { if (!done) { done = true; resolve(b); } };
      setTimeout(function () { finish(null); }, 13000); /* overall hard cap */
      urls.forEach(function (u) {
        fetchWithTimeout(u, 13000).then(function (r) {
          if (!r || !r.ok) return null;
          return r.arrayBuffer();
        }).then(function (ab) {
          if (!ab) return;
          var b = new Uint8Array(ab);
          if (bytesLookValid(b, kind)) finish(b);
        }).catch(function () {}).then(function () {
          if (--left === 0) finish(null);
        });
      });
    });
  }

  /* ---------------- folder scan (auto) ---------------- */
  function readFolderCache() {
    try { return JSON.parse(localStorage.getItem(FOLDER_KEY) || "{}"); } catch (e) { return {}; }
  }

  async function dhScanFolders(force) {
    if (scanning) return;
    var ids = folderIds();
    if (!ids.length) return;
    var cache = readFolderCache();
    if (!force && cache.ts && cache.files && cache.files.length && (Date.now() - cache.ts) < 5 * 60 * 1000) return;
    scanning = true;
    var files = [];
    for (var attempt = 0; attempt < 3 && !files.length; attempt++) {
      for (var i = 0; i < ids.length && !files.length; i++) {
        /* embeddedfoldiew = server-rendered list — sab se reliable */
        var html = await fetchTextViaProxies("https://drive.google.com/embeddedfolderview?id=" + ids[i]);
        if (!html) html = await fetchTextViaProxies("https://drive.google.com/drive/folders/" + ids[i] + "?hl=en");
        if (html) {
          DOCXKIT.parseFolderHtml(html).forEach(function (f) {
            if (!files.some(function (x) { return x.fileId === f.fileId; })) files.push(f);
          });
        }
      }
      if (!files.length && attempt < 2) await new Promise(function (r) { setTimeout(r, 4000); }); // retry after 4s
    }
    scanning = false;
    if (files.length) {
      try { localStorage.setItem(FOLDER_KEY, JSON.stringify({ ts: Date.now(), files: files })); } catch (e) {}
      dhRender();
    } else {
      renderFolderStrip();
    }
  }

  function dhOpenFolderView() {
    var ids = folderIds();
    if (!ids.length) return;
    window.open("https://drive.google.com/drive/folders/" + ids[0], "_blank", "noopener");
  }

  /* ---------------- editors ---------------- */
  var lastEditItem = null;

  function dhEdit(it) {
    lastEditItem = it;
    var kind = it.kind || DOCXKIT.detectKind(it.name || "");
    var name = it.name || String(it.title || "assignment").replace(/[^\w.\- ]+/g, "_");
    /* 1) editor TURANT khulta hai — kabhi "kuch nahi hua" nahi lagega */
    if (kind === "pdf") { dhPreview(it); return; }
    if (kind === "cpp") {
      openInCppLab(name, "// " + (it.title || name) + " load ho raha hai ...\n");
    } else if (kind === "docx") {
      wpOpen(it.title || name, "<p style=\"color:#999\">Loading document&hellip;</p>", /\.docx$/i.test(name) ? name : name + ".docx");
    } else {
      dtOpen(it.title || name, "Loading " + (it.title || name) + " ...", /\.[a-z0-9]+$/i.test(name) ? name : name + ".txt");
    }
    dhToast("Fetching " + (it.title || "file") + "&hellip;");
    /* 2) file background mein aati hai; fail ho to help dialog editor ke upar */
    fetchDriveBytes(it.fileId, kind).then(function (bytes) {
      if (!bytes) { dhLoadDialog(it); return; }
      openBytes(it, bytes);
    });
  }

  function dhLoadDialog(it) {
    var box = $("dhLoadBox");
    if (!box) { dhErr("Could not load the file automatically. Use Download, or try again shortly."); return; }
    $("dhLoadMsg").innerHTML = "<b>" + esc(it.title || "The file") + "</b> automatically load nahi hui (network/Drive). " +
      "Aap <b>Download</b> kar ke file apne device par le lein, phir <b>Choose File</b> se editor mein khol lein — editing 100% kaam karegi.";
    box.style.display = "flex";
  }
  function dhCloseLoad() { var b = $("dhLoadBox"); if (b) b.style.display = "none"; }
  function dhRetryEdit() {
    dhCloseLoad();
    if (lastEditItem) dhEdit(lastEditItem);
  }
  function dhPickLocal() { var f = $("dhLocalFile"); if (f) f.click(); }

  function openBytes(it, bytes) {
    var name = it.name || (String(it.title || "assignment").replace(/[^\w.\- ]+/g, "_"));
    try {
      var isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
      var isOle = bytes[0] === 0xD0 && bytes[1] === 0xCF;
      if (isOle) { dhErr("Purana .doc format editor mein nahi khulta. File ko MS Word mein .docx Save As kar ke dobara try karein."); return; }
      if (isZip) {
        var html = DOCXKIT.docxToHtml(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        Promise.resolve(html).then(function (h) {
          if (!h) { dhErr("Word file ka content read nahi hua — dobara try karein."); return; }
          var fname = /\.(docx|doc)$/i.test(name) ? name.replace(/\.(doc)$/i, ".docx") : name + ".docx";
          wpOpen(it.title || name, h, fname);
          dhCloseLoad();
        });
      } else if (/\.(cpp|cc|c|h|hpp)$/i.test(name)) {
        openInCppLab(name, new TextDecoder().decode(bytes));
        dhToast("Opened in C++ Lab &mdash; press Run to compile and execute.");
        dhCloseLoad();
      } else if (/\.pdf$/i.test(name)) {
        if (it.fileId && it.fileId !== "local") dhPreview(it);
        dhToast("PDF files edit nahi hoti — Preview ya Download use karein.");
        dhCloseLoad();
      } else {
        dtOpen(it.title || name, new TextDecoder().decode(bytes), /\.[a-z0-9]+$/i.test(name) ? name : name + ".txt");
        dhCloseLoad();
      }
    } catch (e) {
      dhErr("Could not open the file: " + esc(e.message || e));
    }
  }

  function wpOpen(title, html, fileName) {
    W.title = title; W.fileName = fileName;
    $("dhWrap").style.display = "none";
    $("dhWordWrap").style.display = "block";
    $("wpTitle").textContent = title + " — ✏️ Edit";
    var page = $("wpPage");
    page.innerHTML = html || "<p><br></p>";
    try { document.execCommand("styleWithCSS", false, true); } catch (e) {}
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}
    page.focus();
  }
  function wpBack() {
    $("dhWordWrap").style.display = "none";
    $("dhTextWrap").style.display = "none";
    $("dhWrap").style.display = "block";
    dhRender();
  }
  function wpCmd(cmd, val) {
    $("wpPage").focus();
    try { document.execCommand(cmd, false, val == null ? null : val); } catch (e) {}
  }
  function wpSize(pt) {
    $("wpPage").focus();
    try {
      document.execCommand("fontSize", false, "7");
      document.querySelectorAll('#wpPage font[size="7"]').forEach(function (f) {
        var s = document.createElement("span");
        s.style.fontSize = pt + "pt";
        while (f.firstChild) s.appendChild(f.firstChild);
        f.parentNode.replaceChild(s, f);
      });
    } catch (e) {}
  }
  function wpBlock(tag) {
    $("wpPage").focus();
    try { document.execCommand("formatBlock", false, tag); } catch (e) {}
  }
  function wpDownload() {
    var blob = DOCXKIT.buildDocxFromHtml($("wpPage").innerHTML, { title: W.title, author: "VU Student" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = W.fileName || "assignment.docx";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    dhToast("Downloaded <b>" + esc(a.download) + "</b>");
  }

  function dtOpen(title, text, fileName) {
    W.title = title; W.fileName = fileName;
    $("dhWrap").style.display = "none";
    $("dhWordWrap").style.display = "none";
    $("dhTextWrap").style.display = "block";
    $("dtTitle").textContent = title + " — ✏️ Edit";
    $("dtArea").value = text || "";
  }
  function dtDownload() {
    var blob = new Blob([$("dtArea").value], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = W.fileName || "assignment.txt";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    dhToast("Downloaded <b>" + esc(a.download) + "</b>");
  }

  /* ---------------- add link dialog (topbar ➕) ---------------- */
  function dhAddDialog() { $("dhAddBox").style.display = "flex"; }
  function dhCloseAdd() { $("dhAddBox").style.display = "none"; }
  function dhAddSave() {
    var link = $("dhAddLink").value.trim();
    var folderId = DOCXKIT.folderIdFromLink(link);
    if (folderId) {
      try {
        var fx = JSON.parse(localStorage.getItem(FOLDER_EXTRA_KEY) || "[]");
        if (fx.indexOf(folderId) < 0) fx.push(folderId);
        localStorage.setItem(FOLDER_EXTRA_KEY, JSON.stringify(fx));
      } catch (e) {}
      dhCloseAdd();
      dhScanFolders(true);
      dhToast("Folder added. Loading its files&hellip;");
      return;
    }
    var fileId = DOCXKIT.fileIdFromLink(link);
    if (!fileId) { dhErr("That does not look like a valid Google Drive link."); return; }
    var it = {
      id: "dhx" + Date.now(),
      title: $("dhAddTitle").value.trim() || "Assignment",
      subject: $("dhAddSubj").value.trim().toUpperCase(),
      desc: $("dhAddDesc").value.trim(),
      link: link, fileId: fileId,
      kind: $("dhAddKind").value,
      name: $("dhAddName").value.trim()
    };
    try {
      var ex = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]");
      ex.push(it);
      localStorage.setItem(EXTRA_KEY, JSON.stringify(ex));
    } catch (e) {}
    dhCloseAdd();
    dhRender();
    dhToast("Thank you! The link has been added to the library.");
  }

  /* ---------------- toasts ---------------- */
  function dhToast(msg) {
    var el = $("dhMsg");
    if (!el) return;
    el.innerHTML = '<div class="as-ok">' + msg + "</div>";
    setTimeout(function () { if (el) el.innerHTML = ""; }, 6000);
  }
  function dhErr(msg) {
    var el = $("dhMsg");
    if (!el) return;
    el.innerHTML = '<div class="as-err">' + msg + "</div>";
    setTimeout(function () { if (el) el.innerHTML = ""; }, 9000);
  }

  /* ---------------- screen ---------------- */
  function showDriveHub() {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    $("screen-drive").classList.add("active");
    $("dhWrap").style.display = "block";
    $("dhWordWrap").style.display = "none";
    $("dhTextWrap").style.display = "none";
    dhRender();
    dhScanFolders(false);          // cache 5 min se puraana ho to background mein fresh list
    dhScanFolders(true);           // nayi upload khud aa jaye — hamesha fresh check
    if (!showDriveHub._timer) {
      showDriveHub._timer = setInterval(function () {
        if ($("screen-drive") && $("screen-drive").classList.contains("active") &&
            $("dhWrap") && $("dhWrap").style.display !== "none") {
          dhScanFolders(true);
        }
      }, 4 * 60 * 1000);           // har 4 minute mein auto-refresh
    }
  }

  /* ---------------- globals ---------------- */
  globalThis.showDriveHub = showDriveHub;
  globalThis.dhRender = dhRender;
  globalThis.dhPreview = dhPreview;
  globalThis.dhClosePreview = dhClosePreview;
  globalThis.dhAddDialog = dhAddDialog;
  globalThis.dhCloseAdd = dhCloseAdd;
  globalThis.dhAddSave = dhAddSave;
  globalThis.dhScanFolders = dhScanFolders;
  globalThis.dhOpenFolderView = dhOpenFolderView;
  globalThis.dhEdit = dhEdit;
  globalThis.dhRetryEdit = dhRetryEdit;
  globalThis.dhPickLocal = dhPickLocal;
  globalThis.dhCloseLoad = dhCloseLoad;
  globalThis.dhOpenBytes = openBytes;
  globalThis.wpBack = wpBack;
  globalThis.wpCmd = wpCmd;
  globalThis.wpSize = wpSize;
  globalThis.wpBlock = wpBlock;
  globalThis.wpDownload = wpDownload;
  globalThis.wpOpen = wpOpen;
  globalThis.dtOpen = dtOpen;
  globalThis.dtDownload = dtDownload;

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { dhClosePreview(); dhCloseAdd(); dhCloseLoad(); }
  });

  /* local device file -> editor (guaranteed fallback) */
  document.addEventListener("DOMContentLoaded", function () {
    var inp = $("dhLocalFile");
    if (!inp || inp.dataset.wired) return;
    inp.dataset.wired = "1";
    inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      f.arrayBuffer().then(function (ab) {
        var b = new Uint8Array(ab);
        var kind = DOCXKIT.detectKind(f.name);
        var it = {
          id: "local", title: f.name, name: f.name, fileId: "local", kind: kind, desc: "Device file"
        };
        if (kind === "pdf") {
          dhCloseLoad();
          dhToast("PDF files edit nahi hoti — Preview ya Download use karein.");
          return;
        }
        openBytes(it, b);
      }).catch(function (e) { dhErr("File read nahi hui: " + esc(e.message || e)); });
      inp.value = "";
    });
  });
})();
