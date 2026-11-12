import { MathOperation, DifficultyGrade, Question } from '../types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateOptions(correctAnswer: number | string, isFraction = false): string[] {
  const optionsSet = new Set<string>();
  const correctStr = String(correctAnswer);
  optionsSet.add(correctStr);

  if (isFraction && typeof correctAnswer === 'string' && correctAnswer.includes('/')) {
    const [numStr, denStr] = correctAnswer.split('/');
    const num = parseInt(numStr, 10);
    const den = parseInt(denStr, 10);

    const candidates = [
      `${num + 1}/${den}`,
      `${Math.max(1, num - 1)}/${den}`,
      `${num}/${den + 1}`,
      `${num + 1}/${den + 1}`,
      `${den}/${num}`,
      `${num * 2}/${den * 2 + 1}`,
    ];

    for (const c of candidates) {
      if (c !== correctStr) optionsSet.add(c);
      if (optionsSet.size >= 4) break;
    }
  } else {
    const numAns = typeof correctAnswer === 'number' ? correctAnswer : parseFloat(correctAnswer);
    if (!isNaN(numAns)) {
      const deltas = [-3, -2, -1, 1, 2, 3, 5, 10, -10, -5];
      const shuffledDeltas = shuffle(deltas);

      for (const d of shuffledDeltas) {
        const fake = numAns + d;
        if (numAns >= 0 && fake < 0) continue;
        optionsSet.add(Number.isInteger(numAns) ? String(fake) : fake.toFixed(1));
        if (optionsSet.size >= 4) break;
      }
    }
  }

  while (optionsSet.size < 4) {
    const randomFallback = getRandomInt(1, 50);
    optionsSet.add(String(randomFallback));
  }

  return shuffle(Array.from(optionsSet));
}

