/* ============================================================
   QuizVerse — 📚 Assignment Library (Drive Hub) (v1 — ahw16)
   Google Drive assignments: download / preview / edit.
   - .docx -> Word-style editor (A4 printable page + ribbon toolbar)
   - .cpp  -> opens in C++ Lab (compile + run)
   - .txt  -> simple text editor
   - .pdf  -> preview + download
   ============================================================ */
(function () {
  "use strict";

  var EXTRA_KEY = "ahw_drive_extra_v1";
  var FOLDER_KEY = "ahw_folder_cache_v1";
  var FOLDER_EXTRA_KEY = "ahw_folder_extra_v1";
  var W = { title: "", fileName: "" };

  function $(id) { return document.getElementById(id); }

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
          id: "f_" + f.fileId,
          title: f.name,
          name: f.name,
          fileId: f.fileId,
          kind: f.kind || DOCXKIT.detectKind(f.name),
          desc: "📁 Folder",
          fromFolder: true
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

  function dhRenderFolderBox() {
    var box = $("dhFolderBox");
    if (!box) return;
    var ids = folderIds();
    if (!ids.length) { box.innerHTML = ""; return; }
    var n = folderFiles().length;
    var frames = ids.map(function (fid) {
      return '<iframe class="dh-folder-frame" loading="lazy" src="https://drive.google.com/embeddedfolderview?id=' + esc(fid) + '#list"></iframe>';
    }).join("");
    box.innerHTML = '<div class="dh-folder card">' +
      '<div class="dh-fold-head">📁 Assignment Folder' + (n ? " — <b>" + n + " files</b> list hue" : "") + "</div>" +
      '<div class="sub" style="margin-top:4px">Folder ki saari files neeche cards mein — 📥 Download, 👁️ Preview, ✏️ Edit.</div>' +
      '<div class="dh-acts" style="margin-top:10px">' +
      '<button class="btn btn-blue btn-sm" data-fact="scan">🔄 List refresh</button>' +
      '<button class="btn btn-gray btn-sm" data-fact="open">🌐 Drive folder kholein</button>' +
      "</div>" +
      '<div id="dhFolderStatus" class="sub" style="margin-top:6px;font-size:12px"></div>' +
      '<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12.5px">📁 Folder browser (Drive view)</summary>' + frames + "</details>" +
      "</div>";
    box.querySelectorAll("[data-fact]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.fact === "scan") dhScanFolders(true);
        else dhOpenFolderView();
      });
    });
  }

  var KIND_ICON = { docx: "📄", pdf: "📕", cpp: "💻", text: "📝", other: "📦" };
  var KIND_LABEL = { docx: "MS Word", pdf: "PDF", cpp: "C++ code", text: "Text", other: "File" };

  function dhRender() {
    dhRenderFolderBox();
    var box = $("dhList");
    if (!box) return;
    var q = (($("dhSearch") && $("dhSearch").value) || "").toLowerCase().trim();
    var items = allItems().filter(function (it) {
      if (!q) return true;
      return ((it.title || "") + " " + (it.subject || "") + " " + (it.desc || "") + " " + (it.name || "")).toLowerCase().indexOf(q) >= 0;
    });
    if (!items.length) {
      box.innerHTML = '<div class="dh-empty">' + (q
        ? "🔍 Koi assignment nahi mili — search badlein."
        : "📭 Abhi links add nahi hue. Upar ➕ se Google Drive link add karein ya admin se links lein.") + "</div>";
      return;
    }
    var h = "";
    items.forEach(function (it) {
      var extra = String(it.id).indexOf("dhx") === 0;
      h += '<div class="dh-card card">' +
        '<div class="dh-type dh-k-' + it.kind + '">' + (KIND_ICON[it.kind] || "📦") + "</div>" +
        '<div class="dh-info">' +
        '<div class="dh-t">' + esc(it.title || it.name || "Assignment") + "</div>" +
        '<div class="dh-s">' + esc([it.subject, it.desc, KIND_LABEL[it.kind] || it.kind].filter(Boolean).join(" · ")) + "</div>" +
        "</div>" +
        '<div class="dh-acts">' +
        '<button class="btn btn-blue btn-sm" data-act="dl" data-id="' + esc(it.id) + '">📥 Download</button>' +
        '<button class="btn btn-purple btn-sm" data-act="pv" data-id="' + esc(it.id) + '">👁️ Preview</button>' +
        (it.kind === "pdf"
          ? ""
          : '<button class="btn btn-green btn-sm" data-act="ed" data-id="' + esc(it.id) + '">✏️ Edit</button>') +
        (extra ? '<button class="btn btn-gray btn-sm" data-act="rm" data-id="' + esc(it.id) + '">🗑️</button>' : "") +
        "</div></div>";
    });
    box.innerHTML = h;
    box.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = allItems().filter(function (x) { return x.id === b.dataset.id; })[0];
        if (!it) return;
        if (b.dataset.act === "dl") dhDownload(it);
        else if (b.dataset.act === "pv") dhPreview(it);
        else if (b.dataset.act === "ed") dhEdit(it);
        else if (b.dataset.act === "rm") dhRemove(it);
      });
    });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function byId(id) { return allItems().filter(function (x) { return x.id === id; })[0]; }

  /* ---------- download / preview ---------- */
  function driveDownloadUrl(fileId) { return "https://drive.google.com/uc?export=download&id=" + fileId; }
  function drivePreviewUrl(fileId) { return "https://drive.google.com/file/d/" + fileId + "/preview"; }

  function dhDownload(it) {
    window.open(driveDownloadUrl(it.fileId), "_blank", "noopener");
  }

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

  /* ---------- fetch drive bytes (direct -> CORS proxies) ---------- */
  function proxyUrls(direct) {
    return [
      direct,
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(direct),
      "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(direct),
      "https://corsproxy.io/?" + encodeURIComponent(direct)
    ];
  }
  async function fetchDriveBytes(fileId) {
    var direct = driveDownloadUrl(fileId);
    var urls = proxyUrls(direct);
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i], { redirect: "follow" });
        if (!r.ok) continue;
        var b = new Uint8Array(await r.arrayBuffer());
        if (b.length < 200) continue;
        // HTML error / virus-scan page -> next
        var head = String.fromCharCode(b[0], b[1], b[2], b[3], b[4], b[5]).toLowerCase();
        if (head.indexOf("<") === 0 || head.indexOf("<!do") === 0) continue;
        return b;
      } catch (e) { /* next */ }
    }
    return null;
  }

  async function fetchFolderHtml(folderId) {
    var urls = proxyUrls("https://drive.google.com/drive/folders/" + folderId + "?hl=en");
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i], { redirect: "follow" });
        if (!r.ok) continue;
        var t = await r.text();
        if (t && t.length > 2000 && /drive|google/i.test(t)) return t;
      } catch (e) { /* next */ }
    }
    return null;
  }

  function folderStatus(msg) {
    var el = $("dhFolderStatus");
    if (el) el.innerHTML = msg || "";
  }

  function readFolderCache() {
    try { return JSON.parse(localStorage.getItem(FOLDER_KEY) || "{}"); } catch (e) { return {}; }
  }

  async function dhScanFolders(force) {
    var ids = folderIds();
    if (!ids.length) return;
    var cache = readFolderCache();
    if (!force && cache.ts && cache.files && cache.files.length && (Date.now() - cache.ts) < 30 * 60 * 1000) return;
    folderStatus("🔄 Folder scan ho raha hai — saari assignments list ho rahi hain…");
    var files = [], fail = 0;
    for (var i = 0; i < ids.length; i++) {
      var html = await fetchFolderHtml(ids[i]);
      if (html) {
        var got = DOCXKIT.parseFolderHtml(html);
        got.forEach(function (f) {
          if (!files.some(function (x) { return x.fileId === f.fileId; })) files.push(f);
        });
      } else fail++;
    }
    try { localStorage.setItem(FOLDER_KEY, JSON.stringify({ ts: Date.now(), files: files })); } catch (e) {}
    if (files.length) folderStatus("✅ " + files.length + " files mil gayin — cards neeche!");
    else folderStatus('⚠️ Folder list nahi mili — "🌐 Drive folder kholein" se manually dekhein (folder sharing "Anyone with the link" honi chahiye).');
    dhRender();
  }

  function dhOpenFolderView() {
    var ids = folderIds();
    if (!ids.length) return;
    window.open("https://drive.google.com/drive/folders/" + ids[0], "_blank", "noopener");
  }

  /* ---------- open editor by kind ---------- */
  async function dhEdit(it) {
    dhToast("⬇️ File download ho rahi hai… (" + (it.title || "") + ")");
    var bytes = await fetchDriveBytes(it.fileId);
    if (!bytes) { dhErr("File fetch nahi ho saki (network/Drive block). 📥 Download kar ke khud edit karein, ya thodi der baad try karein."); return; }
    var kind = it.kind;
    var name = it.name || (String(it.title || "assignment").replace(/[^\w.\- ]+/g, "_") + (kind === "docx" ? ".docx" : kind === "cpp" ? ".cpp" : kind === "pdf" ? ".pdf" : ".txt"));
    try {
      if (kind === "docx") {
        var isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
        if (isZip) {
          var html = await DOCXKIT.docxToHtml(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
          if (!html) { dhErr("Word file parhi nahi ja saki — shayad purana .doc format ho. 📥 Download karein."); return; }
          wpOpen(it.title || name, html, name.endsWith(".docx") ? name : name.replace(/\.(doc|docx)$/i, "") + ".docx");
        } else {
          var txt = new TextDecoder().decode(bytes);
          dtOpen(it.title || name, txt, name.replace(/\.[^.]+$/, "") + ".txt");
        }
      } else if (kind === "cpp") {
        var code = new TextDecoder().decode(bytes);
        openInCppLab(name, code);
        dhToast("💻 C++ Lab mein khul gaya — ▶️ Run dabayein!");
      } else if (kind === "text") {
        dtOpen(it.title || name, new TextDecoder().decode(bytes), name);
      } else {
        dhPreview(it);
        dhToast("Yeh file type edit support nahi karta — preview / download karein.");
      }
    } catch (e) {
      dhErr("Kholne mein masla: " + esc(e.message || e));
    }
  }

  /* ---------- Word-style editor ---------- */
  function wpOpen(title, html, fileName) {
    W.title = title; W.fileName = fileName;
    $("dhList").parentElement && ($("dhWrap").style.display = "none");
    $("dhWordWrap").style.display = "block";
    $("wpTitle").textContent = title + " — ✏️ Edit";
    var page = $("wpPage");
    page.innerHTML = html || "<p><br></p>";
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
      var els = document.querySelectorAll('#wpPage font[size="7"]');
      els.forEach(function (f) {
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
    var html = $("wpPage").innerHTML;
    var blob = DOCXKIT.buildDocxFromHtml(html, { title: W.title, author: "VU Student" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = W.fileName || "assignment.docx";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    dhToast("✅ MS Word file download ho gayi — <b>" + esc(a.download) + "</b>");
  }

  /* ---------- text editor ---------- */
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
    dhToast("✅ Download ho gaya — <b>" + esc(a.download) + "</b>");
  }

  /* ---------- admin: add / remove links ---------- */
  function dhAddDialog() {
    $("dhAddBox").style.display = "flex";
  }
  function dhCloseAdd() {
    $("dhAddBox").style.display = "none";
  }
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
      dhToast("✅ Folder add ho gaya — files list ho rahi hain…");
      return;
    }
    var fileId = DOCXKIT.fileIdFromLink(link);
    if (!fileId) { dhErr("Google Drive link theek nahi — file/d/…, open?id=… ya /folders/… wala link paste karein."); return; }
    var it = {
      id: "dhx" + Date.now(),
      title: $("dhAddTitle").value.trim() || "Assignment",
      subject: $("dhAddSubj").value.trim().toUpperCase(),
      desc: $("dhAddDesc").value.trim(),
      link: link,
      fileId: fileId,
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
    dhToast("✅ Link add ho gayi — card neeche dikh raha hai.");
  }
  function dhRemove(it) {
    if (!confirm("Yeh link list se hata dein?")) return;
    try {
      var ex = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]").filter(function (x) { return x.id !== it.id; });
      localStorage.setItem(EXTRA_KEY, JSON.stringify(ex));
    } catch (e) {}
    dhRender();
  }

  /* ---------- toasts ---------- */
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

  /* ---------- screen ---------- */
  function showDriveHub() {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    $("screen-drive").classList.add("active");
    $("dhWrap").style.display = "block";
    $("dhWordWrap").style.display = "none";
    $("dhTextWrap").style.display = "none";
    dhRender();
    dhScanFolders(false);   // cache pura ho to turant, warna background mein scan
  }

  globalThis.showDriveHub = showDriveHub;
  globalThis.dhRender = dhRender;
  globalThis.dhPreview = dhPreview;
  globalThis.dhClosePreview = dhClosePreview;
  globalThis.dhAddDialog = dhAddDialog;
  globalThis.dhCloseAdd = dhCloseAdd;
  globalThis.dhAddSave = dhAddSave;
  globalThis.dhScanFolders = dhScanFolders;
  globalThis.dhOpenFolderView = dhOpenFolderView;
  globalThis.dhAddExtra = function (it) {
    try {
      var ex = JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]");
      ex.push(it);
      localStorage.setItem(EXTRA_KEY, JSON.stringify(ex));
    } catch (e) {}
  };
  globalThis.wpBack = wpBack;
  globalThis.wpCmd = wpCmd;
  globalThis.wpSize = wpSize;
  globalThis.wpBlock = wpBlock;
  globalThis.wpDownload = wpDownload;
  globalThis.wpOpen = wpOpen;
  globalThis.dtOpen = dtOpen;
  globalThis.dtDownload = dtDownload;

  /* keyboard: Escape closes preview/add dialogs */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dhClosePreview();
      dhCloseAdd();
    }
  });
})();
