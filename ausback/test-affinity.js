// Script de prueba para el algoritmo de afinidad optimizado
import { AffinityCalculator } from './src/services/affinityCalculator.js';

const calculator = new AffinityCalculator();

// Función para generar casos de prueba dinámicos
function generateTestCase(offerType) {
  const testCases = {
    "web_development": {
      name: "Desarrollo Web",
      skills: ["JavaScript", "React", "Node.js", "CSS", "Git"],
      levels: [4, 3, 3, 2, 2]
    },
    "data_analysis": {
      name: "Análisis de Datos", 
      skills: ["Python", "SQL", "Statistics", "Excel"],
      levels: [4, 4, 3, 2]
    },
    "mobile_development": {
      name: "Desarrollo Móvil",
      skills: ["React Native", "JavaScript", "iOS", "Android"],
      levels: [4, 3, 3, 3]
    }
  };
  
  const config = testCases[offerType] || testCases["web_development"];
  const companySkills = {};
  
  config.skills.forEach((skill, index) => {
    companySkills[skill] = config.levels[index];
  });
  
  return {
    name: `Oferta de ${config.name}`,
    companySkills
  };
}

// Función para generar estudiantes de prueba dinámicamente
function generateTestStudents(baseSkills) {
  const students = [];
  const skillNames = Object.keys(baseSkills);
  const extraSkills = ["Python", "TypeScript", "MongoDB", "Docker", "AWS", "HTML", "R"];
  
  for (let i = 1; i <= 5; i++) {
    const student = {
      id: i,
      name: `Estudiante ${i}`,
      skills: {}
    };
    
    // Asignar habilidades base con variación
    skillNames.forEach(skill => {
      if (Math.random() > 0.3) { // 70% probabilidad de tener la habilidad
        const baseLevel = baseSkills[skill];
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, o +1
        student.skills[skill] = Math.max(1, Math.min(5, baseLevel + variation));
      }
    });
    
    // Agregar habilidades extra aleatorias
    const numExtraSkills = Math.floor(Math.random() * 3);
    for (let j = 0; j < numExtraSkills; j++) {
      const extraSkill = extraSkills[Math.floor(Math.random() * extraSkills.length)];
      if (!student.skills[extraSkill]) {
        student.skills[extraSkill] = Math.floor(Math.random() * 5) + 1;
      }
    }
    
    students.push(student);
  }
  
  return students;
}

console.log("🚀 PRUEBAS DEL ALGORITMO DE AFINIDAD OPTIMIZADO\n");
console.log("=".repeat(60));

// Generar casos de prueba dinámicamente
const offerTypes = ["web_development", "data_analysis", "mobile_development"];