// Greatest Common Divisor
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function generateQuestion(
  operation: MathOperation,
  difficulty: DifficultyGrade,
  index = 0
): Question {
  const id = `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;
  let op = operation;
  if (op === 'mixed') {
    const ops: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'algebra', 'geometry'];
    op = ops[Math.floor(Math.random() * ops.length)];
  }

  switch (op) {
    case 'addition':
      return generateAddition(id, difficulty);
    case 'subtraction':
      return generateSubtraction(id, difficulty);
    case 'multiplication':
      return generateMultiplication(id, difficulty);
    case 'division':
      return generateDivision(id, difficulty);
    case 'fractions':
      return generateFractions(id, difficulty);
    case 'algebra':
      return generateAlgebra(id, difficulty);
    case 'geometry':
      return generateGeometry(id, difficulty);
    default:
      return generateAddition(id, difficulty);
  }
}

/**
 * Generates an explicit Dodging Table question based on assigned student table range & mode
 */
export function generateDodgingQuestion(
  tableRange: { min: number; max: number; custom?: number[] },
  mode: 'multiplication' | 'division' | 'missing_factor' | 'mixed' = 'multiplication',
  index = 0
): Question {
  const id = `dq_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Pick table T from custom tables or range [min, max] (tables 2 to 20)
  let table = 2;
  if (tableRange.custom && tableRange.custom.length > 0) {
    table = tableRange.custom[Math.floor(Math.random() * tableRange.custom.length)];
  } else {
    const min = Math.max(2, Math.min(20, tableRange.min || 2));
    const max = Math.max(min, Math.min(20, tableRange.max || 12));
    table = getRandomInt(min, max);
  }

  // Multiplier M is strictly in the range of 1 to 10 (never more than 10, e.g. 19*10 max)
  const multiplier = getRandomInt(1, 10);
  const product = table * multiplier;

  // Determine actual sub-mode
  let actualMode = mode;
  if (mode === 'mixed') {
    const modes: ('multiplication' | 'division' | 'missing_factor')[] = ['multiplication', 'division', 'missing_factor'];
    actualMode = modes[Math.floor(Math.random() * modes.length)];
  }

  // Generate smart dodging distractors
  const generateDodgingOptions = (correctVal: number, isFactor: boolean, maxFactorVal = 10): string[] => {
    const set = new Set<string>();
    const correctStr = String(correctVal);
    set.add(correctStr);

    if (isFactor) {
      // Options for missing factor / division (multiplier strictly 1-10, or table 2-20)
      const deltas = [-2, -1, 1, 2, 3, -3];
      for (const d of shuffle(deltas)) {
        const val = correctVal + d;
        if (val >= 1 && val <= maxFactorVal) set.add(String(val));
        if (set.size >= 4) break;
      }
    } else {
      // Options for product (e.g. 19 * 8 = 152)
      const candidates = [
        table * Math.min(10, multiplier + 1),
        table * Math.max(1, multiplier - 1),
        Math.min(20, table + 1) * multiplier,
        Math.max(2, table - 1) * multiplier,
        table * Math.min(10, Math.max(1, multiplier + 2)),
        table * Math.min(10, Math.max(1, multiplier - 2)),
        correctVal + 10,
        correctVal - 10,
      ];
      for (const cand of shuffle(candidates)) {
        if (cand > 0 && cand !== correctVal) set.add(String(cand));
        if (set.size >= 4) break;
      }
    }

    while (set.size < 4) {
      if (isFactor) {
        set.add(String(getRandomInt(1, maxFactorVal)));
      } else {
        const randM = getRandomInt(1, 10);
        const randT = getRandomInt(Math.max(2, table - 2), Math.min(20, table + 2));
        set.add(String(randT * randM));
      }
    }

    return shuffle(Array.from(set));
  };

  if (actualMode === 'missing_factor') {
    const isFirstMissing = Math.random() > 0.5;
    const text = isFirstMissing ? `? × ${multiplier} = ${product}` : `${table} × ? = ${product}`;
    const correctAns = isFirstMissing ? table : multiplier;
    // If first is missing, it is table (max 20), if second is missing, it is multiplier (max 10)
    const maxVal = isFirstMissing ? 20 : 10;
    return {
      id,
      operation: 'missing_factor',
      difficulty: 'explorer',
      text,
      options: generateDodgingOptions(correctAns, true, maxVal),
      correctAnswer: String(correctAns),
      explanation: `${table} × ${multiplier} = ${product}. So the missing number is ${correctAns}.`,
      hint: `Divide the product ${product} by ${isFirstMissing ? multiplier : table} to find the missing factor.`,
      tableNumber: table,
      multiplier,
    };
  }

  if (actualMode === 'division') {
    const text = `${product} ÷ ${table} = ?`;
    return {
      id,
      operation: 'division',
      difficulty: 'explorer',
      text,
      options: generateDodgingOptions(multiplier, true, 10),
      correctAnswer: String(multiplier),
      explanation: `${product} ÷ ${table} = ${multiplier} because ${table} × ${multiplier} = ${product}.`,
      hint: `What number times ${table} gives ${product}? (Hint: multiplier is between 1 and 10).`,
      tableNumber: table,
      multiplier,
    };
  }

  // Standard multiplication dodging: Table (2 to 20) × Multiplier (1 to 10)
  const text = `${table} × ${multiplier} = ?`;
  return {
    id,
    operation: 'multiplication',
    difficulty: 'explorer',
    text,
    options: generateDodgingOptions(product, false),
    correctAnswer: String(product),
    explanation: `${table} multiplied by ${multiplier} equals ${product}. (Table of ${table})`,
    hint: `Recall your Table of ${table}: ${table} × ${multiplier} = ${product}.`,
    tableNumber: table,
    multiplier,
  };
}

export function generateDodgingTestSet(
  count: number,
  tableRange: { min: number; max: number; custom?: number[] },
  mode: 'multiplication' | 'division' | 'missing_factor' | 'mixed' = 'multiplication'
): Question[] {
  const list: Question[] = [];
  for (let i = 0; i < count; i++) {
    list.push(generateDodgingQuestion(tableRange, mode, i));
  }
  return list;
}

function generateAddition(id: string, diff: DifficultyGrade): Question {
  let a = 0;
  let b = 0;

  if (diff === 'rookie') {
    a = getRandomInt(1, 15);
    b = getRandomInt(1, 15);
  } else if (diff === 'explorer') {
    a = getRandomInt(15, 80);
    b = getRandomInt(10, 75);
  } else if (diff === 'champion') {
    a = getRandomInt(80, 500);
    b = getRandomInt(50, 450);
  } else {
    // master
    a = getRandomInt(300, 2500);
    b = getRandomInt(200, 2500);
  }

  const ans = a + b;
  const isWordProblem = diff !== 'rookie' && Math.random() > 0.6;
  const wordProblems = [
    `Liam collected ${a} math tokens on Monday and ${b} tokens on Tuesday. How many tokens did Liam collect in total?`,
    `A school library has ${a} science books and ${b} history books. What is the total count of books?`,
    `The math club ordered ${a} blue badges and ${b} gold badges. How many badges were ordered in all?`
  ];

  const text = isWordProblem 
    ? wordProblems[Math.floor(Math.random() * wordProblems.length)]
    : `${a} + ${b} = ?`;

  return {
    id,
    operation: 'addition',
    difficulty: diff,
    text,
    options: generateOptions(ans),
    correctAnswer: String(ans),
    explanation: `Break down the sum: ${a} + ${b} = ${ans}. Check by adding ones then tens place!`,
    hint: `Try grouping numbers to the nearest ten: ${a} + ${b} = ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} + ${(a%10) + (b%10)} = ${ans}.`,
  };
}

