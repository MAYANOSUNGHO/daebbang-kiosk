const GRADE_ORDER = [3, 2, 1];

export function pickItem(items, rates) {
  const available = items.filter((item) => item.stock > 0 && item.enabled !== false);
  if (!available.length) return null;

  const gradesWithStock = GRADE_ORDER.filter((grade) =>
    available.some((item) => Number(item.grade) === grade),
  );
  const totalRate = gradesWithStock.reduce((sum, grade) => sum + Number(rates[grade] || 0), 0);
  let roll = Math.random() * totalRate;
  let chosenGrade = gradesWithStock[gradesWithStock.length - 1];
  for (const grade of gradesWithStock) {
    roll -= Number(rates[grade] || 0);
    if (roll <= 0) {
      chosenGrade = grade;
      break;
    }
  }

  const pool = available.filter((item) => Number(item.grade) === chosenGrade);
  const totalWeight = pool.reduce((sum, item) => sum + itemChance(item), 0);
  let weightRoll = Math.random() * totalWeight;
  for (const item of pool) {
    weightRoll -= itemChance(item);
    if (weightRoll <= 0) return item;
  }
  return pool[pool.length - 1];
}

function itemChance(item) {
  const stock = Math.max(0, Number(item.stock) || 0);
  const extra = Math.max(0.01, Number(item.weight) || 1);
  return stock * extra;
}

/** 화면 고지용. 합이 100이 아니어도 실제 비율로 환산해서 보여줍니다. */
export function formatRates(rates) {
  const total = GRADE_ORDER.reduce((sum, grade) => sum + Math.max(0, Number(rates?.[grade]) || 0), 0);
  if (total <= 0) return "확률 미설정";
  return GRADE_ORDER.map((grade) => {
    const percent = (Math.max(0, Number(rates[grade]) || 0) / total) * 100;
    const shown = percent >= 10 ? percent.toFixed(0) : percent.toFixed(percent < 1 ? 2 : 1);
    return `${gradeLabel(grade)} ${Number(shown)}%`;
  }).join(" · ");
}

export function gradeLabel(grade) {
  if (Number(grade) === 1) return "1등상";
  if (Number(grade) === 2) return "2등상";
  return "3등상";
}
