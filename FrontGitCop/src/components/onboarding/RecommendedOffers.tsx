'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  mode: string;
  profamilyId?: number;
  profamily?: {
    name: string;
  };
  Company?: {
    name: string;
  };
  affinity?: {
    level: string;
    score: number;
  };
  recommended?: boolean;
  createdAt: string;
}

interface RecommendedOffersProps {
  className?: string;
  limit?: number;
}

export function RecommendedOffers({ className = '', limit = 3 }: RecommendedOffersProps) {
  const router = useRouter();
  const { getRecommendedOffers } = useOnboarding();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedOffers();
  }, []);

  const loadRecommendedOffers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRecommendedOffers();
      setOffers(data.offers.slice(0, limit));
    } catch (err: any) {
      setError('Error al cargar ofertas recomendadas');
      console.error('Error loading recommended offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAffinityColor = (level: string) => {
    switch (level) {
      case 'muy alto':
        return 'bg-green-100 text-green-800';
      case 'alto':
        return 'bg-blue-100 text-blue-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'bajo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getModeIcon = (mode: string) => {
    return mode === 'remoto' ? '🌐' : '📍';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ofertas Recomendadas
          </CardTitle>
          <CardDescription>
            Encontrando las mejores oportunidades para ti...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadRecommendedOffers} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ofertas Recomendadas
          </CardTitle>
          <CardDescription>
            No hay ofertas disponibles en este momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">
              Completa tu perfil para recibir mejores recomendaciones
            </p>
            <Button variant="outline" onClick={() => router.push('/mi-cv')} className="mt-2">
              Completar CV
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ofertas Recomendadas
            </CardTitle>
            <CardDescription>
              {offers.length} oportunidades perfectas para ti
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/ofertas')}>
            Ver todas
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/ofertas/${offer.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {offer.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {offer.Company?.name || 'Empresa'}
                </p>
              </div>
              
              {offer.affinity && offer.affinity.level !== 'sin datos' && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getAffinityColor(offer.affinity.level)}`}
                >
                  {offer.affinity.level} match
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {offer.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span>{getModeIcon(offer.mode)}</span>
                <span className="capitalize">{offer.mode}</span>
              </div>
              
              {offer.profamily && (
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{offer.profamily.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(offer.createdAt)}</span>
              </div>
            </div>

            {offer.recommended && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                ✨ Altamente recomendado para ti
              </div>
            )}
          </div>
        ))}

        <div className="pt-2 border-t">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => router.push('/ofertas')}
          >
            Explorar todas las ofertas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}