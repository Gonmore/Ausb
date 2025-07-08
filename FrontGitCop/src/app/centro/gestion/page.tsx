'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  GraduationCap, 
  Building2, 
  UserPlus,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  program: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'dropped' | 'on_leave';
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  internshipStatus: 'not_started' | 'in_progress' | 'completed';
  tutorId?: number;
  avatar?: string;
  lastActivity: string;
  applications: number;
  interviews: number;
  offers: number;
}

interface Tutor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  studentsCount: number;
  experience: string;
  rating: number;
  avatar?: string;
  isActive: boolean;
}

interface Program {
  id: number;
  name: string;
  code: string;
  description: string;
  duration: string;
  totalCredits: number;
  studentsEnrolled: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

function StudyCenterManagementContent() {
  const { user, canAccessRole } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('students');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddTutorModalOpen, setIsAddTutorModalOpen] = useState(false);
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);

  // Verificar que el usuario puede acceder como centro de estudios
  if (!canAccessRole('scenter')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a la gestión del centro de estudios.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // Simular carga de datos
    const mockStudents: Student[] = [
      {
        id: 1,
        name: 'Ana García López',
        email: 'ana.garcia@email.com',
        phone: '+34 666 123 456',
        age: 24,
        program: 'Desarrollo Web Full Stack',
        enrollmentDate: '2022-09-01',
        status: 'active',
        gpa: 8.5,
        completedCredits: 80,
        totalCredits: 120,
        internshipStatus: 'in_progress',
        tutorId: 1,
        lastActivity: '2024-12-15',
        applications: 12,
        interviews: 5,
        offers: 2
      },
      {
        id: 2,
        name: 'Carlos Martínez Ruiz',
        email: 'carlos.martinez@email.com',
        phone: '+34 677 234 567',
        age: 26,
        program: 'Desarrollo de Aplicaciones Multiplataforma',
        enrollmentDate: '2021-09-01',
        status: 'graduated',
        gpa: 7.8,
        completedCredits: 120,
        totalCredits: 120,
        internshipStatus: 'completed',
        tutorId: 2,
        lastActivity: '2024-12-10',
        applications: 8,
        interviews: 3,
        offers: 1
      },
      {
        id: 3,
        name: 'María López Santos',
        email: 'maria.lopez@email.com',
        phone: '+34 688 345 678',
        age: 22,
        program: 'Marketing Digital',
        enrollmentDate: '2023-09-01',
        status: 'active',
        gpa: 9.2,
        completedCredits: 40,
        totalCredits: 100,
        internshipStatus: 'not_started',
        tutorId: 3,
        lastActivity: '2024-12-14',
        applications: 15,
        interviews: 8,
        offers: 3
      }
    ];

    const mockTutors: Tutor[] = [
      {
        id: 1,
        name: 'Dr. Elena Jiménez',
        email: 'elena.jimenez@centro.edu',
        phone: '+34 912 345 678',
        specialization: 'Desarrollo Web',
        studentsCount: 25,
        experience: '8 años',
        rating: 4.8,
        isActive: true
      },
      {
        id: 2,
        name: 'Prof. Roberto Sánchez',
        email: 'roberto.sanchez@centro.edu',
        phone: '+34 913 456 789',
        specialization: 'Aplicaciones Móviles',
        studentsCount: 20,
        experience: '5 años',
        rating: 4.6,
        isActive: true
      },
      {
        id: 3,
        name: 'Dra. Carmen Vega',
        email: 'carmen.vega@centro.edu',
        phone: '+34 914 567 890',
        specialization: 'Marketing Digital',
        studentsCount: 18,
        experience: '12 años',
        rating: 4.9,
        isActive: true
      }
    ];

    const mockPrograms: Program[] = [
      {
        id: 1,
        name: 'Desarrollo Web Full Stack',
        code: 'DW-001',
        description: 'Programa completo de desarrollo web con tecnologías modernas',
        duration: '2 años',
        totalCredits: 120,
        studentsEnrolled: 45,
        isActive: true,
        startDate: '2024-09-01',
        endDate: '2026-06-30'
      },
      {
        id: 2,
        name: 'Desarrollo de Aplicaciones Multiplataforma',
        code: 'DAM-002',
        description: 'Desarrollo de aplicaciones para múltiples plataformas',
        duration: '2 años',
        totalCredits: 120,
        studentsEnrolled: 38,
        isActive: true,
        startDate: '2024-09-01',
        endDate: '2026-06-30'
      },
      {
        id: 3,
        name: 'Marketing Digital',
        code: 'MD-003',
        description: 'Especialización en marketing digital y redes sociales',
        duration: '1.5 años',
        totalCredits: 100,
        studentsEnrolled: 32,
        isActive: true,
        startDate: '2024-09-01',
        endDate: '2026-02-28'
      }
    ];

    setStudents(mockStudents);
    setTutors(mockTutors);
    setPrograms(mockPrograms);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'graduated': return 'Graduado';
      case 'dropped': return 'Abandonado';
      case 'on_leave': return 'Excedencia';
      default: return 'Desconocido';
    }
  };

  const getInternshipStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInternshipStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'No iniciado';
      case 'in_progress': return 'En curso';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 text-white rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestión del Centro</h1>
              <p className="text-muted-foreground">Administra estudiantes, tutores y programas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                +{students.filter(s => s.status === 'active').length} activos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutores</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.filter(t => t.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                {tutors.length} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs.filter(p => p.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                {programs.reduce((acc, p) => acc + p.studentsEnrolled, 0)} matriculados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Colocación</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 ? 
                  Math.round((students.filter(s => s.offers > 0).length / students.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Estudiantes con ofertas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar estudiantes, tutores o programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="tutors">Tutores</TabsTrigger>
            <TabsTrigger value="programs">Programas</TabsTrigger>
          </TabsList>
          
          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Estudiantes ({filteredStudents.length})</h2>
              <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Estudiante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="student-name">Nombre Completo</Label>
                      <Input id="student-name" placeholder="Nombre del estudiante" />
                    </div>
                    <div>
                      <Label htmlFor="student-email">Email</Label>
                      <Input id="student-email" type="email" placeholder="email@ejemplo.com" />
                    </div>
                    <div>
                      <Label htmlFor="student-program">Programa</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar programa" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map(program => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => setIsAddStudentModalOpen(false)}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{student.name}</h3>
                            <Badge className={getStatusColor(student.status)}>
                              {getStatusText(student.status)}
                            </Badge>
                            <Badge className={getInternshipStatusColor(student.internshipStatus)}>
                              {getInternshipStatusText(student.internshipStatus)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{student.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span>{student.program}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span>GPA: {student.gpa}/10</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Matriculado: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progreso del Programa</span>
                              <span>{student.completedCredits}/{student.totalCredits} créditos</span>
                            </div>
                            <Progress value={(student.completedCredits / student.totalCredits) * 100} />
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            <span>Aplicaciones: {student.applications}</span>
                            <span>Entrevistas: {student.interviews}</span>
                            <span>Ofertas: {student.offers}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Tutors Tab */}
          <TabsContent value="tutors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tutores ({filteredTutors.length})</h2>
              <Dialog open={isAddTutorModalOpen} onOpenChange={setIsAddTutorModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Tutor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Tutor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tutor-name">Nombre Completo</Label>
                      <Input id="tutor-name" placeholder="Nombre del tutor" />
                    </div>
                    <div>
                      <Label htmlFor="tutor-email">Email</Label>
                      <Input id="tutor-email" type="email" placeholder="email@ejemplo.com" />
                    </div>
                    <div>
                      <Label htmlFor="tutor-specialization">Especialización</Label>
                      <Input id="tutor-specialization" placeholder="Área de especialización" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddTutorModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => setIsAddTutorModalOpen(false)}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTutors.map((tutor) => (
                <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={tutor.avatar} />
                          <AvatarFallback>
                            {tutor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{tutor.name}</h3>
                          <p className="text-sm text-gray-600">{tutor.specialization}</p>
                        </div>
                      </div>
                      
                      <Badge className={tutor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {tutor.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{tutor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{tutor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{tutor.studentsCount} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Valoración: {tutor.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Programas ({filteredPrograms.length})</h2>
              <Dialog open={isAddProgramModalOpen} onOpenChange={setIsAddProgramModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Programa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Programa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="program-name">Nombre del Programa</Label>
                      <Input id="program-name" placeholder="Nombre del programa" />
                    </div>
                    <div>
                      <Label htmlFor="program-code">Código</Label>
                      <Input id="program-code" placeholder="Código del programa" />
                    </div>
                    <div>
                      <Label htmlFor="program-description">Descripción</Label>
                      <Textarea id="program-description" placeholder="Descripción del programa" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddProgramModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => setIsAddProgramModalOpen(false)}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{program.name}</h3>
                          <Badge variant="secondary">{program.code}</Badge>
                          <Badge className={program.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {program.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{program.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{program.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span>{program.totalCredits} créditos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{program.studentsEnrolled} estudiantes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(program.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function StudyCenterManagementPage() {
  return (
    <AuthGuard requireAuth>
      <StudyCenterManagementContent />
    </AuthGuard>
  );
}
