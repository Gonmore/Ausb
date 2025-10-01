'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth';
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
  Award,
  Target,
  BookOpen,
  Car,
  CheckCircle,
  Camera,
  Globe,
  Upload,
  Star,
  StarOff
} from 'lucide-react';
import VerificationBadge, { AcademicVerificationOverlay } from '@/components/VerificationBadge';

interface Skill {
  id: number;
  name: string;
  category: string;
  area: string;
  description?: string;
}

interface CvSkill {
  id: number;
  skillId: number;
  skill: Skill;
  proficiencyLevel: 'bajo' | 'medio' | 'alto';
  yearsOfExperience: number;
  isHighlighted: boolean;
}

interface PendingCvSkill {
  skillId?: number;
  skill?: Skill;
  newSkillName?: string;
  newSkillCategory?: string;
  proficiencyLevel: 'bajo' | 'medio' | 'alto';
  yearsOfExperience: number;
  isHighlighted: boolean;
}

interface Profamily {
  id: number;
  name: string;
  description: string;
}

interface Scenter {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

interface AcademicBackground {
  scenter?: number;
  profamily?: number;
  status?: 'titulado' | 'egresado' | 'por_egresar';
}

interface CVData {
  id?: number;
  studentId: number;
  summary?: string;
  academicBackground?: AcademicBackground;
  availability?: 'immediate' | '1_month' | '3_months' | '6_months' | 'flexible';
  file?: string;
  isComplete: boolean;
  lastUpdated?: string;
  skills?: CvSkill[];
  academicVerificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  academicVerifiedAt?: string;
  academicVerifiedBy?: number;
}

function MiCVContent() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  // Form state
  const [cvData, setCvData] = useState<CVData>({
    studentId: user?.id || 0,
    summary: '',
    academicBackground: {},
    availability: 'flexible',
    isComplete: false,
    skills: [],
    academicVerificationStatus: 'unverified'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profamilies, setProfamilies] = useState<Profamily[]>([]);
  const [scenters, setScenters] = useState<Scenter[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [pendingSkills, setPendingSkills] = useState<PendingCvSkill[]>([]);
  const [showNewSkillForm, setShowNewSkillForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadProfamilies();
      loadScenters();
      loadAvailableSkills();
      loadCVData();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.skill-search-container')) {
        setShowSkillDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfamilies = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profamilies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfamilies(data);
      }
    } catch (error) {
      console.error('Error loading profamilies:', error);
    }
  };