function generateSubtraction(id: string, diff: DifficultyGrade): Question {
  let a = 0;
  let b = 0;

  if (diff === 'rookie') {
    b = getRandomInt(1, 10);
    a = getRandomInt(b, 20);
  } else if (diff === 'explorer') {
    b = getRandomInt(10, 50);
    a = getRandomInt(b + 5, 99);
  } else if (diff === 'champion') {
    b = getRandomInt(50, 350);
    a = getRandomInt(b + 20, 700);
  } else {
    b = getRandomInt(250, 1500);
    a = getRandomInt(b + 50, 3000);
  }

  const ans = a - b;
  const isWordProblem = diff !== 'rookie' && Math.random() > 0.6;
  const wordProblems = [
    `There were ${a} math problem cards in a deck. After solving ${b} of them, how many cards remain?`,
    `A student had a balance of ${a} points and spent ${b} points on a power-up. What is their remaining balance?`,
    `A rocket traveled ${a} miles towards orbit, then adjusted course by ${b} miles. What is the difference?`
  ];

  const text = isWordProblem 
    ? wordProblems[Math.floor(Math.random() * wordProblems.length)]
    : `${a} - ${b} = ?`;

  return {
    id,
    operation: 'subtraction',
    difficulty: diff,
    text,
    options: generateOptions(ans),
    correctAnswer: String(ans),
    explanation: `Subtract ${b} from ${a}: ${a} - ${b} = ${ans}.`,
    hint: `Count backwards or subtract the tens first: ${a} - ${b} = ${ans}.`,
  };
}

function generateMultiplication(id: string, diff: DifficultyGrade): Question {
  let a = 0;
  let b = 0;

  if (diff === 'rookie') {
    a = getRandomInt(2, 5);
    b = getRandomInt(2, 6);
  } else if (diff === 'explorer') {
    a = getRandomInt(4, 12);
    b = getRandomInt(3, 12);
  } else if (diff === 'champion') {
    a = getRandomInt(11, 25);
    b = getRandomInt(4, 15);
  } else {
    a = getRandomInt(15, 60);
    b = getRandomInt(12, 35);
  }

  const ans = a * b;
  const isWordProblem = Math.random() > 0.65;
  const wordProblems = [
    `A teacher arranges desks into ${a} rows with ${b} desks in each row. How many desks are there in total?`,
    `Each team has ${a} players, and there are ${b} teams in the tournament. How many total players are competing?`,
    `Maya solved ${a} questions every day for ${b} days. How many questions did she solve?`
  ];

  const text = isWordProblem
    ? wordProblems[Math.floor(Math.random() * wordProblems.length)]
    : `${a} × ${b} = ?`;

  return {
    id,
    operation: 'multiplication',
    difficulty: diff,
    text,
    options: generateOptions(ans),
    correctAnswer: String(ans),
    explanation: `${a} multiplied by ${b} is equal to ${ans}.`,
    hint: `Think of repeated addition: ${a} groups of ${b}, or break it down (${a} × ${b} = ${ans}).`,
  };
}

function generateDivision(id: string, diff: DifficultyGrade): Question {
  let divisor = 0;
  let quotient = 0;

  if (diff === 'rookie') {
    divisor = getRandomInt(2, 5);
    quotient = getRandomInt(2, 5);
  } else if (diff === 'explorer') {
    divisor = getRandomInt(3, 10);
    quotient = getRandomInt(3, 12);
  } else if (diff === 'champion') {
    divisor = getRandomInt(4, 15);
    quotient = getRandomInt(8, 25);
  } else {
    divisor = getRandomInt(8, 25);
    quotient = getRandomInt(15, 60);
  }

  const dividend = divisor * quotient;
  const isWordProblem = Math.random() > 0.6;
  const wordProblems = [
    `A box of ${dividend} pencils is shared equally among ${divisor} students. How many pencils does each student get?`,
    `A prize pool of $${dividend} is split evenly between ${divisor} champions. How much does each receive?`,
    `A runner completed a ${dividend}-mile relay split across ${divisor} equal laps. How long was each lap?`
  ];

  const text = isWordProblem
    ? wordProblems[Math.floor(Math.random() * wordProblems.length)]
    : `${dividend} ÷ ${divisor} = ?`;

  return {
    id,
    operation: 'division',
    difficulty: diff,
    text,
    options: generateOptions(quotient),
    correctAnswer: String(quotient),
    explanation: `${dividend} ÷ ${divisor} = ${quotient} because ${divisor} × ${quotient} = ${dividend}.`,
    hint: `Ask yourself: what number multiplied by ${divisor} gives ${dividend}?`,
  };
}

