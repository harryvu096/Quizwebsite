/* ============================================================
   QuizVerse — 📝 Assignment Studio (v2 — ahw14)
   Paste/upload assignment -> parse Q/A -> humanize -> MS Word
   Real .docx writer (OOXML + stored-ZIP), zero external deps.
   VU assignment format: Times New Roman 12pt, Question bold 14pt,
   cover page (no "Submitted To"), VU file naming rule.
   PDF upload via bundled pdf.js (js/vendor/pdf.min.js, lazy).
   ============================================================ */
(function () {
  "use strict";
  var ASN = { state: null, metaDirty: true };

  /* ---------- VU default meta (persisted) ---------- */
  var DEFAULT_META = {
    sid: "", name: "", subject: "", subjectTitle: "", asgNo: "1", semester: "", due: ""
  };

  function loadState() {
    try {
      var raw = localStorage.getItem("ahw_assignment_v1");
      if (raw) {
        var d = JSON.parse(raw);
        ASN.state = {
          meta: Object.assign({}, DEFAULT_META, d.meta || {}),
          questions: Array.isArray(d.questions) ? d.questions : [],
          style: d.style || "student",
          opener: d.opener || "mix",
          cover: d.cover !== false
        };
        return;
      }
    } catch (e) { /* fresh */ }
    ASN.state = { meta: Object.assign({}, DEFAULT_META), questions: [], style: "student", opener: "mix", cover: true };
  }
  function saveState() {
    try { localStorage.setItem("ahw_assignment_v1", JSON.stringify(ASN.state)); } catch (e) {}
  }

  /* ---------- tiny xml esc ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  /* ================================================================
     PARSER — paste ya file se questions/answers nikalta hai
     ================================================================ */
  const Q_START = /^\s*(?:question\s*(?:no\.?|#|:)?\s*|q\s*\.?\s*#?\s*:??\s*)(\d{1,3})\s*(?:\s*(?:of|\/)\s*\d{1,3})?\s*[.):\-–—]?\s*(.*)$/i;
  const Q_NUM_ONLY = /^\s*(\d{1,3})\s*[.)]\s+(.*)$/;
  const A_START = /^\s*(?:answer|solution|ans)(?:\s+area)?\s*(?:[:.\-–—]\s*|\s*$)(.*)$/i;
  const MARKS_IN = /[\(\[]?\b(\d{1,3})\s*(?:marks?|marks?\s*[=*x]\s*\d{1,2})\b[\)\]]?|marks?\s*[:=]\s*(\d{1,3})|\[(\d{1,3})\s*marks?\]/i;
  function grabMarks(line) {
    const m = line.match(MARKS_IN);
    if (!m) return null;
    const n = parseInt(m[1] || m[2] || m[3], 10);
    return n >= 0 && n <= 100 ? n : null;
  }

  function parseAssignmentText(text) {
    const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let cur = null, mode = "pre"; // pre | q | a

    function push() {
      if (!cur) return;
      cur.q = (cur.q || "").trim();
      cur.answer = (cur.ansLines || []).join("\n").trim();
      delete cur.ansLines;
      if (cur.q || cur.answer) out.push(cur);
      cur = null;
    }

    for (const raw of lines) {
      const line = raw.trimEnd();
      const s = line.trim();
      // VU-LMS page furniture
      if (/^page\s+\d+\s*(?:of|\/)\s*\d+\s*$/i.test(s)) continue;
      if (/^best\s+of\s+luck\s*[!.]?\s*$/i.test(s)) continue;
      if (/^(?:answer|solution)\s*area\s*:?\s*$/i.test(s)) { if (cur && cur.q) mode = "a"; continue; }

      let m = line.match(Q_START);
      let bare = false;
      if (!m) { m = line.match(Q_NUM_ONLY); bare = !!m; }
      let numOk = false;
      if (m) {
        const num = parseInt(m[1], 10);
        const expected = out.length + (cur ? 1 : 0) + 1;
        if (!bare) numOk = true;                                        // "Question No. N" / "QN:" always starts one
        else if (mode === "a") numOk = num === expected;                // after an answer: sequential "3)" = next question
        else if (mode === "q") numOk = !cur.explicit && num === expected && num !== 1; // numbered list continuation (not sub-parts)
        else numOk = num === expected && /\?\s*$/.test(m[2] || ""); // pre: numbered instruction items are NOT questions
      }
      if (m && numOk) {
        push();
        const marks = grabMarks(m[2] || "");
        const qRest = (m[2] || "").replace(MARKS_IN, "").replace(/\(\s*\)|\[\s*\]/g, "").trim();
        cur = { q: qRest, marks: marks, ansLines: [], explicit: !bare };
        mode = "q";
        continue;
      }
      const a = line.match(A_START);
      if (a) {
        if (!cur) cur = { q: "", marks: null, ansLines: [], explicit: false };
        mode = "a";
        if (a[1]) cur.ansLines.push(a[1]);
        continue;
      }
      if (!cur) continue;
      if (mode === "q") {
        const mk = grabMarks(line);
        if (mk != null && cur.marks == null) {
          /* marks can share the line with the question text — keep the text! */
          const rest = line.replace(MARKS_IN, "").replace(/\(\s*\)|\[\s*\]/g, "").trim();
          cur.marks = mk;
          if (rest) cur.q = (cur.q ? cur.q + " " : "") + rest;
          continue;
        }
        if (s) { cur.q = (cur.q ? cur.q + " " : "") + s; }
        continue;
      }
      cur.ansLines.push(raw);
    }
    push();
    /* if nothing matched at all — treat the whole paste as one answer block */
    if (!out.length && String(text || "").trim()) out.push({ q: "", marks: null, answer: String(text).trim() });
    return out.map(x => ({
      q: (x.q || "").replace(/\s{2,}/g, " ").trim(),
      marks: x.marks == null ? null : x.marks,
      answer: x.answer || ""
    }));
  }

  /* ---- VU-LMS question file -> cover meta (auto-fill) ---- */
  function extractLmsMeta(text, fileName) {
    const t = String(text || "");
    const meta = {};
    let m;
    if ((m = t.match(/(?:^|\n)\s*([A-Za-z]{2,4}\d{3})\s*[:\-–(]\s*([^\n]{3,60})/))) {
      meta.subject = m[1].toUpperCase();
      meta.subjectTitle = m[2].replace(/[):]+\s*$/, "").trim();
    } else if ((m = t.match(/course\s+([A-Za-z]{2,4}\d{3})\s+([^\n]{3,60})/i))) {
      meta.subject = m[1].toUpperCase();
      meta.subjectTitle = m[2].replace(/[):]+\s*$/, "").trim();
    }
    if ((m = t.match(/assignment\s*(?:no\.?|#)?\s*[:.]?\s*(\d{1,2})/i))) meta.asgNo = String(parseInt(m[1], 10));
    if ((m = t.match(/semester\s*:?\s*((?:fall|spring|summer|autumn|winter)\s*\d{4})/i)) ||
        (m = t.match(/((?:fall|spring|summer|autumn|winter)\s*\d{4})/i))) {
      meta.semester = m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    if ((m = t.match(/due\s*date\s*:?\s*\n?\s*([^\n]{1,60})/i))) {
      let due = m[1].replace(/\s+/g, " ").trim();
      if (!/[a-zA-Z]{3}/.test(due)) {
        const rest = t.slice(m.index + m[0].length).match(/^\s*([^\n]{1,30})\s*\n?\s*([^\n]{1,40})/);
        if (rest) due = (due + " " + rest[1] + " " + rest[2]).replace(/\s+/g, " ").trim();
      }
      meta.due = due.replace(/(\d)\s+(st|nd|rd|th)\b/gi, "$1$2").replace(/[.\s]+$/, "");
    }
    if ((m = t.match(/(?:total|maximum)?\s*marks\s*:?\s*(\d{1,3})/i))) meta.totalMarks = m[1];
    // filename fallback: "Fall 2026_CS601_1 (1).pdf"
    if (fileName) {
      const fn = String(fileName).replace(/\.[a-z0-9]+$/i, "");
      if (!meta.subject) { const sm = fn.match(/([A-Za-z]{2,4}\d{3})/); if (sm) meta.subject = sm[1].toUpperCase(); }
      if (!meta.semester) { const sm = fn.match(/((?:fall|spring|summer|autumn|winter)\s*\d{4})/i); if (sm) meta.semester = sm[1]; }
      if (!meta.asgNo) { const sm = fn.match(/_(\d{1,2})(?:\s*\(\d+\))?$/); if (sm) meta.asgNo = String(parseInt(sm[1], 10)); }
    }
    return meta;
  }

  /* ---- FREE AI (keyless) — VU handouts-style answers ---- */
  var AI_SYS = "You are a Virtual University of Pakistan (VU) student writing your assignment solution in your own words, strictly according to VU handouts and lecture content. Write in simple, natural student language as VU students write. Use handout references like 'According to the handouts' naturally. No markdown, no bold, no asterisks, no headings. For calculations show clear step-by-step working. Keep each answer focused (120-260 words) unless the question needs more detail. Never mention that you are an AI. Never refuse normal academic questions.";

  function makeAiPrompt(q, meta) {
    return "Subject: " + (meta.subject || "") + " " + (meta.subjectTitle || "") + "\n" +
      "Assignment: " + (meta.asgNo || "") + " (" + (meta.semester || "") + ")\n" +
      "Question (" + (q.marks || "?") + " marks): " + q.q + "\n\n" +
      "Write the complete assignment answer now (student voice, VU handouts based):";
  }

  async function aiCallOne(q, meta) {
    var user = makeAiPrompt(q, meta);
    /* 1) OpenAI-compatible endpoint (keyless free tier) */
    try {
      var r = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai", messages: [{ role: "system", content: AI_SYS }, { role: "user", content: user }] })
      });
      if (r.ok) {
        var j = await r.json();
        var c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (c && c.trim().length > 40) return c.trim();
      }
    } catch (e) { /* try next */ }
    /* 2) simple GET fallback */
    try {
      var r2 = await fetch("https://text.pollinations.ai/" + encodeURIComponent(user + "\n\n" + AI_SYS));
      if (r2.ok) {
        var t2 = await r2.text();
        if (t2 && t2.trim().length > 40 && !/^\s*(error|denied|unauthorized)/i.test(t2)) return t2.trim();
      }
    } catch (e2) { /* give up */ }
    return null;
  }

  /* ================================================================
     HUMANIZE — offline "human writer" (student voice)
     ================================================================ */
  var OPENERS = {
    student: ["", "First of all, ", "Basically, ", "In simple words, ", "As we studied in the handouts, ", "Ya phir simply ye hai ke "],
    formal: ["", "In general, ", "To begin with, ", "It is important to note that ", "", ""],
    concise: ["", "Simply put, ", "", "In short, ", "", ""]
  };
  var HANDOUT_OPENERS = ["According to the handouts, ", "As described in the handouts, ", "Handouts ke mutabiq, ", "From the handouts, "];
  var TRANSITIONS = ["Also, ", "Moreover, ", "In addition, ", "Apart from this, ", "Iske ilawa, ", "Furthermore, "];

  function humanizeText(text, style, openerPref, used) {
    if (!text) return "";
    style = style || "student";
    used = (used && typeof used === "object") ? used : {};
    var t = String(text);

    // 1) markdown / AI-ism cleanup
    t = t.replace(/^#{1,6}\s*/gm, "").replace(/\*\*|__|`{1,3}/g, "");
    t = t.replace(/^\s*[-*+]\s+/gm, function () { return ""; });
    t = t.replace(/\bIn conclusion,\s*/gi, "In short, ");
    t = t.replace(/\bFurthermore,\s*it is important to note that\b/gi, "Also, ");
    t = t.replace(/\bdelve into\b/gi, "look at");
    t = t.replace(/\bin today's (?:fast-paced )?world\b/gi, "these days");
    t = t.replace(/\bit is worth mentioning that\b/gi, "one thing to mention is that");
    t = t.replace(/\bcomprehensive understanding\b/gi, "clear understanding");
    t = t.replace(/\bleverages?\b/gi, function(m){ return m.toLowerCase() === "leverages" ? "uses" : "use"; }).replace(/\butilize\b/gi, "use");

    // 2) split into sentences
    var parts = t.split(/(?<=[.!?])\s+/);
    var out = [];
    var openerPool = OPENERS[style] || OPENERS.student;
    var oi = 0;
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      if (!s) continue;
      if (i === 0) {
        var op = "";
        if (openerPref === "handouts") {
          op = HANDOUT_OPENERS[Math.floor(Math.random() * HANDOUT_OPENERS.length)];
        } else if (openerPref !== "simple") {
          op = openerPool[Math.floor(Math.random() * openerPool.length)];
        }
        if (op && used[op]) op = "";            // repeat avoid across answers
        if (op) used[op] = 1;
        if (op && /^[a-z]/.test(s)) s = s.charAt(0).toUpperCase() + s.slice(1);
        s = op + s;
        // pronoun softening (once per answer)
        s = s.replace(/\bOne should\b/g, "We should").replace(/\bone can\b/g, "we can");
      } else if (i % 3 === 0 && style === "student" && Math.random() < 0.45) {
        var tr = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];
        if (used[tr]) tr = " ";
        used[tr] = 1;
        if (tr !== " " && /^[a-z]/.test(s)) s = s.charAt(0).toUpperCase() + s.slice(1);
        s = tr === " " ? s : tr + s;
      }
      out.push(s);
    }
    return out.join(" ").replace(/\s{2,}/g, " ").trim();
  }

  /* ================================================================
     DOCX WRITER — stored-ZIP + OOXML
     ================================================================ */
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
    var total = offset + cdSize + 22;
    var out = new Uint8Array(total);
    var pos = 0;
    parts.forEach(function (p) { out.set(p, pos); pos += p.length; });
    central.forEach(function (p) { out.set(p, pos); pos += p.length; });
    out.set(eocd, pos);
    return out;
  }

  /* ---- OOXML document (VU style) ---- */
  function run(text, sz, bold) {
    return '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>' +
      (bold ? '<w:b/>' : '') + '<w:sz w:val="' + sz + '"/></w:rPr>' +
      '<w:t xml:space="preserve">' + esc(text) + '</w:t></w:r>';
  }
  function para(runs, align, after) {
    return '<w:p><w:pPr>' +
      (align ? '<w:jc w:val="' + align + '"/>' : '') +
      '<w:spacing w:after="' + (after == null ? 200 : after) + '"/></w:pPr>' + runs + '</w:p>';
  }

  function buildDocxXml(meta, questions, opts) {
    opts = opts || {};
    var body = "";

    if (opts.cover !== false) {
      body += para(run("Virtual University of Pakistan", 40, true), "center", 240);
      body += para(run("STUDENT ASSIGNMENT", 32, true), "center", 500);
      var rows = [
        ["Student ID", meta.sid || ""],
        ["Student Name", meta.name || ""],
        ["Subject", (meta.subject || "") + (meta.subjectTitle ? " — " + meta.subjectTitle : "")],
        ["Assignment No.", meta.asgNo || ""],
        ["Semester", meta.semester || ""]
      ];
      if (meta.due) rows.push(["Due Date", meta.due]);
      rows.forEach(function (r) {
        if (!r[1]) return;
        body += para(run(r[0] + ": ", 28, true) + run(r[1], 28, false), "left", 260);
      });
      body += para("", "left", 300);
      body += para(run("Date: " + new Date().toLocaleDateString("en-GB"), 24, false), "left", 0);
      body += '<w:p><w:pPr><w:rPr><w:br w:type="page"/></w:rPr></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>';
    }

    questions.forEach(function (q, i) {
      body += para(run("Question No. " + (i + 1), 28, true), "left", 120);
      body += para(run(q.q, 28, true), "left", 80);
      if (q.marks) body += para(run("(Marks: " + q.marks + ")", 24, true), "left", 120);
      body += para(run("Answer:", 24, true), "left", 60);
      (q.answer || "").split("\n").forEach(function (line) {
        body += para(run(line, 24, false), "left", 120);
      });
      body += '<w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>';
    });

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' + body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>' +
      '</w:sectPr></w:body></w:document>';
  }

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
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr>' +
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
    '<w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="000000"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '</w:styles>';

  function coreXml(meta) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/">' +
      '<dc:title>' + esc("Assignment " + (meta.asgNo || "") + " — " + (meta.subject || "")) + '</dc:title>' +
      '<dc:creator>' + esc(meta.sid || meta.name || "VU Student") + '</dc:creator>' +
      '</cp:coreProperties>';
  }

  function buildDocx(meta, questions, opts) {
    opts = opts || {};
    var files = [
      { name: "[Content_Types].xml", data: CT_XML },
      { name: "_rels/.rels", data: RELS_XML },
      { name: "word/document.xml", data: buildDocxXml(meta, questions, opts) },
      { name: "word/_rels/document.xml.rels", data: DOC_RELS_XML },
      { name: "word/styles.xml", data: STYLES_XML },
      { name: "docProps/core.xml", data: coreXml(meta) }
    ];
    return new Blob([zipStore(files)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  /* ---- VU file naming rule ---- */
  function vuFileName(meta) {
    meta = meta || (ASN.state && ASN.state.meta) || {};
    var sid = (meta.sid || "StudentID").replace(/\s+/g, "");
    var subj = (meta.subject || "Subject").replace(/\s+/g, "");
    var n = (meta.asgNo || "1").replace(/\s+/g, "");
    var sem = (meta.semester || "Semester").replace(/\s+/g, "");
    return sid + "_" + subj + "_AssignmentNo" + n + "_" + sem + ".docx";
  }

  /* ================================================================
     .docx upload text extraction (stored zip + inflate via DecompressionStream)
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

  async function extractDocxText(arrayBuffer) {
    try {
      var u8 = new Uint8Array(arrayBuffer);
      // EOCD scan
      var eocd = -1;
      for (var i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
        if (u8[i] === 0x50 && u8[i + 1] === 0x4b && u8[i + 2] === 0x05 && u8[i + 3] === 0x06) { eocd = i; break; }
      }
      if (eocd < 0) return "";
      var dv = new DataView(u8.buffer);
      var count = dv.getUint16(eocd + 10, true);
      var cdOff = dv.getUint32(eocd + 16, true);
      var p = cdOff;
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
          if (method === 0) {
            return xmlToText(new TextDecoder().decode(data));
          } else if (method === 8) {
            var raw = await inflateRaw(data);
            return raw ? xmlToText(new TextDecoder().decode(raw)) : "";
          }
        }
        p += 46 + nameLen + extraLen + cmtLen;
      }
      return "";
    } catch (e) { return ""; }
  }
  function xmlToText(xml) {
    return xml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n").trim();
  }

  /* ================================================================
     PDF text extraction — bundled pdf.js, lazy-loaded
     ================================================================ */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("script load fail: " + src)); };
      document.head.appendChild(s);
    });
  }
  async function ensurePdfJs() {
    if (typeof globalThis.structuredClone !== "function") {
      globalThis.structuredClone = function (v) {
        if (v instanceof Uint8Array) return new Uint8Array(v);
        if (v instanceof ArrayBuffer) return v.slice(0);
        if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer.slice(0));
        if (Array.isArray(v)) return v.map(globalThis.structuredClone);
        if (v && typeof v === "object") { var o = {}; for (var k in v) o[k] = globalThis.structuredClone(v[k]); return o; }
        return v;
      };
    }
    if (globalThis.pdfjsLib) return globalThis.pdfjsLib;
    await loadScript("js/vendor/pdf.min.js");
    if (!globalThis.pdfjsLib) throw new Error("pdf.js load fail");
    globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = "js/vendor/pdf.worker.min.js";
    return globalThis.pdfjsLib;
  }
  async function pdfToText(arrayBuffer) {
    var lib = await ensurePdfJs();
    var doc = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    var all = "";
    for (var p = 1; p <= doc.numPages; p++) {
      var page = await doc.getPage(p);
      var tc = await page.getTextContent();
      var out = [], line = "", lastY = null;
      for (var i = 0; i < tc.items.length; i++) {
        var it = tc.items[i];
        if (typeof it.str !== "string") continue;
        var y = it.transform ? it.transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2.5) { out.push(line); line = ""; }
        line += it.str;
        if (y !== null) lastY = y;
      }
      if (line) out.push(line);
      all += out.join("\n") + "\n\n";
    }
    return all.replace(/\n{3,}/g, "\n\n").trim();
  }

  /* ================================================================
     UI wiring
     ================================================================ */
  var SAMPLE_TEXT =
    "Q1: What is an operating system? (5 marks)\n" +
    "Answer: An operating system is system software that manages computer hardware and software resources. It works as a bridge between the user and the computer. Windows, Linux and Android are common examples of operating systems.\n" +
    "\n" +
    "Q2: Explain the main functions of an operating system. (5 marks)\n" +
    "Ans: The main functions are process management, memory management, file management and device management. Process management handles running programs, memory management keeps track of RAM, and device management controls hardware like keyboard and printer.";

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    var el = $("asFileMsg");
    if (el) {
      el.innerHTML = '<div class="as-ok">' + msg + "</div>";
      setTimeout(function () { if (el) el.innerHTML = ""; }, 5000);
    }
  }
  function toastErr(msg) {
    var el = $("asFileMsg");
    if (el) {
      el.innerHTML = '<div class="as-err">' + msg + "</div>";
      setTimeout(function () { if (el) el.innerHTML = ""; }, 8000);
    }
  }

  function collectMeta() {
    var s = ASN.state;
    s.meta.sid = $("asSid").value.trim();
    s.meta.name = $("asName").value.trim();
    s.meta.subject = $("asSubject").value.trim().toUpperCase();
    s.meta.subjectTitle = $("asSubjectTitle").value.trim();
    s.meta.asgNo = $("asAsgNo").value.trim() || "1";
    s.meta.semester = $("asSem").value.trim();
    s.meta.due = $("asDue").value.trim();
    s.style = $("asStyle").value;
    s.opener = $("asOpener").value;
    s.cover = $("asCover").checked;
    saveState();
    updateFileName();
  }

  function updateFileName() {
    var fn = vuFileName(ASN.state.meta);
    var el = $("asFileName");
    var out = $("asFileNameOut");
    if (out) out.innerHTML = "📄 File name: <b>" + esc(fn) + "</b>";
    if (el && !el.dataset.touched) el.value = fn;
  }

  function renderQList() {
    var box = $("asQList");
    if (!ASN.state.questions.length) {
      box.innerHTML = '<div class="as-empty">Upar text paste karein ya "📄 Sample try karein" dabayein — questions yahan list honge.</div>';
      return;
    }
    var h = "";
    ASN.state.questions.forEach(function (q, i) {
      h += '<div class="as-q">' +
        '<div class="as-qhead"><b>Q' + (i + 1) + '</b>' +
        (q.marks ? '<span class="as-marks">' + q.marks + ' marks</span>' : '') +
        '<button class="as-del" data-i="' + i + '" title="Remove">✕</button></div>' +
        '<div class="as-qtext">' + esc(q.q) + "</div>" +
        '<div class="as-qans">' + esc((q.answer || "(answer missing — edit below)").slice(0, 320)) +
        ((q.answer || "").length > 320 ? "…" : "") + "</div>" +
        '<textarea class="as-edit" data-i="' + i + '" placeholder="Answer yahan edit kar sakte hain…">' + esc(q.answer || "") + "</textarea>" +
        "</div>";
    });
    box.innerHTML = h;
    box.querySelectorAll(".as-del").forEach(function (b) {
      b.addEventListener("click", function () {
        ASN.state.questions.splice(parseInt(b.dataset.i, 10), 1);
        saveState(); renderQList(); renderPreview();
      });
    });
    box.querySelectorAll(".as-edit").forEach(function (t) {
      t.addEventListener("input", function () {
        ASN.state.questions[parseInt(t.dataset.i, 10)].answer = t.value;
        saveState(); renderPreview();
      });
    });
  }

  function renderPreview() {
    var pv = $("asPreview");
    var cp = $("asPrintCover");
    var pp = $("asPrintPreview");
    if (!ASN.state.questions.length) {
      if (pv) pv.innerHTML = '<div class="as-empty">Questions add karein — live preview yahan dikhega.</div>';
      return;
    }
    var s = ASN.state, h = "";
    s.questions.forEach(function (q, i) {
      h += '<div class="pv-q"><b>Question No. ' + (i + 1) + "</b>" + (q.marks ? " <i>— Marks: " + q.marks + "</i>" : "") + "</div>";
      h += '<div class="pv-qt"><b>' + esc(q.q) + "</b></div>";
      h += '<div class="pv-ans"><b>Answer:</b><br>' + esc(q.answer || "").replace(/\n/g, "<br>") + "</div>";
    });
    if (pv) pv.innerHTML = h;
    if (pp) pp.innerHTML = h;
    if (cp) {
      var m = s.meta, ch = "";
      if (s.cover) {
        ch = '<div class="pv-cover-title">Virtual University of Pakistan</div>' +
          '<div class="pv-cover-sub">STUDENT ASSIGNMENT</div>' +
          '<table class="pv-cover-table">';
        [["Student ID", m.sid], ["Student Name", m.name],
         ["Subject", (m.subject || "") + (m.subjectTitle ? " — " + m.subjectTitle : "")],
         ["Assignment No.", m.asgNo], ["Semester", m.semester]].forEach(function (r) {
          if (r[1]) ch += "<tr><td><b>" + r[0] + ":</b></td><td>" + esc(r[1]) + "</td></tr>";
        });
        if (m.due) ch += "<tr><td><b>Due Date:</b></td><td>" + esc(m.due) + "</td></tr>";
        ch += "</table>";
      }
      cp.innerHTML = ch;
    }
  }

  function asnParse() {
    collectMeta();
    var ta = $("asPaste");
    var text = ta.value.trim();
    if (!text) { toastErr("Pehle questions + answers paste/upload karein."); return; }
    var parsed = parseAssignmentText(text);
    if (!parsed.length) { toastErr("Questions nahi mile — format check karein (Q1: ... / Answer: ...)"); return; }
    var existing = ASN.state.questions;
    var added = 0;
    parsed.forEach(function (p) {
      var dup = existing.some(function (e) { return e.q === p.q; });
      if (!dup) { existing.push(p); added++; }
    });
    saveState();
    renderQList(); renderPreview();
    toast("✅ " + added + " question(s) add ho gaye! (total " + existing.length + ")");
  }

  function asnSample() {
    $("asPaste").value = SAMPLE_TEXT;
    if (!$("asSid").value) $("asSid").value = "BC123456789";
    if (!$("asName").value) $("asName").value = "Student Name";
    if (!$("asSubject").value) $("asSubject").value = "CS101";
    if (!$("asSubjectTitle").value) $("asSubjectTitle").value = "Introduction to Computing";
    if (!$("asSem").value) $("asSem").value = "Fall 2026";
    if (!$("asDue").value) $("asDue").value = "30-11-2026";
    ASN.state.questions = [];
    asnParse();
    collectMeta();
    toast("📄 Sample load ho gaya — ab ✨ Humanize ya 📥 Download dabayein!");
  }

  function asnClear() {
    if (!confirm("Sab questions clear karein?")) return;
    ASN.state.questions = [];
    $("asPaste").value = "";
    saveState();
    renderQList(); renderPreview();
  }

  function asnHumanize() {
    if (!ASN.state.questions.length) { toastErr("Pehle questions add karein."); return; }
    collectMeta();
    var used = {};
    ASN.state.questions.forEach(function (q) {
      if (q.answer) q.answer = humanizeText(q.answer, ASN.state.style, ASN.state.opener, used);
    });
    saveState();
    renderQList(); renderPreview();
    toast("✨ Humanize ho gaya — student voice mein answers likhe gaye!");
  }

  function aiStatus(msg) {
    var el = $("asAiStatus");
    if (el) el.innerHTML = msg;
  }

  async function asnAiMake() {
    if (ASN.aiBusy) return;
    if (!ASN.state.questions.length) { toastErr("Pehle assignment file upload/paste karein."); return; }
    collectMeta();
    var meta = ASN.state.meta;
    var pending = ASN.state.questions.filter(function (q) { return !q.answer || q.answer.length < 30; });
    if (!pending.length) { aiStatus("✅ Sare answers pehle se maujood hain — 📥 Download dabayein."); return; }
    ASN.aiBusy = true;
    var btn = $("asAiMakeBtn"); if (btn) btn.disabled = true;
    try {
      var done = 0, failed = 0;
      for (var i = 0; i < pending.length; i++) {
        done++;
        aiStatus("🤖 AI answer likh raha hai… (" + done + "/" + pending.length + ") — VU handouts style");
        var ans = await aiCallOne(pending[i], meta);
        if (ans) pending[i].answer = humanizeText(ans, "student", "handouts", {});
        else failed++;
        saveState(); renderQList(); renderPreview();
      }
      if (failed) {
        aiStatus("⚠️ " + failed + " answer AI se nahi ban sake — thodi der baad 🪄 button dobara dabayein.");
      } else {
        aiStatus("✅ Poora assignment tayyar! Ab 📥 Download MS Word dabayein.");
        toast("🎉 Assignment tayyar — 📥 Download MS Word dabayein!");
      }
    } finally {
      ASN.aiBusy = false;
      if (btn) btn.disabled = false;
    }
  }

  function asnDownload() {
    collectMeta();
    if (!ASN.state.questions.length) { toastErr("Pehle questions add karein."); return; }
    var fn = ($("asFileName").value || "").trim() || vuFileName(ASN.state.meta);
    if (!/\.docx$/i.test(fn)) fn += ".docx";
    var blob = buildDocx(ASN.state.meta, ASN.state.questions, { cover: ASN.state.cover });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fn;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    toast("✅ MS Word file download ho gayi — <b>" + esc(fn) + "</b>");
  }

  function asnPrint() {
    collectMeta();
    if (!ASN.state.questions.length) { toastErr("Pehle questions add karein."); return; }
    renderPreview();
    window.print();
  }

  async function ingestFile(f) {
    var n = (f.name || "").toLowerCase();
    try {
      var text = "";
      if (n.endsWith(".pdf")) {
        toast("📄 PDF parha ja raha hai…");
        text = await pdfToText(await f.arrayBuffer());
        if (!text.trim()) throw new Error("empty");
      } else if (n.endsWith(".docx")) {
        text = await extractDocxText(await f.arrayBuffer());
      } else {
        text = await f.text();
      }
      text = (text || "").trim();
      if (!text) { toastErr("File se text nahi mila (scanned PDF ho sakti hai)."); return; }
      var lm = extractLmsMeta(text, f.name);
      if (lm.subject) $("asSubject").value = lm.subject;
      if (lm.subjectTitle) $("asSubjectTitle").value = lm.subjectTitle;
      if (lm.asgNo) $("asAsgNo").value = lm.asgNo;
      if (lm.semester) $("asSem").value = lm.semester;
      if (lm.due) $("asDue").value = lm.due;
      var ta = $("asPaste");
      ta.value = ta.value.trim() ? ta.value + "\n\n" + text : text;
      toast("✅ " + esc(f.name) + " se text mil gaya!" + (lm.subject ? " — cover auto-fill: " + esc(lm.subject) : ""));
      asnParse();
      /* LMS question file flow: answers missing -> FREE AI se poora assignment */
      if (ASN.state.questions.some(function (q) { return !q.answer || q.answer.length < 30; })) {
        toast("🤖 FREE AI se answers ban rahe hain — VU handouts style…");
        asnAiMake();
      }
    } catch (e) {
      toastErr("File read nahi ho saki: " + esc(f.name) + " (" + esc(e.message || e) + ")");
    }
  }

  function showAssignmentLab() {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    $("screen-assign").classList.add("active");
    loadState();
    // fill form
    $("asSid").value = ASN.state.meta.sid;
    $("asName").value = ASN.state.meta.name;
    $("asSubject").value = ASN.state.meta.subject;
    $("asSubjectTitle").value = ASN.state.meta.subjectTitle;
    $("asAsgNo").value = ASN.state.meta.asgNo;
    $("asSem").value = ASN.state.meta.semester;
    $("asDue").value = ASN.state.meta.due;
    $("asStyle").value = ASN.state.style;
    $("asOpener").value = ASN.state.opener;
    $("asCover").checked = ASN.state.cover;
    $("asFileName").value = vuFileName(ASN.state.meta);
    $("asFileName").dataset.touched = "";
    renderQList(); renderPreview(); updateFileName();
  }

  function init() {
    loadState();
    if (!document.getElementById("screen-assign")) return;

    $("asBackBtn") && $("asBackBtn").addEventListener("click", function () {
      if (typeof globalThis.goHome === "function") globalThis.goHome();
    });

    $("asSampleBtn").addEventListener("click", asnSample);
    $("asClearBtn").addEventListener("click", asnClear);
    $("asParseBtn").addEventListener("click", asnParse);
    $("asHumBtn").addEventListener("click", asnHumanize);
    $("asAiMakeBtn") && $("asAiMakeBtn").addEventListener("click", asnAiMake);
    $("asDlBtn").addEventListener("click", asnDownload);
    $("asPrintBtn").addEventListener("click", asnPrint);

    // auto-parse on first paste (list khali ho to)
    $("asPaste").addEventListener("paste", function () {
      if (ASN.state.questions.length) return;
      setTimeout(asnParse, 350);
    });

    // subject code se title auto-fill (agar khali ho)
    $("asSubject").addEventListener("input", function () {
      var code = $("asSubject").value.trim().toUpperCase();
      var map = (globalThis.AHW && AHW.SUBJECTS) || {};
      if (map[code] && !$("asSubjectTitle").value.trim()) {
        $("asSubjectTitle").value = map[code].title || map[code];
      }
      collectMeta();
    });

    // live meta sync
    ["asSid", "asName", "asSubjectTitle", "asAsgNo", "asSem", "asDue", "asStyle", "asOpener", "asCover"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("change", function () { collectMeta(); renderPreview(); });
      if (el) el.addEventListener("input", function () { updateFileName(); });
    });
    $("asFileName").addEventListener("input", function () { $("asFileName").dataset.touched = "1"; });

    // file upload + drag/drop
    $("asFile").addEventListener("change", function () {
      if (this.files && this.files[0]) ingestFile(this.files[0]);
      this.value = "";
    });
    var ta = $("asPaste");
    ["dragover", "dragenter"].forEach(function (ev) {
      ta.addEventListener(ev, function (e) { e.preventDefault(); ta.classList.add("as-drag"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      ta.addEventListener(ev, function (e) { e.preventDefault(); ta.classList.remove("as-drag"); });
    });
    ta.addEventListener("drop", function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) ingestFile(e.dataTransfer.files[0]);
    });
  }

  /* expose small lib for debugging/tests */
  globalThis.ASN_LIB = {
    parseAssignmentText: parseAssignmentText,
    humanizeText: humanizeText,
    buildDocx: buildDocx,
    buildDocxXml: buildDocxXml,
    vuFileName: vuFileName,
    extractDocxText: extractDocxText,
    extractLmsMeta: extractLmsMeta,
    makeAiPrompt: makeAiPrompt,
    pdfToText: pdfToText,
    crc32: crc32,
    zipStore: zipStore
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  globalThis.showAssignmentLab = function () { showAssignmentLab(); };
  globalThis.asnParse = asnParse;
  globalThis.asnHumanize = asnHumanize;
  globalThis.asnDownload = asnDownload;
  Object.defineProperty(globalThis.ASN_LIB, "state", { get: function () { return ASN.state; } });
})();
