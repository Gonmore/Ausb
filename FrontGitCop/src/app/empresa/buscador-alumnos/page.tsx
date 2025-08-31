'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, Mail, Phone, Search, Filter, User, MapPin, Calendar, Car, GraduationCap, Briefcase, X, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

function CandidateSearchContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const { token } = useAuthStore();

  // Cargar aplicaciones de la empresa
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Llamando a /api/applications/company...');
        
        const response = await fetch('http://localhost:5000/api/applications/company', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Aplicaciones cargadas:', data);
        setApplications(data);
        setFilteredApplications(data);
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  // Filtrar aplicaciones
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.Student?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Student?.User?.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Student?.User?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Student?.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Student?.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.Offer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, applications]);

  const handleViewCV = (student: any) => {
    setSelectedStudent(student);
    setShowCVModal(true);
  };

  const handleContactStudent = (student: any, offerName: string) => {
    setSelectedStudent(student);
    setContactForm({
      subject: `Oferta: ${offerName} - ${student.User.name} ${student.User.surname}`,
      message: `Estimado/a ${student.User.name},\n\nNos ha interesado mucho su aplicación para la oferta "${offerName}".\n\nNos gustaría ponernos en contacto con usted para conocer más detalles sobre su experiencia y habilidades.\n\n¿Podríamos agendar una entrevista?\n\nSaludos cordiales,\n[Tu nombre]\n[Tu empresa]`
    });
    setShowContactModal(true);
  };

  const handleSendEmail = () => {
    if (!selectedStudent) return;

    const emailBody = encodeURIComponent(contactForm.message);
    const emailSubject = encodeURIComponent(contactForm.subject);
    const emailUrl = `mailto:${selectedStudent.User.email}?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(emailUrl);
    setShowContactModal(false);
    setContactForm({ subject: '', message: '' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidatos</h1>
        <p className="text-gray-600">Estudiantes que han aplicado a tus ofertas ({filteredApplications.length})</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar candidatos por nombre, email, curso u oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de candidatos */}
      <div className="grid gap-6">
        {filteredApplications.map((application) => {
          const student = application.Student;
          if (!student || !student.User) return null;

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.User.name?.charAt(0)}{student.User.surname?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{student.User.name} {student.User.surname}</h3>
                        <p className="text-gray-600">{student.User.email}</p>
                        {student.User.phone && (
                          <p className="text-gray-500 text-sm">{student.User.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {student.grade} - {student.course}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2" />
                        {student.car ? 'Con vehículo' : 'Sin vehículo'}
                      </div>
                      {student.profamily && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {student.profamily.name}
                        </div>
                      )}
                    </div>

                    {/* Información de la aplicación */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          Aplicó a: {application.Offer?.name || 'Oferta desconocida'}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                   application.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-300' :
                                   application.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : 
                                   'bg-gray-100 text-gray-800 border-gray-300'}
                        >
                          {application.status === 'pending' ? 'Pendiente' :
                           application.status === 'accepted' ? 'Aceptado' :
                           application.status === 'rejected' ? 'Rechazado' :
                           application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Aplicó el: {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                      </p>
                      {application.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{application.message}"
                        </p>
                      )}
                    </div>

                    {student.tag && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.tag.split(',').map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">{tag.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCV(student)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver CV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleContactStudent(student, application.Offer?.name || 'Oferta')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredApplications.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay estudiantes que hayan aplicado a tus ofertas'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal CV */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              CV de {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Información personal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium">{selectedStudent.User.name} {selectedStudent.User.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudent.User.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedStudent.User.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{selectedStudent.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Grado</p>
                    <p className="font-medium">{selectedStudent.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Curso</p>
                    <p className="font-medium">{selectedStudent.course}</p>
                  </div>
                  {selectedStudent.profamily && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Familia Profesional</p>
                      <p className="font-medium">{selectedStudent.profamily.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Habilidades */}
              {selectedStudent.tag && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.tag.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {selectedStudent.description && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Descripción Personal</h3>
                  <p className="text-gray-700">{selectedStudent.description}</p>
                </div>
              )}

              {/* Disponibilidad */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Disponibilidad</h3>
                <p className="text-gray-700">
                  Disponible desde: {selectedStudent.disp ? new Date(selectedStudent.disp).toLocaleDateString('es-ES') : 'No especificado'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Contactar */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contactar a {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Escribe tu mensaje aquí..."
                rows={8}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Para:</strong> {selectedStudent?.User?.email}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CandidateSearchPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <CandidateSearchContent />
    </AuthGuard>
  );
}
