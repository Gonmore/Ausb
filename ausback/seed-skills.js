// Script para poblar la tabla de skills con básicos (ES module)

import sequelize from './src/database/database.js';
import { Skill } from './src/models/skill.js';

const basicSkills = [
  'Comunicación',
  'Trabajo en equipo',
  'Inglés',
  'Ofimática',
  'Resolución de problemas',
  'Adaptabilidad',
  'Gestión del tiempo',
  'Liderazgo',
  'Creatividad',
  'Responsabilidad',
  'Atención al cliente',
  'Programación',
  'Matemáticas',
  'Redacción',
  'Presentaciones',
];

async function seedSkills() {
  await sequelize.sync();
  for (const name of basicSkills) {
    await Skill.findOrCreate({ where: { name } });
    console.log('Skill insertado:', name);
  }
  console.log('Skills básicos insertados.');
  process.exit(0);
}

seedSkills();