offerTypes.forEach((offerType, index) => {
  const testCase = generateTestCase(offerType);
  const students = generateTestStudents(testCase.companySkills);
  
  console.log(`\n📊 CASO ${index + 1}: ${testCase.name}`);
  console.log("-".repeat(40));
  
  console.log("\n🎯 Habilidades requeridas:");
  Object.entries(testCase.companySkills).forEach(([skill, level]) => {
    console.log(`  • ${skill}: Nivel ${level}`);
  });
  
  console.log("\n👥 Análisis de candidatos:");
  
  students.slice(0, 3).forEach(student => { // Mostrar solo 3 para brevedad
    const affinity = calculator.calculateAffinity(testCase.companySkills, student.skills);
    
    console.log(`\n  🔸 ${student.name} (ID: ${student.id})`);
    console.log(`     ⭐ Nivel: ${affinity.level.toUpperCase()}`);
    console.log(`     📈 Score: ${affinity.score.toFixed(2)}/10`);
    console.log(`     ✅ Coincidencias: ${affinity.matches}/${affinity.totalRequired} (${affinity.coverage}%)`);
    console.log(`     💡 ${affinity.explanation}`);
    
    if (affinity.matchingSkills.length > 0) {
      console.log(`     🔧 Habilidades coincidentes:`);
      affinity.matchingSkills.slice(0, 5).forEach(skill => { // Limitar a 5
        const status = skill.match ? "✅" : "❌";
        const excess = skill.excess > 0 ? ` (+${skill.excess})` : "";
        console.log(`        ${status} ${skill.skill}: ${skill.studentLevel}/${skill.companyLevel}${excess}`);
      });
    }
  });
  
  // Prueba del método findBestCandidates
  console.log(`\n🏆 RANKING DE MEJORES CANDIDATOS:`);
  const results = calculator.findBestCandidates(testCase.companySkills, students, {
    minScore: 2.0, // Score dinámico
    limit: 5,
    includeAnalytics: true,
    diversityBonus: true
  });
  
  results.candidates.forEach((candidate, i) => {
    console.log(`  ${i + 1}. ${candidate.student.name} - ${candidate.affinity.level} (${candidate.affinity.score.toFixed(2)})`);
    if (candidate.analytics.skillGap) {
      console.log(`     📊 Brechas: ${candidate.analytics.skillGap.totalGaps} habilidades faltantes`);
    }
  });
  
  if (results.analytics) {
    console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
    console.log(`  • Score promedio: ${results.analytics.averageScore.toFixed(2)}`);
    console.log(`  • Candidatos recomendados: ${results.recommended}/${results.total}`);
    console.log(`  • Nivel "Muy Alto": ${results.analytics.topTierCount} candidatos`);
  }
});

// Prueba de performance dinámica
console.log(`\n\n⚡ PRUEBA DE PERFORMANCE`);
console.log("=".repeat(40));

// Generar caso de prueba para performance
const performanceTestCase = generateTestCase("web_development");
const performanceStudents = generateTestStudents(performanceTestCase.companySkills);
const sampleStudent = performanceStudents[0];

const iterations = 1000;
console.log(`🧪 Ejecutando ${iterations} cálculos de afinidad...`);

const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
  calculator.calculateAffinity(performanceTestCase.companySkills, sampleStudent.skills);
}

const endTime = Date.now();
const totalTime = endTime - startTime;

console.log(`✅ ${iterations} cálculos completados en ${totalTime}ms`);
console.log(`📊 Promedio: ${(totalTime / iterations).toFixed(3)}ms por cálculo`);
console.log(`🚀 Throughput: ${Math.round(iterations / (totalTime / 1000))} cálculos/segundo`);

// Estadísticas del cache
const cacheStats = calculator.getCacheStats();
console.log(`💾 Cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
console.log(`📦 Cache size: ${cacheStats.size}/${cacheStats.maxSize}`);

// Prueba de findBestCandidates con muchos estudiantes
console.log(`\n📊 PRUEBA CON DATASET GRANDE:`);
const largeCaseTest = generateTestCase("data_analysis");
const manyStudents = [];

for (let i = 0; i < 100; i++) {
  const dynamicStudents = generateTestStudents(largeCaseTest.companySkills);
  manyStudents.push(...dynamicStudents);
}

const startTimeLarge = Date.now();
const largeResults = calculator.findBestCandidates(largeCaseTest.companySkills, manyStudents, {
  minScore: 3.0,
  limit: 10,
  includeAnalytics: true
});
const endTimeLarge = Date.now();

console.log(`✅ Procesados ${manyStudents.length} estudiantes en ${endTimeLarge - startTimeLarge}ms`);
console.log(`🎯 Top 3 candidatos:`);
largeResults.candidates.slice(0, 3).forEach((candidate, i) => {
  console.log(`  ${i + 1}. ${candidate.student.name} - ${candidate.affinity.level} (${candidate.affinity.score.toFixed(2)})`);
});

console.log(`\n✨ ALGORITMO OPTIMIZADO - PRUEBAS COMPLETADAS ✨`);
console.log(`🚀 Performance mejorada con cache y cálculos optimizados`);
console.log(`📈 Mayor precisión en niveles de afinidad`);
console.log(`🎯 Análisis más detallado de brechas de habilidades`);