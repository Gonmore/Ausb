'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Star, 
  Building2,
  Eye,
  Heart,
  MessageSquare,
  ChevronDown,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
  location: string;
  program: string;
  studyCenter: string;
  skills: string[];
  experience: string;
  graduationYear: number;
  gpa: number;
  languages: string[];
  portfolio?: string;
  linkedin?: string;
  github?: string;
  availability: 'immediate' | 'within_month' | 'within_3_months' | 'flexible';
  jobPreferences: string[];
  avatar?: string;
  isVisible: boolean;
  lastActive: string;
  completedProjects: number;
  rating: number;
}

function StudentSearchContent() {
  const { user, canAccessRole } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedStudents, setSavedStudents] = useState<number[]>([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    location: '',
    program: '',
    skills: [] as string[],
    ageRange: [18, 35] as [number, number],
    gpaRange: [0, 10] as [number, number],
    availability: '',
    graduationYear: '',
    experience: '',
    languages: [] as string[]
  });

  // Verificar que el usuario puede acceder como empresa
  if (!canAccessRole('company')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder al buscador de estudiantes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // Simular carga de estudiantes
    const mockStudents: Student[] = [
      {
        id: 1,
        name: 'Ana García López',
        email: 'ana.garcia@email.com',
        age: 24,
        location: 'Madrid',
        program: 'Desarrollo Web Full Stack',
        studyCenter: 'IES Tecnológico Madrid',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'],
        experience: '2 años',
        graduationYear: 2022,
        gpa: 8.5,
        languages: ['Español', 'Inglés', 'Francés'],
        portfolio: 'https://anagarcia.dev',
        linkedin: 'https://linkedin.com/in/anagarcia',
        github: 'https://github.com/anagarcia',
        availability: 'immediate',
        jobPreferences: ['Frontend', 'Full Stack', 'Remoto'],
        isVisible: true,
        lastActive: '2024-12-15',
        completedProjects: 8,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Carlos Martínez Ruiz',
        email: 'carlos.martinez@email.com',
        age: 26,
        location: 'Barcelona',
        program: 'Desarrollo de Aplicaciones Multiplataforma',
        studyCenter: 'Centro Formativo Barcelona',
        skills: ['Java', 'Spring Boot', 'Angular', 'MySQL', 'Git'],
        experience: '1 año',
        graduationYear: 2023,
        gpa: 7.8,
        languages: ['Español', 'Inglés'],
        portfolio: 'https://carlosmartinez.dev',
        linkedin: 'https://linkedin.com/in/carlosmartinez',
        availability: 'within_month',
        jobPreferences: ['Backend', 'Full Stack', 'Presencial'],
        isVisible: true,
        lastActive: '2024-12-14',
        completedProjects: 5,
        rating: 4.5
      },
      {
        id: 3,
        name: 'María López Santos',
        email: 'maria.lopez@email.com',
        age: 22,
        location: 'Valencia',
        program: 'Marketing Digital',
        studyCenter: 'Universidad Politécnica Valencia',
        skills: ['Google Analytics', 'SEO', 'SEM', 'Social Media', 'Photoshop'],
        experience: 'Estudiante',
        graduationYear: 2024,
        gpa: 9.2,
        languages: ['Español', 'Inglés', 'Italiano'],
        portfolio: 'https://marialopez.com',
        linkedin: 'https://linkedin.com/in/marialopez',
        availability: 'within_3_months',
        jobPreferences: ['Marketing', 'Community Manager', 'Remoto'],
        isVisible: true,
        lastActive: '2024-12-13',
        completedProjects: 12,
        rating: 4.9
      },
      {
        id: 4,
        name: 'David Rodríguez Pérez',
        email: 'david.rodriguez@email.com',
        age: 28,
        location: 'Sevilla',
        program: 'Diseño Gráfico y Web',
        studyCenter: 'Escuela de Arte Sevilla',
        skills: ['Figma', 'Adobe Creative Suite', 'HTML/CSS', 'JavaScript', 'UX/UI'],
        experience: '3 años',
        graduationYear: 2021,
        gpa: 8.7,
        languages: ['Español', 'Inglés'],
        portfolio: 'https://davidrodriguez.design',
        linkedin: 'https://linkedin.com/in/davidrodriguez',
        availability: 'flexible',
        jobPreferences: ['Diseño', 'UX/UI', 'Freelance'],
        isVisible: true,
        lastActive: '2024-12-12',
        completedProjects: 15,
        rating: 4.7
      },
      {
        id: 5,
        name: 'Laura Fernández Gil',
        email: 'laura.fernandez@email.com',
        age: 23,
        location: 'Bilbao',
        program: 'Administración de Sistemas',
        studyCenter: 'Instituto Vasco de Tecnología',
        skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Python'],
        experience: '1 año',
        graduationYear: 2023,
        gpa: 8.1,
        languages: ['Español', 'Euskera', 'Inglés'],
        github: 'https://github.com/laurafernandez',
        availability: 'immediate',
        jobPreferences: ['DevOps', 'Cloud', 'Remoto'],
        isVisible: true,
        lastActive: '2024-12-11',
        completedProjects: 6,
        rating: 4.6
      }
    ];

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, students]);

  const applyFilters = () => {
    let filtered = [...students];

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros específicos
    if (filters.location) {
      filtered = filtered.filter(student => student.location === filters.location);
    }

    if (filters.program) {
      filtered = filtered.filter(student => student.program === filters.program);
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(student =>
        filters.skills.some(skill => 
          student.skills.some(studentSkill => 
            studentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.availability) {
      filtered = filtered.filter(student => student.availability === filters.availability);
    }

    // Filtros de rango
    filtered = filtered.filter(student => 
      student.age >= filters.ageRange[0] && student.age <= filters.ageRange[1]
    );

    filtered = filtered.filter(student => 
      student.gpa >= filters.gpaRange[0] && student.gpa <= filters.gpaRange[1]
    );

    setFilteredStudents(filtered);
  };

  const handleSaveStudent = (studentId: number) => {
    if (savedStudents.includes(studentId)) {
      setSavedStudents(savedStudents.filter(id => id !== studentId));
    } else {
      setSavedStudents([...savedStudents, studentId]);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      program: '',
      skills: [],
      ageRange: [18, 35],
      gpaRange: [0, 10],
      availability: '',
      graduationYear: '',
      experience: '',
      languages: []
    });
    setSearchTerm('');
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'immediate': return 'Inmediata';
      case 'within_month': return 'En 1 mes';
      case 'within_3_months': return 'En 3 meses';
      case 'flexible': return 'Flexible';
      default: return 'No especificada';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediate': return 'bg-green-100 text-green-800';
      case 'within_month': return 'bg-blue-100 text-blue-800';
      case 'within_3_months': return 'bg-orange-100 text-orange-800';
      case 'flexible': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueLocations = Array.from(new Set(students.map(s => s.location)));
  const uniquePrograms = Array.from(new Set(students.map(s => s.program)));
  const uniqueSkills = Array.from(new Set(students.flatMap(s => s.skills)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 text-white rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Buscador de Estudiantes</h1>
              <p className="text-muted-foreground">Encuentra el talento perfecto para tu empresa</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, habilidades, programa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="location-filter">Ubicación</Label>
                    <Select value={filters.location} onValueChange={(value: string) => setFilters({...filters, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las ubicaciones</SelectItem>
                        {uniqueLocations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="program-filter">Programa</Label>
                    <Select value={filters.program} onValueChange={(value: string) => setFilters({...filters, program: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los programas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los programas</SelectItem>
                        {uniquePrograms.map(program => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="availability-filter">Disponibilidad</Label>
                    <Select value={filters.availability} onValueChange={(value: string) => setFilters({...filters, availability: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier disponibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquier disponibilidad</SelectItem>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="within_month">En 1 mes</SelectItem>
                        <SelectItem value="within_3_months">En 3 meses</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Rango de Edad: {filters.ageRange[0]} - {filters.ageRange[1]} años</Label>
                    <Slider
                      value={filters.ageRange}
                      onValueChange={(value: number[]) => setFilters({...filters, ageRange: value as [number, number]})}
                      max={50}
                      min={18}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Nota Media: {filters.gpaRange[0]} - {filters.gpaRange[1]}</Label>
                    <Slider
                      value={filters.gpaRange}
                      onValueChange={(value: number[]) => setFilters({...filters, gpaRange: value as [number, number]})}
                      max={10}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''} encontrado{filteredStudents.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Guardados: {savedStudents.length}</span>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.age} años</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveStudent(student.id)}
                    className={savedStudents.includes(student.id) ? 'text-red-600' : 'text-gray-400'}
                  >
                    <Heart className={`w-4 h-4 ${savedStudents.includes(student.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{student.program}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{student.studyCenter}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{student.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Nota: {student.gpa}/10</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Badge className={getAvailabilityColor(student.availability)}>
                    {getAvailabilityText(student.availability)}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Habilidades:</h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{student.skills.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Activo: {new Date(student.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Ver CV
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron estudiantes</h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o términos de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function StudentSearchPage() {
  return (
    <AuthGuard requireAuth>
      <StudentSearchContent />
    </AuthGuard>
  );
}
