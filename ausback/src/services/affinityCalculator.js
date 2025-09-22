export class AffinityCalculator {
  constructor() {
    this.maxScoreUniqueMatch = 3.0;
    
    // 🚀 OPTIMIZACIÓN: Configuración mejorada con pesos dinámicos
    this.weights = {
      exactMatch: 1.0,        // Peso base para coincidencia exacta
      superiorMatch: 1.3,     // Bonus por superar el nivel requerido
      criticalSkill: 1.5,     // Bonus para habilidades críticas (nivel 4-5)
      coverageBonus: 1.2,     // Bonus por alta cobertura
      experienceBonus: 1.15,  // Bonus por experiencia superior
      consistencyBonus: 1.1   // Bonus por consistencia en múltiples habilidades
    };
    
    // 🚀 OPTIMIZACIÓN: Cache para mejorar performance en cálculos repetidos
    this.cache = new Map();
    this.cacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  calculateAffinity(companySkills, studentSkills) {
    // 🚀 OPTIMIZACIÓN: Cache de resultados para estudiantes similares
    const cacheKey = this._generateCacheKey(companySkills, studentSkills);
    if (this.cache.has(cacheKey)) {
      this.cacheHits++;
      return this.cache.get(cacheKey);
    }
    this.cacheMisses++;

    let score = 0;
    let matches = 0;
    let matchingSkills = [];
    let hasPremiumMatch = false;
    let hasValue2Match = 0;
    let hasSuperiorRating = 0;
    let proportionalFactor = 1;
    let specialUniqueMatch = false;
    let coverageFactor = 1;
    let criticalSkillsMatched = 0;
    let consistencyScore = 0;

    // Obtener totales
    const totalCompanySkills = Object.keys(companySkills).length;
    const totalStudentSkills = Object.keys(studentSkills).length;

    if (totalCompanySkills === 0) {
      return this._createAffinityResult(0, 0, totalCompanySkills, [], {});
    }

    // 🚀 OPTIMIZACIÓN: Pre-clasificar habilidades por importancia
    const skillsByImportance = this._classifySkillsByImportance(companySkills);
    
    // 🚀 OPTIMIZACIÓN: Calcular coincidencias con algoritmo mejorado
    for (const [skill, companyLevel] of Object.entries(companySkills)) {
      if (studentSkills[skill]) {
        const studentLevel = studentSkills[skill];
        matches++;
        
        const skillMatch = {
          skill,
          companyLevel,
          studentLevel,
          match: studentLevel >= companyLevel,
          excess: Math.max(0, studentLevel - companyLevel),
          importance: this._getSkillImportance(companyLevel)
        };
        
        matchingSkills.push(skillMatch);

        // 🚀 OPTIMIZACIÓN: Sistema de puntuación más sofisticado
        let skillScore = this._calculateSkillScore(skillMatch);
        
        // Aplicar bonificaciones especiales
        if (companyLevel >= 4) {
          hasPremiumMatch = true;
          criticalSkillsMatched++;
          skillScore *= this.weights.criticalSkill;
        }
        
        if (companyLevel === 2) hasValue2Match++;
        
        if (studentLevel > companyLevel) {
          hasSuperiorRating++;
          skillScore *= this.weights.superiorMatch;
        }
        
        // 🚀 OPTIMIZACIÓN: Bonus por consistencia en habilidades importantes
        if (companyLevel >= 3 && studentLevel >= companyLevel) {
          consistencyScore += 1;
        }
        
        score += skillScore;
      } else {
        // 🚀 OPTIMIZACIÓN: Penalización más inteligente para habilidades faltantes
        const missingPenalty = this._calculateMissingSkillPenalty(companyLevel, totalCompanySkills);
        score -= missingPenalty;
      }
    }

    // 🚀 OPTIMIZACIÓN: Factores mejorados de cobertura y proporcionalidad
    coverageFactor = matches / totalCompanySkills;
    
    // Factor proporcional mejorado
    if (totalStudentSkills > totalCompanySkills) {
      const skillRatio = totalStudentSkills / totalCompanySkills;
      proportionalFactor = Math.min(1.3, 1 + (coverageFactor * 0.3));
    }

    // 🚀 OPTIMIZACIÓN: Detección mejorada de coincidencia única especial
    if (matches === 1 && totalCompanySkills === 1) {
      const singleSkill = matchingSkills[0];
      if (singleSkill.companyLevel >= 4 && singleSkill.studentLevel >= singleSkill.companyLevel) {
        specialUniqueMatch = true;
        score = Math.min(score * 1.8, this.maxScoreUniqueMatch);
      }
    }

    // 🚀 OPTIMIZACIÓN: Sistema de bonificaciones más inteligente
    let finalScore = score;
    
    // Aplicar factores base
    finalScore *= coverageFactor * proportionalFactor;

    // Bonificaciones progresivas
    if (hasPremiumMatch && criticalSkillsMatched >= 2) {
      finalScore *= this.weights.criticalSkill;
    } else if (hasPremiumMatch) {
      finalScore *= this.weights.experienceBonus;
    }
    
    if (hasValue2Match >= 2) finalScore *= 1.05;
    if (hasSuperiorRating >= 2) finalScore *= this.weights.consistencyBonus;
    
    // 🚀 OPTIMIZACIÓN: Bonus por consistencia en múltiples habilidades
    if (consistencyScore >= 3) {
      finalScore *= this.weights.consistencyBonus;
    }
    
    // 🚀 OPTIMIZACIÓN: Bonus por alta cobertura
    if (coverageFactor >= 0.8) {
      finalScore *= this.weights.coverageBonus;
    }

    // 🚀 OPTIMIZACIÓN: Normalización mejorada con curva logarítmica
    const normalizedScore = this._normalizeScore(finalScore, totalCompanySkills, coverageFactor);

    // 🚀 OPTIMIZACIÓN: Factores expandidos con más métricas
    const factors = {
      hasPremiumMatch,
      hasValue2Match,
      hasSuperiorRating,
      criticalSkillsMatched,
      consistencyScore,
      proportionalFactor: Math.round(proportionalFactor * 100) / 100,
      specialUniqueMatch,
      coverageFactor: Math.round(coverageFactor * 100) / 100,
      skillDiversityBonus: totalStudentSkills > totalCompanySkills,
      perfectMatch: matches === totalCompanySkills && hasSuperiorRating === 0
    };

    const result = this._createAffinityResult(
      normalizedScore, 
      matches, 
      totalCompanySkills, 
      matchingSkills, 
      factors
    );
    
    // 🚀 OPTIMIZACIÓN: Guardar en cache
    this._cacheResult(cacheKey, result);
    
    return result;
  }
  
  // 🚀 OPTIMIZACIÓN: Nuevos métodos de apoyo
  _generateCacheKey(companySkills, studentSkills) {
    const companyStr = JSON.stringify(companySkills);
    const studentStr = JSON.stringify(studentSkills);
    return `${companyStr}|${studentStr}`;
  }
  
  _cacheResult(key, result) {
    if (this.cache.size >= this.cacheSize) {
      // Limpiar cache más antiguo (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, result);
  }
  
  _classifySkillsByImportance(companySkills) {
    const critical = [];
    const important = [];
    const basic = [];
    
    for (const [skill, level] of Object.entries(companySkills)) {
      if (level >= 4) critical.push(skill);
      else if (level >= 3) important.push(skill);
      else basic.push(skill);
    }
    
    return { critical, important, basic };
  }
  
  _getSkillImportance(level) {
    if (level >= 4) return 'critical';
    if (level >= 3) return 'important';
    return 'basic';
  }
  
  _calculateSkillScore(skillMatch) {
    const { companyLevel, studentLevel, match } = skillMatch;
    
    if (!match) {
      // Penalización por no cumplir el mínimo
      return companyLevel * 0.3;
    }
    
    let baseScore = companyLevel;
    
    // Bonus por exceder el nivel requerido
    if (studentLevel > companyLevel) {
      const excess = studentLevel - companyLevel;
      baseScore += excess * 0.5;
    }
    
    return baseScore;
  }
  
  _calculateMissingSkillPenalty(companyLevel, totalSkills) {
    // Penalización más suave para habilidades básicas
    const basePenalty = companyLevel * 0.2;
    const scalingFactor = 1 / Math.sqrt(totalSkills);
    return basePenalty * scalingFactor;
  }
  
  _normalizeScore(score, totalRequired, coverageFactor) {
    // Normalización mejorada que considera la cobertura
    const baseNormalization = (score / totalRequired) * 2;
    const coverageAdjustment = Math.log(1 + coverageFactor) / Math.log(2);
    
    return Math.min(10, baseNormalization * coverageAdjustment);
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

  // � OPTIMIZACIÓN: Algoritmo de nivel mejorado con más granularidad
  _scoreToLevel(score, coverage) {
    // Sistema más granular y balanceado
    if (score >= 7.5 && coverage >= 80) return 'muy alto';
    if (score >= 6.0 && coverage >= 70) return 'muy alto';
    if (score >= 4.5 && coverage >= 60) return 'alto';
    if (score >= 3.5 && coverage >= 50) return 'alto';
    if (score >= 2.5 && coverage >= 40) return 'medio';  
    if (score >= 1.5 && coverage >= 30) return 'medio';
    if (score >= 0.5 && coverage >= 15) return 'bajo';
    if (score > 0 || coverage > 0) return 'bajo';
    return 'sin datos';
  }

  // � OPTIMIZACIÓN: Explicaciones más detalladas y útiles
  _generateExplanation(score, matches, totalRequired, coverage, level) {
    if (matches === 0) {
      return 'No se encontraron coincidencias en las habilidades requeridas. Considere ampliar los criterios de búsqueda.';
    }
    
    const baseInfo = `${matches}/${totalRequired} habilidades coincidentes (${coverage}% cobertura)`;
    
    const explanations = {
      'muy alto': `🌟 ${baseInfo}. Candidato excepcional con excelente afinidad para el puesto. Altamente recomendado para entrevista inmediata.`,
      'alto': `⭐ ${baseInfo}. Candidato sólido con buena afinidad. Recomendado para proceso de selección.`,
      'medio': `📊 ${baseInfo}. Candidato con potencial moderado. Revisar experiencia específica y considerar entrevista.`,
      'bajo': `📋 ${baseInfo}. Afinidad limitada. Evaluar si el candidato puede desarrollar habilidades faltantes.`,
      'sin datos': 'No se encontraron datos suficientes para evaluar la afinidad. Revisar perfil del candidato.'
    };

    return explanations[level] || `${baseInfo}. Puntuación: ${score.toFixed(1)}/10`;
  }

  /**
   * 🚀 OPTIMIZACIÓN: Obtener candidatos recomendados con algoritmo mejorado
   */
  findBestCandidates(companySkills, students, options = {}) {
    const {
      minScore = 4.0,           // Score mínimo reducido para más variedad
      limit = 15,               // Límite aumentado
      includeAnalytics = true,  // Incluir métricas adicionales
      diversityBonus = true     // Bonificar diversidad de perfiles
    } = options;

    const candidates = students.map(student => {
      const affinity = this.calculateAffinity(companySkills, student.skills || {});
      
      // 🚀 OPTIMIZACIÓN: Métricas adicionales
      const analytics = includeAnalytics ? {
        skillGap: this._calculateSkillGap(companySkills, student.skills || {}),
        potentialGrowth: this._calculateGrowthPotential(companySkills, student.skills || {}),
        uniqueValue: this._calculateUniqueValue(student.skills || {}, students)
      } : {};
      
      return {
        student,
        affinity,
        analytics,
        recommended: affinity.score >= minScore,
        priority: this._calculatePriority(affinity, analytics)
      };
    });

    // 🚀 OPTIMIZACIÓN: Ordenamiento inteligente con múltiples criterios
    candidates.sort((a, b) => {
      // Prioridad principal: score de afinidad
      if (Math.abs(a.affinity.score - b.affinity.score) > 0.5) {
        return b.affinity.score - a.affinity.score;
      }
      
      // Criterio secundario: prioridad calculada
      if (includeAnalytics && Math.abs(a.priority - b.priority) > 0.1) {
        return b.priority - a.priority;
      }
      
      // Criterio terciario: cobertura de habilidades
      return b.affinity.coverage - a.affinity.coverage;
    });

    // 🚀 OPTIMIZACIÓN: Aplicar bonus de diversidad si está habilitado
    if (diversityBonus && candidates.length > limit) {
      this._applyDiversityBonus(candidates.slice(0, limit * 2));
      candidates.sort((a, b) => b.affinity.score - a.affinity.score);
    }

    const finalCandidates = candidates.slice(0, limit);

    return {
      total: candidates.length,
      recommended: candidates.filter(c => c.recommended).length,
      candidates: finalCandidates,
      analytics: includeAnalytics ? {
        averageScore: this._calculateAverage(candidates.map(c => c.affinity.score)),
        scoreDistribution: this._calculateScoreDistribution(candidates),
        topTierCount: candidates.filter(c => c.affinity.level === 'muy alto').length,
        skillCoverageStats: this._calculateSkillCoverageStats(candidates, companySkills)
      } : null
    };
  }
  
  // 🚀 OPTIMIZACIÓN: Nuevos métodos de análisis
  _calculateSkillGap(companySkills, studentSkills) {
    const missing = [];
    const insufficient = [];
    
    for (const [skill, required] of Object.entries(companySkills)) {
      if (!studentSkills[skill]) {
        missing.push({ skill, required });
      } else if (studentSkills[skill] < required) {
        insufficient.push({ 
          skill, 
          required, 
          current: studentSkills[skill],
          gap: required - studentSkills[skill]
        });
      }
    }
    
    return { missing, insufficient, totalGaps: missing.length + insufficient.length };
  }
  
  _calculateGrowthPotential(companySkills, studentSkills) {
    let potential = 0;
    let trainableSkills = 0;
    
    for (const [skill, required] of Object.entries(companySkills)) {
      const current = studentSkills[skill] || 0;
      if (current < required) {
        const gap = required - current;
        if (gap <= 2) { // Habilidades que se pueden desarrollar fácilmente
          trainableSkills++;
          potential += (2 - gap) * 0.5; // Mayor potencial para gaps menores
        }
      }
    }
    
    return { potential, trainableSkills };
  }
  
  _calculateUniqueValue(studentSkills, allStudents) {
    const skillCounts = {};
    
    // Contar frecuencia de cada habilidad
    allStudents.forEach(student => {
      Object.keys(student.skills || {}).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    
    let uniqueness = 0;
    Object.keys(studentSkills).forEach(skill => {
      const frequency = skillCounts[skill] / allStudents.length;
      uniqueness += (1 - frequency) * studentSkills[skill]; // Valor por rareza
    });
    
    return uniqueness;
  }
  
  _calculatePriority(affinity, analytics) {
    let priority = affinity.score;
    
    if (analytics.potentialGrowth) {
      priority += analytics.potentialGrowth.potential * 0.2;
    }
    
    if (analytics.uniqueValue) {
      priority += Math.min(analytics.uniqueValue * 0.1, 1);
    }
    
    return priority;
  }
  
  _applyDiversityBonus(candidates) {
    // Aplicar pequeño bonus a candidatos con perfiles únicos
    candidates.forEach(candidate => {
      if (candidate.analytics.uniqueValue > 5) {
        candidate.affinity.score += 0.2;
      }
    });
  }
  
  _calculateAverage(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
  
  _calculateScoreDistribution(candidates) {
    const distribution = { 'muy alto': 0, 'alto': 0, 'medio': 0, 'bajo': 0, 'sin datos': 0 };
    candidates.forEach(c => distribution[c.affinity.level]++);
    return distribution;
  }
  
  _calculateSkillCoverageStats(candidates, companySkills) {
    const skillStats = {};
    const totalSkills = Object.keys(companySkills).length;
    
    Object.keys(companySkills).forEach(skill => {
      const candidatesWithSkill = candidates.filter(c => 
        c.student.skills && c.student.skills[skill]
      ).length;
      
      skillStats[skill] = {
        coverage: (candidatesWithSkill / candidates.length) * 100,
        required: companySkills[skill],
        availability: candidatesWithSkill
      };
    });
    
    return skillStats;
  }
  
  /**
   * 🚀 NUEVO: Método para limpiar cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  /**
   * 🚀 NUEVO: Método para obtener estadísticas del cache
   */
  getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.cacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalRequests > 0 ? this.cacheHits / totalRequests : 0
    };
  }
}

export default new AffinityCalculator();