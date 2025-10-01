'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  GraduationCap,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';

interface AcademicVerification {
  id: number;
  studentId: number;
  scenterId: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  scenter: {
    id: number;
    name: string;
  };
  cv: {
    academicBackground: {
      scenter: number;
      profamily: number;
      status: 'titulado' | 'egresado' | 'por_egresar';
    };
    profamily?: {
      id: number;
      name: string;
    };
  };
}

function VerificacionesCentroContent() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [verifications, setVerifications] = useState<AcademicVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<AcademicVerification | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.id && user.role === 'scenter') {
      loadVerifications();
    }
  }, [user]);

  const loadVerifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academic-verifications/scenter`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      } else {
        console.error('Error loading verifications');
      }
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (verification: AcademicVerification, action: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setReviewComments('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedVerification) return;

    setSubmittingReview(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academic-verifications/${selectedVerification.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: reviewAction,
          comments: reviewComments.trim() || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the verification in the list
        setVerifications(prev =>
          prev.map(v =>
            v.id === selectedVerification.id
              ? { ...v, status: reviewAction === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: user?.id, comments: reviewComments.trim() || undefined }
              : v
          )
        );
        setShowReviewModal(false);
        setSelectedVerification(null);
        alert(`Verificación ${reviewAction === 'approve' ? 'aprobada' : 'rechazada'} correctamente.`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al procesar la revisión');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                 Volver al Dashboard
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verificaciones Académicas</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {verifications.filter(v => v.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-900">
                    {verifications.filter(v => v.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-900">
                    {verifications.filter(v => v.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {verifications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verifications List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Solicitudes de Verificación</h2>

            {verifications.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes de verificación</h3>
                <p className="text-gray-500">Las solicitudes de verificación académica aparecerán aquí cuando los estudiantes las envíen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div key={verification.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{verification.student.name}</h3>
                            <p className="text-sm text-gray-500">{verification.student.email}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`}>
                            {getStatusIcon(verification.status)}
                            <span className="ml-1">{getStatusText(verification.status)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{verification.scenter.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {verification.cv?.profamily?.name || 'Sin familia profesional'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(verification.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Información Académica Declarada:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Centro:</span> {verification.scenter.name}
                            </div>
                            <div>
                              <span className="font-medium">Familia Profesional:</span> {verification.cv?.profamily?.name || 'No especificada'}
                            </div>
                            <div>
                              <span className="font-medium">Estado:</span> {
                                verification.cv?.academicBackground?.status === 'titulado' ? 'Titulado' :
                                verification.cv?.academicBackground?.status === 'egresado' ? 'Egresado' :
                                verification.cv?.academicBackground?.status === 'por_egresar' ? 'Por egresar' : 'No especificado'
                              }
                            </div>
                          </div>
                        </div>

                        {verification.comments && (
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Comentarios:</h4>
                            <p className="text-sm text-blue-800">{verification.comments}</p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        {verification.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openReviewModal(verification, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => openReviewModal(verification, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rechazar
                            </button>
                          </>
                        )}
                        {verification.status !== 'pending' && (
                          <div className="text-center">
                            <VerificationBadge
                              status={verification.status === 'approved' ? 'verified' : 'rejected'}
                              showText={false}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'} Verificación
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Estudiante: <span className="font-medium">{selectedVerification.student.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Centro: <span className="font-medium">{selectedVerification.scenter.name}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                placeholder="Agregue comentarios sobre la decisión..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submittingReview}
              >
                Cancelar
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {submittingReview ? 'Procesando...' : (reviewAction === 'approve' ? 'Aprobar' : 'Rechazar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificacionesCentroPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <VerificacionesCentroContent />
    </AuthGuard>
  );
}