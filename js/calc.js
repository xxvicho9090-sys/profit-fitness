// Fórmulas de medición. Unidades: kg, cm, años, minutos.
const Calc = {
  bmi: (kg, cm) => kg / Math.pow(cm / 100, 2),
  bmiCat(b) { return b < 18.5 ? 'Bajo peso' : b < 25 ? 'Normal' : b < 30 ? 'Sobrepeso' : b < 35 ? 'Obesidad I' : b < 40 ? 'Obesidad II' : 'Obesidad III'; },
  // % grasa método Marina de EE.UU. (circunferencias)
  navyBF(sex, cm, neck, waist, hip) {
    if (sex === 'm') { if (waist <= neck) return null; return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(cm)) - 450; }
    if (waist + hip <= neck) return null;
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(cm)) - 450;
  },
  // % grasa método CUN-BAE (usa IMC, edad, sexo)
  cunBAE(sex, age, bmi) { return -44.988 + 0.503 * age + 10.689 * (sex === 'm' ? 0 : 1) + 3.172 * bmi - 0.026 * bmi * bmi + 0.181 * bmi * (sex === 'm' ? 0 : 1) - 0.02 * bmi * age - 0.005 * bmi * bmi * (sex === 'm' ? 0 : 1) + 0.00021 * bmi * bmi * age; },
  bfCat(sex, bf) {
    const t = sex === 'm' ? [[6, 'Esencial'], [14, 'Atleta'], [18, 'Fitness'], [25, 'Promedio']] : [[14, 'Esencial'], [21, 'Atleta'], [25, 'Fitness'], [32, 'Promedio']];
    for (const [lim, name] of t) if (bf < lim) return name;
    return 'Alto';
  },
  lean: (kg, bf) => kg * (1 - bf / 100),
  fat: (kg, bf) => kg * bf / 100,
  ffmi(lean, cm) { const m = cm / 100; return lean / (m * m) + 6.1 * (1.8 - m); },
  bmr(sex, kg, cm, age) { return 10 * kg + 6.25 * cm - 5 * age + (sex === 'm' ? 5 : -161); },
  bmrKatch: (lean) => 370 + 21.6 * lean,
  tdee: (bmr, act) => bmr * act,
  macros(kcal, kg, goal) {
    const adj = { lose: 0.8, maintain: 1, gain: 1.1, recomp: 0.95 }[goal] || 1;
    const k = kcal * adj;
    const pr = (goal === 'lose' || goal === 'recomp' ? 2.2 : 1.8) * kg;
    const fat = Math.max(0.8 * kg, k * 0.22 / 9);
    const carb = Math.max(0, (k - pr * 4 - fat * 9) / 4);
    return { kcal: k, protein: pr, fat, carb };
  },
  whr: (w, h) => w / h,
  whrRisk(sex, r) { return r > (sex === 'm' ? 0.90 : 0.85) ? 'Riesgo elevado' : 'Riesgo bajo'; },
  whtr: (w, cm) => w / cm,
  whtrRisk(r) { return r < 0.4 ? 'Muy delgado' : r < 0.5 ? 'Saludable' : r < 0.6 ? 'Riesgo aumentado' : 'Riesgo alto'; },
  idealWeight(sex, cm) { const inch = cm / 2.54; const base = sex === 'm' ? 50 : 45.5; return base + 2.3 * Math.max(0, inch - 60); },
  epley: (w, r) => r === 1 ? w : w * (1 + r / 30),
  brzycki: (w, r) => r >= 37 ? NaN : w * 36 / (37 - r),
  pct1RM: [[100, 1], [95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 20]],
  hrMax: (age) => 208 - 0.7 * age,
  zones(age, rest) {
    const max = Calc.hrMax(age), res = max - rest;
    return [
      ['Z1 Recuperación', .5, .6], ['Z2 Base aeróbica / quema grasa', .6, .7], ['Z3 Tempo', .7, .8],
      ['Z4 Umbral', .8, .9], ['Z5 Máximo / VO2max', .9, 1]
    ].map(([n, a, b]) => ({ n, lo: Math.round(rest + res * a), hi: Math.round(rest + res * b) }));
  },
  vo2Cooper: (m) => (m - 504.9) / 44.73,
  vo2Rest: (age, rest) => 15.3 * (Calc.hrMax(age) / rest),
  vo2Cat(sex, age, v) {
    const lim = sex === 'm' ? (age < 30 ? [38, 45, 52] : age < 40 ? [35, 42, 48] : age < 50 ? [32, 38, 45] : [28, 35, 42]) : (age < 30 ? [32, 38, 45] : age < 40 ? [30, 35, 42] : age < 50 ? [27, 32, 38] : [24, 30, 36]);
    return v < lim[0] ? 'Bajo' : v < lim[1] ? 'Promedio' : v < lim[2] ? 'Bueno' : 'Excelente';
  },
  water: (kg, active) => kg * 0.035 + (active ? 0.5 : 0),
  // MET aproximados para estimar calorías: kcal = MET * kg * horas
  kcal: (met, kg, min) => met * kg * min / 60,
  // Puntuación relativa de fuerza (carga/peso corporal) vs referencia intermedia
  strengthRatio: { // multiplicadores de peso corporal nivel intermedio: [hombre, mujer]
    squat: [1.5, 1.0], bench: [1.25, 0.65], deadlift: [1.75, 1.25], ohp: [0.8, 0.45], row: [1.0, 0.6]
  },
  wilks(sex, bw, total) { // Wilks 2020 aprox. (coef. IPF modernos)
    const c = sex === 'm' ? [47.4617885411949, 8.47206137941125, 0.073694103462609, -0.00139583381094385, 7.07665973070743e-6, -1.20804336482315e-8] : [-125.4255398, 13.71219419, -0.03307250631, -0.001050400051, 9.38773881462799e-6, -2.3334613884954e-8];
    const d = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4 + c[5] * bw ** 5;
    return total * 600 / d;
  },
  ageFrom(dob) { if (!dob) return null; const d = new Date(dob), n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; }
};