  const loadScenters = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenter/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const scentersData = data.success ? data.data : data;
        setScenters(Array.isArray(scentersData) ? scentersData : []);
      }
    } catch (error) {
      console.error('Error loading scenters:', error);
    }
  };

  const loadAvailableSkills = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadCVData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/my-cv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCvData({
            ...data,
            academicBackground: data.academicBackground || {},
            skills: data.skills || [],
            academicVerificationStatus: data.academicVerificationStatus || 'unverified',
            academicVerifiedAt: data.academicVerifiedAt,
            academicVerifiedBy: data.academicVerifiedBy
          });
        }
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkillToPending = (skill: Skill) => {
    if (!pendingSkills.some(s => s.skillId === skill.id)) {
      const pendingSkill: PendingCvSkill = {
        skillId: skill.id,
        skill,
        proficiencyLevel: 'medio',
        yearsOfExperience: 0,
        isHighlighted: false
      };
      setPendingSkills(prev => [...prev, pendingSkill]);
    }
    setSkillSearchTerm('');
    setShowSkillDropdown(false);
  };

  const addNewSkillToPending = () => {
    if (!newSkillName.trim() || !newSkillCategory.trim()) {
      alert('Por favor completa el nombre y categoría de la habilidad');
      return;
    }

    const pendingSkill: PendingCvSkill = {
      newSkillName: newSkillName.trim(),
      newSkillCategory: newSkillCategory.trim(),
      proficiencyLevel: 'medio',
      yearsOfExperience: 0,
      isHighlighted: false
    };

    setPendingSkills(prev => [...prev, pendingSkill]);
    setNewSkillName('');
    setNewSkillCategory('');
    setShowNewSkillForm(false);
    setSkillSearchTerm('');
    setShowSkillDropdown(false);
  };

  const removePendingSkill = (index: number) => {
    setPendingSkills(prev => prev.filter((_, i) => i !== index));
  };

  const updatePendingSkill = (index: number, updates: Partial<PendingCvSkill>) => {
    setPendingSkills(prev => prev.map((skill, i) =>
      i === index ? { ...skill, ...updates } : skill
    ));
  };

  const updateSkill = async (index: number, updates: Partial<CvSkill>) => {
    const skill = cvData.skills?.[index];
    if (!skill || !skill.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/skills/${skill.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setCvData(prev => ({
          ...prev,
          skills: prev.skills?.map((skill, i) =>
            i === index ? { ...skill, ...updates } : skill
          )
        }));
      } else {
        console.error('Error updating skill:', await response.text());
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const removeSkill = async (index: number) => {
    const skill = cvData.skills?.[index];
    if (!skill || !skill.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/skills/${skill.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCvData(prev => ({
          ...prev,
          skills: prev.skills?.filter((_, i) => i !== index)
        }));
      } else {
        console.error('Error removing skill:', await response.text());
      }
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const toggleSkillHighlight = async (index: number) => {
    const skill = cvData.skills?.[index];
    if (!skill || !skill.id) return;

    const newIsHighlighted = !skill.isHighlighted;

    try {
      // If highlighting this skill, first unhighlight all others
      if (newIsHighlighted) {
        const unhighlightPromises = cvData.skills
          ?.filter((s, i) => i !== index && s.isHighlighted && s.id)
          .map(s => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/skills/${s.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isHighlighted: false })
          })) || [];

        await Promise.all(unhighlightPromises);
      }

      // Update the target skill
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/skills/${skill.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHighlighted: newIsHighlighted })
      });

      if (response.ok) {
        setCvData(prev => ({
          ...prev,
          skills: prev.skills?.map((skill, i) => ({
            ...skill,
            isHighlighted: i === index ? newIsHighlighted : false // Solo uno puede estar destacado
          }))
        }));
      } else {
        console.error('Error updating skill highlight:', await response.text());
      }
    } catch (error) {
      console.error('Error updating skill highlight:', error);
    }
  };

  const submitAcademicVerification = async () => {
    if (!user?.id || !cvData.academicBackground?.scenter) return;

    setSubmittingVerification(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academic-verifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenterId: cvData.academicBackground.scenter
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCvData(prev => ({
          ...prev,
          academicVerificationStatus: 'pending'
        }));
        alert('Solicitud de verificación enviada correctamente. El centro de estudios revisará tu información.');
      } else {
        const errorData = await response.json();
        alert(`Error al enviar la solicitud: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Error al enviar la solicitud de verificación');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const calculateIsComplete = (data: CVData): boolean => {
    const hasAcademicBackground = data.academicBackground &&
      data.academicBackground.scenter &&
      data.academicBackground.profamily &&
      data.academicBackground.status;

    const hasSkills = data.skills && data.skills.length > 0;
    const hasAvailability = data.availability;

    return !!(hasAcademicBackground && hasSkills && hasAvailability);
  };

  const saveCV = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Step 1: Create new skills if any
      const newSkillsToCreate = pendingSkills.filter(skill => skill.newSkillName);
      const createdSkills: Skill[] = [];

      for (const pendingSkill of newSkillsToCreate) {
        if (pendingSkill.newSkillName && pendingSkill.newSkillCategory) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: pendingSkill.newSkillName,
              area: pendingSkill.newSkillCategory
            })
          });

          if (response.ok) {
            const newSkill = await response.json();
            createdSkills.push(newSkill);
            // Update the pending skill with the created skill
            pendingSkill.skillId = newSkill.id;
            pendingSkill.skill = newSkill;
          } else {
            const errorData = await response.json();
            alert(`Error al crear la habilidad ${pendingSkill.newSkillName}: ${errorData.message || 'Error desconocido'}`);
            return;
          }
        }
      }

      // Step 2: Add all pending skills to CV
      const skillsToAdd = pendingSkills.filter(skill => skill.skillId);
      const addedSkills: CvSkill[] = [];

      for (const pendingSkill of skillsToAdd) {
        if (pendingSkill.skillId) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/skills`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              skillId: pendingSkill.skillId,
              proficiencyLevel: pendingSkill.proficiencyLevel,
              yearsOfExperience: pendingSkill.yearsOfExperience,
              isHighlighted: pendingSkill.isHighlighted
            })
          });

          if (response.ok) {
            const data = await response.json();
            const cvSkill: CvSkill = {
              id: data.cvSkill.id,
              skillId: pendingSkill.skillId,
              skill: pendingSkill.skill!,
              proficiencyLevel: pendingSkill.proficiencyLevel,
              yearsOfExperience: pendingSkill.yearsOfExperience,
              isHighlighted: pendingSkill.isHighlighted
            };
            addedSkills.push(cvSkill);
          } else {
            const errorData = await response.json();
            alert(`Error al agregar la habilidad ${pendingSkill.skill?.name || pendingSkill.newSkillName}: ${errorData.message || 'Error desconocido'}`);
            return;
          }
        }
      }

      // Step 3: Save the main CV data
      const dataToSave = {
        summary: cvData.summary,
        academicBackground: cvData.academicBackground,
        availability: cvData.availability,
        isComplete: calculateIsComplete(cvData),
        lastUpdated: new Date().toISOString()
      };

      const method = 'POST';
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cv`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const savedData = await response.json();

        // Update CV data with added skills
        setCvData(prev => ({
          ...savedData,
          skills: [...(prev.skills || []), ...addedSkills]
        }));

        // Clear pending skills
        setPendingSkills([]);

        // Update available skills list with newly created skills
        setAvailableSkills(prev => [...prev, ...createdSkills]);

        alert('CV guardado correctamente con todas las habilidades');
      } else {
        const errorData = await response.json();
        alert(`Error al guardar el CV: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Error al guardar el CV');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                 Volver al Dashboard
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mi CV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveCV}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Guardar CV'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">

          {/* CV Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Estado del CV</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                cvData.isComplete
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cvData.isComplete ? 'Completo' : 'Incompleto'}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              El CV se marca como completo cuando tienes información académica, habilidades y disponibilidad configuradas.
            </p>
          </div>

          {/* Academic Background Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Información Académica
              </h3>
              <VerificationBadge
                status={cvData.academicVerificationStatus || 'unverified'}
                className="text-sm"
              />
            </div>

            {/* Verification Notice */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Información sujeta a verificación
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta información académica será verificada por tu centro de estudios. Asegúrate de que los datos sean correctos antes de solicitar verificación.
                  </p>
                  {cvData.academicVerificationStatus === 'unverified' && cvData.academicBackground?.scenter && cvData.academicBackground?.profamily && cvData.academicBackground?.status && (
                    <div className="mt-3">
                      <button
                        onClick={submitAcademicVerification}
                        disabled={submittingVerification}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {submittingVerification ? 'Enviando...' : 'Solicitar Verificación'}
                      </button>
                    </div>
                  )}
                  {cvData.academicVerificationStatus === 'pending' && (
                    <p className="text-sm text-blue-700 mt-2">
                      ✅ Solicitud de verificación enviada. Esperando respuesta del centro de estudios.
                    </p>
                  )}
                  {cvData.academicVerificationStatus === 'verified' && (
                    <p className="text-sm text-green-700 mt-2">
                      ✅ Tu información académica ha sido verificada por el centro de estudios.
                    </p>
                  )}
                  {cvData.academicVerificationStatus === 'rejected' && (
                    <p className="text-sm text-red-700 mt-2">
                      ❌ La verificación fue rechazada. Revisa la información y vuelve a solicitar verificación.
                    </p>
                  )}
                </div>
                <div className="ml-auto flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <AcademicVerificationOverlay status={cvData.academicVerificationStatus || 'unverified'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centro Educativo
                  </label>
                  <select
                    value={cvData.academicBackground?.scenter || ''}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      academicBackground: {
                        ...prev.academicBackground,
                        scenter: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar centro...</option>
                    {scenters.map((scenter) => (
                      <option key={scenter.id} value={scenter.id}>
                        {scenter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Familia Profesional
                  </label>
                  <select
                    value={cvData.academicBackground?.profamily || ''}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      academicBackground: {
                        ...prev.academicBackground,
                        profamily: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar familia...</option>
                    {profamilies.map((profamily) => (
                      <option key={profamily.id} value={profamily.id}>
                        {profamily.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Graduación
                  </label>
                  <select
                    value={cvData.academicBackground?.status || ''}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      academicBackground: {
                        ...prev.academicBackground,
                        status: e.target.value as 'titulado' | 'egresado' | 'por_egresar' || undefined
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="titulado">Titulado</option>
                    <option value="egresado">Egresado</option>
                    <option value="por_egresar">Por egresar</option>
                  </select>
                </div>
              </div>
            </AcademicVerificationOverlay>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Habilidades
            </h3>

            {/* Add Skills */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Agregar habilidades</h4>

              {/* Pending skills for configuration */}
              {pendingSkills.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">
                    Habilidades pendientes de guardar ({pendingSkills.length}):
                  </h5>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                      <div className="col-span-4">Habilidad</div>
                      <div className="col-span-3">Nivel de dominio</div>
                      <div className="col-span-2">Años de experiencia</div>
                      <div className="col-span-2">Destacar</div>
                      <div className="col-span-1">Acciones</div>
                    </div>

                    {pendingSkills.map((pendingSkill, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded border">
                        <div className="col-span-4">
                          <div>
                            <span className="font-medium">
                              {pendingSkill.skill ? pendingSkill.skill.name : pendingSkill.newSkillName}
                            </span>
                            <div className="text-sm text-gray-500">
                              {pendingSkill.skill ? pendingSkill.skill.area : pendingSkill.newSkillCategory}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <select
                            value={pendingSkill.proficiencyLevel}
                            onChange={(e) => updatePendingSkill(index, { proficiencyLevel: e.target.value as 'bajo' | 'medio' | 'alto' })}
                            className="w-full text-sm border rounded px-2 py-1"
                          >
                            <option value="bajo">Bajo</option>
                            <option value="medio">Medio</option>
                            <option value="alto">Alto</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={pendingSkill.yearsOfExperience}
                            onChange={(e) => updatePendingSkill(index, { yearsOfExperience: parseInt(e.target.value) || 0 })}
                            className="w-full text-sm border rounded px-2 py-1"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={pendingSkill.isHighlighted}
                              onChange={(e) => updatePendingSkill(index, { isHighlighted: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-sm">Sí</span>
                          </label>
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removePendingSkill(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => setPendingSkills([])}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Limpiar todas
                    </button>
                  </div>
                </div>
              )}

              {/* Skills search - Always visible */}
              <div className="relative skill-search-container">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    onFocus={() => setShowSkillDropdown(true)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar habilidades..."
                  />
                  <button
                    onClick={() => setShowNewSkillForm(!showNewSkillForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Nueva
                  </button>
                </div>

                {/* New Skill Form */}
                {showNewSkillForm && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-3">Crear nueva habilidad</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Nombre de la habilidad
                        </label>
                        <input
                          type="text"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Ej: React, Python, Diseño UX..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">
                          Categoría
                        </label>
                        <input
                          type="text"
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Ej: Desarrollo Web, Lenguajes, Diseño..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addNewSkillToPending}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Crear y agregar a pendientes
                      </button>
                      <button
                        onClick={() => {
                          setShowNewSkillForm(false);
                          setNewSkillName('');
                          setNewSkillCategory('');
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {showSkillDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {availableSkills
                      .filter(skill =>
                        skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
                        !cvData.skills?.some(s => s.skillId === skill.id) &&
                        !pendingSkills.some(s => s.skillId === skill.id)
                      )
                      .slice(0, 10)
                      .map((skill) => (
                        <div
                          key={skill.id}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                          onClick={() => addSkillToPending(skill)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{skill.name}</div>
                            <div className="text-sm text-gray-500">{skill.category}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addSkillToPending(skill);
                            }}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                            title="Agregar a pendientes"
                          >
                            + Agregar
                          </button>
                        </div>
                      ))}
                    {skillSearchTerm && !availableSkills.some(skill =>
                      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
                    ) && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No se encontraron habilidades. Prueba con otro término de búsqueda.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Busca habilidades existentes o haz clic en "Nueva" para crear una habilidad personalizada. Las habilidades se agregan a una lista pendiente donde puedes configurar su nivel y experiencia antes de guardar todo el CV.
              </p>
            </div>

            {/* Current Skills */}
            {cvData.skills && cvData.skills.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Habilidades actuales</h4>
                {cvData.skills.map((cvSkill, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-medium text-gray-900">
                            {cvSkill.skill?.name || 'Habilidad'}
                          </h5>
                          {cvSkill.isHighlighted && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{cvSkill.skill?.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleSkillHighlight(index)}
                          className={`p-1 rounded ${
                            cvSkill.isHighlighted
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title={cvSkill.isHighlighted ? 'Quitar como principal' : 'Marcar como principal'}
                        >
                          {cvSkill.isHighlighted ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => removeSkill(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Eliminar habilidad"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel de Dominio
                        </label>
                        <select
                          value={cvSkill.proficiencyLevel}
                          onChange={(e) => updateSkill(index, {
                            proficiencyLevel: e.target.value as 'bajo' | 'medio' | 'alto'
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="bajo">Bajo</option>
                          <option value="medio">Medio</option>
                          <option value="alto">Alto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Años de Experiencia
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={cvSkill.yearsOfExperience}
                          onChange={(e) => updateSkill(index, {
                            yearsOfExperience: parseInt(e.target.value) || 0
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Disponibilidad
            </h3>

            <div className="max-w-md">
              <select
                value={cvData.availability || 'flexible'}
                onChange={(e) => setCvData(prev => ({
                  ...prev,
                  availability: e.target.value as 'immediate' | '1_month' | '3_months' | '6_months' | 'flexible'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Inmediata</option>
                <option value="1_month">1 mes</option>
                <option value="3_months">3 meses</option>
                <option value="6_months">6 meses</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Archivo del CV (Opcional)
            </h3>

            <div className="max-w-md">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Aquí iría la lógica para subir el archivo
                    setCvData(prev => ({ ...prev, file: file.name }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {cvData.file && (
                <p className="text-sm text-gray-600 mt-2">
                  Archivo actual: {cvData.file}
                </p>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Resumen Profesional
            </h3>

            <textarea
              value={cvData.summary || ''}
              onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
              placeholder="Describe brevemente tu perfil profesional, experiencia y objetivos..."
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={saveCV}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50 text-lg font-medium"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Guardando...' : 'Guardar CV Completo'}</span>
            </button>
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
