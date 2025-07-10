'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Search, GraduationCap, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  family: string;
  grade: string;
  company?: string;
  status: 'disponible' | 'en_practicas' | 'finalizado';
}

export default function TablonAlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    // Simulando datos de estudiantes del centro
    const mockStudents: Student[] = [
      {
        id: 1,
        name: 'Ana García',
        email: 'ana.garcia@ejemplo.com',
        phone: '+34 600 123 456',
        family: 'Informática y Comunicaciones',
        grade: 'Grado Superior',
        company: 'TechCorp',
        status: 'en_practicas'
      },
      {
        id: 2,
        name: 'Carlos López',
        email: 'carlos.lopez@ejemplo.com',
        phone: '+34 600 789 012',
        family: 'Administración y Gestión',
        grade: 'Grado Medio',
        status: 'disponible'
      },
      {
        id: 3,
        name: 'María Rodríguez',
        email: 'maria.rodriguez@ejemplo.com',
        phone: '+34 600 345 678',
        family: 'Sanidad',
        grade: 'Grado Superior',
        company: 'Hospital Central',
        status: 'finalizado'
      },
      {
        id: 4,
        name: 'David Martín',
        email: 'david.martin@ejemplo.com',
        phone: '+34 600 901 234',
        family: 'Electricidad y Electrónica',
        grade: 'Grado Medio',
        status: 'disponible'
      }
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disponible: { label: 'Disponible', className: 'bg-green-100 text-green-800' },
      en_practicas: { label: 'En Prácticas', className: 'bg-blue-100 text-blue-800' },
      finalizado: { label: 'Finalizado', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estudiantes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Tablón de Alumnos</h1>
        </div>
        <p className="text-gray-600">
          Gestiona y supervisa a todos los estudiantes de tu centro educativo
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar estudiante</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre o familia profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="en_practicas">En Prácticas</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Exportar Lista
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-700">
                  {students.filter(s => s.status === 'disponible').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">En Prácticas</p>
                <p className="text-2xl font-bold text-blue-700">
                  {students.filter(s => s.status === 'en_practicas').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-gray-700">
                  {students.filter(s => s.status === 'finalizado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de estudiantes */}
      <div className="grid gap-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron estudiantes
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      {getStatusBadge(student.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{student.email}</span>
                      </div>
                      
                      {student.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{student.family}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className="h-4 w-4" />
                        <span>{student.grade}</span>
                      </div>
                      
                      {student.company && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>{student.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm">
                      Contactar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