function generateFractions(id: string, diff: DifficultyGrade): Question {
  if (diff === 'rookie' || diff === 'explorer') {
    // Simplifying or basic addition with common denominators
    const den = getRandomInt(4, 12);
    const n1 = getRandomInt(1, Math.floor(den / 2));
    const n2 = getRandomInt(1, Math.floor(den / 2));
    const sumNum = n1 + n2;
    const g = gcd(sumNum, den);
    const simpNum = sumNum / g;
    const simpDen = den / g;
    const ans = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

    return {
      id,
      operation: 'fractions',
      difficulty: diff,
      text: `Calculate: ${n1}/${den} + ${n2}/${den} (in simplest form)`,
      options: generateOptions(ans, true),
      correctAnswer: ans,
      explanation: `Add numerators with common denominator: (${n1} + ${n2})/${den} = ${sumNum}/${den}. Simplified by dividing by ${g}: ${ans}.`,
      hint: `Since denominators are identical (${den}), add numerators (${n1} + ${n2}) and simplify if possible!`,
      diagramType: 'fraction_pie',
      diagramProps: { numerator: sumNum, denominator: den }
    };
  } else {
    // Different denominators or multiplication
    const isMult = Math.random() > 0.5;
    if (isMult) {
      const d1 = getRandomInt(2, 6);
      const n1 = getRandomInt(1, d1 - 1);
      const d2 = getRandomInt(2, 6);
      const n2 = getRandomInt(1, d2 - 1);

      const numAns = n1 * n2;
      const denAns = d1 * d2;
      const g = gcd(numAns, denAns);
      const sNum = numAns / g;
      const sDen = denAns / g;
      const ans = sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;

      return {
        id,
        operation: 'fractions',
        difficulty: diff,
        text: `Evaluate: (${n1}/${d1}) × (${n2}/${d2}) (simplified)`,
        options: generateOptions(ans, true),
        correctAnswer: ans,
        explanation: `Multiply numerators: ${n1} × ${n2} = ${numAns}. Multiply denominators: ${d1} × ${d2} = ${denAns}. Simplifies to ${ans}.`,
        hint: `Multiply straight across: top times top, bottom times bottom, then simplify.`,
      };
    } else {
      // Different denominators addition (e.g., 1/2 + 1/4)
      const d1 = 2;
      const d2 = getRandomInt(3, 6);
      const n1 = 1;
      const n2 = getRandomInt(1, d2 - 1);

      const commonDen = d1 * d2;
      const numAns = (n1 * d2) + (n2 * d1);
      const g = gcd(numAns, commonDen);
      const sNum = numAns / g;
      const sDen = commonDen / g;
      const ans = sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;

      return {
        id,
        operation: 'fractions',
        difficulty: diff,
        text: `Solve: ${n1}/${d1} + ${n2}/${d2} (in simplest form)`,
        options: generateOptions(ans, true),
        correctAnswer: ans,
        explanation: `Convert to common denominator ${commonDen}: (${n1 * d2} + ${n2 * d1}) / ${commonDen} = ${numAns}/${commonDen} = ${ans}.`,
        hint: `Find the common denominator (LCD = ${commonDen}) before adding!`,
      };
    }
  }
}

