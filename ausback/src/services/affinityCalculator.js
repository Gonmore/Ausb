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
    const totalCompanyPoints = Object.values(companySkills).reduce((sum, val) => sum + val, 0);

    // Factor proporcional basado en cantidad de skills del estudiante
    if (totalStudentSkills < 8) {
      proportionalFactor = 1 + ((8 - totalStudentSkills) / 30);
    }

    // Recoger todas las coincidencias
    const allMatches = [];
    for (const [skill, companyValue] of Object.entries(companySkills)) {
      if (skill in studentSkills) {
        allMatches.push({
          skill,
          companyValue,
          studentValue: studentSkills[skill]
        });
      }
    }

    // Detección de casos especiales
    const isUniqueMatch = allMatches.length === 1 && totalCompanySkills >= 3;
    const isSpecialUniqueMatch = allMatches.length === 1 && 
                                allMatches[0].companyValue === 3 && 
                                allMatches[0].studentValue === 1;

    // Factor de cobertura
    const coverage = allMatches.length / totalCompanySkills;
    if (coverage < 0.8) {
      coverageFactor = 0.3 + (0.8 * coverage);
    }

    // Procesar cada coincidencia
    for (const match of allMatches) {
      matches++;
      let baseValue = 0;
      let isPremium = false;
      let isValue2 = false;
      let isSuperiorRating = false;
      let isSpecialCase = false;
      let isUnique = isUniqueMatch;
      let bonusText = "";

      const { skill, companyValue, studentValue } = match;

      // Sistema de valoración
      if (isSpecialUniqueMatch && companyValue === 3 && studentValue === 1) {
        baseValue = 1.0;
        isSpecialCase = true;
        bonusText = "Caso especial 3-1: valor reducido a 1.0";
      } else if (isUnique) {
        // Casos de única coincidencia
        if (companyValue === 1 && studentValue === 3) {
          baseValue = 2.5;
          bonusText = "2.5 (única coincidencia 1-3, valor máximo)";
          isSuperiorRating = true;
        } else {
          const baseUniqueValue = 1.0 + (0.5 * companyValue) + (0.3 * studentValue);
          baseValue = Math.min(baseUniqueValue, this.maxScoreUniqueMatch);
          bonusText = `${baseValue.toFixed(1)} (única coincidencia ${companyValue}-${studentValue})`;
          
          if (companyValue === 3 && studentValue === 3) {
            isPremium = true;
            hasPremiumMatch = true;
          } else if (companyValue === 2 && studentValue === 2) {
            isValue2 = true;
            hasValue2Match += 1;
          } else if (studentValue > companyValue) {
            isSuperiorRating = true;
            hasSuperiorRating += 1;
          }
        }
      } else {
        // Valores normales para múltiples coincidencias
        if (companyValue === 3) {
          if (studentValue === 3) {
            baseValue = 3.0;
            isPremium = true;
            hasPremiumMatch = true;
            bonusText = "3.0 (coincidencia premium 3-3)";
          } else if (studentValue === 2) {
            baseValue = 2.0;
            bonusText = "2.0 (coincidencia alta 3-2)";
          } else {
            baseValue = 1.2;
            bonusText = "1.2 (coincidencia baja 3-1)";
          }
        } else if (companyValue === 2) {
          if (studentValue === 3) {
            baseValue = 1.8;
            isSuperiorRating = true;
            hasSuperiorRating += 1;
            bonusText = "1.8 (valoración superior 2-3)";
          } else if (studentValue === 2) {
            baseValue = 1.6;
            isValue2 = true;
            hasValue2Match += 1;
            bonusText = "1.6 (coincidencia valor 2)";
          } else {
            baseValue = 1.0;
            bonusText = "1.0 (coincidencia 2-1)";
          }
        } else { // companyValue === 1
          if (studentValue === 3) {
            baseValue = 1.2;
            isSuperiorRating = true;
            hasSuperiorRating += 1;
            bonusText = "1.2 (valoración superior 1-3)";
          } else if (studentValue === 2) {
            baseValue = 1.1;
            isSuperiorRating = true;
            hasSuperiorRating += 1;
            bonusText = "1.1 (valoración superior 1-2)";
          } else {
            baseValue = 0.8;
            bonusText = "0.8 (coincidencia básica 1-1)";
          }
        }
      }

      // Aplicar factores
      let finalValue;
      if (isSpecialCase) {
        finalValue = baseValue;
      } else if (isUnique) {
        finalValue = Math.min(baseValue * proportionalFactor, this.maxScoreUniqueMatch);
      } else {
        finalValue = baseValue * proportionalFactor;
      }

      score += finalValue;

      matchingSkills.push({
        skill,
        companyValue,
        studentValue,
        baseValue: parseFloat(baseValue.toFixed(1)),
        finalValue: parseFloat(finalValue.toFixed(1)),
        bonusText,
        isPremium,
        isValue2,
        isSuperiorRating,
        isSpecialCase,
        isUnique
      });
    }

    // Aplicar factor de cobertura
    if (!isSpecialUniqueMatch && !isUniqueMatch) {
      score = score * coverageFactor;
    } else if (isUniqueMatch) {
      score = Math.min(score, this.maxScoreUniqueMatch);
    }

    const scorePercentage = (score / 15) * 100;

    // Determinar nivel de afinidad
    let level;
    if (isSpecialUniqueMatch) {
      level = "bajo";
    } else if (isUniqueMatch) {
      level = score >= 2.5 ? "medio" : "bajo";
    } else {
      if ((matches >= 3 && scorePercentage >= 60) || 
          (matches >= 2 && score >= 8) ||
          (hasPremiumMatch && matches >= 2 && score >= 7 && coverage >= 0.5) ||
          (hasValue2Match >= 2 && matches >= 2) ||
          (hasSuperiorRating >= 2 && score >= 7 && coverage >= 0.5)) {
        level = "muy alto";
      } else if ((matches >= 2 && scorePercentage >= 40) || 
                 (matches >= 1 && score >= 6) ||
                 (hasPremiumMatch && matches >= 1 && coverage >= 0.5) ||
                 (hasValue2Match >= 1 && matches >= 2) ||
                 (hasSuperiorRating >= 1 && score >= 5 && coverage >= 0.4)) {
        level = "alto";
      } else if ((matches >= 1 && scorePercentage >= 20) || score >= 3) {
        level = "medio";
      } else {
        level = "bajo";
      }
    }

    return {
      level,
      score: parseFloat(score.toFixed(1)),
      matches,
      coverage: parseFloat((coverage * 100).toFixed(0)),
      matchingSkills,
      hasPremiumMatch,
      hasValue2Match,
      hasSuperiorRating,
      isUniqueMatch,
      isSpecialUniqueMatch,
      proportionalFactor: parseFloat(proportionalFactor.toFixed(2)),
      coverageFactor: parseFloat(coverageFactor.toFixed(2))
    };
  }
}