import sequelize from './src/database/database.js';
import { Profamily } from './src/models/profamily.js';

async function seedProfamilies() {
  await sequelize.sync();
  const profamiliesData = [
    { name: 'Informática y Comunicaciones', description: 'Familia profesional de informática y comunicaciones.' },
    { name: 'Administración y Gestión', description: 'Familia profesional de administración y gestión.' },
    { name: 'Sanidad', description: 'Familia profesional de sanidad.' },
    { name: 'Electricidad y Electrónica', description: 'Familia profesional de electricidad y electrónica.' }
  ];
  for (const data of profamiliesData) {
    await Profamily.findOrCreate({ where: { name: data.name }, defaults: data });
  }
  console.log('Familias profesionales insertadas correctamente.');
  process.exit(0);
}

seedProfamilies().catch(e => { console.error(e); process.exit(1); });
