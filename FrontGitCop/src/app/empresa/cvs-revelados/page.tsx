'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  CreditCard, 
  Download, 
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  Euro,
  Lock,
  Unlock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface CVApplication {
  id: number;
  applicantName: string;
  applicantEmail: string;
  offerTitle: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'hired' | 'rejected';
  isRevealed: boolean;
  cost: number;
  studentCenter: string;
  program: string;
  avatar?: string;
  basicInfo: {
    age: number;
    location: string;
    experience: string;
    education: string;
  };
  fullCV?: {
    phone: string;
    address: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      year: string;
      grade: string;
    }>;
    languages: Array<{
      language: string;
      level: string;
    }>;
    portfolio: string;
    linkedin: string;
  };
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

function CVRevealContent() {
  const { user, canAccessRole } = useAuthStore();
  const [applications, setApplications] = useState<CVApplication[]>([]);
  const [credits, setCredits] = useState(45); // Créditos disponibles
  const [selectedApplication, setSelectedApplication] = useState<CVApplication | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Verificar que el usuario puede acceder como empresa
  if (!canAccessRole('company')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder al sistema de CVs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    // Simular carga de aplicaciones
    const mockApplications: CVApplication[] = [
      {
        id: 1,
        applicantName: 'Ana García López',
        applicantEmail: 'ana.garcia@email.com',
        offerTitle: 'Desarrollador Frontend React',
        appliedAt: '2024-12-15T10:30:00',
        status: 'pending',
        isRevealed: true,
        cost: 20,
        studentCenter: 'IES Tecnológico Madrid',
        program: 'Desarrollo Web Full Stack',
        basicInfo: {
          age: 24,
          location: 'Madrid, España',
          experience: '2 años',
          education: 'Grado Superior en Desarrollo de Aplicaciones Web'
        },
        fullCV: {
          phone: '+34 666 123 456',
          address: 'Calle Mayor 123, 28013 Madrid',
          skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Git', 'HTML5', 'CSS3'],
          experience: [
            {
              company: 'TechStart Solutions',
              position: 'Desarrollador Junior',
              duration: '2022-2024',
              description: 'Desarrollo de aplicaciones web con React y Node.js'
            }
          ],
          education: [
            {
              institution: 'IES Tecnológico Madrid',
              degree: 'Grado Superior DAW',
              year: '2022',
              grade: '8.5/10'
            }
          ],
          languages: [
            { language: 'Español', level: 'Nativo' },
            { language: 'Inglés', level: 'B2' }
          ],
          portfolio: 'https://anagarcia.dev',
          linkedin: 'https://linkedin.com/in/anagarcia'
        }
      },
      {
        id: 2,
        applicantName: 'Carlos Martínez Ruiz',
        applicantEmail: 'carlos.martinez@email.com',
        offerTitle: 'Desarrollador Frontend React',
        appliedAt: '2024-12-14T15:45:00',
        status: 'pending',
        isRevealed: false,
        cost: 20,
        studentCenter: 'Centro Formativo Barcelona',
        program: 'Desarrollo de Aplicaciones Multiplataforma',
        basicInfo: {
          age: 26,
          location: 'Barcelona, España',
          experience: '1 año',
          education: 'Grado Superior en Desarrollo de Aplicaciones Multiplataforma'
        }
      },
      {
        id: 3,
        applicantName: 'María López Santos',
        applicantEmail: 'maria.lopez@email.com',
        offerTitle: 'Prácticas Marketing Digital',
        appliedAt: '2024-12-13T09:20:00',
        status: 'reviewed',
        isRevealed: true,
        cost: 15,
        studentCenter: 'Universidad Complutense Madrid',
        program: 'Marketing y Publicidad',
        basicInfo: {
          age: 22,
          location: 'Madrid, España',
          experience: 'Estudiante',
          education: 'Grado en Marketing y Publicidad'
        },
        fullCV: {
          phone: '+34 677 987 654',
          address: 'Avenida de América 45, 28002 Madrid',
          skills: ['Google Analytics', 'Facebook Ads', 'Instagram', 'Canva', 'WordPress'],
          experience: [
            {
              company: 'Freelance',
              position: 'Community Manager',
              duration: '2023-2024',
              description: 'Gestión de redes sociales para pequeñas empresas'
            }
          ],
          education: [
            {
              institution: 'Universidad Complutense Madrid',
              degree: 'Grado en Marketing',
              year: '2025 (en curso)',
              grade: '7.8/10'
            }
          ],
          languages: [
            { language: 'Español', level: 'Nativo' },
            { language: 'Inglés', level: 'B2' },
            { language: 'Francés', level: 'A2' }
          ],
          portfolio: 'https://marialopez.com',
          linkedin: 'https://linkedin.com/in/marialopez'
        }
      }
    ];

    // Simular métodos de pago
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'card_1',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026
      },
      {
        id: 'paypal_1',
        type: 'paypal'
      }
    ];

    setApplications(mockApplications);
    setPaymentMethods(mockPaymentMethods);
  }, []);

  const handleRevealCV = async (applicationId: number) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    if (credits >= application.cost) {
      // Usar créditos
      setCredits(credits - application.cost);
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, isRevealed: true, fullCV: generateMockFullCV(app) }
          : app
      ));
    } else {
      // Abrir modal de pago
      setSelectedApplication(application);
      setIsPaymentModalOpen(true);
    }
  };

  const generateMockFullCV = (app: CVApplication) => {
    return {
      phone: `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
      address: `Calle ${Math.floor(Math.random() * 200) + 1}, ${Math.floor(Math.random() * 50000) + 10000} ${app.basicInfo.location.split(',')[0]}`,
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      experience: [
        {
          company: 'Empresa Ejemplo',
          position: 'Desarrollador',
          duration: '2022-2024',
          description: 'Desarrollo de aplicaciones web'
        }
      ],
      education: [
        {
          institution: app.studentCenter,
          degree: app.program,
          year: '2024',
          grade: '8.0/10'
        }
      ],
      languages: [
        { language: 'Español', level: 'Nativo' },
        { language: 'Inglés', level: 'B2' }
      ],
      portfolio: `https://${app.applicantName.toLowerCase().replace(/\s+/g, '')}.dev`,
      linkedin: `https://linkedin.com/in/${app.applicantName.toLowerCase().replace(/\s+/g, '')}`
    };
  };

  const handlePayment = async (paymentMethodId: string) => {
    if (!selectedApplication) return;

    setIsProcessingPayment(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Actualizar aplicación como revelada
    setApplications(applications.map(app => 
      app.id === selectedApplication.id 
        ? { ...app, isRevealed: true, fullCV: generateMockFullCV(app) }
        : app
    ));
    
    setIsProcessingPayment(false);
    setIsPaymentModalOpen(false);
    setSelectedApplication(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewed': return 'Revisado';
      case 'contacted': return 'Contactado';
      case 'hired': return 'Contratado';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 text-white rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CVs de Candidatos</h1>
              <p className="text-muted-foreground">Revela y gestiona los CVs de los candidatos</p>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Créditos disponibles</p>
                <p className="text-xl font-bold text-green-600">{credits}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aplicaciones</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CVs Revelados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.filter(app => app.isRevealed).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto en CVs</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{applications.filter(app => app.isRevealed).reduce((acc, app) => acc + app.cost, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Revelado</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.length > 0 ? Math.round((applications.filter(app => app.isRevealed).length / applications.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={application.avatar} />
                      <AvatarFallback>
                        {application.applicantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.applicantName}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        {application.isRevealed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Unlock className="w-3 h-3 mr-1" />
                            Revelado
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        Aplicó para: <span className="font-medium">{application.offerTitle}</span>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{application.basicInfo.age} años</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{application.basicInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{application.basicInfo.experience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span>{application.studentCenter}</span>
                        </div>
                      </div>
                      
                      {application.isRevealed && application.fullCV && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Información Completa</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Teléfono:</strong> {application.fullCV.phone}</p>
                              <p><strong>Dirección:</strong> {application.fullCV.address}</p>
                              <p><strong>Portfolio:</strong> 
                                <a href={application.fullCV.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                  Ver portfolio
                                </a>
                              </p>
                            </div>
                            <div>
                              <p><strong>LinkedIn:</strong> 
                                <a href={application.fullCV.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                  Ver perfil
                                </a>
                              </p>
                              <p><strong>Habilidades:</strong> {application.fullCV.skills.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-gray-500">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                    
                    {!application.isRevealed && (
                      <Button 
                        onClick={() => handleRevealCV(application.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Revelar CV (€{application.cost})
                      </Button>
                    )}
                    
                    {application.isRevealed && (
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Descargar CV
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
              <p className="text-gray-600">
                Cuando recibas aplicaciones para tus ofertas, aparecerán aquí
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Revelar CV</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Revela el CV completo de <strong>{selectedApplication.applicantName}</strong>
                  </p>
                  <div className="text-2xl font-bold text-green-600">
                    €{selectedApplication.cost}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Métodos de Pago</h4>
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handlePayment(method.id)}
                      disabled={isProcessingPayment}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {method.type === 'card' ? 
                        `**** **** **** ${method.last4} (${method.brand})` : 
                        'PayPal'
                      }
                    </Button>
                  ))}
                </div>
                
                {isProcessingPayment && (
                  <div className="text-center">
                    <div className="mb-2">Procesando pago...</div>
                    <Progress value={66} className="w-full" />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function CVRevealPage() {
  return (
    <AuthGuard requireAuth>
      <CVRevealContent />
    </AuthGuard>
  );
}