function generateAlgebra(id: string, diff: DifficultyGrade): Question {
  if (diff === 'rookie' || diff === 'explorer') {
    // 1-step linear: x + a = b or x - a = b
    const isAdd = Math.random() > 0.5;
    const x = getRandomInt(3, 20);
    const a = getRandomInt(2, 15);

    if (isAdd) {
      const b = x + a;
      return {
        id,
        operation: 'algebra',
        difficulty: diff,
        text: `Solve for x: x + ${a} = ${b}`,
        options: generateOptions(x),
        correctAnswer: String(x),
        explanation: `Subtract ${a} from both sides: x = ${b} - ${a} = ${x}.`,
        hint: `Isolate x by doing the inverse operation: subtract ${a} from ${b}.`,
      };
    } else {
      const b = x - a;
      return {
        id,
        operation: 'algebra',
        difficulty: diff,
        text: `Solve for x: x - ${a} = ${b}`,
        options: generateOptions(x),
        correctAnswer: String(x),
        explanation: `Add ${a} to both sides: x = ${b} + ${a} = ${x}.`,
        hint: `Isolate x by adding ${a} to ${b}.`,
      };
    }
  } else {
    // 2-step linear: 2x + a = b or 3x - a = b
    const coefficient = getRandomInt(2, 5);
    const x = getRandomInt(2, 12);
    const a = getRandomInt(1, 15);
    const isPlus = Math.random() > 0.5;

    if (isPlus) {
      const b = coefficient * x + a;
      return {
        id,
        operation: 'algebra',
        difficulty: diff,
        text: `Solve for x: ${coefficient}x + ${a} = ${b}`,
        options: generateOptions(x),
        correctAnswer: String(x),
        explanation: `First subtract ${a} from ${b} to get ${coefficient}x = ${b - a}. Then divide by ${coefficient}: x = ${x}.`,
        hint: `Step 1: Subtract ${a} from ${b}. Step 2: Divide the result by ${coefficient}.`,
      };
    } else {
      const b = coefficient * x - a;
      return {
        id,
        operation: 'algebra',
        difficulty: diff,
        text: `Solve for x: ${coefficient}x - ${a} = ${b}`,
        options: generateOptions(x),
        correctAnswer: String(x),
        explanation: `First add ${a} to ${b} to get ${coefficient}x = ${b + a}. Then divide by ${coefficient}: x = ${x}.`,
        hint: `Step 1: Add ${a} to both sides. Step 2: Divide by ${coefficient}.`,
      };
    }
  }
}

function generateGeometry(id: string, diff: DifficultyGrade): Question {
  const type = Math.random();

  if (type < 0.35) {
    // Area / Perimeter of rectangle
    const length = getRandomInt(4, 15);
    const width = getRandomInt(3, 10);
    const isArea = Math.random() > 0.5;

    if (isArea) {
      const ans = length * width;
      return {
        id,
        operation: 'geometry',
        difficulty: diff,
        text: `Find the Area of a rectangle with length = ${length} cm and width = ${width} cm:`,
        options: generateOptions(ans),
        correctAnswer: String(ans),
        explanation: `Area = length × width = ${length} × ${width} = ${ans} cm².`,
        hint: `Remember formula: Area = length × width.`,
        diagramType: 'rectangle',
        diagramProps: { length, width }
      };
    } else {
      const ans = 2 * (length + width);
      return {
        id,
        operation: 'geometry',
        difficulty: diff,
        text: `Find the Perimeter of a rectangle with length = ${length} m and width = ${width} m:`,
        options: generateOptions(ans),
        correctAnswer: String(ans),
        explanation: `Perimeter = 2 × (length + width) = 2 × (${length} + ${width}) = ${ans} m.`,
        hint: `Perimeter is the distance all around: 2 × (length + width).`,
        diagramType: 'rectangle',
        diagramProps: { length, width }
      };
    }
  } else if (type < 0.7) {
    // Triangle Missing Angle
    const a1 = getRandomInt(35, 75);
    const a2 = getRandomInt(35, 75);
    const ans = 180 - (a1 + a2);

    return {
      id,
      operation: 'geometry',
      difficulty: diff,
      text: `In a triangle, two angles measure ${a1}° and ${a2}°. What is the third angle?`,
      options: generateOptions(ans),
      correctAnswer: String(ans),
      explanation: `The interior angles of any triangle sum to 180°. Third angle = 180° - (${a1}° + ${a2}°) = ${ans}°.`,
      hint: `Sum of triangle angles is always 180°. Subtract ${a1} + ${a2} from 180.`,
      diagramType: 'triangle',
      diagramProps: { angle1: a1, angle2: a2 }
    };
  } else {
    // Area of triangle
    const base = getRandomInt(4, 16);
    const height = getRandomInt(2, 10);
    const ans = (base * height) / 2;

    return {
      id,
      operation: 'geometry',
      difficulty: diff,
      text: `Find the Area of a triangle with base = ${base} cm and height = ${height} cm:`,
      options: generateOptions(ans),
      correctAnswer: String(ans),
      explanation: `Area of a triangle = (base × height) / 2 = (${base} × ${height}) / 2 = ${ans} cm².`,
      hint: `Formula: Area = ½ × base × height.`,
      diagramType: 'triangle',
      diagramProps: { base, height }
    };
  }
}
