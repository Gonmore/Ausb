"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCV } from '@/hooks/useCV';
import { ProfamilySelector } from './ProfamilySelector';
import { ScenterSelector } from './ScenterSelector';
import StudentSkillsManager from '@/components/StudentSkillsManager';
import { School, Briefcase, Target, User, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  isCompleted: boolean;
  isRequired: boolean;
}

interface StudentOnboardingWizardProps {
  onComplete?: () => void;
  className?: string;
}

export function StudentOnboardingWizard({ onComplete, className = '' }: StudentOnboardingWizardProps) {
  const { cvData, completionPercentage, hasProfamily, hasStudentSkills, hasScenter, refresh } = useCV();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'profamily',
      title: 'Familia Profesional',
      description: 'Selecciona tu área de especialización profesional',
      icon: Briefcase,
      component: ProfamilySelector,
      isCompleted: hasProfamily,
      isRequired: true,
    },
    {
      id: 'scenter',
      title: 'Centro Educativo',
      description: 'Selecciona tu centro educativo afiliado',
      icon: School,
      component: ScenterSelector,
      isCompleted: hasScenter,
      isRequired: true,
    },
    {
      id: 'skills',
      title: 'Habilidades',
      description: 'Agrega tus competencias y conocimientos técnicos',
      icon: Target,
      component: StudentSkillsManager,
      isCompleted: !!hasStudentSkills,
      isRequired: true,
    },
    {
      id: 'personal-info',
      title: 'Información Personal',
      description: 'Completa tu información de contacto y perfil',
      icon: User,
      component: PersonalInfoForm,
      isCompleted: completionPercentage >= 70, // Consideramos completado si tiene buena parte de la info
      isRequired: false,
    },
    {
      id: 'cv-summary',
      title: 'Resumen de CV',
      description: 'Revisa y completa los detalles de tu currículum',
      icon: FileText,
      component: CVSummary,
      isCompleted: completionPercentage >= 80,
      isRequired: false,
    },
  ];

  // Actualizar pasos completados cuando cambie el estado del CV
  useEffect(() => {
    const newCompletedSteps = new Set<string>();
    steps.forEach(step => {
      if (step.isCompleted) {
        newCompletedSteps.add(step.id);
      }
    });
    setCompletedSteps(newCompletedSteps);
  }, [hasProfamily, hasScenter, hasStudentSkills, completionPercentage]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const canProceed = currentStep.isCompleted || !currentStep.isRequired;

  const handleNext = () => {
    if (isLastStep) {
      // No llamar onComplete aquí, solo cuando se complete profamily
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    refresh(); // Actualizar datos del CV

    // Si se completó el paso de profamily, notificar al componente padre
    if (stepId === 'profamily') {
      onComplete?.();
    }
  };

  const completedStepsCount = completedSteps.size;
  const totalStepsCount = steps.length;
  const overallProgress = (completedStepsCount / totalStepsCount) * 100;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header con progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            Completa tu Perfil Profesional
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para crear un perfil completo y aumentar tus oportunidades laborales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso general</span>
              <span className="font-medium">{completedStepsCount} de {totalStepsCount} pasos completados</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-gray-600">
              {Math.round(overallProgress)}% completado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación de pasos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              const isClickable = index <= currentStepIndex || isCompleted;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : isCompleted
                        ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    <div className={`p-2 rounded-full ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-32">
                        {step.description}
                      </p>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contenido del paso actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <currentStep.icon className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
            {currentStep.isCompleted && (
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <currentStep.component
            onComplete={() => handleStepComplete(currentStep.id)}
            compact={true}
          />
        </CardContent>
      </Card>

      {/* Navegación inferior */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Paso {currentStepIndex + 1} de {steps.length}
              </p>
              <p className="text-xs text-gray-500">
                {currentStep.isRequired ? 'Paso obligatorio' : 'Paso opcional'}
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Finalizar' : 'Siguiente'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {!canProceed && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Completa este paso antes de continuar al siguiente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente auxiliar para información personal
function PersonalInfoForm({ onComplete, compact }: { onComplete?: () => void; compact?: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Aquí puedes completar tu información personal, contacto y detalles adicionales de tu perfil.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Esta funcionalidad estará disponible próximamente. Por ahora, puedes completar tu información
          desde la sección "Mi CV" en el menú lateral.
        </p>
      </div>
    </div>
  );
}

// Componente auxiliar para resumen de CV
function CVSummary({ onComplete, compact }: { onComplete?: () => void; compact?: boolean }) {
  const { completionPercentage, missingFields } = useCV();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Completitud del CV</h4>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-gray-600">{Math.round(completionPercentage)}% completado</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-2">Campos pendientes</h4>
          {missingFields.length > 0 ? (
            <div className="space-y-1">
              {missingFields.slice(0, 5).map((field, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  {field}
                </div>
              ))}
              {missingFields.length > 5 && (
                <p className="text-sm text-gray-500">
                  +{missingFields.length - 5} campos más...
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-green-600">¡Todos los campos completados!</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          ¡Excelente progreso! Tu perfil está casi completo. Las ofertas más relevantes
          ya deberían aparecer en la sección de recomendaciones.
        </p>
      </div>
    </div>
  );
}