'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ArrowRight, Users, FileText, Search } from 'lucide-react';

interface OnboardingGuideProps {
  className?: string;
  compact?: boolean;
}

export function OnboardingGuide({ className = '', compact = false }: OnboardingGuideProps) {
  const router = useRouter();
  const { status, loading, hasNextStep, nextStep, isComplete, shouldShowGuide, completeStep } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Verificando tu progreso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status || isComplete) {
    return null;
  }

  if (!shouldShowGuide && compact) {
    return null;
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'create_profile':
      case 'complete_student_info':
        return <Users className="w-5 h-5" />;
      case 'create_cv':
      case 'complete_cv':
        return <FileText className="w-5 h-5" />;
      case 'apply_to_offers':
        return <Search className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  const handleAction = async () => {
    if (!nextStep) return;

    setIsCompleting(true);
    
    try {
      if (nextStep.action === 'redirect' && nextStep.url) {
        router.push(nextStep.url);
      }
      
      // Marcar como visto
      if (nextStep.step !== 'complete') {
        await completeStep(`${nextStep.step}_viewed`);
      }
    } catch (error) {
      console.error('Error handling onboarding action:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const totalSteps = status.nextSteps.length;
  const completedSteps = Math.max(0, 5 - totalSteps);
  const progressPercentage = totalSteps > 0 ? (completedSteps / 5) * 100 : 100;

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          {getPriorityIcon(nextStep?.priority || 'medium')}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {nextStep?.title || 'Completar perfil'}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {nextStep?.description || 'Faltan algunos pasos'}
            </p>
          </div>
          <Button size="sm" onClick={handleAction} disabled={isCompleting}>
            {isCompleting ? 'Cargando...' : 'Continuar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">¡Completa tu perfil!</CardTitle>
            <CardDescription className="mt-1">
              Te ayudamos a aprovechar al máximo la plataforma
            </CardDescription>
          </div>
          <Badge variant={getPriorityColor(nextStep?.priority || 'medium')}>
            {nextStep?.priority === 'high' && 'Urgente'}
            {nextStep?.priority === 'medium' && 'Importante'}
            {nextStep?.priority === 'low' && 'Opcional'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progreso del perfil</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {completedSteps} de 5 pasos completados
          </p>
        </div>

        {/* Siguiente paso */}
        {nextStep && (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                {getStepIcon(nextStep.step)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{nextStep.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{nextStep.description}</p>
                
                {/* Detalles adicionales */}
                {nextStep.details && (
                  <div className="mt-3 space-y-2">
                    {nextStep.details.missingFields && (
                      <div className="text-xs">
                        <span className="text-gray-500">Campos faltantes:</span>
                        <div className="mt-1 space-x-1">
                          {nextStep.details.missingFields.map((field: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {nextStep.details.recommendedOffersCount && (
                      <div className="text-xs text-green-600">
                        ✨ {nextStep.details.recommendedOffersCount} ofertas esperándote
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={handleAction} 
                disabled={isCompleting}
                className="flex-1"
              >
                {isCompleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cargando...
                  </div>
                ) : (
                  <>
                    {nextStep.action === 'redirect' ? 'Ir ahora' : 'Continuar'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Pasos siguientes */}
        {status.nextSteps.length > 1 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Próximos pasos:</h5>
            <div className="space-y-1">
              {status.nextSteps.slice(1, 3).map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="truncate">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}