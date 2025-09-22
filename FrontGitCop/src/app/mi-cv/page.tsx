'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase, 
  BookOpen,
  GraduationCap,
  Plus,
  Edit,
  X,
  Save,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';

// Skills interfaces
interface StudentSkill {
  id: number;
  name: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  notes?: string;
  isVerified?: boolean;
}

interface AvailableSkill {
  id: number;
  name: string;
  category: string;
  area: string;
  description?: string;
}

// CV Data interface
interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
  };
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  experience: Array<{
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }>;
  skills: StudentSkill[];
}

function MiCVContent() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  
  // Main CV data state
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    },
    education: [],
    experience: [],
    skills: []
  });

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Skills management states
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [selectedSkillsForAdd, setSelectedSkillsForAdd] = useState<any[]>([]);
  const [newSkillProficiency, setNewSkillProficiency] = useState('beginner');
  const [newSkillYears, setNewSkillYears] = useState(0);

  // Load initial data
  useEffect(() => {
    if (user && token) {
      loadCVData();
      loadAvailableSkills();
      loadStudentSkills();
    }
  }, [user, token]);

  const loadCVData = async () => {
    if (!user) return;
    
    try {
      const userWithLocation = user as any;
      
      // Initialize with user data
      const initialCVData: CVData = {
        personalInfo: {
          name: user.username || user.name || '',
          email: user.email || '',
          phone: userWithLocation.phone || '',
          address: userWithLocation.address || '',
          summary: ''
        },
        education: [],
        experience: [],
        skills: []
      };

      // Try to load saved CV data
      const savedData = localStorage.getItem('cv-data');
      if (savedData) {
        try {
          const parsedCV = JSON.parse(savedData);
          setCvData({
            ...parsedCV,
            personalInfo: {
              ...parsedCV.personalInfo,
              name: parsedCV.personalInfo.name || user.username || user.name || '',
              email: parsedCV.personalInfo.email || user.email || '',
            }
          });
        } catch (e) {
          console.log('Error parsing saved CV data, using initial data');
          setCvData(initialCVData);
        }
      } else {
        setCvData(initialCVData);
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
    }
  };

  const loadAvailableSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const response = await fetch('http://localhost:5000/api/skills', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        const skillsArray = Array.isArray(data) ? data : (data?.data || data?.skills || []);
        setAvailableSkills(skillsArray);
      } else {
        console.error('Failed to load available skills:', response.status);
        setAvailableSkills([]);
      }
    } catch (error) {
      console.error('Error loading available skills:', error);
      setAvailableSkills([]);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const loadStudentSkills = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/${user.id}/skills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        const skillsArray = Array.isArray(data) ? data : (data?.skills || []);
        setCvData(prev => ({
          ...prev,
          skills: skillsArray
        }));
      } else {
        console.error('Failed to load student skills:', response.status);
      }
    } catch (error) {
      console.error('Error loading student skills:', error);
    }
  };

  const addSkillToStudent = async (skillId: number, skillData: any) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${user.id}/skills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillId,
          ...skillData
        })
      });

      if (response.ok) {
        await loadStudentSkills();
        return true;
      }
    } catch (error) {
      console.error('Error adding skill to student:', error);
    }
    return false;
  };

  const createAndAddNewSkill = async (skillName: string, proficiencyLevel: string = 'beginner', yearsOfExperience: number = 0) => {
    if (!user?.id || !skillName.trim()) return false;

    try {
      // First create the skill
      const createResponse = await fetch('http://localhost:5000/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: skillName.trim(),
          category: 'technical',
          area: 'other',
          description: `Skill created by user: ${skillName}`,
          demandLevel: 'medium'
        })
      });

      if (createResponse.ok) {
        const newSkillResponse = await createResponse.json();
        // Handle different response formats
        const newSkillId = newSkillResponse.id || newSkillResponse.skill?.id;
        if (!newSkillId) {
          console.error('Could not get skill ID from response:', newSkillResponse);
          return false;
        }

        // Then add it to the student
        const success = await addSkillToStudent(newSkillId, {
          proficiencyLevel,
          yearsOfExperience,
          notes: ''
        });

        if (success) {
          await loadAvailableSkills(); // Refresh available skills
          return true;
        }
      } else {
        console.error('Failed to create skill:', createResponse.status);
      }
    } catch (error) {
      console.error('Error creating and adding new skill:', error);
    }
    return false;
  };  const removeSkillFromStudent = async (skillId: number) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/${user.id}/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadStudentSkills();
        await loadAvailableSkills();
      }
    } catch (error) {
      console.error('Error removing skill from student:', error);
    }
  };

  const handleAddSelectedSkills = async () => {
    if (selectedSkillsForAdd.length === 0) return;

    try {
      let addedCount = 0;
      
      for (const skill of selectedSkillsForAdd) {
        if (skill.isNew) {
          // Crear nueva skill
          const success = await createAndAddNewSkill(skill.label, newSkillProficiency, newSkillYears);
          if (success) addedCount++;
        } else {
          // Agregar skill existente
          const success = await addSkillToStudent(skill.value, {
            proficiencyLevel: 'beginner',
            yearsOfExperience: 0,
            notes: ''
          });
          if (success) addedCount++;
        }
      }
      
      if (addedCount > 0) {
        setSelectedSkillsForAdd([]);
        await loadStudentSkills();
        await loadAvailableSkills();
        alert(`Se agregaron ${addedCount} habilidad(es) exitosamente`);
      }
    } catch (error) {
      console.error('Error adding selected skills:', error);
      alert('Error al agregar las habilidades');
    }
  };

  // Calculate CV completion percentage
  const calculateCompletion = () => {
    const { personalInfo, education, experience, skills } = cvData;
    
    const completionFactors = [
      personalInfo.name ? 10 : 0,          // Nombre (10%)
      personalInfo.email ? 10 : 0,         // Email (10%)
      personalInfo.phone ? 10 : 0,         // Teléfono (10%)
      personalInfo.address ? 10 : 0,       // Dirección (10%)
      personalInfo.summary ? 15 : 0,       // Resumen (15%)
      education.length > 0 ? 15 : 0,       // Educación (15%)
      experience.length > 0 ? 15 : 0,      // Experiencia (15%)
      skills.length > 0 ? 15 : 0           // Habilidades (15%)
    ];

    return completionFactors.reduce((total, factor) => total + factor, 0);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Curriculum Vitae</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tu información profesional y habilidades
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">Completado</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Información Académica
              </h2>
            </div>
            <button
              onClick={() => {
                setEditingSection(editingSection === 'education' ? null : 'education');
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {editingSection === 'education' ? (
                <>
                  <X className="h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Gestionar
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {cvData.education.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No has agregado información académica</p>
                <p className="text-sm mb-4">
                  Agrega tu educación para mejorar tu perfil profesional
                </p>
                <button
                  onClick={() => setEditingSection('education')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar primera educación
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cvData.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-blue-600 font-medium">{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate || 'Presente'}</p>
                        {edu.description && (
                          <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                        )}
                      </div>
                      {editingSection === 'education' && (
                        <button
                          onClick={() => {
                            const newEducation = cvData.education.filter((_, i) => i !== index);
                            setCvData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center"
                          title="Eliminar educación"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSection === 'education' && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">
                      Agregar nueva educación
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institución
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Universidad, Colegio, Instituto..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título/Grado
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Licenciatura, Técnico, Bachiller..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de inicio
                      </label>
                      <input
                        type="month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de finalización
                      </label>
                      <input
                        type="month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detalles sobre tu educación, logros, especialización..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={() => {
                          // TODO: Implement add education logic
                          alert('Funcionalidad en desarrollo');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar educación
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experiencia Laboral */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Experiencia Laboral
              </h2>
            </div>
            <button
              onClick={() => {
                setEditingSection(editingSection === 'experience' ? null : 'experience');
              }}
              className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              {editingSection === 'experience' ? (
                <>
                  <X className="h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Gestionar
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {cvData.experience.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No has agregado experiencia laboral</p>
                <p className="text-sm mb-4">
                  La experiencia laboral es clave para tu perfil profesional
                </p>
                <button
                  onClick={() => setEditingSection('experience')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Agregar primera experiencia
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-green-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Presente'}</p>
                        {exp.description && (
                          <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                      {editingSection === 'experience' && (
                        <button
                          onClick={() => {
                            const newExperience = cvData.experience.filter((_, i) => i !== index);
                            setCvData(prev => ({ ...prev, experience: newExperience }));
                          }}
                          className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center"
                          title="Eliminar experiencia"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSection === 'experience' && (
              <div className="border-t pt-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">
                      Agregar nueva experiencia
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Nombre de la empresa..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo/Posición
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Desarrollador, Analista, Gerente..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de inicio
                      </label>
                      <input
                        type="month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de finalización
                      </label>
                      <input
                        type="month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción de responsabilidades (opcional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={() => {
                          // TODO: Implement add experience logic
                          alert('Funcionalidad en desarrollo');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar experiencia
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agregar nuevas habilidades */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar nuevas habilidades
              </h2>
            </div>
            <button
              onClick={() => {
                setEditingSection(editingSection === 'skills' ? null : 'skills');
              }}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {editingSection === 'skills' ? (
                <>
                  <X className="h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Gestionar
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* Skills Display */}
            {cvData.skills.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No has agregado habilidades</p>
                <p className="text-sm mb-4">
                  Las habilidades son importantes para tu perfil profesional
                </p>
                <button
                  onClick={() => setEditingSection('skills')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Agregar primera habilidad
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cvData.skills.map((skill) => (
                  <div key={skill.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors relative group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">
                        {skill.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {skill.isVerified && (
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                        )}
                        {editingSection === 'skills' && (
                          <button
                            onClick={() => removeSkillFromStudent(skill.id)}
                            className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar habilidad"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-purple-600 font-medium">
                        {skill.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {skill.proficiencyLevel === 'beginner' ? 'Principiante' :
                           skill.proficiencyLevel === 'intermediate' ? 'Intermedio' :
                           skill.proficiencyLevel === 'advanced' ? 'Avanzado' : 'Experto'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'año' : 'años'}
                        </span>
                      </div>
                      {skill.notes && (
                        <p className="text-xs text-gray-600 mt-2">
                          {skill.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Management Interface */}
            {editingSection === 'skills' && (
              <div className="border-t pt-6">
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">
                      Buscar y agregar habilidades
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Multiselect autocomplete
                      </label>
                      <CreatableSelect
                        isMulti
                        value={selectedSkillsForAdd}
                        onChange={(selected) => setSelectedSkillsForAdd(Array.from(selected || []))}
                        options={(availableSkills || [])
                          .filter(skill => {
                            const studentSkillIds = cvData.skills.map(s => s.id);
                            return !studentSkillIds.includes(skill.id);
                          })
                          .map(skill => ({
                            value: skill.id,
                            label: skill.name,
                            category: skill.category,
                            skillData: skill
                          }))
                        }
                        onCreateOption={(inputValue) => {
                          const newSkill = {
                            value: `new_${Date.now()}`,
                            label: inputValue,
                            category: 'technical',
                            isNew: true
                          };
                          setSelectedSkillsForAdd(prev => [...prev, newSkill]);
                        }}
                        placeholder="Escribe para buscar habilidades existentes o crear nuevas..."
                        isLoading={isLoadingSkills}
                        noOptionsMessage={({ inputValue }) => 
                          inputValue ? `Presiona Enter para crear "${inputValue}"` : 'Escribe para buscar habilidades'
                        }
                        formatCreateLabel={(inputValue) => `Crear nueva habilidad: "${inputValue}"`}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor: state.isFocused ? '#a855f7' : provided.borderColor,
                            boxShadow: state.isFocused ? '0 0 0 1px #a855f7' : provided.boxShadow,
                            '&:hover': {
                              borderColor: '#a855f7'
                            }
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected ? '#a855f7' : 
                                           state.isFocused ? '#f3e8ff' : provided.backgroundColor,
                            color: state.isSelected ? 'white' : provided.color
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: '#f3e8ff'
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            color: '#7c3aed'
                          }),
                          multiValueRemove: (provided) => ({
                            ...provided,
                            color: '#7c3aed',
                            '&:hover': {
                              backgroundColor: '#a855f7',
                              color: 'white'
                            }
                          })
                        }}
                      />
                    </div>

                    {/* Add Selected Skills Button */}
                    {selectedSkillsForAdd.length > 0 && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-purple-700 font-medium">
                            {selectedSkillsForAdd.length} habilidad(es) seleccionada(s)
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedSkillsForAdd.slice(0, 3).map((skill, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {skill.label}
                                {skill.isNew && ' (nueva)'}
                              </span>
                            ))}
                            {selectedSkillsForAdd.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                +{selectedSkillsForAdd.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>

                        {/* New Skill Configuration */}
                        {selectedSkillsForAdd.some(skill => skill.isNew) && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="text-sm font-medium text-yellow-800 mb-3">Configurar nuevas habilidades:</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-yellow-700 mb-1">
                                  Nivel de competencia
                                </label>
                                <select
                                  value={newSkillProficiency}
                                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                >
                                  <option value="beginner">Principiante</option>
                                  <option value="intermediate">Intermedio</option>
                                  <option value="advanced">Avanzado</option>
                                  <option value="expert">Experto</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-yellow-700 mb-1">
                                  Años de experiencia
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={newSkillYears}
                                  onChange={(e) => setNewSkillYears(parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleAddSelectedSkills}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar seleccionadas
                        </button>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">{cvData.skills.length}</div>
                        <div className="text-sm text-gray-600">Habilidades totales</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">
                          {cvData.skills.filter(s => s.proficiencyLevel === 'advanced' || s.proficiencyLevel === 'expert').length}
                        </div>
                        <div className="text-sm text-gray-600">Nivel avanzado</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">
                          {availableSkills.length - cvData.skills.length}
                        </div>
                        <div className="text-sm text-gray-600">Disponibles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CV Completion Tips */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Mejora tu perfil</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 mb-3">
                Tu CV está {completionPercentage}% completo. Continúa agregando información para mejorar tu perfil profesional.
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Un CV completo aumenta tus oportunidades de empleo</span>
              </div>
            </div>
            <div className="space-y-2">
              {completionPercentage < 100 && (
                <div className="text-sm">
                  <strong>Próximos pasos:</strong>
                  <ul className="mt-1 space-y-1 text-blue-100">
                    {!cvData.personalInfo.summary && <li>• Agrega un resumen profesional</li>}
                    {cvData.education.length === 0 && <li>• Incluye tu educación</li>}
                    {cvData.experience.length === 0 && <li>• Agrega experiencia laboral</li>}
                    {cvData.skills.length === 0 && <li>• Define tus habilidades</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MiCVPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MiCVContent />
    </AuthGuard>
  );
}