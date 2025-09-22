'use client';'use client';'use client';'use client';'use client';'use client';'use client';



import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import CreatableSelect from 'react-select/creatable';import { useState, useEffect } from 'react';

import { Plus, Save, Edit, Trash2, X, Check, User, BookOpen, Briefcase, Award } from 'lucide-react';

import { AuthGuard } from '@/components/AuthGuard';import { useRouter } from 'next/navigation';



interface Skill {import CreatableSelect from 'react-select/creatable';import { useState, useEffect } from 'react';

  id: number;

  name: string;import { Plus, Save, Edit, Trash2, X, Check, User, BookOpen, Briefcase, Award } from 'lucide-react';

  category: string;

}import { AuthGuard } from '@/components/AuthGuard';import { useRouter } from 'next/navigation';



interface Education {

  id?: string;

  institution: string;interface Skill {import CreatableSelect from 'react-select/creatable';import { useState, useEffect } from 'react';

  degree: string;

  field: string;  id: number;

  startDate: string;

  endDate: string;  name: string;import { Plus, Save, Edit, Trash2, X, Check, User, BookOpen, Briefcase, Award } from 'lucide-react';

  description: string;

}  category: string;



interface Experience {}import { AuthGuard } from '@/components/AuthGuard';import { useRouter } from 'next/navigation';

  id?: string;

  company: string;

  position: string;

