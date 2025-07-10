'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Star, 
  Building2,
  Eye,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Clock,
  TrendingUp,
  Download,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MyStudent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age: number;
  program: string;
  studyCenter: string;
  skills: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'suspended';
  supervisor: string;
  rating?: number;
  notes?: string;
  avatar?: string;
  offerTitle: string;
  progressReports: number;
  lastActivity: string;
}

function MyStudentsContent() {
  const { user, canAccessRole } = useAuthStore();
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<MyStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Verificar que el usuario puede acceder como empresa
  if (!canAccessRole('company')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a la gestión de estudiantes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // Simular carga de estudiantes asignados a la empresa
    const mockStudents: MyStudent[] = [
      {
        id: 1,
        name: 'Carlos Ruiz Mendoza',
        email: 'carlos.ruiz@email.com',
        phone: '+34 666 123 456',
        age: 23,
        program: 'Desarrollo de Aplicaciones Web',
        studyCenter: 'IES Tecnológico Madrid',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        startDate: '2024-09-01',
        endDate: '2024-12-20',
        status: 'active',
        supervisor: 'Ana García (Tutora empresa)',
        rating: 4.5,
        avatar: '/avatars/carlos.jpg',
        offerTitle: 'Desarrollador Frontend Junior',
        progressReports: 3,
        lastActivity: '2024-07-08'
      },
      {
        id: 2,
        name: 'María González Santos',
        email: 'maria.gonzalez@email.com',
        phone: '+34 677 987 654',
        age: 22,
        program: 'Administración de Sistemas',
        studyCenter: 'CFGS Informática Barcelona',
        skills: ['Linux', 'Docker', 'AWS', 'Python'],
        startDate: '2024-06-15',
        endDate: '2024-11-30',
        status: 'active',
        supervisor: 'Pedro López (Tutor empresa)',
        rating: 4.8,
        avatar: '/avatars/maria.jpg',
        offerTitle: 'Técnico en Infraestructura',
        progressReports: 5,
        lastActivity: '2024-07-09'
      },
      {
        id: 3,
        name: 'Diego Fernández Villa',
        email: 'diego.fernandez@email.com',
        age: 24,
        program: 'Desarrollo de Aplicaciones Multiplataforma',
        studyCenter: 'IES Digital Valencia',
        skills: ['Java', 'Spring Boot', 'Android', 'MySQL'],
        startDate: '2024-02-01',
        endDate: '2024-05-31',
        status: 'completed',
        supervisor: 'Laura Martín (Tutora empresa)',
        rating: 4.2,
        avatar: '/avatars/diego.jpg',
        offerTitle: 'Desarrollador Mobile',
        progressReports: 8,
        lastActivity: '2024-05-31',
        notes: 'Excelente rendimiento. Proyecto final muy bien valorado.'
      }
    ];

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.offerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, statusFilter, students]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: 'Activo',
      completed: 'Completado',
      suspended: 'Suspendido'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Alumnos en Prácticas</h1>
          <p className="text-gray-600">Gestiona y supervisa a los estudiantes asignados a tu empresa</p>
        </div>

        {/* Controles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nombre, email, oferta o programa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  Todos ({students.length})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Activos ({students.filter(s => s.status === 'active').length})
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('completed')}
                  size="sm"
                >
                  Completados ({students.filter(s => s.status === 'completed').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de estudiantes */}
        <div className="grid gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                            <p className="text-gray-600">{student.offerTitle}</p>
                          </div>
                          {getStatusBadge(student.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{student.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{student.program}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{student.studyCenter}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de prácticas */}
                  <div className="lg:w-80 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Información de Prácticas</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Supervisor:</span>
                        <span className="text-sm font-medium">{student.supervisor}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha inicio:</span>
                        <span className="text-sm font-medium">{formatDate(student.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha fin:</span>
                        <span className="text-sm font-medium">{formatDate(student.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Informes:</span>
                        <span className="text-sm font-medium">{student.progressReports}</span>
                      </div>
                      
                      {student.rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Valoración:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{student.rating}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Última actividad:</span>
                        <span className="text-sm font-medium">{formatDate(student.lastActivity)}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-4">
                      <span className="text-sm text-gray-600 mb-2 block">Competencias:</span>
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {student.skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{student.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Notas */}
                    {student.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">{student.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {/* Modal Ver Perfil */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          Perfil de {student.name}
                        </DialogTitle>
                        <DialogDescription>
                          CV y información académica completa
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Información Personal */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Información Personal</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Nombre completo</Label>
                              <p className="mt-1">{student.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Edad</Label>
                              <p className="mt-1">{student.age} años</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Email</Label>
                              <p className="mt-1">{student.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                              <p className="mt-1">{student.phone || 'No disponible'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Formación Académica */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-5 h-5 text-fprax-blue" />
                              <span className="font-medium">{student.program}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span>{student.studyCenter}</span>
                            </div>
                          </div>
                        </div>

                        {/* Competencias Técnicas */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Competencias Técnicas</h3>
                          <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-fprax-blue/10 text-fprax-blue">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Información de Prácticas */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Prácticas Actuales</h3>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">{student.offerTitle}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Supervisor:</span>
                                <span>{student.supervisor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Período:</span>
                                <span>{formatDate(student.startDate)} - {formatDate(student.endDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Estado:</span>
                                {getStatusBadge(student.status)}
                              </div>
                              {student.rating && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Valoración:</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span>{student.rating}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Notas adicionales */}
                        {student.notes && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Observaciones</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <p className="text-sm">{student.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Modal Contactar */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Contactar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Contactar con {student.name}</DialogTitle>
                        <DialogDescription>
                          Envía un mensaje al estudiante
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Asunto</Label>
                          <Input
                            id="subject"
                            placeholder="Revisión de progreso..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="message">Mensaje</Label>
                          <Textarea
                            id="message"
                            placeholder="Hola {student.name.split(' ')[0]}, me gustaría..."
                            rows={4}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1 bg-fprax-blue hover:bg-fprax-blue/90">
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Mensaje
                          </Button>
                          <Button variant="outline" size="icon" title="Llamar">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Email directo">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Modal Informes */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        Informes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Informes de Progreso - {student.name}</DialogTitle>
                        <DialogDescription>
                          Historial de informes y seguimiento académico
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Resumen de informes */}
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <FileText className="w-8 h-8 text-fprax-blue mx-auto mb-2" />
                              <p className="text-2xl font-bold">{student.progressReports}</p>
                              <p className="text-sm text-gray-600">Informes totales</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold">85%</p>
                              <p className="text-sm text-gray-600">Progreso</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold">{student.rating || 'N/A'}</p>
                              <p className="text-sm text-gray-600">Valoración media</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Lista de informes */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Informes Recientes</h4>
                          {[1, 2, 3].map((reportNum) => (
                            <Card key={reportNum} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">Informe #{reportNum}</h5>
                                  <p className="text-sm text-gray-600">
                                    {new Date(Date.now() - reportNum * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-800">
                                    Satisfactorio
                                  </Badge>
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="bg-fprax-blue hover:bg-fprax-blue/90">
                            <FileText className="w-4 h-4 mr-2" />
                            Generar Nuevo Informe
                          </Button>
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Todos
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Modal Evaluar (solo para estudiantes activos) */}
                  {student.status === 'active' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Evaluar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Evaluar a {student.name}</DialogTitle>
                          <DialogDescription>
                            Registra una nueva evaluación del desempeño
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="evaluation-type">Tipo de Evaluación</Label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona el tipo..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Evaluación Semanal</SelectItem>
                                <SelectItem value="monthly">Evaluación Mensual</SelectItem>
                                <SelectItem value="project">Evaluación de Proyecto</SelectItem>
                                <SelectItem value="final">Evaluación Final</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="rating">Calificación (1-5)</Label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona calificación..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - Insuficiente</SelectItem>
                                <SelectItem value="2">2 - Suficiente</SelectItem>
                                <SelectItem value="3">3 - Bien</SelectItem>
                                <SelectItem value="4">4 - Notable</SelectItem>
                                <SelectItem value="5">5 - Sobresaliente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="competencies">Competencias Evaluadas</Label>
                            <div className="mt-2 space-y-2">
                              {['Puntualidad', 'Trabajo en equipo', 'Iniciativa', 'Calidad técnica'].map((comp) => (
                                <div key={comp} className="flex items-center justify-between">
                                  <span className="text-sm">{comp}</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <Star key={rating} className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="comments">Comentarios</Label>
                            <Textarea
                              id="comments"
                              placeholder="Comentarios sobre el desempeño, logros, áreas de mejora..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Guardar Evaluación
                            </Button>
                            <Button variant="outline">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron estudiantes</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros o términos de búsqueda'
                  : 'Aún no tienes estudiantes asignados para prácticas'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MyStudentsPage() {
  return (
    <AuthGuard requireAuth>
      <MyStudentsContent />
    </AuthGuard>
  );
}
