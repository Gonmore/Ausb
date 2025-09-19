'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth'; // 🆕 IMPORTAR STORE
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Award
} from 'lucide-react';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    summary: string;
    // 🆕 CAMPOS DE UBICACIÓN
    countryCode: string;
    cityId: string;
    cityName: string;
    countryName: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    level: string;
  }>;
}

function MiCVContent() {
  const { user } = useAuthStore(); // 🆕 USAR STORE DE AUTH
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      summary: '',
      countryCode: '',
      cityId: '',
      cityName: '',
      countryName: ''
    },
    education: [],
    experience: [],
    skills: [],
    languages: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 🔥 CARGAR DATOS DEL USUARIO DESDE EL STORE
    if (user) {
      console.log('👤 Usuario cargado:', user);
      
      // 🔥 CONSTRUIR DIRECCIÓN AUTOMÁTICAMENTE
      let autoAddress = '';
      if (user.cityName && user.countryName) {
        autoAddress = `${user.cityName}, ${user.countryName}`;
      } else if (user.countryName) {
        autoAddress = user.countryName;
      }

      // Inicializar CV con datos del usuario del registro
      const initialCVData = {
        personalInfo: {
          name: user.username || user.name || '',
          email: user.email || '',
          phone: user.phone || '', // ✅ TELÉFONO DEL REGISTRO
          address: autoAddress, // ✅ UBICACIÓN DEL REGISTRO
          dateOfBirth: '',
          summary: '',
          // 🆕 DATOS DE UBICACIÓN
          countryCode: user.countryCode || '',
          cityId: user.cityId || '',
          cityName: user.cityName || '',
          countryName: user.countryName || ''
        },
        education: [],
        experience: [],
        skills: [],
        languages: []
      };

      setCvData(initialCVData);

      // 🔥 CARGAR CV GUARDADO Y MEZCLAR CON DATOS DEL USUARIO
      const savedCV = localStorage.getItem('cv-data');
      if (savedCV) {
        try {
          const parsedCV = JSON.parse(savedCV);
          setCvData({
            ...parsedCV,
            personalInfo: {
              ...parsedCV.personalInfo,
              // ✅ SIEMPRE MANTENER DATOS ACTUALIZADOS DEL USUARIO
              name: parsedCV.personalInfo.name || user.username || user.name || '',
              email: parsedCV.personalInfo.email || user.email || '',
              phone: parsedCV.personalInfo.phone || user.phone || '', // ✅ Del registro
              address: parsedCV.personalInfo.address || autoAddress, // ✅ Del registro
              countryCode: user.countryCode || parsedCV.personalInfo.countryCode || '',
              cityId: user.cityId || parsedCV.personalInfo.cityId || '',
              cityName: user.cityName || parsedCV.personalInfo.cityName || '',
              countryName: user.countryName || parsedCV.personalInfo.countryName || ''
            }
          });
        } catch (error) {
          console.error('Error cargando CV guardado:', error);
          setCvData(initialCVData);
        }
      }
    }
  }, [user]);

  const saveCV = () => {
    localStorage.setItem('cv-data', JSON.stringify(cvData));
    setIsEditing(false);
    setEditingSection(null);
    console.log('💾 CV guardado:', cvData);
  };

  // 🔥 FUNCIÓN PARA CALCULAR PROGRESO REAL
  const calculateProgress = () => {
    const { personalInfo, education, experience } = cvData;
    
    const checks = [
      personalInfo.name ? 15 : 0,        // Nombre (15%)
      personalInfo.email ? 10 : 0,       // Email (10%)
      personalInfo.phone ? 10 : 0,       // Teléfono (10%)
      personalInfo.address ? 5 : 0,      // Dirección (5%)
      personalInfo.summary ? 20 : 0,     // Resumen (20%)
      personalInfo.dateOfBirth ? 5 : 0,  // Fecha nacimiento (5%)
      education.length > 0 ? 20 : 0,     // Educación (20%)
      experience.length > 0 ? 15 : 0     // Experiencia (15%)
    ];
    
    return checks.reduce((sum, value) => sum + value, 0);
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Volver al Dashboard
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi CV</h1>
                {/* 🆕 MOSTRAR DATOS DEL REGISTRO */}
                {user && (
                  <p className="text-sm text-gray-600">
                    📍 {user.cityName && user.countryName ? `${user.cityName}, ${user.countryName}` : 'Ubicación no especificada'}
                    {user.phone && ` • 📞 ${user.phone}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={saveCV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingSection(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar CV</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Información Personal */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {cvData.personalInfo.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={cvData.personalInfo.name}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, name: e.target.value }
                      }))}
                      className="text-xl font-bold text-gray-900 text-center border rounded px-2 py-1"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">
                      {cvData.personalInfo.name || 'Tu Nombre'}
                    </h3>
                  )}
                  {user?.role && (
                    <p className="text-gray-600 capitalize">{user.role}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={cvData.personalInfo.email}
                        onChange={(e) => setCvData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="text-sm text-gray-700 border rounded px-2 py-1 flex-1"
                        placeholder="tu@email.com"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {cvData.personalInfo.email || 'Email no proporcionado'}
                      </span>
                    )}
                  </div>

                  {/* 🔥 TELÉFONO CON INDICADOR DE ORIGEN */}
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={cvData.personalInfo.phone}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          className="text-sm text-gray-700 border rounded px-2 py-1 w-full"
                          placeholder="Tu teléfono"
                        />
                      ) : (
                        <div>
                          <span className="text-sm text-gray-700">
                            {cvData.personalInfo.phone || 'Teléfono no proporcionado'}
                          </span>
                          {cvData.personalInfo.phone && user?.phone === cvData.personalInfo.phone && (
                            <span className="text-xs text-green-600 block">✓ Del registro</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🔥 DIRECCIÓN CON INDICADOR DE ORIGEN */}
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={cvData.personalInfo.address}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, address: e.target.value }
                          }))}
                          className="text-sm text-gray-700 border rounded px-2 py-1 w-full"
                          placeholder="Tu dirección"
                        />
                      ) : (
                        <div>
                          <span className="text-sm text-gray-700">
                            {cvData.personalInfo.address || 'Dirección no proporcionada'}
                          </span>
                          {cvData.personalInfo.address && user?.cityName && (
                            <span className="text-xs text-green-600 block">✓ Del registro</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {isEditing ? (
                      <input
                        type="date"
                        value={cvData.personalInfo.dateOfBirth}
                        onChange={(e) => setCvData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                        }))}
                        className="text-sm text-gray-700 border rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">
                        {cvData.personalInfo.dateOfBirth ? 
                          new Date(cvData.personalInfo.dateOfBirth).toLocaleDateString() : 
                          'Fecha de nacimiento no proporcionada'
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen Personal</h4>
                  {isEditing ? (
                    <textarea
                      value={cvData.personalInfo.summary}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, summary: e.target.value }
                      }))}
                      className="w-full text-sm text-gray-700 border rounded px-3 py-2 h-24 resize-none"
                      placeholder="Describe brevemente tu perfil profesional..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700">
                      {cvData.personalInfo.summary || 'Agrega un resumen personal para describir tu perfil profesional.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Experiencia y Educación - MANTENER IGUAL */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Educación */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Educación
                </h2>
                {isEditing && (
                  <button
                    onClick={addEducation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {cvData.education.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay información educativa. {isEditing && 'Haz clic en "Agregar" para comenzar.'}
                  </p>
                ) : (
                  cvData.education.map((edu) => (
                    <div key={edu.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  education: prev.education.map(item => 
                                    item.id === edu.id ? { ...item, institution: e.target.value } : item
                                  )
                                }))}
                                className="text-lg font-semibold text-gray-900 border rounded px-2 py-1 w-full"
                                placeholder="Institución"
                              />
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  education: prev.education.map(item => 
                                    item.id === edu.id ? { ...item, degree: e.target.value } : item
                                  )
                                }))}
                                className="text-blue-600 border rounded px-2 py-1 w-full"
                                placeholder="Título/Grado"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => setCvData(prev => ({
                                    ...prev,
                                    education: prev.education.map(item => 
                                      item.id === edu.id ? { ...item, startDate: e.target.value } : item
                                    )
                                  }))}
                                  className="text-sm text-gray-600 border rounded px-2 py-1 flex-1"
                                />
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => setCvData(prev => ({
                                    ...prev,
                                    education: prev.education.map(item => 
                                      item.id === edu.id ? { ...item, endDate: e.target.value } : item
                                    )
                                  }))}
                                  className="text-sm text-gray-600 border rounded px-2 py-1 flex-1"
                                />
                              </div>
                              <textarea
                                value={edu.description}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  education: prev.education.map(item => 
                                    item.id === edu.id ? { ...item, description: e.target.value } : item
                                  )
                                }))}
                                className="text-sm text-gray-700 border rounded px-2 py-1 w-full h-20 resize-none"
                                placeholder="Descripción de los estudios..."
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {edu.institution || 'Institución'}
                              </h3>
                              <p className="text-blue-600">{edu.degree || 'Título/Grado'}</p>
                              <p className="text-sm text-gray-600">
                                {edu.startDate && edu.endDate ? 
                                  `${new Date(edu.startDate).getFullYear()} - ${new Date(edu.endDate).getFullYear()}` :
                                  'Fechas no especificadas'
                                }
                              </p>
                              {edu.description && (
                                <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                              )}
                            </>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Experiencia Laboral - MANTENER IGUAL */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experiencia Laboral
                </h2>
                {isEditing && (
                  <button
                    onClick={addExperience}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {cvData.experience.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay experiencia laboral registrada. {isEditing && 'Haz clic en "Agregar" para comenzar.'}
                  </p>
                ) : (
                  cvData.experience.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-green-200 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  experience: prev.experience.map(item => 
                                    item.id === exp.id ? { ...item, company: e.target.value } : item
                                  )
                                }))}
                                className="text-lg font-semibold text-gray-900 border rounded px-2 py-1 w-full"
                                placeholder="Empresa"
                              />
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  experience: prev.experience.map(item => 
                                    item.id === exp.id ? { ...item, position: e.target.value } : item
                                  )
                                }))}
                                className="text-green-600 border rounded px-2 py-1 w-full"
                                placeholder="Posición"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => setCvData(prev => ({
                                    ...prev,
                                    experience: prev.experience.map(item => 
                                      item.id === exp.id ? { ...item, startDate: e.target.value } : item
                                    )
                                  }))}
                                  className="text-sm text-gray-600 border rounded px-2 py-1 flex-1"
                                />
                                <input
                                  type="date"
                                  value={exp.endDate}
                                  onChange={(e) => setCvData(prev => ({
                                    ...prev,
                                    experience: prev.experience.map(item => 
                                      item.id === exp.id ? { ...item, endDate: e.target.value } : item
                                    )
                                  }))}
                                  className="text-sm text-gray-600 border rounded px-2 py-1 flex-1"
                                />
                              </div>
                              <textarea
                                value={exp.description}
                                onChange={(e) => setCvData(prev => ({
                                  ...prev,
                                  experience: prev.experience.map(item => 
                                    item.id === exp.id ? { ...item, description: e.target.value } : item
                                  )
                                }))}
                                className="text-sm text-gray-700 border rounded px-2 py-1 w-full h-20 resize-none"
                                placeholder="Descripción de responsabilidades y logros..."
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exp.company || 'Empresa'}
                              </h3>
                              <p className="text-green-600">{exp.position || 'Posición'}</p>
                              <p className="text-sm text-gray-600">
                                {exp.startDate && exp.endDate ? 
                                  `${new Date(exp.startDate).getFullYear()} - ${new Date(exp.endDate).getFullYear()}` :
                                  'Fechas no especificadas'
                                }
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                              )}
                            </>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 🔥 ESTADO DEL CV ACTUALIZADO */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estado de tu CV</h3>
                  <p className="text-blue-100">
                    Mantén tu CV actualizado para mejorar tus oportunidades
                  </p>
                  {/* 🆕 MOSTRAR INFORMACIÓN DE DATOS HEREDADOS */}
                  <div className="mt-2 text-sm text-blue-100">
                    ✓ Datos del registro: {user?.phone ? 'Teléfono' : ''} {user?.cityName ? 'Ubicación' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-blue-100 text-sm">Completado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MiCVPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <MiCVContent />
    </AuthGuard>
  );
}
