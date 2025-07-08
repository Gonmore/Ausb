'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building, Users } from 'lucide-react';
import { companyService } from '@/lib/services';
import { Company } from '@/types';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '@/components/ui/loading';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
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

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll().then(res => res.data),
  });

  useEffect(() => {
    if (companies.length > 0) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companies, searchTerm]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando empresas..." />
  }

  if (error) {
    return <ErrorDisplay message="Error al cargar las empresas" onRetry={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Empresas Colaboradoras
            </h1>
            <p className="text-gray-600 mt-2">
              Descubre las empresas que ofrecen oportunidades de prácticas
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
                placeholder="Buscar empresas por nombre, sector o ciudad..."
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
            {filteredCompanies.length} empresas encontradas
          </p>

          {filteredCompanies.length === 0 ? (
            <EmptyState
              title="No se encontraron empresas"
              description={searchTerm ? "Intenta con diferentes términos de búsqueda" : "Aún no hay empresas registradas"}
              icon={<Building className="h-12 w-12 text-gray-400 mx-auto" />}
              action={searchTerm ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Limpiar búsqueda
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {company.name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {company.city && (
                        <div className="flex items-center text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {company.city}
                        </div>
                      )}
                      {company.sector && (
                        <Badge variant="outline">{company.sector}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {company.email && (
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {company.email}
                        </p>
                      )}
                      {company.phone && (
                        <p className="text-sm text-gray-600">
                          <strong>Teléfono:</strong> {company.phone}
                        </p>
                      )}
                      {company.address && (
                        <p className="text-sm text-gray-600">
                          <strong>Dirección:</strong> {company.address}
                        </p>
                      )}
                      <div className="pt-2">
                        <Button className="w-full" size="sm">
                          Ver Ofertas
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