  startDate: string;interface Education {

  endDate: string;

  description: string;  id?: string;

  current: boolean;

}  institution: string;interface Skill {import CreatableSelect from 'react-select/creatable';import { useState, useEffect } from 'react';



interface CVData {  degree: string;

  personalInfo: {

    firstName: string;  field: string;  id: number;

    lastName: string;

    email: string;  startDate: string;

    phone: string;

    bio: string;  endDate: string;  name: string;import { Plus, Save, Edit, Trash2, X, Check, User, BookOpen, Briefcase, Award } from 'lucide-react';

  };

  skills: Skill[];  description: string;

  education: Education[];

  experience: Experience[];}  category: string;

}



export default function MiCVPage() {

  const router = useRouter();interface Experience {}import { AuthGuard } from '@/components/AuthGuard';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  const [user, setUser] = useState<any>(null);

  const [cvData, setCvData] = useState<CVData>({  id?: string;

    personalInfo: { firstName: '', lastName: '', email: '', phone: '', bio: '' },

    skills: [],  company: string;

    education: [],

    experience: []  position: string;

  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);  startDate: string;interface Education {

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);  endDate: string;

  const [activeSection, setActiveSection] = useState<string | null>(null);

  description: string;  id?: string;

  // Estados para formularios

  const [newEducation, setNewEducation] = useState<Education>({  current: boolean;

    institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

  });}  institution: string;interface Skill {import { Button } from '@/components/ui/button';import { useEffect, useState } from 'react';import { useEffect, useState } from 'react';

  const [newExperience, setNewExperience] = useState<Experience>({

    company: '', position: '', startDate: '', endDate: '', description: '', current: false

  });

interface CVData {  degree: string;

  useEffect(() => {

    initializePage();  personalInfo: {

  }, []);

    firstName: string;  field: string;  id: number;

  const initializePage = async () => {

    try {    lastName: string;

      await loadUser();

      await loadAvailableSkills();    email: string;  startDate: string;

      await loadExistingData();

    } catch (error) {    phone: string;

      console.error('Error initializing page:', error);

    } finally {    bio: string;  endDate: string;  name: string;import { Input } from '@/components/ui/input';

      setLoading(false);

    }  };

  };

  skills: Skill[];  description: string;

  const loadUser = async () => {

    const token = localStorage.getItem('token');  education: Education[];

    if (!token) {

      router.push('/login');  experience: Experience[];}  category: string;

      return;

    }}



    try {

      const response = await fetch('/api/auth/me', {

        headers: { Authorization: `Bearer ${token}` }export default function MiCVPage() {

      });

      if (response.ok) {  const router = useRouter();interface Experience {}import { Textarea } from '@/components/ui/textarea';import CreatableSelect from 'react-select/creatable';import Select from 'react-select';

        const userData = await response.json();

        setUser(userData);  const [user, setUser] = useState<any>(null);

      }

    } catch (error) {  const [cvData, setCvData] = useState<CVData>({  id?: string;

      console.error('Error loading user:', error);

    }    personalInfo: { firstName: '', lastName: '', email: '', phone: '', bio: '' },

  };

    skills: [],  company: string;

  const loadAvailableSkills = async () => {

    try {    education: [],

      const response = await fetch('/api/skills');

      if (response.ok) {    experience: []  position: string;

        const skills = await response.json();

        setAvailableSkills(skills);  });

      }

    } catch (error) {  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);  startDate: string;interface Education {import { Label } from '@/components/ui/label';

      console.error('Error loading skills:', error);

    }  const [loading, setLoading] = useState(true);

  };

  const [saving, setSaving] = useState(false);  endDate: string;

  const loadExistingData = async () => {

    // Cargar datos desde localStorage primero  const [activeSection, setActiveSection] = useState<string | null>(null);

    const savedData = localStorage.getItem('cvData');

    if (savedData) {  description: string;  id?: string;

      setCvData(JSON.parse(savedData));

    }  // Estados para formularios



    // Cargar skills del estudiante desde la API  const [newEducation, setNewEducation] = useState<Education>({  current: boolean;

    if (user?.id) {

      await loadStudentSkills();    institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

    }

  };  });}  institution: string;import { Badge } from '@/components/ui/badge';import { AuthGuard } from '@/components/auth/auth-guard';import CreatableSelect from 'react-select/creatable';



  const loadStudentSkills = async () => {  const [newExperience, setNewExperience] = useState<Experience>({

    try {

      const response = await fetch(`/api/students/${user.id}/skills`);    company: '', position: '', startDate: '', endDate: '', description: '', current: false

      if (response.ok) {

        const studentSkills = await response.json();  });

        setCvData(prev => ({

          ...prev,interface CVData {  degree: string;

          skills: studentSkills

        }));  useEffect(() => {

      }

    } catch (error) {    initializePage();  personalInfo: {

      console.error('Error loading student skills:', error);

    }  }, []);

  };

    firstName: string;  field: string;import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

  const saveToLocalStorage = (data: CVData) => {

    localStorage.setItem('cvData', JSON.stringify(data));  const initializePage = async () => {

  };

    try {    lastName: string;

  const handleSkillsChange = async (selectedSkills: any[]) => {

    const newSkills = selectedSkills.map(option => ({      await loadUser();

      id: option.__isNew__ ? Date.now() + Math.random() : option.value,

      name: option.label,      await loadAvailableSkills();    email: string;  startDate: string;

      category: 'General'

    }));      await loadExistingData();



    setCvData(prev => {    } catch (error) {    phone: string;

      const updated = { ...prev, skills: newSkills };

      saveToLocalStorage(updated);      console.error('Error initializing page:', error);

      return updated;

    });    } finally {    bio: string;  endDate: string;import { CreatableSelect } from '@/components/ui/creatable-select';import { useAuthStore } from '@/stores/auth';import { useRouter } from 'next/navigation';



    // Si hay skills nuevas, guardarlas en la base de datos      setLoading(false);

    if (user?.id) {

      await saveSkillsToDatabase(newSkills);    }  };

    }

  };  };



  const saveSkillsToDatabase = async (skills: Skill[]) => {  skills: Skill[];  description: string;

    try {

      const response = await fetch(`/api/students/${user.id}/skills`, {  const loadUser = async () => {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },    const token = localStorage.getItem('token');  education: Education[];

        body: JSON.stringify({ skills })

      });    if (!token) {



      if (!response.ok) {      router.push('/login');  experience: Experience[];}import { toast } from 'sonner';

        console.error('Error saving skills to database');

      }      return;

    } catch (error) {

      console.error('Error saving skills:', error);    }}

    }

  };



  const handlePersonalInfoChange = (field: string, value: string) => {    try {

    setCvData(prev => {

      const updated = {      const response = await fetch('/api/auth/me', {

        ...prev,

        personalInfo: { ...prev.personalInfo, [field]: value }        headers: { Authorization: `Bearer ${token}` }export default function MiCVPage() {

      };

      saveToLocalStorage(updated);      });

      return updated;

    });      if (response.ok) {  const router = useRouter();interface Experience {import { Save, Plus, X, User, GraduationCap, Briefcase, Award, FileText } from 'lucide-react';import { import { AuthGuard } from '@/components/auth/auth-guard';

  };

        const userData = await response.json();

  const addEducation = () => {

    if (!newEducation.institution || !newEducation.degree) return;        setUser(userData);  const [user, setUser] = useState<any>(null);



    const educationWithId = { ...newEducation, id: Date.now().toString() };      }

    setCvData(prev => {

      const updated = {    } catch (error) {  const [cvData, setCvData] = useState<CVData>({  id?: string;

        ...prev,

        education: [...prev.education, educationWithId]      console.error('Error loading user:', error);

      };

      saveToLocalStorage(updated);    }    personalInfo: { firstName: '', lastName: '', email: '', phone: '', bio: '' },

      return updated;

    });  };



    setNewEducation({    skills: [],  company: string;

      institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

    });  const loadAvailableSkills = async () => {

    setActiveSection(null);

  };    try {    education: [],



  const addExperience = () => {      const response = await fetch('/api/skills');

    if (!newExperience.company || !newExperience.position) return;

      if (response.ok) {    experience: []  position: string;

    const experienceWithId = { ...newExperience, id: Date.now().toString() };

    setCvData(prev => {        const skills = await response.json();

      const updated = {

        ...prev,        setAvailableSkills(skills);  });

        experience: [...prev.experience, experienceWithId]

      };      }

      saveToLocalStorage(updated);

      return updated;    } catch (error) {  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);  startDate: string;interface Skill {  User, import { useAuthStore } from '@/stores/auth';

    });

      console.error('Error loading skills:', error);

    setNewExperience({

      company: '', position: '', startDate: '', endDate: '', description: '', current: false    }  const [loading, setLoading] = useState(true);

    });

    setActiveSection(null);  };

  };

  const [saving, setSaving] = useState(false);  endDate: string;

  const removeEducation = (id: string) => {

    setCvData(prev => {  const loadExistingData = async () => {

      const updated = {

        ...prev,    // Cargar datos desde localStorage primero  const [activeSection, setActiveSection] = useState<string | null>(null);

        education: prev.education.filter(edu => edu.id !== id)

      };    const savedData = localStorage.getItem('cvData');

      saveToLocalStorage(updated);

      return updated;    if (savedData) {  description: string;  id: number;

    });

  };      setCvData(JSON.parse(savedData));



  const removeExperience = (id: string) => {    }  // Estados para formularios

    setCvData(prev => {

      const updated = {

        ...prev,

        experience: prev.experience.filter(exp => exp.id !== id)    // Cargar skills del estudiante desde la API  const [newEducation, setNewEducation] = useState<Education>({  current: boolean;

      };

      saveToLocalStorage(updated);    if (user?.id) {

      return updated;

    });      await loadStudentSkills();    institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

  };

    }

  const skillOptions = availableSkills.map(skill => ({

    value: skill.id,  };  });}  name: string;  Mail, import { 

    label: skill.name

  }));



  const selectedSkillOptions = cvData.skills.map(skill => ({  const loadStudentSkills = async () => {  const [newExperience, setNewExperience] = useState<Experience>({

    value: skill.id,

    label: skill.name    try {

  }));

      const response = await fetch(`/api/students/${user.id}/skills`);    company: '', position: '', startDate: '', endDate: '', description: '', current: false

  if (loading) {

    return (      if (response.ok) {

      <AuthGuard>

        <div className="min-h-screen flex items-center justify-center">        const studentSkills = await response.json();  });

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

        </div>        setCvData(prev => ({

      </AuthGuard>

    );          ...prev,interface CVData {  area: string;

  }

          skills: studentSkills

  return (

    <AuthGuard>        }));  useEffect(() => {

      <div className="min-h-screen bg-gray-50 py-8">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">      }

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">

            {/* Header */}    } catch (error) {    initializePage();  personalInfo: {

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">

              <h1 className="text-2xl font-bold text-white flex items-center">      console.error('Error loading student skills:', error);

                <User className="mr-3 h-8 w-8" />

                Mi Currículum Vitae    }  }, []);

              </h1>

            </div>  };



            <div className="p-6 space-y-8">    firstName: string;  proficiencyLevel?: number;  Phone,   User, 

              {/* Información Personal */}

              <div className="border-b border-gray-200 pb-6">  const saveToLocalStorage = (data: CVData) => {

                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                  <User className="mr-2 h-5 w-5" />    localStorage.setItem('cvData', JSON.stringify(data));  const initializePage = async () => {

                  Información Personal

                </h2>  };

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>    try {    lastName: string;

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      Nombre  const handleSkillsChange = async (selectedSkills: any[]) => {

                    </label>

                    <input    const newSkills = selectedSkills.map(option => ({      await loadUser();

                      type="text"

                      value={cvData.personalInfo.firstName}      id: option.__isNew__ ? Date.now() + Math.random() : option.value,

                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      name: option.label,      await loadAvailableSkills();    email: string;  yearsOfExperience?: number;

                      placeholder="Tu nombre"

                    />      category: 'General'

                  </div>

                  <div>    }));      await loadExistingData();

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      Apellido

                    </label>

                    <input    setCvData(prev => {    } catch (error) {    phone: string;

                      type="text"

                      value={cvData.personalInfo.lastName}      const updated = { ...prev, skills: newSkills };

                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      saveToLocalStorage(updated);      console.error('Error initializing page:', error);

                      placeholder="Tu apellido"

                    />      return updated;

                  </div>

                  <div>    });    } finally {    bio: string;}  MapPin,   Mail, 

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      Email

                    </label>

                    <input    // Si hay skills nuevas, guardarlas en la base de datos      setLoading(false);

                      type="email"

                      value={cvData.personalInfo.email}    if (user?.id) {

                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      await saveSkillsToDatabase(newSkills);    }  };

                      placeholder="tu@email.com"

                    />    }

                  </div>

                  <div>  };  };

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      Teléfono

                    </label>

                    <input  const saveSkillsToDatabase = async (skills: Skill[]) => {  skills: Skill[];

                      type="tel"

                      value={cvData.personalInfo.phone}    try {

                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}

                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      const response = await fetch(`/api/students/${user.id}/skills`, {  const loadUser = async () => {

                      placeholder="+54 11 1234-5678"

                    />        method: 'POST',

                  </div>

                </div>        headers: { 'Content-Type': 'application/json' },    const token = localStorage.getItem('token');  education: Education[];

                <div className="mt-4">

                  <label className="block text-sm font-medium text-gray-700 mb-1">        body: JSON.stringify({ skills })

                    Biografía

                  </label>      });    if (!token) {

                  <textarea

                    value={cvData.personalInfo.bio}

                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}

                    rows={3}      if (!response.ok) {      router.push('/login');  experience: Experience[];interface Education {  Award,   Phone, 

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="Cuéntanos un poco sobre ti..."        console.error('Error saving skills to database');

                  />

                </div>      }      return;

              </div>

    } catch (error) {

              {/* Skills */}

              <div className="border-b border-gray-200 pb-6">      console.error('Error saving skills:', error);    }}

                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                  <Award className="mr-2 h-5 w-5" />    }

                  Habilidades

                </h2>  };

                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-700">

                    Selecciona tus habilidades (puedes crear nuevas)

                  </label>  const handlePersonalInfoChange = (field: string, value: string) => {    try {  id?: string;

                  <CreatableSelect

                    isMulti    setCvData(prev => {

                    options={skillOptions}

                    value={selectedSkillOptions}      const updated = {      const response = await fetch('/api/auth/me', {

                    onChange={handleSkillsChange}

                    placeholder="Buscar o crear habilidades..."        ...prev,

                    formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}

                    className="react-select-container"        personalInfo: { ...prev.personalInfo, [field]: value }        headers: { Authorization: `Bearer ${token}` }export default function MiCVPage() {

                    classNamePrefix="react-select"

                  />      };

                  <p className="text-sm text-gray-500">

                    {cvData.skills.length} habilidad(es) seleccionada(s)      saveToLocalStorage(updated);      });

                  </p>

                </div>      return updated;

              </div>

    });      if (response.ok) {  const router = useRouter();  institution: string;  Briefcase,   MapPin, 

              {/* Educación */}

              <div className="border-b border-gray-200 pb-6">  };

                <div className="flex justify-between items-center mb-4">

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">        const userData = await response.json();

                    <BookOpen className="mr-2 h-5 w-5" />

                    Educación  const addEducation = () => {

                  </h2>

                  <button    if (!newEducation.institution || !newEducation.degree) return;        setUser(userData);  const [user, setUser] = useState<any>(null);

                    onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >

                    <Plus className="mr-2 h-4 w-4" />    const educationWithId = { ...newEducation, id: Date.now().toString() };      }

                    Agregar Educación

                  </button>    setCvData(prev => {

                </div>

      const updated = {    } catch (error) {  const [cvData, setCvData] = useState<CVData>({  degree: string;

                {activeSection === 'education' && (

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">        ...prev,

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Educación</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">        education: [...prev.education, educationWithId]      console.error('Error loading user:', error);

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      };

                          Institución *

                        </label>      saveToLocalStorage(updated);    }    personalInfo: { firstName: '', lastName: '', email: '', phone: '', bio: '' },

                        <input

                          type="text"      return updated;

                          value={newEducation.institution}

                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}    });  };

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Universidad/Instituto"

                        />

                      </div>    setNewEducation({    skills: [],  field: string;  BookOpen,  Calendar, 

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

                          Título *

                        </label>    });  const loadAvailableSkills = async () => {

                        <input

                          type="text"    setActiveSection(null);

                          value={newEducation.degree}

                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}  };    try {    education: [],

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Licenciatura, Maestría, etc."

                        />

                      </div>  const addExperience = () => {      const response = await fetch('/api/skills');

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">    if (!newExperience.company || !newExperience.position) return;

                          Campo de estudio

                        </label>      if (response.ok) {    experience: []  startDate: string;

                        <input

                          type="text"    const experienceWithId = { ...newExperience, id: Date.now().toString() };

                          value={newEducation.field}

                          onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}    setCvData(prev => {        const skills = await response.json();

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Informática, Ingeniería, etc."      const updated = {

                        />

                      </div>        ...prev,        setAvailableSkills(skills);  });

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">

                        <div>        experience: [...prev.experience, experienceWithId]

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de inicio      };      }

                          </label>

                          <input      saveToLocalStorage(updated);

                            type="date"

                            value={newEducation.startDate}      return updated;    } catch (error) {  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);  endDate: string;  Plus,  Award, 

                            onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    });

                          />

                        </div>      console.error('Error loading skills:', error);

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">    setNewExperience({

                            Fecha de fin

                          </label>      company: '', position: '', startDate: '', endDate: '', description: '', current: false    }  const [loading, setLoading] = useState(true);

                          <input

                            type="date"    });

                            value={newEducation.endDate}

                            onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}    setActiveSection(null);  };

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />  };

                        </div>

                      </div>  const [saving, setSaving] = useState(false);  description: string;

                    </div>

                    <div className="mb-4">  const removeEducation = (id: string) => {

                      <label className="block text-sm font-medium text-gray-700 mb-1">

                        Descripción    setCvData(prev => {  const loadExistingData = async () => {

                      </label>

                      <textarea      const updated = {

                        value={newEducation.description}

                        onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}        ...prev,    // Cargar datos desde localStorage primero  const [activeSection, setActiveSection] = useState<string | null>(null);

                        rows={3}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        education: prev.education.filter(edu => edu.id !== id)

                        placeholder="Describe tu experiencia educativa..."

                      />      };    const savedData = localStorage.getItem('cvData');

                    </div>

                    <div className="flex justify-end space-x-2">      saveToLocalStorage(updated);

                      <button

                        onClick={() => setActiveSection(null)}      return updated;    if (savedData) {}  Edit,  Briefcase, 

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"

                      >    });

                        Cancelar

                      </button>  };      setCvData(JSON.parse(savedData));

                      <button

                        onClick={addEducation}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"

                      >  const removeExperience = (id: string) => {    }  // Estados para formularios

                        <Check className="mr-2 h-4 w-4" />

                        Agregar    setCvData(prev => {

                      </button>

                    </div>      const updated = {

                  </div>

                )}        ...prev,



                <div className="space-y-3">        experience: prev.experience.filter(exp => exp.id !== id)    // Cargar skills del estudiante desde la API  const [newEducation, setNewEducation] = useState<Education>({

                  {cvData.education.map((edu) => (

                    <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-4">      };

                      <div className="flex justify-between items-start">

                        <div className="flex-1">      saveToLocalStorage(updated);    if (user?.id) {

                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>

                          <p className="text-gray-600">{edu.institution}</p>      return updated;

                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}

                          {(edu.startDate || edu.endDate) && (    });      await loadStudentSkills();    institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

                            <p className="text-sm text-gray-500">

                              {edu.startDate && new Date(edu.startDate).getFullYear()}  };

                              {edu.startDate && edu.endDate && ' - '}

                              {edu.endDate && new Date(edu.endDate).getFullYear()}    }

                            </p>

                          )}  const skillOptions = availableSkills.map(skill => ({

                          {edu.description && (

                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>    value: skill.id,  };  });interface Experience {  X,  BookOpen,

                          )}

                        </div>    label: skill.name

                        <button

                          onClick={() => removeEducation(edu.id!)}  }));

                          className="text-red-600 hover:text-red-800 p-1"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>  const selectedSkillOptions = cvData.skills.map(skill => ({  const loadStudentSkills = async () => {  const [newExperience, setNewExperience] = useState<Experience>({

                      </div>

                    </div>    value: skill.id,

                  ))}

                  {cvData.education.length === 0 && (    label: skill.name    try {

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna educación aún. Haz clic en "Agregar Educación" para comenzar.  }));

                    </p>

                  )}      const response = await fetch(`/api/students/${user.id}/skills`);    company: '', position: '', startDate: '', endDate: '', description: '', current: false  id?: string;

                </div>

              </div>  if (loading) {



              {/* Experiencia Laboral */}    return (      if (response.ok) {

              <div>

                <div className="flex justify-between items-center mb-4">      <AuthGuard>

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">

                    <Briefcase className="mr-2 h-5 w-5" />        <div className="min-h-screen flex items-center justify-center">        const studentSkills = await response.json();  });

                    Experiencia Laboral

                  </h2>          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                  <button

                    onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}        </div>        setCvData(prev => ({

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >      </AuthGuard>

                    <Plus className="mr-2 h-4 w-4" />

                    Agregar Experiencia    );          ...prev,  company: string;  Save,  GraduationCap,

                  </button>

                </div>  }



                {activeSection === 'experience' && (          skills: studentSkills

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Experiencia</h3>  return (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                      <div>    <AuthGuard>        }));  useEffect(() => {

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Empresa *      <div className="min-h-screen bg-gray-50 py-8">

                        </label>

                        <input        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">      }

                          type="text"

                          value={newExperience.company}          <div className="bg-white shadow-lg rounded-lg overflow-hidden">

                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            {/* Header */}    } catch (error) {    initializePage();  position: string;

                          placeholder="Nombre de la empresa"

                        />            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">

                      </div>

                      <div>              <h1 className="text-2xl font-bold text-white flex items-center">      console.error('Error loading student skills:', error);

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Cargo *                <User className="mr-3 h-8 w-8" />

                        </label>

                        <input                Mi Currículum Vitae    }  }, []);

                          type="text"

                          value={newExperience.position}              </h1>

                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            </div>  };

                          placeholder="Tu cargo o posición"

                        />

                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">            <div className="p-6 space-y-8">  startDate: string;  Target,  Plus,

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">              {/* Información Personal */}

                            Fecha de inicio

                          </label>              <div className="border-b border-gray-200 pb-6">  const saveToLocalStorage = (data: CVData) => {

                          <input

                            type="date"                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                            value={newExperience.startDate}

                            onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}                  <User className="mr-2 h-5 w-5" />    localStorage.setItem('cvData', JSON.stringify(data));  const initializePage = async () => {

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />                  Información Personal

                        </div>

                        <div>                </h2>  };

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de fin                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          </label>

                          <input                  <div>    try {  endDate: string;

                            type="date"

                            value={newExperience.endDate}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                            onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}

                            disabled={newExperience.current}                      Nombre  const handleSkillsChange = async (selectedSkills: any[]) => {

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

                          />                    </label>

                        </div>

                      </div>                    <input    const newSkills = selectedSkills.map(option => ({      await loadUser();

                      <div className="md:col-span-2">

                        <label className="flex items-center">                      type="text"

                          <input

                            type="checkbox"                      value={cvData.personalInfo.firstName}      id: option.__isNew__ ? Date.now() + Math.random() : option.value,

                            checked={newExperience.current}

                            onChange={(e) => setNewExperience({...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate})}                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}

                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"

                          />                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      name: option.label,      await loadAvailableSkills();  description: string;  TrendingUp,  Edit,

                          <span className="ml-2 text-sm text-gray-700">Trabajo aquí actualmente</span>

                        </label>                      placeholder="Tu nombre"

                      </div>

                    </div>                    />      category: 'General'

                    <div className="mb-4">

                      <label className="block text-sm font-medium text-gray-700 mb-1">                  </div>

                        Descripción

                      </label>                  <div>    }));      await loadExistingData();

                      <textarea

                        value={newExperience.description}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}

                        rows={3}                      Apellido

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Describe tus responsabilidades y logros..."                    </label>

                      />

                    </div>                    <input    setCvData(prev => {    } catch (error) {  current: boolean;

                    <div className="flex justify-end space-x-2">

                      <button                      type="text"

                        onClick={() => setActiveSection(null)}

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"                      value={cvData.personalInfo.lastName}      const updated = { ...prev, skills: newSkills };

                      >

                        Cancelar                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}

                      </button>

                      <button                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      saveToLocalStorage(updated);      console.error('Error initializing page:', error);

                        onClick={addExperience}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"                      placeholder="Tu apellido"

                      >

                        <Check className="mr-2 h-4 w-4" />                    />      return updated;

                        Agregar

                      </button>                  </div>

                    </div>

                  </div>                  <div>    });    } finally {}  Check,  X,

                )}

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                <div className="space-y-3">

                  {cvData.experience.map((exp) => (                      Email

                    <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">

                      <div className="flex justify-between items-start">                    </label>

                        <div className="flex-1">

                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>                    <input    // Si hay skills nuevas, guardarlas en la base de datos      setLoading(false);

                          <p className="text-gray-600">{exp.company}</p>

                          <p className="text-sm text-gray-500">                      type="email"

                            {exp.startDate && new Date(exp.startDate).getFullYear()}

                            {exp.startDate && (exp.endDate || exp.current) && ' - '}                      value={cvData.personalInfo.email}    if (user?.id) {

                            {exp.current ? 'Presente' : (exp.endDate && new Date(exp.endDate).getFullYear())}

                          </p>                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}

                          {exp.description && (

                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      await saveSkillsToDatabase(newSkills);    }

                          )}

                        </div>                      placeholder="tu@email.com"

                        <button

                          onClick={() => removeExperience(exp.id!)}                    />    }

                          className="text-red-600 hover:text-red-800 p-1"

                        >                  </div>

                          <Trash2 className="h-4 w-4" />

                        </button>                  <div>  };  };

                      </div>

                    </div>                    <label className="block text-sm font-medium text-gray-700 mb-1">

                  ))}

                  {cvData.experience.length === 0 && (                      Teléfono

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna experiencia laboral aún. Haz clic en "Agregar Experiencia" para comenzar.                    </label>

                    </p>

                  )}                    <input  const saveSkillsToDatabase = async (skills: Skill[]) => {export default function MiCVPage() {  AlertCircle,  Save,

                </div>

              </div>                      type="tel"

            </div>

          </div>                      value={cvData.personalInfo.phone}    try {

        </div>

      </div>                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}

    </AuthGuard>

  );                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      const response = await fetch(`/api/students/${user.id}/skills`, {  const loadUser = async () => {

}
                      placeholder="+54 11 1234-5678"

                    />        method: 'POST',

                  </div>

                </div>        headers: { 'Content-Type': 'application/json' },    const token = localStorage.getItem('token');  const [userId, setUserId] = useState<number | null>(null);

                <div className="mt-4">

                  <label className="block text-sm font-medium text-gray-700 mb-1">        body: JSON.stringify({ skills })

                    Biografía

                  </label>      });    if (!token) {

                  <textarea

                    value={cvData.personalInfo.bio}

                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}

                    rows={3}      if (!response.ok) {      router.push('/login');  const [studentId, setStudentId] = useState<number | null>(null);  Calendar  Star,

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="Cuéntanos un poco sobre ti..."        console.error('Error saving skills to database');

                  />

                </div>      }      return;

              </div>

    } catch (error) {

              {/* Skills */}

              <div className="border-b border-gray-200 pb-6">      console.error('Error saving skills:', error);    }  const [loading, setLoading] = useState(true);

                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                  <Award className="mr-2 h-5 w-5" />    }

                  Habilidades

                </h2>  };

                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-700">

                    Selecciona tus habilidades (puedes crear nuevas)

                  </label>  const handlePersonalInfoChange = (field: string, value: string) => {    try {} from 'lucide-react';  Target,

                  <CreatableSelect

                    isMulti    setCvData(prev => {

                    options={skillOptions}

                    value={selectedSkillOptions}      const updated = {      const response = await fetch('/api/auth/me', {

                    onChange={handleSkillsChange}

                    placeholder="Buscar o crear habilidades..."        ...prev,

                    formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}

                    className="react-select-container"        personalInfo: { ...prev.personalInfo, [field]: value }        headers: { Authorization: `Bearer ${token}` }  // CV Data

                    classNamePrefix="react-select"

                  />      };

                  <p className="text-sm text-gray-500">

                    {cvData.skills.length} habilidad(es) seleccionada(s)      saveToLocalStorage(updated);      });

                  </p>

                </div>      return updated;

              </div>

    });      if (response.ok) {  const [personalInfo, setPersonalInfo] = useState({  TrendingUp

              {/* Educación */}

              <div className="border-b border-gray-200 pb-6">  };

                <div className="flex justify-between items-center mb-4">

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">        const userData = await response.json();

                    <BookOpen className="mr-2 h-5 w-5" />

                    Educación  const addEducation = () => {

                  </h2>

                  <button    if (!newEducation.institution || !newEducation.degree) return;        setUser(userData);    name: '',

                    onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >

                    <Plus className="mr-2 h-4 w-4" />    const educationWithId = { ...newEducation, id: Date.now().toString() };      }

                    Agregar Educación

                  </button>    setCvData(prev => {

                </div>

      const updated = {    } catch (error) {    email: '',// Interfaces} from 'lucide-react';

                {activeSection === 'education' && (

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">        ...prev,

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Educación</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">        education: [...prev.education, educationWithId]      console.error('Error loading user:', error);

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      };

                          Institución *

                        </label>      saveToLocalStorage(updated);    }    phone: '',

                        <input

                          type="text"      return updated;

                          value={newEducation.institution}

                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}    });  };

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Universidad/Instituto"

                        />

                      </div>    setNewEducation({    description: '',interface StudentSkill {

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

                          Título *

                        </label>    });  const loadAvailableSkills = async () => {

                        <input

                          type="text"    setActiveSection(null);

                          value={newEducation.degree}

                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}  };    try {    grade: '',

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Licenciatura, Maestría, etc."

                        />

                      </div>  const addExperience = () => {      const response = await fetch('/api/skills');

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">    if (!newExperience.company || !newExperience.position) return;

                          Campo de estudio

                        </label>      if (response.ok) {    course: ''  id: number;// Skills interfaces

                        <input

                          type="text"    const experienceWithId = { ...newExperience, id: Date.now().toString() };

                          value={newEducation.field}

                          onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}    setCvData(prev => {        const skills = await response.json();

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Informática, Ingeniería, etc."      const updated = {

                        />

                      </div>        ...prev,        setAvailableSkills(skills);  });

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">

                        <div>        experience: [...prev.experience, experienceWithId]

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de inicio      };      }

                          </label>

                          <input      saveToLocalStorage(updated);

                            type="date"

                            value={newEducation.startDate}      return updated;    } catch (error) {  name: string;interface StudentSkill {

                            onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    });

                          />

                        </div>      console.error('Error loading skills:', error);

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">    setNewExperience({

                            Fecha de fin

                          </label>      company: '', position: '', startDate: '', endDate: '', description: '', current: false    }  const [skills, setSkills] = useState<Skill[]>([]);

                          <input

                            type="date"    });

                            value={newEducation.endDate}

                            onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}    setActiveSection(null);  };

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />  };

                        </div>

                      </div>  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);  category: string;  id: number;

                    </div>

                    <div className="mb-4">  const removeEducation = (id: string) => {

                      <label className="block text-sm font-medium text-gray-700 mb-1">

                        Descripción    setCvData(prev => {  const loadExistingData = async () => {

                      </label>

                      <textarea      const updated = {

                        value={newEducation.description}

                        onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}        ...prev,    // Cargar datos desde localStorage primero  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);

                        rows={3}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        education: prev.education.filter(edu => edu.id !== id)

                        placeholder="Describe tu experiencia educativa..."

                      />      };    const savedData = localStorage.getItem('cvData');

                    </div>

                    <div className="flex justify-end space-x-2">      saveToLocalStorage(updated);

                      <button

                        onClick={() => setActiveSection(null)}      return updated;    if (savedData) {  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';  name: string;

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"

                      >    });

                        Cancelar

                      </button>  };      setCvData(JSON.parse(savedData));

                      <button

                        onClick={addEducation}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"

                      >  const removeExperience = (id: string) => {    }  const [education, setEducation] = useState<Education[]>([]);

                        <Check className="mr-2 h-4 w-4" />

                        Agregar    setCvData(prev => {

                      </button>

                    </div>      const updated = {

                  </div>

                )}        ...prev,



                <div className="space-y-3">        experience: prev.experience.filter(exp => exp.id !== id)    // Cargar skills del estudiante desde la API  const [experience, setExperience] = useState<Experience[]>([]);  yearsOfExperience: number;  category: string;

                  {cvData.education.map((edu) => (

                    <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-4">      };

                      <div className="flex justify-between items-start">

                        <div className="flex-1">      saveToLocalStorage(updated);    if (user?.id) {

                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>

                          <p className="text-gray-600">{edu.institution}</p>      return updated;

                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}

                          {(edu.startDate || edu.endDate) && (    });      await loadStudentSkills();

                            <p className="text-sm text-gray-500">

                              {edu.startDate && new Date(edu.startDate).getFullYear()}  };

                              {edu.startDate && edu.endDate && ' - '}

                              {edu.endDate && new Date(edu.endDate).getFullYear()}    }

                            </p>

                          )}  const skillOptions = availableSkills.map(skill => ({

                          {edu.description && (

                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>    value: skill.id,  };  // Form states  isVerified?: boolean;  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

                          )}

                        </div>    label: skill.name

                        <button

                          onClick={() => removeEducation(edu.id!)}  }));

                          className="text-red-600 hover:text-red-800 p-1"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>  const selectedSkillOptions = cvData.skills.map(skill => ({  const loadStudentSkills = async () => {  const [savingPersonal, setSavingPersonal] = useState(false);

                      </div>

                    </div>    value: skill.id,

                  ))}

                  {cvData.education.length === 0 && (    label: skill.name    try {

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna educación aún. Haz clic en "Agregar Educación" para comenzar.  }));

                    </p>

                  )}      const response = await fetch(`/api/students/${user.id}/skills`);  const [savingSkills, setSavingSkills] = useState(false);  notes?: string;  yearsOfExperience: number;

                </div>

              </div>  if (loading) {



              {/* Experiencia Laboral */}    return (      if (response.ok) {

              <div>

                <div className="flex justify-between items-center mb-4">      <AuthGuard>

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">

                    <Briefcase className="mr-2 h-5 w-5" />        <div className="min-h-screen flex items-center justify-center">        const studentSkills = await response.json();  const [savingEducation, setSavingEducation] = useState(false);

                    Experiencia Laboral

                  </h2>          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                  <button

                    onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}        </div>        setCvData(prev => ({

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >      </AuthGuard>

                    <Plus className="mr-2 h-4 w-4" />

                    Agregar Experiencia    );          ...prev,  const [savingExperience, setSavingExperience] = useState(false);}  notes?: string;

                  </button>

                </div>  }



                {activeSection === 'experience' && (          skills: studentSkills

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Experiencia</h3>  return (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                      <div>    <AuthGuard>        }));

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Empresa *      <div className="min-h-screen bg-gray-50 py-8">

                        </label>

                        <input        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">      }

                          type="text"

                          value={newExperience.company}          <div className="bg-white shadow-lg rounded-lg overflow-hidden">

                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            {/* Header */}    } catch (error) {  // New item forms  isVerified?: boolean;

                          placeholder="Nombre de la empresa"

                        />            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">

                      </div>

                      <div>              <h1 className="text-2xl font-bold text-white flex items-center">      console.error('Error loading student skills:', error);

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Cargo *                <User className="mr-3 h-8 w-8" />

                        </label>

                        <input                Mi Currículum Vitae    }  const [newEducation, setNewEducation] = useState<Education>({

                          type="text"

                          value={newExperience.position}              </h1>

                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            </div>  };

                          placeholder="Tu cargo o posición"

                        />

                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">            <div className="p-6 space-y-8">    institution: '',interface AvailableSkill {}

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">              {/* Información Personal */}

                            Fecha de inicio

                          </label>              <div className="border-b border-gray-200 pb-6">  const saveToLocalStorage = (data: CVData) => {

                          <input

                            type="date"                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                            value={newExperience.startDate}

                            onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}                  <User className="mr-2 h-5 w-5" />    localStorage.setItem('cvData', JSON.stringify(data));    degree: '',

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />                  Información Personal

                        </div>

                        <div>                </h2>  };

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de fin                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          </label>

                          <input                  <div>    field: '',  id: number;

                            type="date"

                            value={newExperience.endDate}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                            onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}

                            disabled={newExperience.current}                      Nombre  const handleSkillsChange = async (selectedSkills: any[]) => {

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

                          />                    </label>

                        </div>

                      </div>                    <input    const newSkills = selectedSkills.map(option => ({    startDate: '',

                      <div className="md:col-span-2">

                        <label className="flex items-center">                      type="text"

                          <input

                            type="checkbox"                      value={cvData.personalInfo.firstName}      id: option.__isNew__ ? Date.now() + Math.random() : option.value,

                            checked={newExperience.current}

                            onChange={(e) => setNewExperience({...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate})}                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}

                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"

                          />                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      name: option.label,    endDate: '',  name: string;interface AvailableSkill {

                          <span className="ml-2 text-sm text-gray-700">Trabajo aquí actualmente</span>

                        </label>                      placeholder="Tu nombre"

                      </div>

                    </div>                    />      category: 'General'

                    <div className="mb-4">

                      <label className="block text-sm font-medium text-gray-700 mb-1">                  </div>

                        Descripción

                      </label>                  <div>    }));    description: ''

                      <textarea

                        value={newExperience.description}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}

                        rows={3}                      Apellido

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Describe tus responsabilidades y logros..."                    </label>

                      />

                    </div>                    <input    setCvData(prev => {  });  category: string;  id: number;

                    <div className="flex justify-end space-x-2">

                      <button                      type="text"

                        onClick={() => setActiveSection(null)}

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"                      value={cvData.personalInfo.lastName}      const updated = { ...prev, skills: newSkills };

                      >

                        Cancelar                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}

                      </button>

                      <button                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      saveToLocalStorage(updated);

                        onClick={addExperience}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"                      placeholder="Tu apellido"

                      >

                        <Check className="mr-2 h-4 w-4" />                    />      return updated;

                        Agregar

                      </button>                  </div>

                    </div>

                  </div>                  <div>    });  const [newExperience, setNewExperience] = useState<Experience>({  description?: string;  name: string;

                )}

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                <div className="space-y-3">

                  {cvData.experience.map((exp) => (                      Email

                    <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">

                      <div className="flex justify-between items-start">                    </label>

                        <div className="flex-1">

                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>                    <input    // Si hay skills nuevas, guardarlas en la base de datos    company: '',

                          <p className="text-gray-600">{exp.company}</p>

                          <p className="text-sm text-gray-500">                      type="email"

                            {exp.startDate && new Date(exp.startDate).getFullYear()}

                            {exp.startDate && (exp.endDate || exp.current) && ' - '}                      value={cvData.personalInfo.email}    if (user?.id) {

                            {exp.current ? 'Presente' : (exp.endDate && new Date(exp.endDate).getFullYear())}

                          </p>                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}

                          {exp.description && (

                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      await saveSkillsToDatabase(newSkills);    position: '',}  category: string;

                          )}

                        </div>                      placeholder="tu@email.com"

                        <button

                          onClick={() => removeExperience(exp.id!)}                    />    }

                          className="text-red-600 hover:text-red-800 p-1"

                        >                  </div>

                          <Trash2 className="h-4 w-4" />

                        </button>                  <div>  };    startDate: '',

                      </div>

                    </div>                    <label className="block text-sm font-medium text-gray-700 mb-1">

                  ))}

                  {cvData.experience.length === 0 && (                      Teléfono

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna experiencia laboral aún. Haz clic en "Agregar Experiencia" para comenzar.                    </label>

                    </p>

                  )}                    <input  const saveSkillsToDatabase = async (skills: Skill[]) => {    endDate: '',  area: string;

                </div>

              </div>                      type="tel"

            </div>

          </div>                      value={cvData.personalInfo.phone}    try {

        </div>

      </div>                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}

    </AuthGuard>

  );                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      const response = await fetch(`/api/students/${user.id}/skills`, {    description: '',

}
                      placeholder="+54 11 1234-5678"

                    />        method: 'POST',

                  </div>

                </div>        headers: { 'Content-Type': 'application/json' },    current: falseinterface CVData {  description?: string;

                <div className="mt-4">

                  <label className="block text-sm font-medium text-gray-700 mb-1">        body: JSON.stringify({ skills })

                    Biografía

                  </label>      });  });

                  <textarea

                    value={cvData.personalInfo.bio}

                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}

                    rows={3}      if (!response.ok) {  personalInfo: {}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="Cuéntanos un poco sobre ti..."        console.error('Error saving skills to database');

                  />

                </div>      }  useEffect(() => {

              </div>

    } catch (error) {

              {/* Skills */}

              <div className="border-b border-gray-200 pb-6">      console.error('Error saving skills:', error);    initializeUser();    name: string;

                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                  <Award className="mr-2 h-5 w-5" />    }

                  Habilidades

                </h2>  };    loadAvailableSkills();

                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-700">

                    Selecciona tus habilidades (puedes crear nuevas)

                  </label>  const handlePersonalInfoChange = (field: string, value: string) => {  }, []);    email: string;// CV Data interface

                  <CreatableSelect

                    isMulti    setCvData(prev => {

                    options={skillOptions}

                    value={selectedSkillOptions}      const updated = {

                    onChange={handleSkillsChange}

                    placeholder="Buscar o crear habilidades..."        ...prev,

                    formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}

                    className="react-select-container"        personalInfo: { ...prev.personalInfo, [field]: value }  useEffect(() => {    phone: string;interface CVData {

                    classNamePrefix="react-select"

                  />      };

                  <p className="text-sm text-gray-500">

                    {cvData.skills.length} habilidad(es) seleccionada(s)      saveToLocalStorage(updated);    if (studentId) {

                  </p>

                </div>      return updated;

              </div>

    });      loadStudentSkills();    address: string;  personalInfo: {

              {/* Educación */}

              <div className="border-b border-gray-200 pb-6">  };

                <div className="flex justify-between items-center mb-4">

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">      loadCVData();

                    <BookOpen className="mr-2 h-5 w-5" />

                    Educación  const addEducation = () => {

                  </h2>

                  <button    if (!newEducation.institution || !newEducation.degree) return;    }    summary: string;    name: string;

                    onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >

                    <Plus className="mr-2 h-4 w-4" />    const educationWithId = { ...newEducation, id: Date.now().toString() };  }, [studentId]);

                    Agregar Educación

                  </button>    setCvData(prev => {

                </div>

      const updated = {  };    email: string;

                {activeSection === 'education' && (

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">        ...prev,

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Educación</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">        education: [...prev.education, educationWithId]  const initializeUser = async () => {

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      };

                          Institución *

                        </label>      saveToLocalStorage(updated);    try {  education: Array<{    phone: string;

                        <input

                          type="text"      return updated;

                          value={newEducation.institution}

                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}    });      const token = localStorage.getItem('token');

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Universidad/Instituto"

                        />

                      </div>    setNewEducation({      if (!token) {    id?: number;    address: string;

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      institution: '', degree: '', field: '', startDate: '', endDate: '', description: ''

                          Título *

                        </label>    });        toast.error('No autenticado');

                        <input

                          type="text"    setActiveSection(null);

                          value={newEducation.degree}

                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}  };        return;    institution: string;    summary: string;

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Licenciatura, Maestría, etc."

                        />

                      </div>  const addExperience = () => {      }

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">    if (!newExperience.company || !newExperience.position) return;

                          Campo de estudio

                        </label>    degree: string;  };

                        <input

                          type="text"    const experienceWithId = { ...newExperience, id: Date.now().toString() };

                          value={newEducation.field}

                          onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}    setCvData(prev => {      const response = await fetch('/api/auth/me', {

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Informática, Ingeniería, etc."      const updated = {

                        />

                      </div>        ...prev,        headers: { Authorization: `Bearer ${token}` }    startDate: string;  education: Array<{

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">

                        <div>        experience: [...prev.experience, experienceWithId]

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de inicio      };      });

                          </label>

                          <input      saveToLocalStorage(updated);

                            type="date"

                            value={newEducation.startDate}      return updated;    endDate: string;    id: number;

                            onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    });

                          />

                        </div>      if (response.ok) {

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">    setNewExperience({

                            Fecha de fin

                          </label>      company: '', position: '', startDate: '', endDate: '', description: '', current: false        const userData = await response.json();    description?: string;    institution: string;

                          <input

                            type="date"    });

                            value={newEducation.endDate}

                            onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}    setActiveSection(null);        setUserId(userData.userId || 1); // Fallback to 1 for testing

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />  };

                        </div>

                      </div>        setStudentId(userData.studentId || 1); // Fallback to 1 for testing  }>;    degree: string;

                    </div>

                    <div className="mb-4">  const removeEducation = (id: string) => {

                      <label className="block text-sm font-medium text-gray-700 mb-1">

                        Descripción    setCvData(prev => {      }

                      </label>

                      <textarea      const updated = {

                        value={newEducation.description}

                        onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}        ...prev,    } catch (error) {  experience: Array<{    field: string;

                        rows={3}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        education: prev.education.filter(edu => edu.id !== id)

                        placeholder="Describe tu experiencia educativa..."

                      />      };      console.error('Error initializing user:', error);

                    </div>

                    <div className="flex justify-end space-x-2">      saveToLocalStorage(updated);

                      <button

                        onClick={() => setActiveSection(null)}      return updated;      setUserId(1); // Fallback    id?: number;    startDate: string;

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"

                      >    });

                        Cancelar

                      </button>  };      setStudentId(1); // Fallback

                      <button

                        onClick={addEducation}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"

                      >  const removeExperience = (id: string) => {    } finally {    company: string;    endDate: string;

                        <Check className="mr-2 h-4 w-4" />

                        Agregar    setCvData(prev => {

                      </button>

                    </div>      const updated = {      setLoading(false);

                  </div>

                )}        ...prev,



                <div className="space-y-3">        experience: prev.experience.filter(exp => exp.id !== id)    }    position: string;    description: string;

                  {cvData.education.map((edu) => (

                    <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-4">      };

                      <div className="flex justify-between items-start">

                        <div className="flex-1">      saveToLocalStorage(updated);  };

                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>

                          <p className="text-gray-600">{edu.institution}</p>      return updated;

                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}

                          {(edu.startDate || edu.endDate) && (    });    startDate: string;  }>;

                            <p className="text-sm text-gray-500">

                              {edu.startDate && new Date(edu.startDate).getFullYear()}  };

                              {edu.startDate && edu.endDate && ' - '}

                              {edu.endDate && new Date(edu.endDate).getFullYear()}  const loadAvailableSkills = async () => {

                            </p>

                          )}  const skillOptions = availableSkills.map(skill => ({

                          {edu.description && (

                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>    value: skill.id,    try {    endDate: string;  experience: Array<{

                          )}

                        </div>    label: skill.name

                        <button

                          onClick={() => removeEducation(edu.id!)}  }));      const response = await fetch('/api/skills');

                          className="text-red-600 hover:text-red-800 p-1"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>  const selectedSkillOptions = cvData.skills.map(skill => ({      if (response.ok) {    description?: string;    id: number;

                      </div>

                    </div>    value: skill.id,

                  ))}

                  {cvData.education.length === 0 && (    label: skill.name        const skillsData = await response.json();

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna educación aún. Haz clic en "Agregar Educación" para comenzar.  }));

                    </p>

                  )}        setAvailableSkills(skillsData);  }>;    company: string;

                </div>

              </div>  if (loading) {



              {/* Experiencia Laboral */}    return (      }

              <div>

                <div className="flex justify-between items-center mb-4">      <AuthGuard>

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">

                    <Briefcase className="mr-2 h-5 w-5" />        <div className="min-h-screen flex items-center justify-center">    } catch (error) {  skills: StudentSkill[];    position: string;

                    Experiencia Laboral

                  </h2>          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

                  <button

                    onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}        </div>      console.error('Error loading skills:', error);

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >      </AuthGuard>

                    <Plus className="mr-2 h-4 w-4" />

                    Agregar Experiencia    );    }}    startDate: string;

                  </button>

                </div>  }



                {activeSection === 'experience' && (  };

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Experiencia</h3>  return (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                      <div>    <AuthGuard>    endDate: string;

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Empresa *      <div className="min-h-screen bg-gray-50 py-8">

                        </label>

                        <input        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">  const loadStudentSkills = async () => {

                          type="text"

                          value={newExperience.company}          <div className="bg-white shadow-lg rounded-lg overflow-hidden">

                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            {/* Header */}    if (!studentId) return;function MiCVContent() {    description: string;

                          placeholder="Nombre de la empresa"

                        />            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">

                      </div>

                      <div>              <h1 className="text-2xl font-bold text-white flex items-center">

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Cargo *                <User className="mr-3 h-8 w-8" />

                        </label>

                        <input                Mi Currículum Vitae    try {  const { user, token } = useAuthStore();    current: boolean;

                          type="text"

                          value={newExperience.position}              </h1>

                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            </div>      const response = await fetch(`/api/students/${studentId}/skills`);

                          placeholder="Tu cargo o posición"

                        />

                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">            <div className="p-6 space-y-8">      if (response.ok) {    }>;

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">              {/* Información Personal */}

                            Fecha de inicio

                          </label>              <div className="border-b border-gray-200 pb-6">        const skillsData = await response.json();

                          <input

                            type="date"                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                            value={newExperience.startDate}

                            onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}                  <User className="mr-2 h-5 w-5" />        setSkills(skillsData);  // Estados principales  skills: StudentSkill[];

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />                  Información Personal

                        </div>

                        <div>                </h2>        // Convert to format expected by CreatableSelect

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de fin                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          </label>

                          <input                  <div>        const formattedSkills = skillsData.map((skill: any) => ({  const [cvData, setCvData] = useState<CVData>({}

                            type="date"

                            value={newExperience.endDate}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                            onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}

                            disabled={newExperience.current}                      Nombre          value: skill.id.toString(),

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

                          />                    </label>

                        </div>

                      </div>                    <input          label: skill.name,    personalInfo: { name: '', email: '', phone: '', address: '', summary: '' },

                      <div className="md:col-span-2">

                        <label className="flex items-center">                      type="text"

                          <input

                            type="checkbox"                      value={cvData.personalInfo.firstName}          area: skill.area

                            checked={newExperience.current}

                            onChange={(e) => setNewExperience({...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate})}                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}

                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"

                          />                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        }));    education: [],function MiCVContent() {

                          <span className="ml-2 text-sm text-gray-700">Trabajo aquí actualmente</span>

                        </label>                      placeholder="Tu nombre"

                      </div>

                    </div>                    />        setSelectedSkills(formattedSkills);

                    <div className="mb-4">

                      <label className="block text-sm font-medium text-gray-700 mb-1">                  </div>

                        Descripción

                      </label>                  <div>      }    experience: [],  const { user, token } = useAuthStore();

                      <textarea

                        value={newExperience.description}                    <label className="block text-sm font-medium text-gray-700 mb-1">

                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}

                        rows={3}                      Apellido    } catch (error) {

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Describe tus responsabilidades y logros..."                    </label>

                      />

                    </div>                    <input      console.error('Error loading student skills:', error);    skills: []  const router = useRouter();

                    <div className="flex justify-end space-x-2">

                      <button                      type="text"

                        onClick={() => setActiveSection(null)}

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"                      value={cvData.personalInfo.lastName}    }

                      >

                        Cancelar                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}

                      </button>

                      <button                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  };  });  

                        onClick={addExperience}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"                      placeholder="Tu apellido"

                      >

                        <Check className="mr-2 h-4 w-4" />                    />

                        Agregar

                      </button>                  </div>

                    </div>

                  </div>                  <div>  const loadCVData = async () => {  // Main CV data state

                )}

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                <div className="space-y-3">

                  {cvData.experience.map((exp) => (                      Email    if (!studentId) return;

                    <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">

                      <div className="flex justify-between items-start">                    </label>

                        <div className="flex-1">

                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>                    <input  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);  const [cvData, setCvData] = useState<CVData>({

                          <p className="text-gray-600">{exp.company}</p>

                          <p className="text-sm text-gray-500">                      type="email"

                            {exp.startDate && new Date(exp.startDate).getFullYear()}

                            {exp.startDate && (exp.endDate || exp.current) && ' - '}                      value={cvData.personalInfo.email}    try {

                            {exp.current ? 'Presente' : (exp.endDate && new Date(exp.endDate).getFullYear())}

                          </p>                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}

                          {exp.description && (

                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      // Load from localStorage first  const [selectedSkillsForAdd, setSelectedSkillsForAdd] = useState<any[]>([]);    personalInfo: {

                          )}

                        </div>                      placeholder="tu@email.com"

                        <button

                          onClick={() => removeExperience(exp.id!)}                    />      const savedCV = localStorage.getItem(`cv_${studentId}`);

                          className="text-red-600 hover:text-red-800 p-1"

                        >                  </div>

                          <Trash2 className="h-4 w-4" />

                        </button>                  <div>      if (savedCV) {  const [isLoading, setIsLoading] = useState(true);      name: '',

                      </div>

                    </div>                    <label className="block text-sm font-medium text-gray-700 mb-1">

                  ))}

                  {cvData.experience.length === 0 && (                      Teléfono        const cvData = JSON.parse(savedCV);

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna experiencia laboral aún. Haz clic en "Agregar Experiencia" para comenzar.                    </label>

                    </p>

                  )}                    <input        setPersonalInfo(cvData.personalInfo || personalInfo);  const [isLoadingSkills, setIsLoadingSkills] = useState(false);      email: '',

                </div>

              </div>                      type="tel"

            </div>

          </div>                      value={cvData.personalInfo.phone}        setEducation(cvData.education || []);

        </div>

      </div>                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}

    </AuthGuard>

  );                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        setExperience(cvData.experience || []);  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');      phone: '',

}
                      placeholder="+54 11 1234-5678"

                    />      }

                  </div>

                </div>      address: '',

                <div className="mt-4">

                  <label className="block text-sm font-medium text-gray-700 mb-1">      // Load student profile

                    Biografía

                  </label>      const response = await fetch(`/api/students/${studentId}`);  // Estados para formularios      summary: ''

                  <textarea

                    value={cvData.personalInfo.bio}      if (response.ok) {

                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}

                    rows={3}        const studentData = await response.json();  const [showEducationForm, setShowEducationForm] = useState(false);    },

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="Cuéntanos un poco sobre ti..."        setPersonalInfo(prev => ({

                  />

                </div>          ...prev,  const [showExperienceForm, setShowExperienceForm] = useState(false);    education: [],

              </div>

          grade: studentData.grade || '',

              {/* Skills */}

              <div className="border-b border-gray-200 pb-6">          course: studentData.course || '',  const [showSkillsManager, setShowSkillsManager] = useState(false);    experience: [],

                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">

                  <Award className="mr-2 h-5 w-5" />          description: studentData.description || prev.description

                  Habilidades

                </h2>        }));    skills: []

                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-700">      }

                    Selecciona tus habilidades (puedes crear nuevas)

                  </label>    } catch (error) {  const [newEducation, setNewEducation] = useState({  });

                  <CreatableSelect

                    isMulti      console.error('Error loading CV data:', error);

                    options={skillOptions}

                    value={selectedSkillOptions}    }    institution: '', degree: '', startDate: '', endDate: '', description: ''

                    onChange={handleSkillsChange}

                    placeholder="Buscar o crear habilidades..."  };

                    formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}

                    className="react-select-container"  });  // UI states

                    classNamePrefix="react-select"

                  />  const savePersonalInfo = async () => {

                  <p className="text-sm text-gray-500">

                    {cvData.skills.length} habilidad(es) seleccionada(s)    if (!studentId) return;  const [isEditing, setIsEditing] = useState(false);

                  </p>

                </div>

              </div>

    setSavingPersonal(true);  const [newExperience, setNewExperience] = useState({  const [editingSection, setEditingSection] = useState<string | null>(null);

              {/* Educación */}

              <div className="border-b border-gray-200 pb-6">    try {

                <div className="flex justify-between items-center mb-4">

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">      const response = await fetch(`/api/students/${studentId}`, {    company: '', position: '', startDate: '', endDate: '', description: ''  

                    <BookOpen className="mr-2 h-5 w-5" />

                    Educación        method: 'PUT',

                  </h2>

                  <button        headers: { 'Content-Type': 'application/json' },  });  // Skills management states

                    onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"        body: JSON.stringify({

                  >

                    <Plus className="mr-2 h-4 w-4" />          description: personalInfo.description,  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);

                    Agregar Educación

                  </button>          grade: personalInfo.grade,

                </div>

          course: personalInfo.course  // Función para obtener el ID del usuario  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

                {activeSection === 'education' && (

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">        })

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Educación</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">      });  const getUserId = () => {  const [selectedSkillsForAdd, setSelectedSkillsForAdd] = useState<any[]>([]);

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Institución *

                        </label>      if (response.ok) {    return user?.id || user?.userId || user?.studentId || 1;

                        <input

                          type="text"        // Save to localStorage

                          value={newEducation.institution}

                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}        const cvData = {  };  // Load initial data

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Universidad/Instituto"          personalInfo,

                        />

                      </div>          education,  useEffect(() => {

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">          experience,

                          Título *

                        </label>          lastUpdated: new Date().toISOString()  // Cargar datos iniciales    if (user) {

                        <input

                          type="text"        };

                          value={newEducation.degree}

                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}        localStorage.setItem(`cv_${studentId}`, JSON.stringify(cvData));  useEffect(() => {      loadCVData();

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Licenciatura, Maestría, etc."

                        />

                      </div>        toast.success('Información personal guardada');    if (user) {      loadAvailableSkills();

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">      } else {

                          Campo de estudio

                        </label>        toast.error('Error al guardar información personal');      loadInitialData();      loadStudentSkills();

                        <input

                          type="text"      }

                          value={newEducation.field}

                          onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}    } catch (error) {    }    }

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          placeholder="Informática, Ingeniería, etc."      console.error('Error saving personal info:', error);

                        />

                      </div>      toast.error('Error al guardar información personal');  }, [user]);  }, [user]);

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">

                        <div>    } finally {

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de inicio      setSavingPersonal(false);

                          </label>

                          <input    }

                            type="date"

                            value={newEducation.startDate}  };  const loadInitialData = async () => {  const loadCVData = async () => {

                            onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />

                        </div>  const saveSkills = async () => {    setIsLoading(true);    if (!user) return;

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">    if (!studentId) return;

                            Fecha de fin

                          </label>    try {    

                          <input

                            type="date"    setSavingSkills(true);

                            value={newEducation.endDate}

                            onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}    try {      await Promise.all([    try {

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />      // Remove existing skills

                        </div>

                      </div>      for (const skill of skills) {        loadCVData(),      const userWithLocation = user as any;

                    </div>

                    <div className="mb-4">        await fetch(`/api/students/${studentId}/skills/${skill.id}`, {

                      <label className="block text-sm font-medium text-gray-700 mb-1">

                        Descripción          method: 'DELETE'        loadAvailableSkills(),      

                      </label>

                      <textarea        });

                        value={newEducation.description}

                        onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}      }        loadStudentSkills()      // Initialize with user data

                        rows={3}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Describe tu experiencia educativa..."

                      />      // Add selected skills      ]);      const initialCVData: CVData = {

                    </div>

                    <div className="flex justify-end space-x-2">      for (const selectedSkill of selectedSkills) {

                      <button

                        onClick={() => setActiveSection(null)}        const skillId = parseInt(selectedSkill.value);    } catch (error) {        personalInfo: {

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"

                      >        const response = await fetch(`/api/students/${studentId}/skills`, {

                        Cancelar

                      </button>          method: 'POST',      console.error('Error loading initial data:', error);          name: user.username || user.name || '',

                      <button

                        onClick={addEducation}          headers: { 'Content-Type': 'application/json' },

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"

                      >          body: JSON.stringify({    } finally {          email: user.email || '',

                        <Check className="mr-2 h-4 w-4" />

                        Agregar            skillId,

                      </button>

                    </div>            proficiencyLevel: 2, // Default intermediate      setIsLoading(false);          phone: userWithLocation.phone || '',

                  </div>

                )}            yearsOfExperience: 1



                <div className="space-y-3">          })    }          address: userWithLocation.address || '',

                  {cvData.education.map((edu) => (

                    <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-4">        });

                      <div className="flex justify-between items-start">

                        <div className="flex-1">  };          summary: ''

                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>

                          <p className="text-gray-600">{edu.institution}</p>        if (!response.ok) {

                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}

                          {(edu.startDate || edu.endDate) && (          // If skill doesn't exist in database, create it first        },

                            <p className="text-sm text-gray-500">

                              {edu.startDate && new Date(edu.startDate).getFullYear()}          if (response.status === 404) {

                              {edu.startDate && edu.endDate && ' - '}

                              {edu.endDate && new Date(edu.endDate).getFullYear()}            const createSkillResponse = await fetch('/api/skills', {  // Cargar datos del CV        education: [],

                            </p>

                          )}              method: 'POST',

                          {edu.description && (

                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>              headers: { 'Content-Type': 'application/json' },  const loadCVData = async () => {        experience: [],

                          )}

                        </div>              body: JSON.stringify({

                        <button

                          onClick={() => removeEducation(edu.id!)}                name: selectedSkill.label,    if (!user) return;        skills: []

                          className="text-red-600 hover:text-red-800 p-1"

                        >                area: selectedSkill.area || 'General'

                          <Trash2 className="h-4 w-4" />

                        </button>              })          };

                      </div>

                    </div>            });

                  ))}

                  {cvData.education.length === 0 && (    const initialPersonalInfo = {

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna educación aún. Haz clic en "Agregar Educación" para comenzar.            if (createSkillResponse.ok) {

                    </p>

                  )}              const newSkill = await createSkillResponse.json();      name: user.username || user.name || '',      // Try to load saved CV data

                </div>

              </div>              await fetch(`/api/students/${studentId}/skills`, {



              {/* Experiencia Laboral */}                method: 'POST',      email: user.email || '',      const savedData = localStorage.getItem('cv-data');

              <div>

                <div className="flex justify-between items-center mb-4">                headers: { 'Content-Type': 'application/json' },

                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">

                    <Briefcase className="mr-2 h-5 w-5" />                body: JSON.stringify({      phone: '',      if (savedData) {

                    Experiencia Laboral

                  </h2>                  skillId: newSkill.id,

                  <button

                    onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}                  proficiencyLevel: 2,      address: '',        try {

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"

                  >                  yearsOfExperience: 1

                    <Plus className="mr-2 h-4 w-4" />

                    Agregar Experiencia                })      summary: ''          const parsedCV = JSON.parse(savedData);

                  </button>

                </div>              });



                {activeSection === 'experience' && (            }    };          setCvData({

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">

                    <h3 className="text-lg font-medium text-gray-900 mb-3">Nueva Experiencia</h3>          }

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                      <div>        }            ...parsedCV,

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Empresa *      }

                        </label>

                        <input    const savedData = localStorage.getItem(`cv-data-${getUserId()}`);            personalInfo: {

                          type="text"

                          value={newExperience.company}      await loadStudentSkills(); // Reload skills

                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      toast.success('Habilidades guardadas');    if (savedData) {              ...parsedCV.personalInfo,

                          placeholder="Nombre de la empresa"

                        />    } catch (error) {

                      </div>

                      <div>      console.error('Error saving skills:', error);      try {              name: parsedCV.personalInfo.name || user.username || user.name || '',

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                          Cargo *      toast.error('Error al guardar habilidades');

                        </label>

                        <input    } finally {        const parsedCV = JSON.parse(savedData);              email: parsedCV.personalInfo.email || user.email || '',

                          type="text"

                          value={newExperience.position}      setSavingSkills(false);

                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}

                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    }        setCvData(prev => ({            }

                          placeholder="Tu cargo o posición"

                        />  };

                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 gap-4">          ...parsedCV,          });

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-1">  const addEducation = async () => {

                            Fecha de inicio

                          </label>    if (!newEducation.institution || !newEducation.degree) {          personalInfo: {        } catch (e) {

                          <input

                            type="date"      toast.error('Por favor completa institución y título');

                            value={newExperience.startDate}

                            onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}      return;            ...parsedCV.personalInfo,          console.log('Error parsing saved CV data, using initial data');

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                          />    }

                        </div>

                        <div>            name: parsedCV.personalInfo.name || initialPersonalInfo.name,          setCvData(initialCVData);

                          <label className="block text-sm font-medium text-gray-700 mb-1">

                            Fecha de fin    setSavingEducation(true);

                          </label>

                          <input    try {            email: parsedCV.personalInfo.email || initialPersonalInfo.email,        }

                            type="date"

                            value={newExperience.endDate}      const updatedEducation = [...education, { ...newEducation, id: Date.now().toString() }];

                            onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}

                            disabled={newExperience.current}      setEducation(updatedEducation);          }      } else {

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

                          />

                        </div>

                      </div>      // Save to localStorage        }));        setCvData(initialCVData);

                      <div className="md:col-span-2">

                        <label className="flex items-center">      const cvData = {

                          <input

                            type="checkbox"        personalInfo,      } catch (e) {      }

                            checked={newExperience.current}

                            onChange={(e) => setNewExperience({...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate})}        education: updatedEducation,

                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"

                          />        experience,        setCvData(prev => ({ ...prev, personalInfo: initialPersonalInfo }));    } catch (error) {

                          <span className="ml-2 text-sm text-gray-700">Trabajo aquí actualmente</span>

                        </label>        lastUpdated: new Date().toISOString()

                      </div>

                    </div>      };      }      console.error('Error loading CV data:', error);

                    <div className="mb-4">

                      <label className="block text-sm font-medium text-gray-700 mb-1">      localStorage.setItem(`cv_${studentId}`, JSON.stringify(cvData));

                        Descripción

                      </label>    } else {    }

                      <textarea

                        value={newExperience.description}      // Reset form

                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}

                        rows={3}      setNewEducation({      setCvData(prev => ({ ...prev, personalInfo: initialPersonalInfo }));  };

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Describe tus responsabilidades y logros..."        institution: '',

                      />

                    </div>        degree: '',    }

                    <div className="flex justify-end space-x-2">

                      <button        field: '',

                        onClick={() => setActiveSection(null)}

                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"        startDate: '',  };  const loadAvailableSkills = async () => {

                      >

                        Cancelar        endDate: '',

                      </button>

                      <button        description: ''    if (!user?.studentId) return;

                        onClick={addExperience}

                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"      });

                      >

                        <Check className="mr-2 h-4 w-4" />  // Cargar skills disponibles    

                        Agregar

                      </button>      toast.success('Educación agregada');

                    </div>

                  </div>    } catch (error) {  const loadAvailableSkills = async () => {    setIsLoadingSkills(true);

                )}

      console.error('Error adding education:', error);

                <div className="space-y-3">

                  {cvData.experience.map((exp) => (      toast.error('Error al agregar educación');    setIsLoadingSkills(true);    try {

                    <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">

                      <div className="flex justify-between items-start">    } finally {

                        <div className="flex-1">

                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>      setSavingEducation(false);    try {      const response = await fetch('http://localhost:5000/api/skills', {

                          <p className="text-gray-600">{exp.company}</p>

                          <p className="text-sm text-gray-500">    }

                            {exp.startDate && new Date(exp.startDate).getFullYear()}

                            {exp.startDate && (exp.endDate || exp.current) && ' - '}  };      console.log('Loading available skills...');        headers: {

                            {exp.current ? 'Presente' : (exp.endDate && new Date(exp.endDate).getFullYear())}

                          </p>

                          {exp.description && (

                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>  const addExperience = async () => {      const response = await fetch('http://localhost:5000/api/skills', {          'Authorization': `Bearer ${token}`,

                          )}

                        </div>    if (!newExperience.company || !newExperience.position) {

                        <button

                          onClick={() => removeExperience(exp.id!)}      toast.error('Por favor completa empresa y posición');        headers: {          'Content-Type': 'application/json'

                          className="text-red-600 hover:text-red-800 p-1"

                        >      return;

                          <Trash2 className="h-4 w-4" />

                        </button>    }          'Authorization': `Bearer ${token}`,        }

                      </div>

                    </div>

                  ))}

                  {cvData.experience.length === 0 && (    setSavingExperience(true);          'Content-Type': 'application/json'      });

                    <p className="text-gray-500 text-center py-4">

                      No has agregado ninguna experiencia laboral aún. Haz clic en "Agregar Experiencia" para comenzar.    try {

                    </p>

                  )}      const updatedExperience = [...experience, { ...newExperience, id: Date.now().toString() }];        }      

                </div>

              </div>      setExperience(updatedExperience);

            </div>

          </div>      });      if (response.ok) {

        </div>

      </div>      // Save to localStorage

    </AuthGuard>

  );      const cvData = {              const data = await response.json();

}
        personalInfo,

        education,      if (response.ok) {        setAvailableSkills(data || []);

        experience: updatedExperience,

        lastUpdated: new Date().toISOString()        const data = await response.json();      }

      };

      localStorage.setItem(`cv_${studentId}`, JSON.stringify(cvData));        console.log('Available skills loaded:', data.length, 'skills');    } catch (error) {



      // Reset form        setAvailableSkills(data || []);      console.error('Error loading available skills:', error);

      setNewExperience({

        company: '',      } else {    } finally {

        position: '',

        startDate: '',        console.error('Failed to load available skills:', response.status);      setIsLoadingSkills(false);

        endDate: '',

        description: '',      }    }

        current: false

      });    } catch (error) {  };



      toast.success('Experiencia agregada');      console.error('Error loading available skills:', error);

    } catch (error) {

      console.error('Error adding experience:', error);    } finally {  const loadStudentSkills = async () => {

      toast.error('Error al agregar experiencia');

    } finally {      setIsLoadingSkills(false);    if (!user?.studentId) return;

      setSavingExperience(false);

    }    }    

  };

  };    try {

  const removeEducation = (index: number) => {

    const updatedEducation = education.filter((_, i) => i !== index);      const response = await fetch(`http://localhost:5000/api/students/${user.studentId}/skills`, {

    setEducation(updatedEducation);

  // Cargar skills del estudiante        headers: {

    const cvData = {

      personalInfo,  const loadStudentSkills = async () => {          'Authorization': `Bearer ${token}`,

      education: updatedEducation,

      experience,    const userId = getUserId();          'Content-Type': 'application/json'

      lastUpdated: new Date().toISOString()

    };    try {        }

    localStorage.setItem(`cv_${studentId}`, JSON.stringify(cvData));

    toast.success('Educación eliminada');      console.log('Loading student skills for user:', userId);      });

  };

      const response = await fetch(`http://localhost:5000/api/students/${userId}/skills`, {      

  const removeExperience = (index: number) => {

    const updatedExperience = experience.filter((_, i) => i !== index);        headers: {      if (response.ok) {

    setExperience(updatedExperience);

          'Authorization': `Bearer ${token}`,        const data = await response.json();

    const cvData = {

      personalInfo,          'Content-Type': 'application/json'        setCvData(prev => ({

      education,

      experience: updatedExperience,        }          ...prev,

      lastUpdated: new Date().toISOString()

    };      });          skills: data.skills || []

    localStorage.setItem(`cv_${studentId}`, JSON.stringify(cvData));

    toast.success('Experiencia eliminada');              }));

  };

      if (response.ok) {      }

  if (loading) {

    return (        const data = await response.json();    } catch (error) {

      <div className="flex items-center justify-center min-h-screen">

        <div className="text-lg">Cargando...</div>        console.log('Student skills loaded:', data.skills?.length || 0, 'skills');      console.error('Error loading student skills:', error);

      </div>

    );        setCvData(prev => ({    }

  }

          ...prev,  };

  return (

    <div className="container mx-auto p-6 max-w-6xl">          skills: data.skills || []

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi CV</h1>        }));  const addSkillToStudent = async (skillId: number, skillData: any) => {

        <p className="text-gray-600">Completa tu currículum para postular a ofertas de trabajo</p>

      </div>      } else {    if (!user?.studentId) return;



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        console.error('Failed to load student skills:', response.status);    

        {/* Información Personal */}

        <Card>      }    try {

          <CardHeader>

            <CardTitle className="flex items-center gap-2">    } catch (error) {      const response = await fetch(`http://localhost:5000/api/students/${user.studentId}/skills`, {

              <User className="h-5 w-5" />

              Información Personal      console.error('Error loading student skills:', error);        method: 'POST',

            </CardTitle>

          </CardHeader>    }        headers: {

          <CardContent className="space-y-4">

            <div className="grid grid-cols-2 gap-4">  };          'Authorization': `Bearer ${token}`,

              <div>

                <Label htmlFor="grade">Grado</Label>          'Content-Type': 'application/json'

                <Input

                  id="grade"  // Guardar CV        },

                  value={personalInfo.grade}

                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, grade: e.target.value }))}  const saveCVData = () => {        body: JSON.stringify({

                  placeholder="Ej: 2º DAM"

                />    try {          skillId,

              </div>

              <div>      setSaveStatus('saving');          ...skillData

                <Label htmlFor="course">Curso</Label>

                <Input      localStorage.setItem(`cv-data-${getUserId()}`, JSON.stringify(cvData));        })

                  id="course"

                  value={personalInfo.course}      setSaveStatus('success');      });

                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, course: e.target.value }))}

                  placeholder="Ej: Desarrollo de Aplicaciones Multiplataforma"      setTimeout(() => setSaveStatus('idle'), 2000);

                />

              </div>    } catch (error) {      if (response.ok) {

            </div>

            <div>      console.error('Error saving CV data:', error);        await loadStudentSkills();

              <Label htmlFor="description">Descripción Personal</Label>

              <Textarea      setSaveStatus('error');        return true;

                id="description"

                value={personalInfo.description}      setTimeout(() => setSaveStatus('idle'), 2000);      }

                onChange={(e) => setPersonalInfo(prev => ({ ...prev, description: e.target.value }))}

                placeholder="Describe tus objetivos profesionales, fortalezas y experiencia..."    }    } catch (error) {

                rows={4}

              />  };      console.error('Error adding skill to student:', error);

            </div>

            <Button    }

              onClick={savePersonalInfo}

              disabled={savingPersonal}  // Agregar educación    return false;

              className="w-full"

            >  const addEducation = () => {  };

              <Save className="h-4 w-4 mr-2" />

              {savingPersonal ? 'Guardando...' : 'Guardar Información'}    if (!newEducation.institution.trim() || !newEducation.degree.trim()) {

            </Button>

          </CardContent>      alert('Por favor completa los campos obligatorios');  const createAndAddNewSkill = async (skillName: string) => {

        </Card>

      return;    if (!user?.studentId || !skillName.trim()) return false;

        {/* Habilidades */}

        <Card>    }    

          <CardHeader>

            <CardTitle className="flex items-center gap-2">    try {

              <Award className="h-5 w-5" />

              Habilidades    setCvData(prev => ({      // First create the skill

            </CardTitle>

          </CardHeader>      ...prev,      const createResponse = await fetch('http://localhost:5000/api/skills', {

          <CardContent className="space-y-4">

            <div>      education: [...prev.education, { ...newEducation, id: Date.now() }]        method: 'POST',

              <Label>Habilidades</Label>

              <CreatableSelect    }));        headers: {

                value={selectedSkills}

                onChange={setSelectedSkills}          'Content-Type': 'application/json',

                options={availableSkills.map(skill => ({

                  value: skill.id.toString(),    setNewEducation({ institution: '', degree: '', startDate: '', endDate: '', description: '' });          'Authorization': `Bearer ${token}`

                  label: skill.name,

                  area: skill.area    setShowEducationForm(false);        },

                }))}

                placeholder="Selecciona o agrega habilidades..."    setTimeout(saveCVData, 100);        body: JSON.stringify({

                isMulti

              />  };          name: skillName.trim(),

            </div>

            {skills.length > 0 && (          category: 'technical',

              <div>

                <Label>Habilidades actuales:</Label>  // Agregar experiencia          area: 'other',

                <div className="flex flex-wrap gap-2 mt-2">

                  {skills.map((skill) => (  const addExperience = () => {          description: `Skill created by user: ${skillName}`,

                    <Badge key={skill.id} variant="secondary">

                      {skill.name}    if (!newExperience.company.trim() || !newExperience.position.trim()) {          demandLevel: 'medium'

                    </Badge>

                  ))}      alert('Por favor completa los campos obligatorios');        })

                </div>

              </div>      return;      });

            )}

            <Button    }      

              onClick={saveSkills}

              disabled={savingSkills}      if (createResponse.ok) {

              className="w-full"

            >    setCvData(prev => ({        const newSkillResponse = await createResponse.json();

              <Save className="h-4 w-4 mr-2" />

              {savingSkills ? 'Guardando...' : 'Guardar Habilidades'}      ...prev,        

            </Button>

          </CardContent>      experience: [...prev.experience, { ...newExperience, id: Date.now() }]        // Then add it to the student

        </Card>

    }));        const success = await addSkillToStudent(newSkillResponse.skill.id, {

        {/* Educación */}

        <Card>          proficiencyLevel: 'beginner',

          <CardHeader>

            <CardTitle className="flex items-center gap-2">    setNewExperience({ company: '', position: '', startDate: '', endDate: '', description: '' });          yearsOfExperience: 0,

              <GraduationCap className="h-5 w-5" />

              Educación    setShowExperienceForm(false);          notes: ''

            </CardTitle>

          </CardHeader>    setTimeout(saveCVData, 100);        });

          <CardContent className="space-y-4">

            {/* Lista de educación existente */}  };        

            {education.map((edu, index) => (

              <div key={edu.id} className="border rounded-lg p-3 bg-gray-50">        if (success) {

                <div className="flex justify-between items-start">

                  <div>  // Eliminar educación          await loadAvailableSkills(); // Refresh available skills

                    <h4 className="font-semibold">{edu.degree}</h4>

                    <p className="text-sm text-gray-600">{edu.institution}</p>  const removeEducation = (index: number) => {          return true;

                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>

                  </div>    setCvData(prev => ({        }

                  <Button

                    variant="ghost"      ...prev,      }

                    size="sm"

                    onClick={() => removeEducation(index)}      education: prev.education.filter((_, i) => i !== index)    } catch (error) {

                  >

                    <X className="h-4 w-4" />    }));      console.error('Error creating and adding new skill:', error);

                  </Button>

                </div>    setTimeout(saveCVData, 100);    }

              </div>

            ))}  };    return false;



            {/* Formulario para agregar educación */}  };

            <div className="border-t pt-4 space-y-3">

              <div className="grid grid-cols-2 gap-3">  // Eliminar experiencia

                <div>

                  <Label htmlFor="institution">Institución</Label>  const removeExperience = (index: number) => {  const removeSkillFromStudent = async (skillId: number) => {

                  <Input

                    id="institution"    setCvData(prev => ({    if (!user?.studentId) return;

                    value={newEducation.institution}

                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}      ...prev,    

                    placeholder="Nombre de la institución"

                  />      experience: prev.experience.filter((_, i) => i !== index)    try {

                </div>

                <div>    }));      const response = await fetch(`http://localhost:5000/api/students/${user.studentId}/skills/${skillId}`, {

                  <Label htmlFor="degree">Título</Label>

                  <Input    setTimeout(saveCVData, 100);        method: 'DELETE',

                    id="degree"

                    value={newEducation.degree}  };        headers: {

                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}

                    placeholder="Ej: Grado en Informática"          'Authorization': `Bearer ${token}`,

                  />

                </div>  // Funciones de skills          'Content-Type': 'application/json'

              </div>

              <div>  const addSkillToStudent = async (skillId: number, details: any) => {        }

                <Label htmlFor="field">Campo de estudio</Label>

                <Input    const userId = getUserId();      });

                  id="field"

                  value={newEducation.field}    try {

                  onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}

                  placeholder="Ej: Desarrollo de Software"      const response = await fetch(`http://localhost:5000/api/students/${userId}/skills`, {      if (response.ok) {

                />

              </div>        method: 'POST',        await loadStudentSkills();

              <div className="grid grid-cols-2 gap-3">

                <div>        headers: {        await loadAvailableSkills();

                  <Label htmlFor="edu-start">Fecha inicio</Label>

                  <Input          'Authorization': `Bearer ${token}`,      }

                    id="edu-start"

                    type="date"          'Content-Type': 'application/json'    } catch (error) {

                    value={newEducation.startDate}

                    onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}        },      console.error('Error removing skill from student:', error);

                  />

                </div>        body: JSON.stringify({ skillId, ...details })    }

                <div>

                  <Label htmlFor="edu-end">Fecha fin</Label>      });  };

                  <Input

                    id="edu-end"

                    type="date"

                    value={newEducation.endDate}      if (response.ok) {  const handleAddSelectedSkills = async () => {

                    onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}

                  />        await loadStudentSkills();    if (selectedSkillsForAdd.length === 0) return;

                </div>

              </div>        return true;

              <Button

                onClick={addEducation}      }    try {

                disabled={savingEducation}

                className="w-full"      return false;      let addedCount = 0;

              >

                <Plus className="h-4 w-4 mr-2" />    } catch (error) {      

                {savingEducation ? 'Agregando...' : 'Agregar Educación'}

              </Button>      console.error('Error adding skill:', error);      for (const skill of selectedSkillsForAdd) {

            </div>

          </CardContent>      return false;        if (skill.isNew) {

        </Card>

    }          // Crear nueva skill

        {/* Experiencia */}

        <Card>  };          const success = await createAndAddNewSkill(skill.label);

          <CardHeader>

            <CardTitle className="flex items-center gap-2">          if (success) addedCount++;

              <Briefcase className="h-5 w-5" />

              Experiencia Laboral  const createAndAddNewSkill = async (skillName: string) => {        } else {

            </CardTitle>

          </CardHeader>    if (!skillName.trim()) return false;          // Agregar skill existente

          <CardContent className="space-y-4">

            {/* Lista de experiencia existente */}          const success = await addSkillToStudent(skill.value, {

            {experience.map((exp, index) => (

              <div key={exp.id} className="border rounded-lg p-3 bg-gray-50">    try {            proficiencyLevel: 'beginner',

                <div className="flex justify-between items-start">

                  <div>      const createResponse = await fetch('http://localhost:5000/api/skills', {            yearsOfExperience: 0,

                    <h4 className="font-semibold">{exp.position}</h4>

                    <p className="text-sm text-gray-600">{exp.company}</p>        method: 'POST',            notes: ''

                    <p className="text-xs text-gray-500">

                      {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}        headers: {          });

                    </p>

                  </div>          'Authorization': `Bearer ${token}`,          if (success) addedCount++;

                  <Button

                    variant="ghost"          'Content-Type': 'application/json'        }

                    size="sm"

                    onClick={() => removeExperience(index)}        },      }

                  >

                    <X className="h-4 w-4" />        body: JSON.stringify({      

                  </Button>

                </div>          name: skillName.trim(),      if (addedCount > 0) {

              </div>

            ))}          category: 'technical',        setSelectedSkillsForAdd([]);



            {/* Formulario para agregar experiencia */}          description: `Skill creada por usuario: ${skillName}`        await loadStudentSkills();

            <div className="border-t pt-4 space-y-3">

              <div className="grid grid-cols-2 gap-3">        })        await loadAvailableSkills();

                <div>

                  <Label htmlFor="company">Empresa</Label>      });        alert(`Se agregaron ${addedCount} habilidad(es) exitosamente`);

                  <Input

                    id="company"      }

                    value={newExperience.company}

                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}      if (createResponse.ok) {    } catch (error) {

                    placeholder="Nombre de la empresa"

                  />        const newSkill = await createResponse.json();      console.error('Error adding selected skills:', error);

                </div>

                <div>        const success = await addSkillToStudent(newSkill.id, {      alert('Error al agregar las habilidades');

                  <Label htmlFor="position">Posición</Label>

                  <Input          proficiencyLevel: 'beginner',    }

                    id="position"

                    value={newExperience.position}          yearsOfExperience: 0,  };

                    onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}

                    placeholder="Cargo desempeñado"          notes: ''

                  />

                </div>        });  // Calculate CV completion percentage

              </div>

              <div className="grid grid-cols-2 gap-3">  const calculateCompletion = () => {

                <div>

                  <Label htmlFor="exp-start">Fecha inicio</Label>        if (success) {    const { personalInfo, education, experience, skills } = cvData;

                  <Input

                    id="exp-start"          await loadAvailableSkills();    

                    type="date"

                    value={newExperience.startDate}          return true;    const completionFactors = [

                    onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}

                  />        }      personalInfo.name ? 10 : 0,          // Nombre (10%)

                </div>

                <div>      }      personalInfo.email ? 10 : 0,         // Email (10%)

                  <Label htmlFor="exp-end">Fecha fin</Label>

                  <Input      return false;      personalInfo.phone ? 10 : 0,         // Teléfono (10%)

                    id="exp-end"

                    type="date"    } catch (error) {      personalInfo.address ? 10 : 0,       // Dirección (10%)

                    value={newExperience.endDate}

                    onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}      console.error('Error creating and adding skill:', error);      personalInfo.summary ? 15 : 0,       // Resumen (15%)

                    disabled={newExperience.current}

                  />      return false;      education.length > 0 ? 15 : 0,       // Educación (15%)

                </div>

              </div>    }      experience.length > 0 ? 15 : 0,      // Experiencia (15%)

              <div className="flex items-center space-x-2">

                <input  };      skills.length > 0 ? 15 : 0           // Habilidades (15%)

                  type="checkbox"

                  id="current"    ];

                  checked={newExperience.current}

                  onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}  const removeSkillFromStudent = async (skillId: number) => {

                />

                <Label htmlFor="current">Trabajo actual</Label>    const userId = getUserId();    return completionFactors.reduce((total, factor) => total + factor, 0);

              </div>

              <div>    try {  };

                <Label htmlFor="exp-description">Descripción</Label>

                <Textarea      const response = await fetch(`http://localhost:5000/api/students/${userId}/skills/${skillId}`, {

                  id="exp-description"

                  value={newExperience.description}        method: 'DELETE',  const completionPercentage = calculateCompletion();

                  onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}

                  placeholder="Describe tus responsabilidades y logros..."        headers: {

                  rows={3}

                />          'Authorization': `Bearer ${token}`,  return (

              </div>

              <Button          'Content-Type': 'application/json'    <div className="min-h-screen bg-gray-50 py-8">

                onClick={addExperience}

                disabled={savingExperience}        }      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                className="w-full"

              >      });        

                <Plus className="h-4 w-4 mr-2" />

                {savingExperience ? 'Agregando...' : 'Agregar Experiencia'}        {/* Header */}

              </Button>

            </div>      if (response.ok) {        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">

          </CardContent>

        </Card>        await loadStudentSkills();          <div className="flex items-center justify-between">

      </div>

        await loadAvailableSkills();            <div>

      {/* Resumen del CV */}

      <Card className="mt-6">      }              <h1 className="text-3xl font-bold text-gray-900">Mi Curriculum Vitae</h1>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">    } catch (error) {              <p className="text-gray-600 mt-1">

            <FileText className="h-5 w-5" />

            Resumen de tu CV      console.error('Error removing skill:', error);                Gestiona tu información profesional y habilidades

          </CardTitle>

        </CardHeader>    }              </p>

        <CardContent>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">  };            </div>

            <div>

              <div className="text-2xl font-bold text-blue-600">{skills.length}</div>            <div className="text-right">

              <div className="text-sm text-gray-600">Habilidades</div>

            </div>  const handleAddSelectedSkills = async () => {              <div className="flex items-center gap-3">

            <div>

              <div className="text-2xl font-bold text-green-600">{education.length}</div>    if (selectedSkillsForAdd.length === 0) return;                <div className="text-sm text-gray-500">Completado</div>

              <div className="text-sm text-gray-600">Educación</div>

            </div>                <div className="flex items-center gap-2">

            <div>

              <div className="text-2xl font-bold text-purple-600">{experience.length}</div>    try {                  <div className="w-32 bg-gray-200 rounded-full h-2">

              <div className="text-sm text-gray-600">Experiencias</div>

            </div>      let addedCount = 0;                    <div 

            <div>

              <div className="text-2xl font-bold text-orange-600">      for (const skill of selectedSkillsForAdd) {                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"

                {personalInfo.description ? '✓' : '✗'}

              </div>        if (skill.isNew) {                      style={{ width: `${completionPercentage}%` }}

              <div className="text-sm text-gray-600">Descripción</div>

            </div>          const success = await createAndAddNewSkill(skill.label);                    ></div>

          </div>

        </CardContent>          if (success) addedCount++;                  </div>

      </Card>

    </div>        } else {                  <span className="text-lg font-bold text-gray-900">{completionPercentage}%</span>

  );

}          const success = await addSkillToStudent(skill.value, {                </div>

            proficiencyLevel: 'beginner',              </div>

            yearsOfExperience: 0,            </div>

            notes: ''          </div>

          });        </div>

          if (success) addedCount++;

        }        {/* Información Académica */}

      }        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">

                <div className="flex items-center justify-between mb-6">

      if (addedCount > 0) {            <div className="flex items-center gap-3">

        setSelectedSkillsForAdd([]);              <BookOpen className="h-6 w-6 text-blue-600" />

        alert(`Se agregaron ${addedCount} habilidad(es) exitosamente`);              <h2 className="text-xl font-semibold text-gray-900">

      }                Información Académica

    } catch (error) {              </h2>

      console.error('Error adding selected skills:', error);            </div>

      alert('Error al agregar las habilidades');            <button

    }              onClick={() => {

  };                setEditingSection(editingSection === 'education' ? null : 'education');

              }}

  // Calcular porcentaje de completitud              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"

  const calculateCompletion = () => {            >

    const { personalInfo, education, experience, skills } = cvData;              {editingSection === 'education' ? (

    const factors = [                <>

      personalInfo.name ? 15 : 0,                  <X className="h-4 w-4" />

      personalInfo.email ? 15 : 0,                  Cancelar

      personalInfo.summary ? 20 : 0,                </>

      education.length > 0 ? 20 : 0,              ) : (

      experience.length > 0 ? 15 : 0,                <>

      skills.length > 0 ? 15 : 0                  <Edit className="h-4 w-4" />

    ];                  Gestionar

    return factors.reduce((total, factor) => total + factor, 0);                </>

  };              )}

            </button>

  const completionPercentage = calculateCompletion();          </div>



  if (isLoading) {          <div className="space-y-6">

    return (            {cvData.education.length === 0 ? (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">              <div className="text-center py-12 text-gray-500">

        <div className="text-center">                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>                <p className="text-lg mb-2">No has agregado información académica</p>

          <p className="text-gray-600">Cargando tu CV...</p>                <p className="text-sm mb-4">

        </div>                  Agrega tu educación para mejorar tu perfil profesional

      </div>                </p>

    );                <button

  }                  onClick={() => setEditingSection('education')}

                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

  return (                >

    <div className="min-h-screen bg-gray-50 py-6">                  Agregar primera educación

      <div className="max-w-5xl mx-auto px-4">                </button>

                      </div>

        {/* Header con estado de guardado */}            ) : (

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">              <div className="space-y-4">

          <div className="flex items-center justify-between">                {cvData.education.map((edu, index) => (

            <div>                  <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">

              <h1 className="text-2xl font-bold text-gray-900">Mi Curriculum Vitae</h1>                    <div className="flex items-start justify-between mb-2">

              <p className="text-gray-600">Completado: {completionPercentage}%</p>                      <div className="flex-1">

            </div>                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>

                                    <p className="text-blue-600 font-medium">{edu.institution}</p>

            <div className="flex items-center gap-4">                        <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate || 'Presente'}</p>

              {/* Indicador de estado */}                        {edu.description && (

              <div className="flex items-center gap-2">                          <p className="text-sm text-gray-700 mt-2">{edu.description}</p>

                {saveStatus === 'saving' && (                        )}

                  <>                      </div>

                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>                      {editingSection === 'education' && (

                    <span className="text-sm text-blue-600">Guardando...</span>                        <button

                  </>                          onClick={() => {

                )}                            const newEducation = cvData.education.filter((_, i) => i !== index);

                {saveStatus === 'success' && (                            setCvData(prev => ({ ...prev, education: newEducation }));

                  <>                          }}

                    <Check className="h-4 w-4 text-green-600" />                          className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center"

                    <span className="text-sm text-green-600">Guardado</span>                          title="Eliminar educación"

                  </>                        >

                )}                          <X className="h-4 w-4" />

                {saveStatus === 'error' && (                        </button>

                  <>                      )}

                    <AlertCircle className="h-4 w-4 text-red-600" />                    </div>

                    <span className="text-sm text-red-600">Error</span>                  </div>

                  </>                ))}

                )}              </div>

              </div>            )}

              

              {/* Botón guardar manual */}            {editingSection === 'education' && (

              <button              <div className="border-t pt-6">

                onClick={saveCVData}                <div className="bg-blue-50 rounded-lg p-6">

                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"                  <div className="flex items-center gap-3 mb-4">

              >                    <BookOpen className="h-5 w-5 text-blue-600" />

                <Save className="h-4 w-4" />                    <h3 className="font-medium text-gray-900">

                Guardar CV                      Agregar nueva educación

              </button>                    </h3>

            </div>                  </div>

          </div>                  

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Barra de progreso */}                    <div>

          <div className="mt-4">                      <label className="block text-sm font-medium text-gray-700 mb-2">

            <div className="w-full bg-gray-200 rounded-full h-2">                        Institución

              <div                       </label>

                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"                      <input

                style={{ width: `${completionPercentage}%` }}                        type="text"

              ></div>                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

            </div>                        placeholder="Universidad, Colegio, Instituto..."

          </div>                      />

        </div>                    </div>

                    <div>

        {/* Grid de secciones */}                      <label className="block text-sm font-medium text-gray-700 mb-2">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">                        Título/Grado

                                </label>

          {/* Información Académica */}                      <input

          <div className="bg-white rounded-lg shadow-sm p-6">                        type="text"

            <div className="flex items-center justify-between mb-4">                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

              <div className="flex items-center gap-3">                        placeholder="Licenciatura, Técnico, Bachiller..."

                <BookOpen className="h-6 w-6 text-blue-600" />                      />

                <h2 className="text-xl font-semibold">Educación</h2>                    </div>

              </div>                    <div>

              <button                      <label className="block text-sm font-medium text-gray-700 mb-2">

                onClick={() => setShowEducationForm(!showEducationForm)}                        Fecha de inicio

                className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"                      </label>

              >                      <input

                <Plus className="h-4 w-4" />                        type="month"

                Agregar                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

              </button>                      />

            </div>                    </div>

                    <div>

            {/* Lista de educación */}                      <label className="block text-sm font-medium text-gray-700 mb-2">

            <div className="space-y-3 mb-4">                        Fecha de finalización

              {cvData.education.length === 0 ? (                      </label>

                <p className="text-gray-500 text-center py-8">No has agregado información académica</p>                      <input

              ) : (                        type="month"

                cvData.education.map((edu, index) => (                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

                  <div key={index} className="border rounded-lg p-4">                      />

                    <div className="flex justify-between items-start">                    </div>

                      <div>                    <div className="md:col-span-2">

                        <h3 className="font-medium">{edu.degree}</h3>                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        <p className="text-blue-600 text-sm">{edu.institution}</p>                        Descripción (opcional)

                        <p className="text-gray-500 text-sm">{edu.startDate} - {edu.endDate || 'Presente'}</p>                      </label>

                      </div>                      <textarea

                      <button                        rows={3}

                        onClick={() => removeEducation(index)}                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"

                        className="text-red-500 hover:bg-red-50 p-1 rounded"                        placeholder="Detalles sobre tu educación, logros, especialización..."

                      >                      />

                        <X className="h-4 w-4" />                    </div>

                      </button>                    <div className="md:col-span-2">

                    </div>                      <button

                  </div>                        onClick={() => {

                ))                          // TODO: Implement add education logic

              )}                          alert('Funcionalidad en desarrollo');

            </div>                        }}

                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"

            {/* Formulario de educación */}                      >

            {showEducationForm && (                        <Plus className="h-4 w-4" />

              <div className="border-t pt-4">                        Agregar educación

                <div className="space-y-3">                      </button>

                  <input                    </div>

                    type="text"                  </div>

                    placeholder="Institución *"                </div>

                    value={newEducation.institution}              </div>

                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}            )}

                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"          </div>

                  />        </div>

                  <input

                    type="text"        {/* Experiencia Laboral */}

                    placeholder="Título/Grado *"        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">

                    value={newEducation.degree}          <div className="flex items-center justify-between mb-6">

                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}            <div className="flex items-center gap-3">

                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"              <Briefcase className="h-6 w-6 text-green-600" />

                  />              <h2 className="text-xl font-semibold text-gray-900">

                  <div className="grid grid-cols-2 gap-3">                Experiencia Laboral

                    <input              </h2>

                      type="month"            </div>

                      value={newEducation.startDate}            <button

                      onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}              onClick={() => {

                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"                setEditingSection(editingSection === 'experience' ? null : 'experience');

                    />              }}

                    <input              className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"

                      type="month"            >

                      value={newEducation.endDate}              {editingSection === 'experience' ? (

                      onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}                <>

                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"                  <X className="h-4 w-4" />

                    />                  Cancelar

                  </div>                </>

                  <div className="flex gap-2">              ) : (

                    <button                <>

                      onClick={addEducation}                  <Edit className="h-4 w-4" />

                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"                  Gestionar

                    >                </>

                      <Save className="h-4 w-4" />              )}

                      Guardar            </button>

                    </button>          </div>

                    <button

                      onClick={() => setShowEducationForm(false)}          <div className="space-y-6">

                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"            {cvData.experience.length === 0 ? (

                    >              <div className="text-center py-12 text-gray-500">

                      Cancelar                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />

                    </button>                <p className="text-lg mb-2">No has agregado experiencia laboral</p>

                  </div>                <p className="text-sm mb-4">

                </div>                  La experiencia laboral es clave para tu perfil profesional

              </div>                </p>

            )}                <button

          </div>                  onClick={() => setEditingSection('experience')}

                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"

          {/* Experiencia Laboral */}                >

          <div className="bg-white rounded-lg shadow-sm p-6">                  Agregar primera experiencia

            <div className="flex items-center justify-between mb-4">                </button>

              <div className="flex items-center gap-3">              </div>

                <Briefcase className="h-6 w-6 text-green-600" />            ) : (

                <h2 className="text-xl font-semibold">Experiencia</h2>              <div className="space-y-4">

              </div>                {cvData.experience.map((exp, index) => (

              <button                  <div key={index} className="border rounded-lg p-4 hover:border-green-300 transition-colors">

                onClick={() => setShowExperienceForm(!showExperienceForm)}                    <div className="flex items-start justify-between mb-2">

                className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"                      <div className="flex-1">

              >                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>

                <Plus className="h-4 w-4" />                        <p className="text-green-600 font-medium">{exp.company}</p>

                Agregar                        <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Presente'}</p>

              </button>                        {exp.description && (

            </div>                          <p className="text-sm text-gray-700 mt-2">{exp.description}</p>

                        )}

            {/* Lista de experiencia */}                      </div>

            <div className="space-y-3 mb-4">                      {editingSection === 'experience' && (

              {cvData.experience.length === 0 ? (                        <button

                <p className="text-gray-500 text-center py-8">No has agregado experiencia laboral</p>                          onClick={() => {

              ) : (                            const newExperience = cvData.experience.filter((_, i) => i !== index);

                cvData.experience.map((exp, index) => (                            setCvData(prev => ({ ...prev, experience: newExperience }));

                  <div key={index} className="border rounded-lg p-4">                          }}

                    <div className="flex justify-between items-start">                          className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center"

                      <div>                          title="Eliminar experiencia"

                        <h3 className="font-medium">{exp.position}</h3>                        >

                        <p className="text-green-600 text-sm">{exp.company}</p>                          <X className="h-4 w-4" />

                        <p className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate || 'Presente'}</p>                        </button>

                      </div>                      )}

                      <button                    </div>

                        onClick={() => removeExperience(index)}                  </div>

                        className="text-red-500 hover:bg-red-50 p-1 rounded"                ))}

                      >              </div>

                        <X className="h-4 w-4" />            )}

                      </button>

                    </div>            {editingSection === 'experience' && (

                  </div>              <div className="border-t pt-6">

                ))                <div className="bg-green-50 rounded-lg p-6">

              )}                  <div className="flex items-center gap-3 mb-4">

            </div>                    <Briefcase className="h-5 w-5 text-green-600" />

                    <h3 className="font-medium text-gray-900">

            {/* Formulario de experiencia */}                      Agregar nueva experiencia

            {showExperienceForm && (                    </h3>

              <div className="border-t pt-4">                  </div>

                <div className="space-y-3">                  

                  <input                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    type="text"                    <div>

                    placeholder="Empresa *"                      <label className="block text-sm font-medium text-gray-700 mb-2">

                    value={newExperience.company}                        Empresa

                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}                      </label>

                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"                      <input

                  />                        type="text"

                  <input                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"

                    type="text"                        placeholder="Nombre de la empresa..."

                    placeholder="Cargo/Posición *"                      />

                    value={newExperience.position}                    </div>

                    onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}                    <div>

                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"                      <label className="block text-sm font-medium text-gray-700 mb-2">

                  />                        Cargo/Posición

                  <div className="grid grid-cols-2 gap-3">                      </label>

                    <input                      <input

                      type="month"                        type="text"

                      value={newExperience.startDate}                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"

                      onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}                        placeholder="Desarrollador, Analista, Gerente..."

                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"                      />

                    />                    </div>

                    <input                    <div>

                      type="month"                      <label className="block text-sm font-medium text-gray-700 mb-2">

                      value={newExperience.endDate}                        Fecha de inicio

                      onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}                      </label>

                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"                      <input

                    />                        type="month"

                  </div>                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"

                  <div className="flex gap-2">                      />

                    <button                    </div>

                      onClick={addExperience}                    <div>

                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"                      <label className="block text-sm font-medium text-gray-700 mb-2">

                    >                        Fecha de finalización

                      <Save className="h-4 w-4" />                      </label>

                      Guardar                      <input

                    </button>                        type="month"

                    <button                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"

                      onClick={() => setShowExperienceForm(false)}                      />

                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"                    </div>

                    >                    <div className="md:col-span-2">

                      Cancelar                      <label className="block text-sm font-medium text-gray-700 mb-2">

                    </button>                        Descripción de responsabilidades (opcional)

                  </div>                      </label>

                </div>                      <textarea

              </div>                        rows={3}

            )}                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"

          </div>                        placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas..."

        </div>                      />

                    </div>

        {/* Sección de Habilidades - Ancho completo */}                    <div className="md:col-span-2">

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">                      <button

          <div className="flex items-center justify-between mb-6">                        onClick={() => {

            <div className="flex items-center gap-3">                          // TODO: Implement add experience logic

              <Award className="h-6 w-6 text-purple-600" />                          alert('Funcionalidad en desarrollo');

              <h2 className="text-xl font-semibold">Habilidades Técnicas</h2>                        }}

              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"

                {cvData.skills.length} skills                      >

              </span>                        <Plus className="h-4 w-4" />

            </div>                        Agregar experiencia

            <button                      </button>

              onClick={() => setShowSkillsManager(!showSkillsManager)}                    </div>

              className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"                  </div>

            >                </div>

              <Award className="h-4 w-4" />              </div>

              Gestionar Skills            )}

            </button>          </div>

          </div>        </div>



          {/* Mostrar skills actuales */}        {/* Agregar nuevas habilidades */}

          <div className="mb-6">        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">

            {cvData.skills.length === 0 ? (          <div className="flex items-center justify-between mb-6">

              <div className="text-center py-12 text-gray-500">            <div className="flex items-center gap-3">

                <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />              <Award className="h-6 w-6 text-purple-600" />

                <p className="text-lg mb-2">No tienes habilidades agregadas</p>              <h2 className="text-xl font-semibold text-gray-900">

                <p className="text-sm">Agrega tus skills técnicas para mejorar tu perfil</p>                Agregar nuevas habilidades

              </div>              </h2>

            ) : (            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            <button

                {cvData.skills.map((skill) => (              onClick={() => {

                  <div key={skill.id} className="border border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-colors">                setEditingSection(editingSection === 'skills' ? null : 'skills');

                    <div className="flex justify-between items-start mb-2">              }}

                      <h3 className="font-medium text-gray-900">{skill.name}</h3>              className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"

                      <button            >

                        onClick={() => removeSkillFromStudent(skill.id)}              {editingSection === 'skills' ? (

                        className="text-red-500 hover:bg-red-50 p-1 rounded-full opacity-70 hover:opacity-100"                <>

                      >                  <X className="h-4 w-4" />

                        <X className="h-4 w-4" />                  Cancelar

                      </button>                </>

                    </div>              ) : (

                    <p className="text-purple-600 text-sm font-medium mb-2">{skill.category}</p>                <>

                    <div className="flex items-center gap-2">                  <Edit className="h-4 w-4" />

                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">                  Gestionar

                        {skill.proficiencyLevel === 'beginner' ? 'Principiante' :                </>

                         skill.proficiencyLevel === 'intermediate' ? 'Intermedio' :              )}

                         skill.proficiencyLevel === 'advanced' ? 'Avanzado' : 'Experto'}            </button>

                      </span>          </div>

                      <span className="text-xs text-gray-500">

                        {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'año' : 'años'}          <div className="space-y-6">

                      </span>            {/* Skills Display */}

                    </div>            {cvData.skills.length === 0 ? (

                  </div>              <div className="text-center py-12 text-gray-500">

                ))}                <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />

              </div>                <p className="text-lg mb-2">No has agregado habilidades</p>

            )}                <p className="text-sm mb-4">

          </div>                  Las habilidades son importantes para tu perfil profesional

                </p>

          {/* Gestor de skills */}                <button

          {showSkillsManager && (                  onClick={() => setEditingSection('skills')}

            <div className="border-t pt-6">                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"

              <div className="bg-purple-50 rounded-lg p-6">                >

                <h3 className="font-medium text-gray-900 mb-4">Agregar Nuevas Habilidades</h3>                  Agregar primera habilidad

                                </button>

                <div className="space-y-4">              </div>

                  <div>            ) : (

                    <label className="block text-sm font-medium text-gray-700 mb-2">              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                      Buscar habilidades existentes o crear nuevas                {cvData.skills.map((skill) => (

                    </label>                  <div key={skill.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors relative group">

                    <CreatableSelect                    <div className="flex items-start justify-between mb-2">

                      isMulti                      <h3 className="font-semibold text-gray-900 truncate flex-1">

                      value={selectedSkillsForAdd}                        {skill.name}

                      onChange={(selected) => setSelectedSkillsForAdd(Array.from(selected || []))}                      </h3>

                      options={availableSkills                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">

                        .filter(skill => !cvData.skills.some(s => s.id === skill.id))                        {skill.isVerified && (

                        .map(skill => ({                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">

                          value: skill.id,                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>

                          label: skill.name,                          </div>

                          category: skill.category                        )}

                        }))                        {editingSection === 'skills' && (

                      }                          <button

                      onCreateOption={(inputValue) => {                            onClick={() => removeSkillFromStudent(skill.id)}

                        const newSkill = {                            className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"

                          value: `new_${Date.now()}`,                            title="Eliminar habilidad"

                          label: inputValue,                          >

                          category: 'technical',                            <X className="h-4 w-4" />

                          isNew: true                          </button>

                        };                        )}

                        setSelectedSkillsForAdd(prev => [...prev, newSkill]);                      </div>

                      }}                    </div>

                      placeholder="Escribe para buscar skills existentes o crear nuevas..."                    <div className="space-y-2">

                      isLoading={isLoadingSkills}                      <p className="text-sm text-purple-600 font-medium">

                      noOptionsMessage={({ inputValue }) =>                         {skill.category}

                        inputValue ? `Presiona Enter para crear "${inputValue}"` : 'Escribe para buscar habilidades'                      </p>

                      }                      <div className="flex items-center gap-2">

                      formatCreateLabel={(inputValue) => `Crear nueva skill: "${inputValue}"`}                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">

                      className="react-select-container"                          {skill.proficiencyLevel === 'beginner' ? 'Principiante' :

                      classNamePrefix="react-select"                           skill.proficiencyLevel === 'intermediate' ? 'Intermedio' :

                      styles={{                           skill.proficiencyLevel === 'advanced' ? 'Avanzado' : 'Experto'}

                        control: (provided, state) => ({                        </span>

                          ...provided,                        <span className="text-xs text-gray-500">

                          borderColor: state.isFocused ? '#a855f7' : provided.borderColor,                          {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'año' : 'años'}

                          boxShadow: state.isFocused ? '0 0 0 1px #a855f7' : provided.boxShadow,                        </span>

                        }),                      </div>

                        option: (provided, state) => ({                      {skill.notes && (

                          ...provided,                        <p className="text-xs text-gray-600 mt-2">

                          backgroundColor: state.isSelected ? '#a855f7' :                           {skill.notes}

                                         state.isFocused ? '#f3e8ff' : provided.backgroundColor,                        </p>

                          color: state.isSelected ? 'white' : provided.color                      )}

                        })                    </div>

                      }}                  </div>

                    />                ))}

                  </div>              </div>

            )}

                  {/* Información de debug */}

                  <div className="text-sm text-gray-600">            {/* Skills Management Interface */}

                    <p>Skills disponibles: {availableSkills.length}</p>            {editingSection === 'skills' && (

                    <p>Skills del estudiante: {cvData.skills.length}</p>              <div className="border-t pt-6">

                    {isLoadingSkills && <p>Cargando skills...</p>}                <div className="bg-purple-50 rounded-lg p-6">

                  </div>                  <div className="flex items-center gap-3 mb-4">

                    <Award className="h-5 w-5 text-purple-600" />

                  {/* Botón agregar skills seleccionadas */}                    <h3 className="font-medium text-gray-900">

                  {selectedSkillsForAdd.length > 0 && (                      Buscar y agregar habilidades

                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">                    </h3>

                      <span className="text-sm text-purple-700 font-medium">                  </div>

                        {selectedSkillsForAdd.length} skill(s) seleccionada(s)                  

                      </span>                  <div className="space-y-4">

                      <button                    <div>

                        onClick={handleAddSelectedSkills}                      <label className="block text-sm font-medium text-gray-700 mb-2">

                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"                        Multiselect autocomplete

                      >                      </label>

                        <Plus className="h-4 w-4" />                      <CreatableSelect

                        Agregar Skills                        isMulti

                      </button>                        value={selectedSkillsForAdd}

                    </div>                        onChange={(selected) => setSelectedSkillsForAdd(Array.from(selected || []))}

                  )}                        options={availableSkills

                </div>                          .filter(skill => !cvData.skills.some(s => s.id === skill.id))

              </div>                          .map(skill => ({

            </div>                            value: skill.id,

          )}                            label: skill.name,

        </div>                            category: skill.category,

                            skillData: skill

        {/* Tips de completitud */}                          }))

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mt-6">                        }

          <div className="flex items-center gap-3 mb-4">                        onCreateOption={(inputValue) => {

            <Target className="h-6 w-6" />                          const newSkill = {

            <h3 className="text-xl font-semibold">Mejora tu perfil</h3>                            value: `new_${Date.now()}`,

          </div>                            label: inputValue,

          <div className="grid md:grid-cols-2 gap-4">                            category: 'technical',

            <div>                            isNew: true

              <p className="text-blue-100 mb-3">                          };

                Tu CV está {completionPercentage}% completo.                           setSelectedSkillsForAdd(prev => [...prev, newSkill]);

              </p>                        }}

              <div className="flex items-center gap-2">                        placeholder="Escribe para buscar habilidades existentes o crear nuevas..."

                <TrendingUp className="h-4 w-4" />                        isLoading={isLoadingSkills}

                <span className="text-sm">Un CV completo aumenta tus oportunidades</span>                        noOptionsMessage={({ inputValue }) => 

              </div>                          inputValue ? `Presiona Enter para crear "${inputValue}"` : 'Escribe para buscar habilidades'

            </div>                        }

            <div className="space-y-2">                        formatCreateLabel={(inputValue) => `Crear nueva habilidad: "${inputValue}"`}

              {completionPercentage < 100 && (                        className="react-select-container"

                <div className="text-sm">                        classNamePrefix="react-select"

                  <strong>Próximos pasos:</strong>                        styles={{

                  <ul className="mt-1 space-y-1 text-blue-100">                          control: (provided, state) => ({

                    {!cvData.personalInfo.summary && <li>• Agrega un resumen profesional</li>}                            ...provided,

                    {cvData.education.length === 0 && <li>• Incluye tu educación</li>}                            borderColor: state.isFocused ? '#a855f7' : provided.borderColor,

                    {cvData.experience.length === 0 && <li>• Agrega experiencia laboral</li>}                            boxShadow: state.isFocused ? '0 0 0 1px #a855f7' : provided.boxShadow,

                    {cvData.skills.length === 0 && <li>• Define tus habilidades técnicas</li>}                            '&:hover': {

                  </ul>                              borderColor: '#a855f7'

                </div>                            }

              )}                          }),

            </div>                          option: (provided, state) => ({

          </div>                            ...provided,

        </div>                            backgroundColor: state.isSelected ? '#a855f7' : 

      </div>                                           state.isFocused ? '#f3e8ff' : provided.backgroundColor,

    </div>                            color: state.isSelected ? 'white' : provided.color

  );                          }),

}                          multiValue: (provided) => ({

                            ...provided,

export default function MiCVPage() {                            backgroundColor: '#f3e8ff'

  return (                          }),

    <AuthGuard>                          multiValueLabel: (provided) => ({

      <MiCVContent />                            ...provided,

    </AuthGuard>                            color: '#7c3aed'

  );                          }),

}                          multiValueRemove: (provided) => ({
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