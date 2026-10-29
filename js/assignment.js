/* =====================================================================
   AHW QUIZVERSE — ASSIGNMENT STUDIO  (c) 2026 AHW Quizverse / All VU Students.
   Paste or upload rough assignment questions + answers -> get a proper
   VU-style MS Word (.docx) file with a cover page, ready to submit.

   Everything runs in the browser (works offline / file://):
   - parseAssignmentText()  smart parser  (Q1 / "Question No. 2" / "1." …)
   - humanizeText()         offline "student voice" polish
   - aiHumanize()           OPTIONAL rewrite using YOUR OWN API key
                            (Google Gemini free tier, or any OpenAI-compatible API)
   - buildDocx()            real .docx writer (OOXML + stored-ZIP, no libs)
   - extractDocxText()      .docx upload reader (native DecompressionStream)
   VU format: Times New Roman 12pt, cover page, "Question No. X / Marks: Y /
   Answer:" body — matching VU assignment instructions.
   ===================================================================== */
(function () {
  "use strict";

  /* ===================== STATE ===================== */
  const ASN_KEY = "ahw_assignment_v1";
  const AI_KEY = "ahw_ai_cfg_v1";

  const ASN = {
    meta: { sid: "", name: "", subject: "", subjectTitle: "", assignmentNo: "1", semester: "", teacher: "", dueDate: "" },
    questions: [],           // [{q, marks, answer}]
    cover: true,
    style: "student",        // student | formal | detailed
    opener: true             // sprinkle natural student openers
  };

  function loadAsn() {
    try {
      const s = JSON.parse(localStorage.getItem(ASN_KEY) || "null");
      if (s && typeof s === "object") {
        if (s.meta) Object.assign(ASN.meta, s.meta);
        if (Array.isArray(s.questions) && s.questions.length) ASN.questions = s.questions;
        if (typeof s.cover === "boolean") ASN.cover = s.cover;
        if (s.style) ASN.style = s.style;
        if (typeof s.opener === "boolean") ASN.opener = s.opener;
      }
    } catch (e) {}
  }
  function saveAsn() {
    try { localStorage.setItem(ASN_KEY, JSON.stringify({ meta: ASN.meta, questions: ASN.questions, cover: ASN.cover, style: ASN.style, opener: ASN.opener })); } catch (e) {}
  }
  function loadAiCfg() { try { return JSON.parse(localStorage.getItem(AI_KEY) || "null") || {}; } catch (e) { return {}; } }
  function saveAiCfg(cfg) { try { localStorage.setItem(AI_KEY, JSON.stringify(cfg)); } catch (e) {} }

  /* ===================== PARSER =====================
     Accepts messy student paste and splits into {q, marks, answer}.
     Question starters:  "Question No. 1", "Q1", "Q: 2", "Question 3:", "1." / "2)"
     Answer starters:    "Answer:", "Solution:", "Ans:" / "Ans."
     Marks found on the question line: "(10 marks)", "10 Marks", "Marks: 5", "[5]"  */
  const Q_START = /^\s*(?:question\s*(?:no\.?|#|:)?\s*|q\s*\.?\s*#?\s*:??\s*)(\d{1,3})\s*[.):\-]?\s*(.*)$/i;
  const Q_NUM_ONLY = /^\s*(\d{1,3})\s*[.)]\s+(.*)$/;
  const A_START = /^\s*(?:answer|solution|ans)\s*[:.\-]\s*(.*)$/i;
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
      let m = line.match(Q_START);
      if (!m) m = line.match(Q_NUM_ONLY);
      const numOk = m && (mode !== "a" || /^\s*question/i.test(line) || /^\s*q\s*\d/i.test(line)
        || parseInt(m[1], 10) === out.length + (cur ? 1 : 0) + 1);   // sequential "3)" after Q2 also starts a question
      if (m && numOk) {
        push();
        const marks = grabMarks(m[2] || "");
        const qRest = (m[2] || "").replace(MARKS_IN, "").trim();
        cur = { q: qRest, marks: marks, ansLines: [] };
        mode = "q";
        continue;
      }
      const a = line.match(A_START);
      if (a) {
        if (!cur) cur = { q: "", marks: null, ansLines: [] };
        mode = "a";
        if (a[1]) cur.ansLines.push(a[1]);
        continue;
      }
      if (!cur) continue;
      if (mode === "q") {
        const mk = grabMarks(line);
        if (mk != null && cur.marks == null) {
          /* marks can share the line with the question text — keep the text! */
          const rest = line.replace(MARKS_IN, "").trim();
          cur.marks = mk;
          if (rest) cur.q = (cur.q ? cur.q + " " : "") + rest;
          continue;
        }
        if (line.trim()) { cur.q = (cur.q ? cur.q + " " : "") + line.trim(); }
        continue;
      }
      cur.ansLines.push(raw);
    }
    push();
    /* if nothing matched at all — treat the whole paste as one answer block */
    if (!out.length && String(text || "").trim()) out.push({ q: "", marks: null, answer: String(text).trim() });
    return out.map(x => ({ q: x.q, marks: x.marks == null ? null : x.marks, answer: x.answer || "" }));
  }

  /* ===================== OFFLINE HUMANIZER =====================
     "Student voice" polish without any AI: strips markdown/AI-isms,
     normalises bullets, cleans spacing. */
  const PHRASE_FIXES = [
    [/(^|\n)#{1,6}\s*/g, "$1"],
    [/\*\*([^*]+)\*\*/g, "$1"],
    [/__([^_]+)__/g, "$1"],
    [/\*([^*\n]+)\*/g, "$1"],
    [/`([^`]+)`/g, "$1"],
    [/^\s*[-•*]\s+/gm, "• "],
    [/\bIn conclusion,\s*/gi, ""],
    [/\bIn summary,\s*/gi, "So, "],
    [/\bMoreover,\s*/gi, "Also, "],
    [/\bFurthermore,\s*/gi, "Besides this, "],
    [/\bAdditionally,\s*/gi, "Also, "],
    [/\bIt is important to note that\s*/gi, "We should note that "],
    [/\bIt is worth noting that\s*/gi, "Note that "],
    [/\bdelve(s|d)? into\b/gi, "look$1 at"],
    [/\bIn today'?s (fast-paced |modern |digital )?world,?\s*/gi, "Today, "],
    [/\bleverage(s|d)?\b/gi, "use$1"],
    [/\butilize(s|d)?\b/gi, "use$1"],
    [/\brobust\b/gi, "strong"],
    [/\bcomprehensive\b/gi, "complete"],
    [/\bmultifaceted\b/gi, "many-sided"],
    [/\ba testament to\b/gi, "proof of"],
    [/\blandscape of\b/gi, "field of"],
    [/\bpivotal\b/gi, "key"],
    [/\bcatalyst for\b/gi, "reason for"],
    [/\bembark on\b/gi, "start"]
  ];
  const OPENERS = [
    "According to the handouts, ",
    "As explained in the lecture, ",
    "In simple words, ",
    "From my understanding, ",
    "Basically, ",
    "As we studied, "
  ];

  function humanizeText(t, style, useOpener, seed) {
    let s = String(t || "");
    for (const [re, rep] of PHRASE_FIXES) s = s.replace(re, rep);
    /* spacing / layout cleanup */
    s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/\s+([.,;:])/g, "$1").trim();
    /* turn super-short fragment answers into proper sentences */
    if (style !== "formal") {
      s = s.replace(/(^|\n)([A-Z][^.\n]{2,60})\n/g, (all, p, frag) => p + frag + ".\n");
    }
    /* natural student openers on the first sentence of each paragraph */
    if (useOpener && s) {
      const parts = s.split("\n\n");
      parts[0] = parts[0].replace(/^([A-Z][a-z])/, (c, ch) => {
        const idx = Math.abs(seed || 0) % OPENERS.length;
        return OPENERS[idx] + ch.toLowerCase();
      });
      s = parts.join("\n\n");
    }
    if (style === "detailed" && s && !/\n\n/.test(s) && s.length > 220) {
      /* break a wall of text into two readable paragraphs at a sentence */
      s = s.replace(/([.!?])\s+(?=[A-Z][a-z]{3,})/, "$1\n\n");
    }
    return s.replace(/\n{3,}/g, "\n\n").trim();
  }

  /* ===================== AI HUMANIZER (optional, user's own key) =====================
     Gemini free tier: https://aistudio.google.com/apikey
     Or any OpenAI-compatible endpoint (key stays in THIS browser only). */
  function aiPrompt(answer, style) {
    const voice = style === "formal"
      ? "clear academic English at a Pakistani university student's level"
      : "a real Virtual University (Pakistan) student writing in their own simple words";
    return "Rewrite the following university assignment answer so it reads like " + voice + ".\n" +
      "Rules:\n- Keep every technical fact and term accurate; do NOT add new information.\n" +
      "- Short paragraphs, natural wording; light references like 'According to the handouts' or 'as covered in the lecture' where natural.\n" +
      "- Avoid AI-sounding phrases (no 'In conclusion', 'delve', 'tapestry', 'Moreover' every sentence, no bullet-point overload).\n" +
      "- No markdown, no headings, no quotation marks around the answer.\n" +
      "- Return ONLY the rewritten answer text.\n\nAnswer:\n" + answer;
  }

  async function aiCall(cfg, prompt) {
    if (cfg.provider === "gemini") {
      const model = cfg.model || "gemini-2.0-flash";
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(cfg.key), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!r.ok) throw new Error("Gemini error " + r.status + ": " + (await r.text()).slice(0, 140));
      const j = await r.json();
      const t = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0].text;
      if (!t) throw new Error("Gemini returned an empty response");
      return t.trim();
    }
    const base = (cfg.base || "https://api.openai.com").replace(/\/+$/, "");
    const r = await fetch(base + "/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.key },
      body: JSON.stringify({
        model: cfg.model || "gpt-4o-mini",
        messages: [{ role: "system", content: "You rewrite university assignment answers into natural student voice." }, { role: "user", content: prompt }]
      })
    });
    if (!r.ok) throw new Error("API error " + r.status + ": " + (await r.text()).slice(0, 140));
    const j = await r.json();
    const t = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!t) throw new Error("API returned an empty response");
    return t.trim();
  }

  /* ===================== DOCX WRITER (pure JS — stored ZIP + OOXML) ===================== */
  const CRC_T = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  const TE = new TextEncoder();

  /* minimal ZIP writer: every entry stored (method 0) — Word accepts this fine */
  function zipStore(files) {
    const chunks = [], central = [];
    let offset = 0;
    const u16 = v => [v & 255, (v >> 8) & 255];
    const u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];

    for (const f of files) {
      const name = TE.encode(f.name);
      const data = typeof f.data === "string" ? TE.encode(f.data) : f.data;
      const crc = crc32(data);
      const local = [].concat(
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0)
      );
      chunks.push(new Uint8Array(local), name, data);
      central.push({ name, crc, size: data.length, offset });
      offset += local.length + name.length + data.length;
    }
    const cdStart = offset;
    for (const c of central) {
      const hdr = [].concat(
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(c.crc), u32(c.size), u32(c.size), u16(c.name.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(c.offset)
      );
      chunks.push(new Uint8Array(hdr), c.name);
      offset += hdr.length + c.name.length;
    }
    const eocd = new Uint8Array([].concat(
      u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
      u32(offset - cdStart), u32(cdStart), u16(0)
    ));
    chunks.push(eocd);
    return new Blob(chunks, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  const xesc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    // keep common student symbols intact in XML:
    .replace(/[—–]/g, m => m).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  /* run/paragraph builders (direct formatting = no style dependency) */
  function run(text, o) {
    o = o || {};
    const props = [
      '<w:rFonts w:ascii="' + (o.font || "Times New Roman") + '" w:hAnsi="' + (o.font || "Times New Roman") + '"/>',
      o.bold ? "<w:b/>" : "",
      o.italics ? "<w:i/>" : "",
      o.size ? '<w:sz w:val="' + Math.round(o.size * 2) + '"/><w:szCs w:val="' + Math.round(o.size * 2) + '"/>' : ""
    ].join("");
    if (o.break === "page") return '<w:r><w:rPr>' + props + '</w:rPr><w:br w:type="page"/></w:r>';
    if (o.tab) return '<w:r><w:rPr>' + props + '</w:rPr><w:tab/></w:r>';
    return '<w:r><w:rPr>' + props + '</w:rPr><w:t xml:space="preserve">' + xesc(text) + '</w:t></w:r>';
  }
  function para(runs, o) {
    o = o || {};
    const jc = o.align ? '<w:jc w:val="' + o.align + '"/>' : "";
    const spacing = '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 120 : o.after) + '" w:line="' + (o.line || 276) + '" w:lineRule="auto"/>';
    const ind = o.indent ? '<w:ind w:left="' + o.indent + '"/>' : "";
    const pb = o.pageBreakBefore ? "<w:pageBreakBefore/>" : "";
    const rpr = o.bold ? '<w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="' + Math.round((o.size || 12) * 2) + '"/></w:rPr>' : "";
    return "<w:p><w:pPr>" + pb + spacing + jc + ind + rpr + "</w:pPr>" + (Array.isArray(runs) ? runs.join("") : runs) + "</w:p>";
  }

  function buildDocxXml(meta, questions, opts) {
    opts = opts || {};
    const P = [];
    /* ---------- cover page (VU style) ---------- */
    if (opts.cover !== false) {
      P.push(para(run("", { size: 12 }), { after: 200 }));
      P.push(para(run("VIRTUAL UNIVERSITY OF PAKISTAN", { bold: true, size: 22 }), { align: "center", after: 120 }));
      P.push(para(run("FEDERAL GOVERNMENT UNIVERSITY", { size: 12 }), { align: "center", after: 400 }));
      P.push(para(run("ASSIGNMENT NO. " + (meta.assignmentNo || "1"), { bold: true, size: 18 }), { align: "center", after: 80 }));
      P.push(para(run("SEMESTER: " + String(meta.semester || "").toUpperCase(), { bold: true, size: 13 }), { align: "center", after: 500 }));
      const row = (label, val) => P.push(
        para([run(label + ":  ", { bold: true, size: 13 }), run(val || "—", { size: 13 })], { after: 100, indent: 900 })
      );
      row("Student ID", meta.sid);
      row("Student Name", meta.name);
      row("Subject Code", meta.subject);
      row("Subject Title", meta.subjectTitle);
      row("Assignment No.", String(meta.assignmentNo || "1"));
      row("Semester", meta.semester);
      row("Submitted To", meta.teacher);
      if (meta.dueDate) row("Due Date", meta.dueDate);
      P.push(para(run("", { size: 12 }), { after: 300 }));
      P.push(para(run("Date of Submission:  " + new Date().toLocaleDateString("en-GB"), { size: 12 }), { indent: 900, after: 100 }));
      P.push(para(run(""), {}));
      P.push([run("", { break: "page" })].map(r => "<w:p>" + r + "</w:p>").join(""));
    }
    /* ---------- questions + answers ---------- */
    questions.forEach((q, i) => {
      P.push(para([
        run("Question No. " + (i + 1), { bold: true, size: 12 }),
        run(";\t", { bold: true, size: 12 }),
        run((q.marks != null ? q.marks : "—") + " Marks", { bold: true, size: 12 })
      ], { before: i ? 240 : 0, after: 80 }));
      if (q.q) P.push(para(run(q.q, { bold: true, italics: true, size: 12 }), { after: 80, align: "both" }));
      P.push(para(run("Answer:", { bold: true, size: 12 }), { after: 60 }));
      const blocks = String(q.answer || "").split(/\n{2,}/);
      const paras = blocks.length ? blocks : [""];
      for (const b of paras) {
        const lines = String(b).split("\n");
        for (const ln of lines) {
          const isBullet = /^\s*[•]\s+/.test(ln);
          P.push(para(run(ln.replace(/^\s*[•]\s+/, "•  "), { size: 12 }), { align: "both", indent: isBullet ? 360 : 0, after: 60 }));
        }
        P.push(para(run("", { size: 12 }), { after: 20 }));
      }
    });
    /* ---------- document.xml ---------- */
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      "<w:body>" + P.join("") +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>' +
      "</w:body></w:document>";
  }

  function buildDocx(meta, questions, opts) {
    const docXml = buildDocxXml(meta, questions, opts);
    const contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      "</Types>";
    const rootRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      "</Relationships>";
    const docRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      "</Relationships>";
    const styles =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:line="276" w:lineRule="auto"/></w:pPr></w:style>' +
      "</w:styles>";
    const now = new Date().toISOString();
    const core =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">' +
      "<dc:title>Assignment " + xesc(meta.assignmentNo) + " — " + xesc(meta.subject) + "</dc:title>" +
      "<dc:creator>" + xesc(meta.name || meta.sid || "VU Student") + "</dc:creator>" +
      "<cp:lastModifiedBy>" + xesc(meta.name || "AHW Quizverse") + "</cp:lastModifiedBy>" +
      "</cp:coreProperties>";
    return zipStore([
      { name: "[Content_Types].xml", data: contentTypes },
      { name: "_rels/.rels", data: rootRels },
      { name: "word/document.xml", data: docXml },
      { name: "word/_rels/document.xml.rels", data: docRels },
      { name: "word/styles.xml", data: styles },
      { name: "docProps/core.xml", data: core }
    ]);
  }

  /* ===================== DOCX READER (upload support) =====================
     Reads word/document.xml out of an uploaded .docx (stored or deflated) and
     returns plain text. Uses the browser's native DecompressionStream. */
  async function extractDocxText(arrayBuffer) {
    const u8 = new Uint8Array(arrayBuffer);
    const dv = new DataView(arrayBuffer);
    /* find End Of Central Directory */
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Not a valid .docx file (zip directory missing)");
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("Corrupt .docx directory");
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true);
      const nameLen = dv.getUint16(p + 28, true);
      const extraLen = dv.getUint16(p + 30, true);
      const cmtLen = dv.getUint16(p + 32, true);
      const lho = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
      if (name === "word/document.xml") {
        const lNameLen = dv.getUint16(lho + 26, true);
        const lExtraLen = dv.getUint16(lho + 28, true);
        const start = lho + 30 + lNameLen + lExtraLen;
        const comp = u8.subarray(start, start + csize);
        let xml;
        if (method === 0) xml = dec.decode(comp);
        else if (method === 8) {
          if (typeof DecompressionStream === "undefined") throw new Error("This browser cannot read compressed .docx — please paste the text instead");
          const ds = new DecompressionStream("deflate-raw");
          const stream = new Blob([comp]).stream().pipeThrough(ds);
          xml = dec.decode(new Uint8Array(await new Response(stream).arrayBuffer()));
        } else throw new Error("Unsupported .docx compression");
        /* paragraphs -> lines, text runs -> words */
        return xml
          .replace(/<\/w:p>/g, "\n")
          .replace(/<w:tab[^>]*\/>/g, " ")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/\n{3,}/g, "\n\n").trim();
      }
      p += 46 + nameLen + extraLen + cmtLen;
    }
    throw new Error("word/document.xml not found in file");
  }

  /* ===================== FILE NAME (VU convention) ===================== */
  function vuFileName() {
    const m = ASN.meta;
    const clean = s => String(s || "").trim().replace(/\s+/g, "");
    return (clean(m.sid) || "StudentID") + "_" + (clean(m.subject) || "Subject") + "_AssignmentNo" + (m.assignmentNo || "1") + "_" + clean(m.semester) + ".docx";
  }

  /* ===================== UI ===================== */
  function el(id) { return document.getElementById(id); }

  function showAssignmentLab() {
    if (typeof ac === "function") ac();
    if (typeof sfx !== "undefined") sfx.click();
    renderAssignmentLab();
    show("screen-assign");
  }

  function renderAssignmentLab() {
    const m = ASN.meta;
    if (el("asSid")) el("asSid").value = m.sid || "";
    if (el("asName")) el("asName").value = m.name || "";
    if (el("asSubject")) el("asSubject").value = m.subject || "";
    if (el("asSubjectTitle")) el("asSubjectTitle").value = m.subjectTitle || "";
    if (el("asAsgNo")) el("asAsgNo").value = m.assignmentNo || "1";
    if (el("asSem")) el("asSem").value = m.semester || "";
    if (el("asTeacher")) el("asTeacher").value = m.teacher || "";
    if (el("asDue")) el("asDue").value = m.dueDate || "";
    if (el("asCover")) el("asCover").checked = ASN.cover !== false;
    if (el("asStyle")) el("asStyle").value = ASN.style || "student";
    if (el("asOpener")) el("asOpener").checked = ASN.opener !== false;
    renderAsnQuestions();
    renderAiFields();
    updateFilePreview();
  }

  function asnMetaFromForm() {
    const m = ASN.meta;
    m.sid = el("asSid") ? el("asSid").value.trim() : m.sid;
    m.name = el("asName") ? el("asName").value.trim() : m.name;
    m.subject = el("asSubject") ? el("asSubject").value.trim().toUpperCase() : m.subject;
    m.subjectTitle = el("asSubjectTitle") ? el("asSubjectTitle").value.trim() : m.subjectTitle;
    m.assignmentNo = el("asAsgNo") ? el("asAsgNo").value : m.assignmentNo;
    m.semester = el("asSem") ? el("asSem").value.trim() : m.semester;
    m.teacher = el("asTeacher") ? el("asTeacher").value.trim() : m.teacher;
    m.dueDate = el("asDue") ? el("asDue").value.trim() : m.dueDate;
    ASN.cover = el("asCover") ? el("asCover").checked : ASN.cover;
    ASN.style = el("asStyle") ? el("asStyle").value : ASN.style;
    ASN.opener = el("asOpener") ? el("asOpener").checked : ASN.opener;
    saveAsn();
    updateFilePreview();
    return m;
  }

  function updateFilePreview() {
    const f = el("asFilePreview");
    if (f) f.textContent = "📄 " + vuFileName();
  }

  function renderAsnQuestions() {
    const box = el("asQList");
    if (!box) return;
    box.innerHTML = "";
    if (!ASN.questions.length) {
      box.innerHTML = '<div class="lb-empty">No questions yet — paste your assignment above (or upload a file) and press <b>🔍 Parse Questions</b>.</div>';
      return;
    }
    ASN.questions.forEach((q, i) => {
      const d = document.createElement("div");
      d.className = "as-qcard";
      d.innerHTML =
        '<div class="as-qhead"><b>Question ' + (i + 1) + '</b>' +
        '<span class="as-qacts">' +
        '<label>Marks <input type="number" min="0" max="100" class="as-marks" value="' + (q.marks == null ? "" : q.marks) + '"></label>' +
        '<button class="as-mini" data-up="' + i + '" title="Move up">▲</button>' +
        '<button class="as-mini" data-dn="' + i + '" title="Move down">▼</button>' +
        '<button class="as-mini red" data-del="' + i + '" title="Remove">✖</button>' +
        "</span></div>" +
        '<textarea class="as-qt" rows="2" placeholder="Question text..."></textarea>' +
        '<textarea class="as-qa" rows="5" placeholder="Your answer..."></textarea>';
      d.querySelector(".as-qt").value = q.q || "";
      d.querySelector(".as-qa").value = q.answer || "";
      d.querySelector(".as-qt").oninput = e => { ASN.questions[i].q = e.target.value; saveAsn(); };
      d.querySelector(".as-qa").oninput = e => { ASN.questions[i].answer = e.target.value; saveAsn(); };
      d.querySelector(".as-marks").oninput = e => {
        const v = parseInt(e.target.value, 10);
        ASN.questions[i].marks = isNaN(v) ? null : v; saveAsn();
      };
      d.querySelector("[data-up]").onclick = () => {
        if (i > 0) { const t = ASN.questions[i - 1]; ASN.questions[i - 1] = ASN.questions[i]; ASN.questions[i] = t; saveAsn(); renderAsnQuestions(); }
      };
      d.querySelector("[data-dn]").onclick = () => {
        if (i < ASN.questions.length - 1) { const t = ASN.questions[i + 1]; ASN.questions[i + 1] = ASN.questions[i]; ASN.questions[i] = t; saveAsn(); renderAsnQuestions(); }
      };
      d.querySelector("[data-del]").onclick = () => {
        ASN.questions.splice(i, 1); saveAsn(); renderAsnQuestions();
      };
      box.appendChild(d);
    });
  }

  function asnParse() {
    const txt = el("asPaste") ? el("asPaste").value : "";
    const parsed = parseAssignmentText(txt);
    if (!parsed.length) { if (typeof alertUser === "function") alertUser("Paste your questions & answers first (or use the Upload button)."); return; }
    ASN.questions = parsed;
    saveAsn();
    renderAsnQuestions();
    if (typeof streakBanner === "function") streakBanner("🔍 Parsed " + parsed.length + " question(s) — check & edit below!");
    const q = el("asQList"); if (q && q.scrollIntoView) q.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function asnAddQuestion() {
    ASN.questions.push({ q: "", marks: null, answer: "" });
    saveAsn(); renderAsnQuestions();
  }

  async function asnUpload(file) {
    if (!file) return;
    try {
      let text = "";
      if (/\.docx$/i.test(file.name)) {
        text = await extractDocxText(await file.arrayBuffer());
      } else {
        text = await file.text();
      }
      if (el("asPaste")) el("asPaste").value = text;
      if (typeof streakBanner === "function") streakBanner("📥 Loaded " + file.name + " — press 🔍 Parse Questions");
    } catch (e) {
      if (typeof alertUser === "function") alertUser("Could not read this file: " + e.message + "\n\nTip: .txt works always; .docx needs a modern browser — you can also paste the text.");
    }
  }

  /* offline polish */
  function asnHumanize() {
    if (!ASN.questions.length) { if (typeof alertUser === "function") alertUser("Add some questions first."); return; }
    ASN.style = el("asStyle") ? el("asStyle").value : ASN.style;
    ASN.opener = el("asOpener") ? el("asOpener").checked : ASN.opener;
    let n = 0;
    ASN.questions.forEach((q, i) => {
      const before = q.answer;
      q.answer = humanizeText(q.answer, ASN.style, ASN.opener, i * 7 + String(q.q).length);
      if (q.answer !== before) n++;
    });
    saveAsn(); renderAsnQuestions();
    if (typeof streakBanner === "function") streakBanner("✨ Humanized " + n + " answer(s) — student voice applied!");
  }

  /* AI polish (optional — user's own key) */
  function renderAiFields() {
    const cfg = loadAiCfg();
    if (el("asAiProv")) el("asAiProv").value = cfg.provider || "gemini";
    if (el("asAiKey")) el("asAiKey").value = cfg.key || "";
    if (el("asAiModel")) el("asAiModel").value = cfg.model || (cfg.provider === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini");
    if (el("asAiBase")) el("asAiBase").value = cfg.base || "https://api.openai.com";
  }
  function asnAiSaveCfg() {
    const cfg = {
      provider: el("asAiProv") ? el("asAiProv").value : "gemini",
      key: el("asAiKey") ? el("asAiKey").value.trim() : "",
      model: el("asAiModel") ? el("asAiModel").value.trim() : "",
      base: el("asAiBase") ? el("asAiBase").value.trim() : "https://api.openai.com"
    };
    saveAiCfg(cfg);
    return cfg;
  }
  async function asnAiHumanize() {
    const cfg = asnAiSaveCfg();
    if (!cfg.key) { if (typeof alertUser === "function") alertUser("Pehle API key daalein.\n\nFree option: Google AI Studio se Gemini key lein — https://aistudio.google.com/apikey", "API key required"); return; }
    if (!ASN.questions.length) { if (typeof alertUser === "function") alertUser("Add some questions first."); return; }
    const btn = el("asAiBtn");
    if (btn) { btn.disabled = true; btn.textContent = "🤖 Rewriting… 0/" + ASN.questions.length; }
    let done = 0, failed = 0;
    for (let i = 0; i < ASN.questions.length; i++) {
      const q = ASN.questions[i];
      if (!q.answer || !q.answer.trim()) { done++; continue; }
      try {
        const out = await aiCall(cfg, aiPrompt(q.answer, ASN.style));
        q.answer = out.replace(/^["'\s]+|["'\s]+$/g, "");
        done++;
      } catch (e) {
        failed++;
        if (typeof streakBanner === "function") streakBanner("⚠️ " + e.message);
        if (failed >= 2) break;   // stop early on repeated failure (bad key / offline)
      }
      if (btn) btn.textContent = "🤖 Rewriting… " + (i + 1) + "/" + ASN.questions.length;
      saveAsn();
    }
    if (btn) { btn.disabled = false; btn.textContent = "🤖 AI Humanize — rewrite in student voice"; }
    saveAsn(); renderAsnQuestions();
    if (typeof alertUser === "function" && failed) alertUser("Some answers could not be rewritten (" + failed + " failed).\nCheck the API key / internet. Un-rewritten answers are kept as-is.");
    else if (typeof streakBanner === "function") streakBanner("🤖 AI humanized " + done + " answer(s) — student voice applied!");
  }

  /* ---------- download ---------- */
  function asnDownload() {
    asnMetaFromForm();
    if (!ASN.questions.length) { if (typeof alertUser === "function") alertUser("Pehle questions add karein (paste + Parse)."); return; }
    const m = ASN.meta;
    if (!m.sid || !m.subject) { if (typeof alertUser === "function") alertUser("Student ID aur Subject Code zaroori hain (cover page ke liye)."); return; }
    const blob = buildDocx(m, ASN.questions, { cover: ASN.cover });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (el("asFileName") && el("asFileName").value.trim()) ? el("asFileName").value.trim() : vuFileName();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    if (typeof sfx !== "undefined") sfx.correct();
    if (typeof streakBanner === "function") streakBanner("⬇️ Word file downloaded — best of luck with submission!");
  }

  /* print / PDF backup */
  function asnPrint() {
    asnMetaFromForm();
    const area = el("assignPrintArea");
    if (!area) { window.print(); return; }
    const m = ASN.meta;
    const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let h = "";
    if (ASN.cover) {
      h += '<div class="ap-cover"><h1>VIRTUAL UNIVERSITY OF PAKISTAN</h1><h2>Assignment No. ' + esc(m.assignmentNo) + ' — ' + esc(m.semester) + "</h2><table>" +
        "<tr><td>Student ID</td><td>" + esc(m.sid) + "</td></tr>" +
        "<tr><td>Student Name</td><td>" + esc(m.name) + "</td></tr>" +
        "<tr><td>Subject</td><td>" + esc(m.subject) + " — " + esc(m.subjectTitle) + "</td></tr>" +
        "<tr><td>Submitted To</td><td>" + esc(m.teacher) + "</td></tr></table></div><div class='ap-break'></div>";
    }
    ASN.questions.forEach((q, i) => {
      h += '<h3>Question No. ' + (i + 1) + ";  " + (q.marks == null ? "—" : q.marks) + " Marks</h3>";
      if (q.q) h += "<p><b><i>" + esc(q.q) + "</i></b></p>";
      h += "<p><b>Answer:</b></p>";
      String(q.answer || "").split(/\n{2,}/).forEach(b => { h += "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>"; });
    });
    area.innerHTML = h;
    document.body.classList.add("print-assign");
    const finish = () => document.body.classList.remove("print-assign");
    try { window.print(); } catch (e) {}
    setTimeout(finish, 600);
    try { window.addEventListener("afterprint", finish, { once: true }); } catch (e) {}
  }

  /* ---------- boot: wire up once DOM exists ---------- */
  function asnWire() {
    const map = [
      ["asSid", "sid"], ["asName", "name"], ["asSubject", "subject"], ["asSubjectTitle", "subjectTitle"],
      ["asAsgNo", "assignmentNo"], ["asSem", "semester"], ["asTeacher", "teacher"], ["asDue", "dueDate"]
    ];
    map.forEach(([id, key]) => {
      const e = el(id);
      if (e) e.addEventListener("input", () => { ASN.meta[key] = e.value.trim(); saveAsn(); updateFilePreview(); });
    });
    const cv = el("asCover"); if (cv) cv.addEventListener("change", () => { ASN.cover = cv.checked; saveAsn(); });
    const st = el("asStyle"); if (st) st.addEventListener("change", () => { ASN.style = st.value; saveAsn(); });
    const op = el("asOpener"); if (op) op.addEventListener("change", () => { ASN.opener = op.checked; saveAsn(); });

    const btnParse = el("asParseBtn"); if (btnParse) btnParse.onclick = asnParse;
    const btnAdd = el("asAddBtn"); if (btnAdd) btnAdd.onclick = asnAddQuestion;
    const btnHum = el("asHumBtn"); if (btnHum) btnHum.onclick = asnHumanize;
    const btnAi = el("asAiBtn"); if (btnAi) btnAi.onclick = asnAiHumanize;
    const btnDl = el("asDlBtn"); if (btnDl) btnDl.onclick = asnDownload;
    const btnPr = el("asPrintBtn"); if (btnPr) btnPr.onclick = asnPrint;
    const fn = el("asFileName"); if (fn) fn.addEventListener("input", () => {});

    const up = el("asFile");
    if (up) up.addEventListener("change", () => { if (up.files && up.files[0]) asnUpload(up.files[0]); up.value = ""; });

    /* drag & drop onto the paste box */
    const paste = el("asPaste");
    if (paste) {
      paste.addEventListener("dragover", e => { e.preventDefault(); paste.classList.add("as-drag"); });
      paste.addEventListener("dragleave", () => paste.classList.remove("as-drag"));
      paste.addEventListener("drop", e => {
        e.preventDefault(); paste.classList.remove("as-drag");
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) asnUpload(f);
      });
    }
    loadAsn();
  }
  document.addEventListener("DOMContentLoaded", asnWire);

  /* ---------- expose (UI onclick + smoke tests) ---------- */
  globalThis.ASN_LIB = {
    parseAssignmentText, humanizeText, buildDocx, buildDocxXml, extractDocxText, vuFileName, crc32, zipStore, aiPrompt,
    get state() { return ASN; }
  };
  globalThis.showAssignmentLab = showAssignmentLab;
  globalThis.asnParse = asnParse;
  globalThis.asnAddQuestion = asnAddQuestion;
  globalThis.asnHumanize = asnHumanize;
  globalThis.asnAiHumanize = asnAiHumanize;
  globalThis.asnDownload = asnDownload;
  globalThis.asnPrint = asnPrint;
})();
