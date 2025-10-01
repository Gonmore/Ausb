"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';
import { School, CheckCircle, Loader2 } from 'lucide-react';

interface Scenter {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  active: boolean;
}

interface ScenterSelectorProps {
  onScenterSelected?: (scenter: Scenter) => void;
  className?: string;
  compact?: boolean;
}

export function ScenterSelector({ onScenterSelected, className = '', compact = false }: ScenterSelectorProps) {
  const { user } = useAuthStore();
  const [scenters, setScenters] = useState<Scenter[]>([]);
  const [selectedScenter, setSelectedScenter] = useState<Scenter | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentScenter, setCurrentScenter] = useState<Scenter | null>(null);

  // Cargar centros educativos disponibles
  useEffect(() => {
    loadScenters();
    loadCurrentScenter();
  }, []);

  const loadScenters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/scenters/active');
      setScenters(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading scenters:', error);
      alert('No se pudieron cargar los centros educativos');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentScenter = async () => {
    if (!user?.id) return;

    try {
      const response = await apiClient.get(`/api/students/${user.id}/scenter`);
      if (response.data && response.data.scenter) {
        setCurrentScenter(response.data.scenter);
        setSelectedScenter(response.data.scenter);
      }
    } catch (error) {
      // Es normal que no tenga scenter asignado aún
      console.log('No current scenter found');
    }
  };

  const handleScenterSelect = (scenterId: string) => {
    const scenter = scenters.find(s => s.id.toString() === scenterId);
    if (scenter) {
      setSelectedScenter(scenter);
    }
  };

  const handleSaveScenter = async () => {
    if (!selectedScenter || !user?.id) return;

    try {
      setSaving(true);
      await apiClient.put(`/api/students/${user.id}/scenter`, {
        scenterId: selectedScenter.id
      });

      setCurrentScenter(selectedScenter);
      alert('¡Excelente! Tu centro educativo ha sido guardado correctamente');

      // Notificar al componente padre
      onScenterSelected?.(selectedScenter);
    } catch (error) {
      console.error('Error saving scenter:', error);
      alert('No se pudo guardar el centro educativo');
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Centro Educativo</span>
          {currentScenter && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="w-3 h-3 mr-1" />
              {currentScenter.name}
            </Badge>
          )}
        </div>

        {!currentScenter && (
          <div className="space-y-2">
            <Select onValueChange={handleScenterSelect} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu centro educativo" />
              </SelectTrigger>
              <SelectContent>
                {scenters.map((scenter) => (
                  <SelectItem key={scenter.id} value={scenter.id.toString()}>
                    {scenter.name} - {scenter.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSaveScenter}
              disabled={!selectedScenter || saving}
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
          <School className="w-5 h-5 text-blue-600" />
          Selecciona tu Centro Educativo
        </CardTitle>
        <CardDescription>
          Elige el centro educativo afiliado donde realizas tus estudios.
          Esto nos ayudará a validar tu información académica.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentScenter ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Centro educativo seleccionado
                </p>
                <p className="text-sm text-green-600">
                  {currentScenter.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {currentScenter.city} • Código: {currentScenter.code}
                </p>
                {currentScenter.address && (
                  <p className="text-xs text-green-600">
                    {currentScenter.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Centro Educativo *
              </label>
              <Select onValueChange={handleScenterSelect} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu centro educativo" />
                </SelectTrigger>
                <SelectContent>
                  {scenters.map((scenter) => (
                    <SelectItem key={scenter.id} value={scenter.id.toString()}>
                      {scenter.name} - {scenter.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScenter && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-1">
                  {selectedScenter.name}
                </h4>
                <p className="text-sm text-blue-600">
                  {selectedScenter.city} • Código: {selectedScenter.code}
                </p>
                {selectedScenter.address && (
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedScenter.address}
                  </p>
                )}
                {selectedScenter.phone && (
                  <p className="text-xs text-blue-600">
                    Tel: {selectedScenter.phone}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleSaveScenter}
              disabled={!selectedScenter || saving}
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