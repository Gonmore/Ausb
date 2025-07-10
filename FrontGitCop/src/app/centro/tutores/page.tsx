'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search, Users, Phone, Mail, Plus, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface Tutor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  specialization: string[];
  studentsCount: number;
  status: 'activo' | 'inactivo';
  company?: string;
}

export default function TutoresPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    // Simulando datos de tutores
    const mockTutors: Tutor[] = [
      {
        id: 1,
        name: 'Prof. Elena Martínez',
        email: 'elena.martinez@centro.edu',
        phone: '+34 600 111 222',
        department: 'Informática y Comunicaciones',
        specialization: ['Desarrollo Web', 'Bases de Datos', 'Redes'],
        studentsCount: 8,
        status: 'activo',
        company: 'TechCorp'
      },
      {
        id: 2,
        name: 'Prof. Miguel Ruiz',
        email: 'miguel.ruiz@centro.edu',
        phone: '+34 600 333 444',
        department: 'Administración y Gestión',
        specialization: ['Contabilidad', 'Recursos Humanos'],
        studentsCount: 12,
        status: 'activo'
      },
      {
        id: 3,
        name: 'Prof. Carmen Silva',
        email: 'carmen.silva@centro.edu',
        phone: '+34 600 555 666',
        department: 'Sanidad',
        specialization: ['Enfermería', 'Auxiliar de Enfermería'],
        studentsCount: 6,
        status: 'activo',
        company: 'Hospital Central'
      },
      {
        id: 4,
        name: 'Prof. Antonio López',
        email: 'antonio.lopez@centro.edu',
        phone: '+34 600 777 888',
        department: 'Electricidad y Electrónica',
        specialization: ['Instalaciones Eléctricas', 'Automatización'],
        studentsCount: 0,
        status: 'inactivo'
      }
    ];

    setTimeout(() => {
      setTutors(mockTutors);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'todos' || tutor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      activo: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' }
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
            <p className="text-gray-600">Cargando tutores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tutores</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Tutor
          </Button>
        </div>
        <p className="text-gray-600">
          Administra y supervisa a los tutores de prácticas de tu centro educativo
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
              <Label htmlFor="search">Buscar tutor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre, departamento o especialización..."
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
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
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tutores</p>
                <p className="text-2xl font-bold text-gray-900">{tutors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-700">
                  {tutors.filter(t => t.status === 'activo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Estudiantes Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {tutors.reduce((acc, tutor) => acc + tutor.studentsCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold text-purple-700">
                  {new Set(tutors.map(t => t.department)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tutores */}
      <div className="grid gap-4">
        {filteredTutors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron tutores
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tutor.name}</h3>
                      {getStatusBadge(tutor.status)}
                      {tutor.studentsCount > 0 && (
                        <Badge variant="outline" className="text-blue-600">
                          {tutor.studentsCount} estudiantes
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{tutor.email}</span>
                      </div>
                      
                      {tutor.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{tutor.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>{tutor.department}</span>
                      </div>
                      
                      {tutor.company && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Empresa: {tutor.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Especializaciones */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Especializaciones:</p>
                      <div className="flex flex-wrap gap-2">
                        {tutor.specialization.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Estudiantes
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
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
