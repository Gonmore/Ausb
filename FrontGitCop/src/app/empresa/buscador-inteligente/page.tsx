'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eye, Mail, Search, Plus, X, Brain, Star, Target, Car, GraduationCap, Briefcase, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

interface Student {
  id: number;
  grade: string;
  course: string;
  car: boolean;
  tag: string;
  description: string;
  User: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  Profamily: {
    id: number;
    name: string;
  } | null;
  affinity: {
    level: string;
    score: number;
    matches: number;
    coverage: number;
    matchingSkills: Array<{
      skill: string;
      companyValue: number;
      studentValue: number;
      finalValue: number;
      bonusText: string;
      isPremium: boolean;
    }>;
    explanation: string;
  };
}

function IntelligentSearchContent() {
  const [skills, setSkills] = useState<{[key: string]: number}>({});
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentValue, setCurrentValue] = useState(3);
  const [filters, setFilters] = useState({
    profamilyId: '',
    grade: '',
    car: '',
    minAffinity: ''
  });
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userTokens, setUserTokens] = useState(0); // Cambiar a 0 inicialmente
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [revealedCVs, setRevealedCVs] = useState<number[]>([]);

  const { token } = useAuthStore();

  // Cargar balance de tokens real
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        setLoadingTokens(true);
        const response = await fetch('http://localhost:5000/api/students/tokens/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserTokens(data.balance);
          console.log('💰 Balance de tokens:', data.balance);
        }
      } catch (error) {
        console.error('❌ Error cargando tokens:', error);
      } finally {
        setLoadingTokens(false);
      }
    };

    if (token) {
      fetchTokenBalance();
    }
  }, [token]);

  // REVEAL CVs
  useEffect(() => {
    const fetchRevealedCVs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students/revealed-cvs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRevealedCVs(data.revealedStudentIds);
          console.log('✅ CVs revelados cargados:', data.revealedStudentIds);
        }
      } catch (error) {
        console.error('❌ Error cargando CVs revelados:', error);
      }
    };

    if (token) {
      fetchRevealedCVs();
    }
  }, [token]);

  const addSkill = () => {
    if (currentSkill.trim() && !skills[currentSkill.trim()]) {
      setSkills(prev => ({
        ...prev,
        [currentSkill.trim()]: currentValue
      }));
      setCurrentSkill('');
      setCurrentValue(3);
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills(prev => {
      const newSkills = { ...prev };
      delete newSkills[skillName];
      return newSkills;
    });
  };

  const searchStudents = async () => {
    if (Object.keys(skills).length === 0) {
      alert('Agrega al menos una habilidad para buscar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/students/search-intelligent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        })
      });

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      setResults(data.students);
      setShowResults(true);
      console.log('🔍 Resultados búsqueda inteligente:', data);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealStudent = async (student: Student) => {
    try {
      console.log('🔓 Revelar estudiante:', student.id);
      
      const isAlreadyRevealed = revealedCVs.includes(student.id);
      
      if (isAlreadyRevealed) {
        console.log('✅ Estudiante ya revelado - Acceso gratuito');
      }
      
      const response = await fetch(`http://localhost:5000/api/students/${student.id}/view-cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_TOKENS') {
          alert(`❌ Tokens insuficientes.\nNecesitas ${errorData.required} tokens para revelar este estudiante.\n\n¿Quieres recargar tokens?`);
          setShowTokenModal(true); // 🔥 MOSTRAR MODAL DE RECARGA
          return;
        }
        throw new Error('Error al revelar el estudiante');
      }

      const cvData = await response.json();
      console.log('✅ Estudiante revelado:', cvData);
      
      // 🔥 ACTUALIZAR INMEDIATAMENTE EL STATE Y TOKEN BALANCE
      if (!isAlreadyRevealed && !cvData.wasAlreadyRevealed) {
        setRevealedCVs(prev => [...prev, student.id]);
        // Actualizar tokens inmediatamente solo si se cobraron
        if (cvData.tokensUsed > 0) {
          setUserTokens(prev => prev - cvData.tokensUsed);
        }
      }
      
      // Mostrar modal elegante
      setSelectedStudentForAction(student);
      setCvData(cvData);
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error revelando estudiante:', error);
      alert('Error al revelar el estudiante');
    }
  };

  const handleContact = (student: Student) => {
    setSelectedStudentForAction(student);
    setContactForm({
      subject: `Interés en tu perfil profesional`,
      message: `Estimado/a ${student.User.name},\n\nHemos encontrado tu perfil a través de nuestro sistema de búsqueda inteligente y nos interesa mucho conocerte.\n\nTu nivel de afinidad con nuestras ofertas es: ${student.affinity?.level?.toUpperCase()}\n\n¿Te gustaría conocer más sobre las oportunidades que tenemos disponibles?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  };

  const handleSendContact = async () => {
    if (!selectedStudentForAction) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudentForAction.id}/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: false, // 🔥 GRATIS porque ya fue revelado
          subject: contactForm.subject,
          message: contactForm.message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_TOKENS') {
          alert(`❌ Tokens insuficientes.\nNecesitas ${errorData.required} tokens para contactar.`);
          return;
        }
        throw new Error('Error al contactar el estudiante');
      }

      const result = await response.json();
      console.log('✅ Contacto registrado:', result);

      // Abrir cliente de email
      const emailBody = encodeURIComponent(contactForm.message);
      const emailSubject = encodeURIComponent(contactForm.subject);
      const emailUrl = `mailto:${selectedStudentForAction.User.email}?subject=${emailSubject}&body=${emailBody}`;
      
      window.open(emailUrl);
      
      // Cerrar modal
      setShowContactModal(false);
      setContactForm({ subject: '', message: '' });
      
    } catch (error) {
      console.error('❌ Error contactando estudiante:', error);
      alert('Error al contactar el estudiante');
    }
  };

  const getAffinityColor = (level: string) => {
    switch (level) {
      case 'muy alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'alto': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAffinityIcon = (level: string) => {
    switch (level) {
      case 'muy alto': return <Star className="w-4 h-4 text-green-600" />;
      case 'alto': return <Target className="w-4 h-4 text-blue-600" />;
      case 'medio': return <Brain className="w-4 h-4 text-yellow-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Buscador Inteligente de Estudiantes
        </h1>
        <p className="text-gray-600">
          Encuentra los mejores candidatos <strong>que aún NO han aplicado</strong> a tus ofertas
        </p>
        <div className="bg-blue-50 p-3 rounded-lg mt-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Nota:</strong> Este buscador solo muestra estudiantes que NO son candidatos actuales. 
            Para ver candidatos que ya aplicaron, ve a la sección "Candidatos" (gratis).
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <CreditCard className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">
            {loadingTokens ? 'Cargando...' : `Tokens disponibles: ${userTokens}`}
          </span>
        </div>
      </div>

      {!showResults ? (
        /* Formulario de búsqueda */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de habilidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Habilidades Requeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar habilidad */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: JavaScript, React, Python..."
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="text-sm">Valor:</span>
                  <span className="font-bold text-blue-600">{currentValue}</span>
                </div>
              </div>
              
              <div className="px-2">
                <Slider
                  value={[currentValue]}
                  onValueChange={(value) => setCurrentValue(value[0])}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Básico (1)</span>
                  <span>Importante (2)</span>
                  <span>Crítico (3)</span>
                </div>
              </div>

              <Button onClick={addSkill} disabled={!currentSkill.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Habilidad
              </Button>

              {/* Lista de habilidades */}
              {Object.keys(skills).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Habilidades agregadas:</h4>
                  <div className="space-y-1">
                    {Object.entries(skills).map(([skill, value]) => (
                      <div key={skill} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium">{skill}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600">
                            Valor: {value}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Familia Profesional</Label>
                <Select value={filters.profamilyId} onValueChange={(value) => setFilters(prev => ({...prev, profamilyId: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las familias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las familias</SelectItem>
                    <SelectItem value="1">Informática y Comunicaciones</SelectItem>
                    <SelectItem value="2">Administración y Gestión</SelectItem>
                    <SelectItem value="3">Sanidad</SelectItem>
                    <SelectItem value="4">Servicios Socioculturales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Grado Académico</Label>
                <Select value={filters.grade} onValueChange={(value) => setFilters(prev => ({...prev, grade: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los grados</SelectItem>
                    <SelectItem value="Grado Medio">Grado Medio</SelectItem>
                    <SelectItem value="Grado Superior">Grado Superior</SelectItem>
                    <SelectItem value="Universitario">Universitario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vehículo Propio</Label>
                <Select value={filters.car} onValueChange={(value) => setFilters(prev => ({...prev, car: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Indiferente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Indiferente</SelectItem>
                    <SelectItem value="true">Con vehículo</SelectItem>
                    <SelectItem value="false">Sin vehículo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Afinidad Mínima</Label>
                <Select value={filters.minAffinity} onValueChange={(value) => setFilters(prev => ({...prev, minAffinity: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier nivel</SelectItem>
                    <SelectItem value="bajo">Bajo o superior</SelectItem>
                    <SelectItem value="medio">Medio o superior</SelectItem>
                    <SelectItem value="alto">Alto o superior</SelectItem>
                    <SelectItem value="muy alto">Muy alto únicamente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={searchStudents} 
                disabled={loading || Object.keys(skills).length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>Buscando...</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Estudiantes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Resultados */
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Resultados de Búsqueda</h2>
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">
                {results.length} estudiantes encontrados
              </span>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Nueva Búsqueda
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header del estudiante */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.User.name?.charAt(0)}{student.User.surname?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{student.User.name} {student.User.surname}</h3>
                          <p className="text-gray-600">{student.grade} - {student.course}</p>
                        </div>
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            Estudiante Nuevo
                          </Badge>
                          {getAffinityIcon(student.affinity.level)}
                          <Badge className={getAffinityColor(student.affinity.level)}>
                            Afinidad: {student.affinity.level.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Información académica */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {student.grade} - {student.course}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="w-4 h-4 mr-2" />
                          {student.car ? 'Con vehículo' : 'Sin vehículo'}
                        </div>
                        {student.Profamily && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {student.Profamily.name}
                          </div>
                        )}
                      </div>

                      {/* Detalles de afinidad */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Análisis de Afinidad</h4>
                        <p className="text-sm text-blue-800 mb-2">{student.affinity.explanation}</p>
                        <div className="flex flex-wrap gap-2">
                          {student.affinity.matchingSkills.map((match, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={match.isPremium ? 'bg-green-50 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-300'}
                            >
                              {match.skill} ({match.companyValue}→{match.studentValue}) 
                              {match.isPremium && ' ⭐'}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Habilidades del estudiante */}
                      {student.tag && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">Habilidades:</h4>
                          <div className="flex flex-wrap gap-2">
                            {student.tag.split(',').map((tag: string, index: number) => (
                              <Badge key={index} variant="outline">{tag.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRevealStudent(student)}
                        className={revealedCVs.includes(student.id) ? 
                          'bg-green-50 border-green-300 text-green-700 cursor-default' : 
                          'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                        }
                        disabled={revealedCVs.includes(student.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {revealedCVs.includes(student.id) ? 'CV Revelado ✓' : 'Revelar Perfil (2 tokens)'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
                <p className="text-gray-600">
                  Intenta ajustar los criterios de búsqueda o reducir el nivel de afinidad mínimo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal CV Elegante */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              CV de {selectedStudentForAction?.User?.name} {selectedStudentForAction?.User?.surname}
              <Badge className={cvData?.wasAlreadyRevealed ? 'bg-blue-100 text-blue-800 ml-2' : 'bg-purple-100 text-purple-800 ml-2'}>
                {cvData?.wasAlreadyRevealed ? 'Ya Revelado' : 'Con Tokens'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudentForAction && cvData && (
            <div className="space-y-6">
              {/* Información personal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium">{selectedStudentForAction.User.name} {selectedStudentForAction.User.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudentForAction.User.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedStudentForAction.User.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{selectedStudentForAction.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Grado</p>
                    <p className="font-medium">{cvData.student.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Curso</p>
                    <p className="font-medium">{cvData.student.course}</p>
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              {cvData.student.skills && cvData.student.skills.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {cvData.student.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill.name} ({skill.proficiencyLevel})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Afinidad */}
              {selectedStudentForAction.affinity && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Afinidad con tu búsqueda</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      {selectedStudentForAction.affinity.level.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Score: {selectedStudentForAction.affinity.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {selectedStudentForAction.affinity.explanation}
                  </p>
                </div>
              )}

              {/* Información de acceso */}
              <div className={`p-4 rounded-lg border ${cvData?.wasAlreadyRevealed ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-semibold ${cvData?.wasAlreadyRevealed ? 'text-blue-800' : 'text-purple-800'}`}>
                    {cvData?.wasAlreadyRevealed ? 'CV Previamente Revelado' : 'Candidato Inteligente - 2 Tokens'}
                  </h4>
                </div>
                <p className="text-sm text-gray-700">
                  {cvData?.wasAlreadyRevealed 
                    ? 'Ya revelaste este CV anteriormente con tokens, ahora puedes acceder gratuitamente.'
                    : 'Este candidato fue encontrado por nuestro algoritmo de IA y tiene alta afinidad con tu búsqueda.'
                  }
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setShowCVModal(false);
                    // Abrir modal de contacto
                    setContactForm({
                      subject: `Interés en tu perfil profesional`,
                      message: `Estimado/a ${selectedStudentForAction?.User?.name},\n\nHemos revisado tu perfil y nos interesa mucho conocerte.\n\nTu nivel de afinidad con nuestras búsquedas es: ${selectedStudentForAction?.affinity?.level?.toUpperCase()}\n\n¿Te gustaría conocer más sobre las oportunidades que tenemos disponibles?\n\nSaludos cordiales.`
                    });
                    setShowContactModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Estudiante
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCVModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Contacto Elegante */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contactar a {selectedStudentForAction?.User?.name} {selectedStudentForAction?.User?.surname}
              <Badge className="bg-green-100 text-green-800 ml-2">
                Sin Costo Adicional
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Info del estudiante */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedStudentForAction?.User?.name?.charAt(0)}{selectedStudentForAction?.User?.surname?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedStudentForAction?.User?.name} {selectedStudentForAction?.User?.surname}</h4>
                  <p className="text-sm text-gray-600">{selectedStudentForAction?.User?.email}</p>
                  <p className="text-sm text-gray-600">{selectedStudentForAction?.grade} - {selectedStudentForAction?.course}</p>
                  {selectedStudentForAction?.affinity && (
                    <Badge className="bg-purple-100 text-purple-800 mt-1">
                      Afinidad: {selectedStudentForAction.affinity.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto del mensaje
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
            </div>

            {/* Información de costo */}
            <div className="p-3 rounded-lg bg-green-50 text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Contacto incluido sin costo adicional - Estudiante ya revelado</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSendContact}
                className="bg-green-600 hover:bg-green-700"
                disabled={!contactForm.subject.trim() || !contactForm.message.trim()}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Contacto
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowContactModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function IntelligentSearchPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <IntelligentSearchContent />
    </AuthGuard>
  );
}