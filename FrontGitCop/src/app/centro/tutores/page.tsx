'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search, Users, Phone, Mail, Plus, Building2 } from 'lucide-react';
import { tutorsService, scenterService } from '@/lib/services';
import { useAuthStore } from '@/stores/auth';

interface Tutor {
  id: string;
  name: string;
  email: string;
  grade?: string;
  degree?: string;
  tutorId?: number;
  scenter?: {
    id: number;
    name: string;
    city: string;
  };
  profamily?: {
    id: number;
    name: string;
    description: string;
  };
  studentsCount?: number;
}

export default function TutoresPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadTutors = async () => {
      try {
        setIsLoading(true);
        // Obtener el ID del centro del usuario actual
        const userScenterInfo = await scenterService.getUserScenterInfo();
        const scenterId = userScenterInfo.data.data.scenter.id;
        const response = await tutorsService.getByScenter(scenterId);
        setTutors(response.data || []);
      } catch (error) {
        console.error('Error loading tutors:', error);
        setError('Error al cargar los tutores');
      } finally {
        setIsLoading(false);
      }
    };

    loadTutors();
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tutor.grade && tutor.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.degree && tutor.degree.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.profamily?.name && tutor.profamily.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusBadge = (tutor: Tutor) => {
    // Como no tenemos campo status, mostramos un badge genérico
    return (
      <Badge className="bg-blue-100 text-blue-800">
        Tutor
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
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
                  placeholder="Nombre, email, grado o familia profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
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
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Con Estudiantes</p>
                <p className="text-2xl font-bold text-green-700">
                  {tutors.filter(t => t.studentsCount && t.studentsCount > 0).length}
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
                <p className="text-sm text-gray-600">Familias Profesionales</p>
                <p className="text-2xl font-bold text-purple-700">
                  {new Set(tutors.map(t => t.profamily?.id).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Con Email</p>
                <p className="text-2xl font-bold text-orange-700">
                  {tutors.filter(t => t.email).length}
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
                      {getStatusBadge(tutor)}
                      {tutor.studentsCount && tutor.studentsCount > 0 && (
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
                      
                      {tutor.grade && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Grado: {tutor.grade}</span>
                        </div>
                      )}
                      
                      {tutor.degree && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Título: {tutor.degree}</span>
                        </div>
                      )}
                      
                      {tutor.profamily && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Familia: {tutor.profamily.name}</span>
                        </div>
                      )}
                      
                      {tutor.scenter && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Centro: {tutor.scenter.name}</span>
                        </div>
                      )}
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
