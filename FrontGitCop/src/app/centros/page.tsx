'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, BookOpen, Users } from 'lucide-react';
import { scenterService } from '@/lib/services';
import { Scenter } from '@/types';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '@/components/ui/loading';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

export default function CentrosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCenters, setFilteredCenters] = useState<Scenter[]>([]);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Show loading while checking authentication
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const { data: centers = [], isLoading, error } = useQuery({
    queryKey: ['scenters'],
    queryFn: () => scenterService.getAll().then(res => res.data),
  });

  useEffect(() => {
    if (centers.length > 0) {
      const filtered = centers.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCenters(filtered);
    }
  }, [centers, searchTerm]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando centros educativos..." />
  }

  if (error) {
    return <ErrorDisplay message="Error al cargar los centros educativos" onRetry={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Centros Educativos
            </h1>
            <p className="text-gray-600 mt-2">
              Conoce los centros educativos participantes en el programa
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar centros por nombre o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-gray-600">
            {filteredCenters.length} centros encontrados
          </p>

          {filteredCenters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron centros
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Intenta con diferentes términos de búsqueda'
                    : 'Aún no hay centros educativos registrados'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {center.name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {center.city && (
                        <div className="flex items-center text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {center.city}
                        </div>
                      )}
                      {center.code && (
                        <Badge variant="outline">Código: {center.code}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {center.email && (
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {center.email}
                        </p>
                      )}
                      {center.phone && (
                        <p className="text-sm text-gray-600">
                          <strong>Teléfono:</strong> {center.phone}
                        </p>
                      )}
                      {center.address && (
                        <p className="text-sm text-gray-600">
                          <strong>Dirección:</strong> {center.address}
                        </p>
                      )}
                      <div className="pt-2">
                        <Button className="w-full" size="sm">
                          Ver Estudiantes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
