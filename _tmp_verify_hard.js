// Brute-force verifier for 10 hard symbolic-condition questions
// Verdicts: alwaysTrue / alwaysFalse / mixed (over exhaustive integer grid)

function run(name, n, max, cond, c1, c2, expect) {
  const v = new Array(n).fill(1);
  let t1 = 0, f1 = 0, t2 = 0, f2 = 0, samples = 0;
  while (true) {
    if (cond(v)) {
      samples++;
      if (c1(v)) t1++; else f1++;
      if (c2(v)) t2++; else f2++;
    }
    let i = 0;
    while (i < n) { v[i]++; if (v[i] <= max) break; v[i] = 1; i++; }
    if (i === n) break;
  }
  const verdict = (t, f) => (t > 0 && f > 0) ? 'mixed' : (t > 0 ? 'alwaysTrue' : (f > 0 ? 'alwaysFalse' : 'NO_SAMPLES'));
  const v1 = verdict(t1, f1), v2 = verdict(t2, f2);
  const ok = (v1 === expect[0] && v2 === expect[1]) ? 'PASS' : '*** FAIL ***';
  console.log(`${name} samples=${samples} C1=${v1}(T${t1}/F${f1}) C2=${v2}(T${t2}/F${f2}) expect=[${expect}] => ${ok}`);
}

// ---------- Normal chain questions (values 1..6 exhaustive) ----------

// Q1 vars [A,B,C,D,E,F,G]
// cond: A > B >= C = D > E ; F >= B > G >= E
run('Q1', 7, 6,
  v => v[0] > v[1] && v[1] >= v[2] && v[2] === v[3] && v[3] > v[4] && v[5] >= v[1] && v[1] > v[6] && v[6] >= v[4],
  v => v[0] + v[5] > v[2] + v[6],          // A+F > C+G
  v => v[0] - v[4] > v[2] - v[1],          // A-E > C-B
  ['alwaysTrue', 'alwaysTrue']);

// Q2 vars [A,B,C,D,E,F,G,H]
// cond: H = A >= B > C >= D ; B >= E = F > G >= D
run('Q2', 8, 6,
  v => v[7] === v[0] && v[0] >= v[1] && v[1] > v[2] && v[2] >= v[3] && v[1] >= v[4] && v[4] === v[5] && v[5] > v[6] && v[6] >= v[3],
  v => v[0] + v[1] > v[2] + v[6],          // A+B > C+G
  v => v[0] + v[3] >= v[4] + v[6],         // A+D >= E+G
  ['alwaysTrue', 'mixed']);

// Q3 vars [A,B,C,D,E,F,G]
// cond: A >= B = C > D >= E ; F > C >= G = E
run('Q3', 7, 6,
  v => v[0] >= v[1] && v[1] === v[2] && v[2] > v[3] && v[3] >= v[4] && v[5] > v[2] && v[2] >= v[6] && v[6] === v[4],
  v => v[0] + v[3] > v[1] + v[6],          // A+D > B+G
  v => v[1] + v[5] > v[0] + v[6],          // B+F > A+G
  ['mixed', 'mixed']);

// Q4 vars [A,B,C,D,E,F,G,H]
// cond: A > B >= C > D = E ; H = C >= F > E >= G
run('Q4', 8, 6,
  v => v[0] > v[1] && v[1] >= v[2] && v[2] > v[3] && v[3] === v[4] && v[7] === v[2] && v[2] >= v[5] && v[5] > v[4] && v[4] >= v[6],
  v => v[3] + v[6] > v[2] + v[5],          // D+G > C+F
  v => v[4] + v[6] >= v[1] + v[5],         // E+G >= B+F
  ['alwaysFalse', 'alwaysFalse']);

// Q5 vars [A,B,C,D,E,F,G,H]
// cond: A >= B > C = D >= E ; F > B >= G > H = E
run('Q5', 8, 6,
  v => v[0] >= v[1] && v[1] > v[2] && v[2] === v[3] && v[3] >= v[4] && v[5] > v[1] && v[1] >= v[6] && v[6] > v[7] && v[7] === v[4],
  v => v[2] + v[7] > v[1] + v[6],          // C+H > B+G
  v => v[5] + v[4] >= v[0] + v[7],         // F+E >= A+H
  ['alwaysFalse', 'mixed']);

// Q6 vars [A,B,C,D,E,F,G,H]
// cond: A = B >= C > D >= E ; C >= F = G > H >= E
run('Q6', 8, 6,
  v => v[0] === v[1] && v[1] >= v[2] && v[2] > v[3] && v[3] >= v[4] && v[2] >= v[5] && v[5] === v[6] && v[6] > v[7] && v[7] >= v[4],
  v => v[0] + v[5] >= v[2] + v[6],         // A+F >= C+G
  v => v[1] + v[6] > v[3] + v[7],          // B+G > D+H
  ['alwaysTrue', 'alwaysTrue']);

// ---------- Fraction questions (values 1..15 exhaustive) ----------

// Q7 vars [A,B,C,D,E,F]
// cond: A/3 > B/2 >= C/5  (2A>3B, 5B>=2C) ; C >= D > E = F
run('Q7', 6, 15,
  v => 2 * v[0] > 3 * v[1] && 5 * v[1] >= 2 * v[2] && v[2] >= v[3] && v[3] > v[4] && v[4] === v[5],
  v => v[0] > v[3],                        // A > D
  v => 5 * v[1] >= 2 * v[5],               // 5B >= 2F
  ['mixed', 'alwaysTrue']);

// Q8 vars [A,B,C,D,E,F]
// cond: A/4 > B/3 >= C/2  (3A>4B, 2B>=3C) ; C > D >= E = F
run('Q8', 6, 15,
  v => 3 * v[0] > 4 * v[1] && 2 * v[1] >= 3 * v[2] && v[2] > v[3] && v[3] >= v[4] && v[4] === v[5],
  v => v[0] + v[1] > v[2] + v[3],          // A+B > C+D
  v => v[0] + v[4] > v[1] + v[5],          // A+E > B+F
  ['alwaysTrue', 'alwaysTrue']);

// Q9 vars [A,B,C,F,G,H]
// cond: A/5 > B/4 >= C/2  (4A>5B, B>=2C) ; C = F > G >= H
run('Q9', 6, 15,
  v => 4 * v[0] > 5 * v[1] && v[1] >= 2 * v[2] && v[2] === v[3] && v[3] > v[4] && v[4] >= v[5],
  v => v[5] >= v[1],                       // H >= B
  v => 2 * v[2] > v[1],                    // 2C > B
  ['alwaysFalse', 'alwaysFalse']);

// Q10 vars [A,B,C,D,E,F]
// cond: A/2 > B/3 >= C/4  (3A>2B, 4B>=3C) ; C >= D > E = F
run('Q10', 6, 15,
  v => 3 * v[0] > 2 * v[1] && 4 * v[1] >= 3 * v[2] && v[2] >= v[3] && v[3] > v[4] && v[4] === v[5],
  v => v[0] > v[4],                        // A > E
  v => v[1] > v[5],                        // B > F
  ['mixed', 'mixed']);

console.log('done');
