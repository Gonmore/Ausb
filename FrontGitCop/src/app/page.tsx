import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { ConditionalHeader } from '@/components/conditional-header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      {/* <ConditionalHeader /> */}

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Conectamos talento con
            <span className="text-blue-600"> oportunidades</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma que une estudiantes, centros educativos y empresas para facilitar 
            las prácticas profesionales y el desarrollo del talento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ofertas">
              <Button size="lg" className="w-full sm:w-auto">
                Ver Ofertas de Prácticas
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Únete a la Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona Ausbildung?
            </h3>
            <p className="text-lg text-gray-600">
              Una plataforma integral para gestionar prácticas profesionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <CardTitle>Para Estudiantes</CardTitle>
                <CardDescription>
                  Encuentra oportunidades de prácticas que se adapten a tu perfil profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Explora ofertas por familia profesional</li>
                  <li>• Gestiona tu CV digital</li>
                  <li>• Conecta con empresas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <CardTitle>Para Empresas</CardTitle>
                <CardDescription>
                  Publica ofertas y encuentra el talento joven que necesitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Publica ofertas de prácticas</li>
                  <li>• Accede a CVs de estudiantes</li>
                  <li>• Gestiona procesos de selección</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏫</span>
                </div>
                <CardTitle>Para Centros Educativos</CardTitle>
                <CardDescription>
                  Supervisa a tus estudiantes y coordina con empresas colaboradoras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Gestiona tutores y estudiantes</li>
                  <li>• Supervisa prácticas</li>
                  <li>• Coordina con empresas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de estudiantes, empresas y centros educativos
          </p>
          <Link href="/registro">
            <Button size="lg" variant="secondary">
              Empezar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <h4 className="text-lg font-bold">Ausbildung</h4>
              </div>
              <p className="text-gray-400">
                Conectando talento con oportunidades desde 2025
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Explorar</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ofertas" className="hover:text-white transition-colors">Ver Ofertas</Link></li>
                <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Plataforma</h5>
              <ul className="space-y-2 text-gray-400">
                <li><span className="text-gray-500">Para Estudiantes</span></li>
                <li><span className="text-gray-500">Para Empresas</span></li>
                <li><span className="text-gray-500">Para Centros</span></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ayuda" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/politica-privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ausbildung. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
