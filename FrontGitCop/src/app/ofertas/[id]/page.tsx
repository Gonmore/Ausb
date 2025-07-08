'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
// import { ConditionalHeader } from '@/components/conditional-header';

interface Oferta {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  empresa: {
    nombre: string;
    descripcion?: string;
  };
  fecha_publicacion: string;
  salario?: string;
  tipo: string;
  modalidad: string;
  requisitos?: string[];
  beneficios?: string[];
  fechaLimite?: string;
  contacto?: string;
}

export default function OfertaDetallePage() {
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const ofertaId = params.id as string;

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
      
      // Datos mock para demostración
      const mockOferta: Oferta = {
        id: ofertaId,
        titulo: 'Desarrollador Frontend React',
        descripcion: 'Únete a nuestro equipo de desarrollo y trabaja en proyectos innovadores utilizando las últimas tecnologías. Desarrollarás aplicaciones web modernas con React, TypeScript y Next.js, colaborando con un equipo dinámico y experimentado.',
        ubicacion: 'Berlín, Alemania',
        empresa: {
          nombre: 'Tech Solutions GmbH',
          descripcion: 'Empresa líder en desarrollo de software con más de 10 años de experiencia en el mercado europeo.'
        },
        fecha_publicacion: '2024-01-15',
        salario: '45.000€ - 55.000€',
        tipo: 'Tiempo completo',
        modalidad: 'Híbrido',
        requisitos: [
          'Experiencia con React y TypeScript',
          'Conocimientos de HTML, CSS y JavaScript',
          'Familiaridad con Git y herramientas de desarrollo',
          'Nivel intermedio de alemán',
          'Grado en Informática o experiencia equivalente'
        ],
        beneficios: [
          'Horario flexible',
          'Trabajo remoto híbrido',
          'Seguro médico completo',
          'Presupuesto para formación',
          'Ambiente de trabajo dinámico',
          'Oportunidades de crecimiento profesional'
        ],
        fechaLimite: '2024-02-15',
        contacto: 'jobs@techsolutions.de'
      };
      
      setOferta(mockOferta);
    }, 500);
  }, [ofertaId]);

  const handleApply = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Simular aplicación
    alert('¡Aplicación enviada con éxito! Te contactaremos pronto.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando oferta...</p>
        </div>
      </div>
    );
  }

  if (error || !oferta) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error || 'Oferta no encontrada'}</p>
          <button
            onClick={() => router.push('/ofertas')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver a Ofertas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <ConditionalHeader /> */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Volver
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{oferta.titulo}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                🏢 {oferta.empresa.nombre}
              </span>
              <span className="flex items-center gap-1">
                📍 {oferta.ubicacion}
              </span>
              <span className="flex items-center gap-1">
                🕒 {oferta.tipo}
              </span>
              <span className="flex items-center gap-1">
                💼 {oferta.modalidad}
              </span>
            </div>
            
            {oferta.salario && (
              <div className="text-xl font-semibold text-green-600 mb-4">
                💰 {oferta.salario}
              </div>
            )}
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Aplicar a esta oferta
              </button>
              <button
                onClick={() => router.push('/aplicaciones')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Ver mis aplicaciones
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{oferta.descripcion}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Empresa</h3>
                <p className="text-gray-700">{oferta.empresa.descripcion}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Publicado:</span>
                  <p className="text-gray-600">{new Date(oferta.fecha_publicacion).toLocaleDateString('es-ES')}</p>
                </div>
                {oferta.fechaLimite && (
                  <div>
                    <span className="font-medium text-gray-900">Fecha límite:</span>
                    <p className="text-gray-600">{new Date(oferta.fechaLimite).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              {oferta.requisitos && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                  <ul className="space-y-2">
                    {oferta.requisitos.map((requisito, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{requisito}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {oferta.beneficios && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Beneficios</h3>
                  <ul className="space-y-2">
                    {oferta.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {oferta.contacto && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contacto</h3>
                  <p className="text-gray-700">{oferta.contacto}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
