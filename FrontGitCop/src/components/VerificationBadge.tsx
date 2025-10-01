"use client";

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  className?: string;
  showText?: boolean;
}

export default function VerificationBadge({
  status,
  className = '',
  showText = true
}: VerificationBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'VERIFICADO',
          bgColor: 'bg-green-500',
          textColor: 'text-green-600',
          description: 'Información verificada por el centro de estudios'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'PENDIENTE',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          description: 'Esperando verificación del centro de estudios'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'RECHAZADO',
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          description: 'La verificación fue rechazada'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'NO VERIFICADO',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-600',
          description: 'Información no verificada'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Badge principal */}
      <div className={`
        relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        ${status === 'verified' ? 'bg-green-100 border border-green-200' : ''}
        ${status === 'pending' ? 'bg-yellow-100 border border-yellow-200' : ''}
        ${status === 'rejected' ? 'bg-red-100 border border-red-200' : ''}
        ${status === 'unverified' ? 'bg-gray-100 border border-gray-200' : ''}
      `}>
        <IconComponent className={`h-3 w-3 ${config.textColor}`} />
        {showText && (
          <span className={config.textColor}>
            {config.text}
          </span>
        )}

        {/* Sello "VERIFIED" transparente para estado verificado */}
        {status === 'verified' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-green-600 font-bold text-lg opacity-20 select-none transform rotate-12">
              VERIFIED
            </span>
          </div>
        )}
      </div>

      {/* Tooltip con descripción */}
      <div className="group relative">
        <AlertCircle className="h-4 w-4 text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar el sello de verificación sobre la información académica
export function AcademicVerificationOverlay({
  status,
  children
}: {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}

      {/* Overlay con sello para información verificada */}
      {status === 'verified' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 bg-opacity-10 border-2 border-green-500 border-opacity-20 rounded-lg w-full h-full flex items-center justify-center">
            <span className="text-green-600 font-bold text-4xl opacity-15 select-none transform -rotate-12">
              VERIFIED
            </span>
          </div>
        </div>
      )}

      {/* Badge en la esquina superior derecha */}
      <div className="absolute top-2 right-2">
        <VerificationBadge status={status} showText={false} />
      </div>
    </div>
  );
}