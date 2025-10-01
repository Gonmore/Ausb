"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SimpleOnboardingActionsProps {
  completionPercentage: number;
  isComplete: boolean;
  missingFields?: string[];
  className?: string;
}

export function SimpleOnboardingActions({
  completionPercentage,
  isComplete,
  missingFields = [],
  className = ''
}: SimpleOnboardingActionsProps) {
  const router = useRouter();

  // Si el perfil está completo, no mostrar nada (el dashboard ya maneja esto)
  if (isComplete) {
    return null;
  }

  // Solo mostrar si el perfil está muy incompleto (< 50%)
  if (completionPercentage >= 50) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <AlertCircle className="w-5 h-5" />
          ¡Comienza tu perfil!
          <Badge variant="secondary" className="ml-auto">
            {Math.round(completionPercentage)}%
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Completa tu información básica para desbloquear todas las funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => router.push('/mi-cv')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Completar CV ({Math.round(completionPercentage)}%)
          </Button>
          <Button
            onClick={() => router.push('/ofertas')}
            variant="outline"
            disabled={completionPercentage < 30}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {completionPercentage < 30 ? 'Completa tu perfil primero' : 'Ver Ofertas Disponibles'}
          </Button>
        </div>

        {missingFields.length > 0 && (
          <div className="pt-3 border-t border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Campos que faltan por completar:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 3).map((field, index) => (
                <Badge key={index} variant="outline" className="text-xs text-blue-700 border-blue-300">
                  {field}
                </Badge>
              ))}
              {missingFields.length > 3 && (
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                  +{missingFields.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}