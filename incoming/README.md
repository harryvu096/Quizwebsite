# 📥 Yahan apni MCQ files daalein (incoming)

Is folder me apni **past-paper / MCQ files** upload karein — main (AI) yahan se
padh kar sahi subject + sahi exam (Mid/Final) ke bank me import kar dunga.

## Kaise upload karein (browser se, 30 second)
1. Ye link kholein (Login hona zaroori hai):
   https://github.com/harryvu096/Quizwebsite/upload/arena/01a0adf1-quizwebsite/incoming
2. Files **drag & drop** karein (ek sath bohat si files bhi chalengi).
3. Neeche "Commit changes" dabayein.
4. Mujhe bata dein "upload ho gaya" — main import kar dunga aur report dikha dunga.

## Kaunsi file format behtar hai (priority order)
1. **.txt / .md** — sab se behtar (PDF se convert ho kar aaye to bhi theek)
2. **.docx** — chal jayegi (converter maujood hai)
3. **.pdf** — text wali PDF chalegi; **scanned image wali PDF nahi chalegi**
4. **.csv** — `question,optionA,optionB,optionC,optionD,answer,explanation`
5. **.json** — `[[ "question", ["a","b","c","d"], 2, "explanation" ], ...]` (answer index 0-based)

## Naam rakhne ka tareeqa (isi se subject detect hota hai)
- `CS301_Final_2024.txt` → CS301 ka **Finalterm** bank
- `CS201_Mid_PastPapers.docx` → CS201 ka **Midterm** bank
- `Data Structures Mid MCQs.txt` → subject ka **naam** likha ho to bhi detect ho jata hai
- Naam theek na ho to koi masla nahi — main `--subject=Q_CS301_MID` se force kar dunga.

## MCQ ka format (tool khud samajh leta hai)
```
1. Question text yahan?
A) option 1
B) option 2
C) option 3
D) option 4
Answer: B
Explanation: tafseel yahan
```
- Correct option par `*` ya `✓` bhi chalta hai
- Ek hi line me options: `a) x  b) y  c) z  d) w`
- Explanation na ho to bhi theek (main placeholder laga dunga)

> Jitni files zyada, utna behtar. Target: **har subject ka har bank 200+ MCQs**.
> Har import se pehle automatic backup (`data/.backups/`) banta hai aur
> `reports/import-*.md` me pura hisaab likha jata hai — koi data kharab nahi hota.
