/* ============================================================
   QuizVerse — DOCXKIT (v1 — ahw16)
   Real .docx read/write engine: OOXML + stored-ZIP, zero deps.
   - buildDocxFromHtml(html, opts) -> Blob (formatted Word file)
   - docxToHtml(arrayBuffer)       -> HTML (keeps bold/italic/size/color/align)
   - extractDocxText(arrayBuffer)  -> plain text
   - fileIdFromLink / detectKind   -> Google Drive helpers
   Used by: Assignment Library (Drive) word editor.
   ============================================================ */
(function () {
  "use strict";

  var W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  /* ---------- zip ---------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zipStore(files) {
    var enc = new TextEncoder();
    var parts = [], central = [], offset = 0;
    var dosTime = 0, dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
    files.forEach(function (f) {
      var nameB = enc.encode(f.name);
      var dataB = enc.encode(f.data);
      var crc = crc32(dataB);
      var lh = new Uint8Array(30 + nameB.length);
      var dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
      dv.setUint16(10, dosTime, true); dv.setUint16(12, dosDate, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, dataB.length, true); dv.setUint32(22, dataB.length, true);
      dv.setUint16(26, nameB.length, true); dv.setUint16(28, 0, true);
      lh.set(nameB, 30);
      parts.push(lh, dataB);
      var ch = new Uint8Array(46 + nameB.length);
      var cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, dataB.length, true); cv.setUint32(24, dataB.length, true);
      cv.setUint16(28, nameB.length, true);
      cv.setUint32(42, offset, true);
      ch.set(nameB, 46);
      central.push(ch);
      offset += lh.length + dataB.length;
    });
    var cdSize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
    var out = new Uint8Array(offset + cdSize + 22);
    var pos = 0;
    parts.forEach(function (p) { out.set(p, pos); pos += p.length; });
    central.forEach(function (p) { out.set(p, pos); pos += p.length; });
    out.set(eocd, pos);
    return out;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  /* ---------- package parts ---------- */
  var CT_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '</Types>';
  var RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '</Relationships>';
  var DOC_RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';
  var STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:styles xmlns:w="' + W_NS + '">' +
    '<w:docDefaults><w:rPrDefault><w:rPr>' +
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
    '<w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '</w:styles>';
  function coreXml(title, author) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/">' +
      '<dc:title>' + esc(title || "Assignment") + '</dc:title>' +
      '<dc:creator>' + esc(author || "VU Student") + '</dc:creator>' +
      '</cp:coreProperties>';
  }
  var SECTPR = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>' +
    '</w:sectPr>';

  /* ---------- color helpers ---------- */
  function rgbToHex(c) {
    if (!c) return "";
    c = String(c).trim();
    if (c[0] === "#") return c.length === 4 ? "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
    var m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      var h = function (n) { return ("0" + parseInt(n, 10).toString(16)).slice(-2); };
      return "#" + h(m[1]) + h(m[2]) + h(m[3]);
    }
    return "";
  }
  function xmlColor(c) { return (rgbToHex(c) || "#000000").replace("#", "").toUpperCase(); }

  /* ================================================================
     HTML -> OOXML
     ================================================================ */
  function runXml(text, f) {
    var font = f.font || "Times New Roman";
    var rpr = '<w:rFonts w:ascii="' + esc(font) + '" w:hAnsi="' + esc(font) + '"/>';
    if (f.b) rpr += '<w:b/>';
    if (f.i) rpr += '<w:i/>';
    if (f.u) rpr += '<w:u w:val="single"/>';
    if (f.s) rpr += '<w:strike/>';
    if (f.sup) rpr += '<w:vertAlign w:val="superscript"/>';
    if (f.sub) rpr += '<w:vertAlign w:val="subscript"/>';
    if (f.size) rpr += '<w:sz w:val="' + Math.round(f.size * 2) + '"/>';
    if (f.color) rpr += '<w:color w:val="' + xmlColor(f.color) + '"/>';
    if (f.bg) rpr += '<w:shd w:val="clear" w:color="auto" w:fill="' + xmlColor(f.bg) + '"/>';
    return '<w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r>';
  }
  function brRunXml(f) {
    var font = f.font || "Times New Roman";
    var rpr = '<w:rFonts w:ascii="' + esc(font) + '" w:hAnsi="' + esc(font) + '"/>';
    if (f.b) rpr += '<w:b/>';
    if (f.size) rpr += '<w:sz w:val="' + Math.round(f.size * 2) + '"/>';
    return '<w:r><w:rPr>' + rpr + '</w:rPr><w:br/></w:r>';
  }

  function inlineWalk(node, fmt, out) {
    var kids = node.childNodes || [];
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) {
        if (ch.nodeValue) out.push(runXml(ch.nodeValue, fmt));
        continue;
      }
      if (ch.nodeType !== 1) continue;
      var tag = (ch.tagName || "").toUpperCase();
      if (tag === "BR") { out.push(brRunXml(fmt)); continue; }
      if (tag === "SCRIPT" || tag === "STYLE") continue;
      var f = {};
      for (var k in fmt) f[k] = fmt[k];
      if (tag === "B" || tag === "STRONG") f.b = 1;
      if (tag === "I" || tag === "EM") f.i = 1;
      if (tag === "U") f.u = 1;
      if (tag === "S" || tag === "STRIKE" || tag === "DEL") f.s = 1;
      if (tag === "SUP") f.sup = 1;
      if (tag === "SUB") f.sub = 1;
      if (tag === "FONT") {
        if (ch.getAttribute("face")) f.font = ch.getAttribute("face").split(",")[0].replace(/["']/g, "").trim();
        if (ch.getAttribute("color")) f.color = ch.getAttribute("color");
        var fs = parseInt(ch.getAttribute("size") || "0", 10);
        if (fs >= 1 && fs <= 7) f.size = [7, 10, 12, 14, 18, 24, 36][fs - 1];
      }
      var st = ch.style;
      if (st) {
        if (st.fontWeight === "bold" || parseInt(st.fontWeight, 10) >= 600) f.b = 1;
        if (st.fontStyle === "italic") f.i = 1;
        var td = st.textDecoration || st.textDecorationLine || "";
        if (td.indexOf("underline") >= 0) f.u = 1;
        if (td.indexOf("line-through") >= 0) f.s = 1;
        if (st.fontSize) {
          var m = /(\d+(?:\.\d+)?)\s*(pt|px)?/.exec(st.fontSize);
          if (m) f.size = m[2] === "px" ? Math.round(parseFloat(m[1]) * 0.75 * 100) / 100 : parseFloat(m[1]);
        }
        if (st.fontFamily) f.font = st.fontFamily.split(",")[0].replace(/["']/g, "").trim();
        if (st.color) f.color = st.color;
        if (st.backgroundColor && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(st.backgroundColor)) f.bg = st.backgroundColor;
        if (st.verticalAlign === "super") f.sup = 1;
        if (st.verticalAlign === "sub") f.sub = 1;
      }
      inlineWalk(ch, f, out);
    }
  }

  function blockXml(el, prefix) {
    var tag = (el.tagName || "P").toUpperCase();
    var fmt = { font: "Times New Roman", size: 12 };
    var jc = "";
    if (tag === "H1") { fmt.size = 16; fmt.b = 1; }
    else if (tag === "H2") { fmt.size = 14; fmt.b = 1; }
    else if (tag === "H3") { fmt.size = 13; fmt.b = 1; }
    if (el.style && el.style.textAlign) {
      var a = el.style.textAlign;
      jc = a === "justify" ? "both" : (a === "start" ? "left" : (a === "end" ? "right" : a));
    }
    var runs = [];
    if (prefix) runs.push(runXml(prefix, { font: "Times New Roman", size: 12 }));
    inlineWalk(el, fmt, runs);
    if (!runs.length) runs.push(runXml("", fmt));
    return '<w:p><w:pPr>' + (jc ? '<w:jc w:val="' + jc + '"/>' : "") +
      '<w:spacing w:after="120"/></w:pPr>' + runs.join("") + '</w:p>';
  }

  var BLOCK_TAGS = { P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, LI: 1, BLOCKQUOTE: 1 };

  function walkBlocks(node, out) {
    var kids = node.childNodes || [];
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) {
        if (ch.nodeValue && ch.nodeValue.trim()) out.push(blockXml(ch));
        continue;
      }
      if (ch.nodeType !== 1) continue;
      var tag = (ch.tagName || "").toUpperCase();
      if (tag === "UL" || tag === "OL") {
        var items = ch.getElementsByTagName("li");
        for (var j = 0; j < items.length; j++) {
          out.push(blockXml(items[j], tag === "OL" ? (j + 1) + ". " : "• "));
        }
        continue;
      }
      if (BLOCK_TAGS[tag]) {
        // block with nested blocks? process children blocks separately
        var hasBlockKid = false;
        for (var c2 = 0; c2 < ch.childNodes.length; c2++) {
          var k2 = ch.childNodes[c2];
          if (k2.nodeType === 1 && (BLOCK_TAGS[(k2.tagName || "").toUpperCase()] || (k2.tagName || "").toUpperCase() === "UL" || (k2.tagName || "").toUpperCase() === "OL")) { hasBlockKid = true; break; }
        }
        if (hasBlockKid && tag !== "LI") walkBlocks(ch, out);
        else out.push(blockXml(ch));
        continue;
      }
      if (tag === "BR") { out.push(blockXml(ch)); continue; }
      walkBlocks(ch, out);
    }
  }

  function htmlToDocxXml(html, opts) {
    opts = opts || {};
    var doc = new DOMParser().parseFromString('<div id="dkroot">' + (html || "") + '</div>', "text/html");
    var root = doc.getElementById("dkroot");
    var out = [];
    walkBlocks(root, out);
    if (!out.length) out.push('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:t></w:t></w:r></w:p>');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="' + W_NS + '"><w:body>' + out.join("") + SECTPR + '</w:body></w:document>';
  }

  function buildDocxFromHtml(html, opts) {
    opts = opts || {};
    var files = [
      { name: "[Content_Types].xml", data: CT_XML },
      { name: "_rels/.rels", data: RELS_XML },
      { name: "word/document.xml", data: htmlToDocxXml(html, opts) },
      { name: "word/_rels/document.xml.rels", data: DOC_RELS_XML },
      { name: "word/styles.xml", data: STYLES_XML },
      { name: "docProps/core.xml", data: coreXml(opts.title, opts.author) }
    ];
    return new Blob([zipStore(files)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  /* ================================================================
     OOXML -> HTML / text  (reading real Word files)
     ================================================================ */
  async function inflateRaw(u8) {
    if (typeof DecompressionStream === "undefined") return null;
    try {
      var ds = new DecompressionStream("deflate-raw");
      var stream = new Blob([u8]).stream().pipeThrough(ds);
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (e) {
      try {
        var ds2 = new DecompressionStream("deflate");
        var stream2 = new Blob([u8]).stream().pipeThrough(ds2);
        return new Uint8Array(await new Response(stream2).arrayBuffer());
      } catch (e2) { return null; }
    }
  }

  async function getDocxXml(arrayBuffer) {
    try {
      var u8 = new Uint8Array(arrayBuffer);
      var eocd = -1;
      for (var i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
        if (u8[i] === 0x50 && u8[i + 1] === 0x4b && u8[i + 2] === 0x05 && u8[i + 3] === 0x06) { eocd = i; break; }
      }
      if (eocd < 0) return "";
      var dv = new DataView(u8.buffer);
      var count = dv.getUint16(eocd + 10, true);
      var p = dv.getUint32(eocd + 16, true);
      for (var c = 0; c < count; c++) {
        if (dv.getUint32(p, true) !== 0x02014b50) break;
        var method = dv.getUint16(p + 10, true);
        var compSize = dv.getUint32(p + 20, true);
        var nameLen = dv.getUint16(p + 28, true);
        var extraLen = dv.getUint16(p + 30, true);
        var cmtLen = dv.getUint16(p + 32, true);
        var lho = dv.getUint32(p + 42, true);
        var name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
        if (name === "word/document.xml") {
          var lnl = dv.getUint16(lho + 26, true);
          var lel = dv.getUint16(lho + 28, true);
          var start = lho + 30 + lnl + lel;
          var data = u8.subarray(start, start + compSize);
          if (method === 0) return new TextDecoder().decode(data);
          if (method === 8) {
            var raw = await inflateRaw(data);
            return raw ? new TextDecoder().decode(raw) : "";
          }
        }
        p += 46 + nameLen + extraLen + cmtLen;
      }
      return "";
    } catch (e) { return ""; }
  }

  function elText(el) {
    var s = "";
    var kids = el.childNodes || [];
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) s += ch.nodeValue;
      else if (ch.nodeType === 1) {
        var tag = (ch.tagName || "").split(":").pop().toUpperCase();
        if (tag === "BR") s += "\n";
        else if (tag === "TAB") s += "\u2003";
        else s += elText(ch);
      }
    }
    return s;
  }

  function docxToHtml(arrayBuffer) {
    return getDocxXml(arrayBuffer).then(function (xml) {
      if (!xml) return "";
      var doc;
      try { doc = new DOMParser().parseFromString(xml, "application/xml"); } catch (e) { return ""; }
      if (doc.getElementsByTagName("parsererror").length) return "";
      var ps = doc.getElementsByTagNameNS(W_NS, "p");
      var out = [];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var pPr = p.getElementsByTagNameNS(W_NS, "pPr")[0];
        var style = "";
        var prefix = "";
        if (pPr) {
          var jc = pPr.getElementsByTagNameNS(W_NS, "jc")[0];
          if (jc) {
            var v = jc.getAttribute("w:val") || jc.getAttributeNS(W_NS, "val") || "";
            if (v === "center" || v === "right" || v === "both") style += "text-align:" + (v === "both" ? "justify" : v) + ";";
          }
          if (pPr.getElementsByTagNameNS(W_NS, "numPr").length) prefix = "• ";
        }
        var runs = [];
        var rs = p.getElementsByTagNameNS(W_NS, "r");
        for (var r = 0; r < rs.length; r++) {
          var run = rs[r];
          var rPr = run.getElementsByTagNameNS(W_NS, "rPr")[0];
          var css = "";
          var open = "", close = "";
          if (rPr) {
            if (rPr.getElementsByTagNameNS(W_NS, "b").length) { open += "<b>"; close = "</b>" + close; }
            if (rPr.getElementsByTagNameNS(W_NS, "i").length) { open += "<i>"; close = "</i>" + close; }
            var uEl = rPr.getElementsByTagNameNS(W_NS, "u")[0];
            if (uEl) { open += "<u>"; close = "</u>" + close; }
            if (rPr.getElementsByTagNameNS(W_NS, "strike").length) { open += "<s>"; close = "</s>" + close; }
            var sz = rPr.getElementsByTagNameNS(W_NS, "sz")[0];
            if (sz) {
              var half = parseInt(sz.getAttribute("w:val") || sz.getAttributeNS(W_NS, "val") || "0", 10);
              if (half) css += "font-size:" + (half / 2) + "pt;";
            }
            var col = rPr.getElementsByTagNameNS(W_NS, "color")[0];
            if (col) {
              var cv = col.getAttribute("w:val") || col.getAttributeNS(W_NS, "val") || "";
              if (cv && cv !== "auto") css += "color:#" + cv.replace("#", "") + ";";
            }
            var shd = rPr.getElementsByTagNameNS(W_NS, "shd")[0];
            if (shd) {
              var fill = shd.getAttribute("w:fill") || shd.getAttributeNS(W_NS, "fill") || "";
              if (fill && fill !== "auto" && fill !== "clear") css += "background-color:#" + fill.replace("#", "") + ";";
            }
            var rf = rPr.getElementsByTagNameNS(W_NS, "rFonts")[0];
            if (rf) {
              var face = rf.getAttribute("w:ascii") || rf.getAttributeNS(W_NS, "ascii") || "";
              if (face) css += "font-family:'" + face + "';";
            }
            var va = rPr.getElementsByTagNameNS(W_NS, "vertAlign")[0];
            if (va) {
              var vv = va.getAttribute("w:val") || va.getAttributeNS(W_NS, "val") || "";
              if (vv === "superscript") { open += "<sup>"; close = "</sup>" + close; }
              if (vv === "subscript") { open += "<sub>"; close = "</sub>" + close; }
            }
          }
          var inner = "";
          var kids = run.childNodes || [];
          for (var k = 0; k < kids.length; k++) {
            var kn = kids[k];
            if (kn.nodeType !== 1) continue;
            var kt = (kn.tagName || "").split(":").pop().toUpperCase();
            if (kt === "T") inner += (kn.textContent || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            else if (kt === "BR") inner += "<br>";
            else if (kt === "TAB") inner += "&emsp;";
          }
          if (inner) runs.push((css ? '<span style="' + css + '">' : "<span>") + open + inner + close + "</span>");
        }
        var bodyHtml = prefix + runs.join("");
        if (!bodyHtml) bodyHtml = "<br>";
        out.push('<p style="' + style + 'margin:0 0 6pt 0;">' + bodyHtml + "</p>");
      }
      return out.join("");
    });
  }

  function xmlToText(xml) {
    return xml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n").trim();
  }
  function extractDocxText(arrayBuffer) {
    return getDocxXml(arrayBuffer).then(xmlToText);
  }

  /* ---------- drive helpers ---------- */
  function fileIdFromLink(link) {
    var s = String(link || "").trim();
    if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;
    var m = s.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
    if (m) return m[1];
    m = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (m) return m[1];
    return null;
  }
  function detectKind(name) {
    var n = String(name || "").toLowerCase();
    if (/\.docx?$/.test(n)) return "docx";
    if (/\.pdf$/.test(n)) return "pdf";
    if (/\.(cpp|cc|c|h|hpp|hpp)$/.test(n)) return "cpp";
    if (/\.(txt|md|csv|log|json)$/.test(n)) return "text";
    return "other";
  }

  globalThis.DOCXKIT = {
    crc32: crc32,
    zipStore: zipStore,
    htmlToDocxXml: htmlToDocxXml,
    buildDocxFromHtml: buildDocxFromHtml,
    docxToHtml: docxToHtml,
    extractDocxText: extractDocxText,
    fileIdFromLink: fileIdFromLink,
    detectKind: detectKind
  };
})();
