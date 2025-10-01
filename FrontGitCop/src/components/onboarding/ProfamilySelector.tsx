"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';
import { Briefcase, CheckCircle, Loader2 } from 'lucide-react';

interface Profamily {
  id: number;
  name: string;
  description: string;
  knowledgeAreaId?: number;
}

interface ProfamilySelectorProps {
  onProfamilySelected?: (profamily: Profamily) => void;
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

export function ProfamilySelector({ onProfamilySelected, onComplete, className = '', compact = false }: ProfamilySelectorProps) {
  const { user } = useAuthStore();
  const [profamilies, setProfamilies] = useState<Profamily[]>([]);
  const [selectedProfamily, setSelectedProfamily] = useState<Profamily | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentProfamily, setCurrentProfamily] = useState<Profamily | null>(null);

  // Cargar familias profesionales disponibles
  useEffect(() => {
    loadProfamilies();
    loadCurrentProfamily();
  }, []);

  const loadProfamilies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/profamilies');
      setProfamilies(response.data);
    } catch (error) {
      console.error('Error loading profamilies:', error);
      alert('No se pudieron cargar las familias profesionales');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentProfamily = async () => {
    if (!user?.id) return;

    try {
      const response = await apiClient.get(`/api/students/${user.id}/profamily`);
      if (response.data && response.data.profamily) {
        setCurrentProfamily(response.data.profamily);
        setSelectedProfamily(response.data.profamily);
      }
    } catch (error) {
      // Es normal que no tenga profamily asignada aún
      console.log('No current profamily found');
    }
  };

  const handleProfamilySelect = (profamilyId: string) => {
    const profamily = profamilies.find(p => p.id.toString() === profamilyId);
    if (profamily) {
      setSelectedProfamily(profamily);
    }
  };

  const handleSaveProfamily = async () => {
    if (!selectedProfamily || !user?.id) return;

    try {
      setSaving(true);
      await apiClient.put(`/api/students/${user.id}/profamily`, {
        profamilyId: selectedProfamily.id
      });

      setCurrentProfamily(selectedProfamily);
      alert('¡Excelente! Tu familia profesional ha sido guardada correctamente');

      // Notificar al componente padre
      onProfamilySelected?.(selectedProfamily);
      onComplete?.();
    } catch (error) {
      console.error('Error saving profamily:', error);
      alert('No se pudo guardar la familia profesional');
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Familia Profesional</span>
          {currentProfamily && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="w-3 h-3 mr-1" />
              {currentProfamily.name}
            </Badge>
          )}
        </div>

        {!currentProfamily && (
          <div className="space-y-2">
            <Select onValueChange={handleProfamilySelect} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu familia profesional" />
              </SelectTrigger>
              <SelectContent>
                {profamilies.map((profamily) => (
                  <SelectItem key={profamily.id} value={profamily.id.toString()}>
                    {profamily.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSaveProfamily}
              disabled={!selectedProfamily || saving}
              size="sm"
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar selección'
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Selecciona tu Familia Profesional
        </CardTitle>
        <CardDescription>
          Elige la familia profesional que mejor representa tu área de interés y experiencia.
          Esto nos ayudará a mostrarte ofertas más relevantes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentProfamily ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Familia profesional seleccionada
                </p>
                <p className="text-sm text-green-600">
                  {currentProfamily.name}
                </p>
                {currentProfamily.description && (
                  <p className="text-xs text-green-600 mt-1">
                    {currentProfamily.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Familia Profesional *
              </label>
              <Select onValueChange={handleProfamilySelect} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu familia profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profamilies.map((profamily) => (
                    <SelectItem key={profamily.id} value={profamily.id.toString()}>
                      {profamily.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfamily && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-1">
                  {selectedProfamily.name}
                </h4>
                {selectedProfamily.description && (
                  <p className="text-sm text-blue-600">
                    {selectedProfamily.description}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleSaveProfamily}
              disabled={!selectedProfamily || saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando selección...
                </>
              ) : (
                'Guardar y continuar'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}