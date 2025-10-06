'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Search, GraduationCap, Building2, MapPin, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { scenterService } from '@/lib/services';

interface Student {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    active: boolean;
  };
  grade?: string;
  course?: string;
  car: boolean;
  profamily: {
    id: number;
    name: string;
  } | null;
  tutor: {
    id: number;
    name: string;
    email: string;
  } | null;
  cv: {
    verificationStatus: string;
    verifiedAt?: string;
  };
  applications: any[];
  applicationStats: {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  };
}

export default function TablonAlumnosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await scenterService.getScenterStudents();
      
      if (response.data.success) {
        setStudents(response.data.data);
      } else {
        setError('Error al cargar los estudiantes');
      }
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError(err.response?.data?.message || 'Error al cargar los estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.user.name} ${student.user.surname || ''}`.trim().toLowerCase();
    const profamilyName = student.profamily?.name?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         profamilyName.includes(searchTerm.toLowerCase()) ||
                         student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || student.cv.verificationStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { label: 'Verificado', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      unverified: { label: 'Sin Verificar', className: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unverified;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStudents}>Reintentar</Button>
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
                  placeholder="Nombre, email o familia profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado de Verificación</Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="verified">Verificado</option>
                <option value="unverified">Sin Verificar</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={loadStudents}>
                Actualizar
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
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-green-700">
                  {students.filter(s => s.cv.verificationStatus === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {students.filter(s => s.cv.verificationStatus === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Sin Verificar</p>
                <p className="text-2xl font-bold text-red-700">
                  {students.filter(s => s.cv.verificationStatus === 'unverified').length}
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.user.name} {student.user.surname}
                      </h3>
                      {getVerificationBadge(student.cv.verificationStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{student.user.email}</span>
                      </div>

                      {student.user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{student.user.phone}</span>
                        </div>
                      )}

                      {student.profamily && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{student.profamily.name}</span>
                        </div>
                      )}

                      {student.grade && (
                        <div className="flex items-center space-x-2">
                          <Badge className="h-4 w-4" />
                          <span>{student.grade}</span>
                        </div>
                      )}

                      {student.tutor && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Tutor: {student.tutor.name}</span>
                        </div>
                      )}

                      {student.cv.verifiedAt && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Verificado: {new Date(student.cv.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm">
                      Gestionar
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
