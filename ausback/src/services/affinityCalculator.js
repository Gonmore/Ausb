export class AffinityCalculator {
  constructor() {
    this.maxScoreUniqueMatch = 3.0;
  }

  calculateAffinity(companySkills, studentSkills) {
    let score = 0;
    let matches = 0;
    let matchingSkills = [];
    let hasPremiumMatch = false;
    let hasValue2Match = 0;
    let hasSuperiorRating = 0;
    let proportionalFactor = 1;
    let specialUniqueMatch = false;
    let coverageFactor = 1;

    // Obtener totales
    const totalCompanySkills = Object.keys(companySkills).length;
    const totalStudentSkills = Object.keys(studentSkills).length;

    if (totalCompanySkills === 0) {
      return this._createAffinityResult(0, 0, totalCompanySkills, [], {});
    }

    // Calcular coincidencias
    for (const [skill, companyLevel] of Object.entries(companySkills)) {
      if (studentSkills[skill]) {
        const studentLevel = studentSkills[skill];
        matches++;
        matchingSkills.push({
          skill,
          companyLevel,
          studentLevel,
          match: studentLevel >= companyLevel
        });

        // Calcular puntuación base
        if (studentLevel >= companyLevel) {
          score += companyLevel;
          
          // Bonificaciones especiales
          if (companyLevel >= 4) hasPremiumMatch = true;
          if (companyLevel === 2) hasValue2Match++;
          if (studentLevel > companyLevel) hasSuperiorRating++;
        } else {
          // Penalización por nivel insuficiente
          score += companyLevel * 0.5;
        }
      }
    }

    // Factor de cobertura (porcentaje de habilidades requeridas que tiene el estudiante)
    coverageFactor = matches / totalCompanySkills;

    // Factor proporcional (evita penalizar estudiantes con muchas habilidades extra)
    if (totalStudentSkills > totalCompanySkills) {
      proportionalFactor = Math.min(1.2, 1 + (matches / totalCompanySkills) * 0.2);
    }

    // Detección de coincidencia única especial
    if (matches === 1 && totalCompanySkills === 1 && companySkills[matchingSkills[0].skill] >= 4) {
      specialUniqueMatch = true;
      score = Math.min(score * 1.5, this.maxScoreUniqueMatch);
    }

    // Aplicar factores
    score *= coverageFactor * proportionalFactor;

    // Bonificaciones adicionales
    if (hasPremiumMatch) score *= 1.1;
    if (hasValue2Match >= 2) score *= 1.05;
    if (hasSuperiorRating >= 2) score *= 1.15;

    // Normalizar score (0-10)
    const normalizedScore = Math.min(10, (score / totalCompanySkills) * 2);

    const factors = {
      hasPremiumMatch,
      hasValue2Match,
      hasSuperiorRating,
      proportionalFactor: Math.round(proportionalFactor * 100) / 100,
      specialUniqueMatch,
      coverageFactor: Math.round(coverageFactor * 100) / 100
    };

    return this._createAffinityResult(
      normalizedScore, 
      matches, 
      totalCompanySkills, 
      matchingSkills, 
      factors
    );
  }

  // 🔥 MÉTODO NUEVO: Crear resultado con nivel y explicación
  _createAffinityResult(score, matches, totalRequired, matchingSkills, factors) {
    const roundedScore = Math.round(score * 100) / 100;
    const coverage = Math.round((matches / totalRequired) * 100);
    
    // 🔥 CONVERTIR SCORE A NIVEL
    const level = this._scoreToLevel(roundedScore, coverage);
    
    // 🔥 GENERAR EXPLICACIÓN LEGIBLE
    const explanation = this._generateExplanation(roundedScore, matches, totalRequired, coverage, level);

    return {
      score: roundedScore,
      level,
      matches,
      coverage,
      totalRequired,
      coveragePercentage: coverage,
      matchingSkills,
      explanation,
      factors
    };
  }

  // 🔥 MÉTODO MEJORADO: Convertir score a nivel
  _scoreToLevel(score, coverage) {
    // Algoritmo más balanceado para tener más variedad
    if (score >= 6 && coverage >= 75) return 'muy alto';
    if (score >= 4.5 && coverage >= 60) return 'alto';
    if (score >= 2.5 && coverage >= 40) return 'medio';  
    if (score >= 1 && coverage >= 20) return 'bajo';
    if (score > 0 || coverage > 0) return 'bajo';
    return 'sin datos';
  }

  // 🔥 MÉTODO NUEVO: Generar explicación legible
  _generateExplanation(score, matches, totalRequired, coverage, level) {
    if (matches === 0) {
      return 'No se encontraron coincidencias en las habilidades requeridas';
    }
    
    const explanations = {
      'muy alto': `Excelente afinidad: ${matches}/${totalRequired} habilidades coincidentes (${coverage}%). Candidato muy recomendado.`,
      'alto': `Buena afinidad: ${matches}/${totalRequired} habilidades coincidentes (${coverage}%). Candidato recomendado.`,
      'medio': `Afinidad moderada: ${matches}/${totalRequired} habilidades coincidentes (${coverage}%). Candidato con potencial.`,
      'bajo': `Afinidad baja: ${matches}/${totalRequired} habilidades coincidentes (${coverage}%). Revisar requisitos.`,
      'sin datos': 'No se encontraron datos suficientes para evaluar la afinidad.'
    };

    return explanations[level] || `${matches} coincidencias de ${totalRequired} requeridas (${coverage}% cobertura)`;
  }

  /**
   * Obtener candidatos recomendados basado en afinidad
   */
  findBestCandidates(companySkills, students, minScore = 6.0, limit = 10) {
    const candidates = students.map(student => {
      const affinity = this.calculateAffinity(companySkills, student.skills || {});
      return {
        student,
        affinity,
        recommended: affinity.score >= minScore
      };
    });

    // Ordenar por puntuación descendente
    candidates.sort((a, b) => b.affinity.score - a.affinity.score);

    return {
      total: candidates.length,
      recommended: candidates.filter(c => c.recommended).length,
      candidates: candidates.slice(0, limit)
    };
  }
}

export default new AffinityCalculator();