'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Coins, 
  ShoppingCart, 
  Eye, 
  Mail, 
  Calendar,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

interface TokenBalance {
  balance: number;
  used: number;
  total: number;
  companyId: number;
  companyName: string;
}

interface TokenTransaction {
  id: number;
  type: 'purchase' | 'usage' | 'refund';
  action: string;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
  student?: {
    id: number;
    User: {
      name: string;
      surname: string;
    };
  };
}

const TOKEN_PACKAGES = [
  { id: 1, tokens: 50, price: 25, popular: false, savings: 0 },
  { id: 2, tokens: 100, price: 45, popular: true, savings: 10 },
  { id: 3, tokens: 200, price: 80, popular: false, savings: 20 },
  { id: 4, tokens: 500, price: 175, popular: false, savings: 75 }
];

function TokenManagementContent() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [processingPurchase, setProcessingPurchase] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadTokenData();
    }
  }, [token]);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      
      // Cargar balance y historial en paralelo
      const [balanceResponse, historyResponse] = await Promise.all([
        fetch('http://localhost:5000/api/students/tokens/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }),
        fetch('http://localhost:5000/api/tokens/usage-history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
      ]);

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setTokenBalance(balanceData);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setTransactions(historyData.usage || []);
      }

    } catch (error) {
      console.error('❌ Error cargando datos de tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageData: any) => {
    try {
      setProcessingPurchase(true);
      
      const response = await fetch('http://localhost:5000/api/tokens/recharge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: packageData.tokens,
          packageId: packageData.id,
          price: packageData.price
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar balance local
        if (tokenBalance) {
          setTokenBalance({
            ...tokenBalance,
            balance: result.newBalance,
            total: tokenBalance.total + packageData.tokens
          });
        }
        
        // Recargar datos
        await loadTokenData();
        
        alert(`✅ ¡Compra exitosa!\nSe han agregado ${packageData.tokens} tokens a tu cuenta.`);
        setShowPurchaseModal(false);
        setSelectedPackage(null);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error en la compra');
      }
      
    } catch (error) {
      console.error('❌ Error comprando tokens:', error);
      alert(`❌ Error en la compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0) {
      const customPackage = {
        id: 'custom',
        tokens: amount,
        price: Math.ceil(amount * 0.5), // 0.5€ por token
        popular: false,
        savings: 0
      };
      handlePurchase(customPackage);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view_cv': return <Eye className="w-4 h-4 text-purple-600" />;
      case 'contact_student': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'buy_tokens': return <ShoppingCart className="w-4 h-4 text-green-600" />;
      default: return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'view_cv': return 'Ver CV';
      case 'contact_student': return 'Contactar estudiante';
      case 'buy_tokens': return 'Compra de tokens';
      default: return action;
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          Gestión de Tokens
        </h1>
        <p className="text-gray-600">
          Gestiona tus tokens para acceder a perfiles de estudiantes y funcionalidades premium
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{tokenBalance?.balance || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Utilizados</p>
                <p className="text-3xl font-bold text-blue-600">{tokenBalance?.used || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Adquiridos</p>
                <p className="text-3xl font-bold text-purple-600">{tokenBalance?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="text-3xl font-bold text-orange-600">
                  {tokenBalance?.total ? Math.round((tokenBalance.used / tokenBalance.total) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Token Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paquetes de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {TOKEN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setShowPurchaseModal(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pkg.tokens} Tokens</h3>
                        {pkg.popular && (
                          <Badge className="bg-blue-100 text-blue-800">Más Popular</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {(pkg.price / pkg.tokens).toFixed(2)}€ por token
                      </p>
                      {pkg.savings > 0 && (
                        <p className="text-green-600 text-sm font-medium">
                          Ahorras {pkg.savings}€
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pkg.price}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-3">Cantidad Personalizada</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Cantidad de tokens"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                />
                <Button 
                  onClick={handleCustomPurchase}
                  disabled={!customAmount || parseInt(customAmount) <= 0}
                >
                  Comprar
                </Button>
              </div>
              {customAmount && parseInt(customAmount) > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Precio: {Math.ceil(parseInt(customAmount) * 0.5)}€
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Token Usage Info */}
        <Card>
          <CardHeader>
            <CardTitle>Costos por Acción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Revelar CV Completo</p>
                    <p className="text-sm text-gray-600">Acceso completo al perfil del estudiante</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  2 tokens
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Contactar Estudiante</p>
                    <p className="text-sm text-gray-600">Incluido con la revelación del CV</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Gratis
                </Badge>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Persistencia de CVs</p>
                    <p className="text-sm text-yellow-700">
                      Una vez revelado un CV, tienes acceso permanente sin costo adicional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Candidatos Gratuitos</p>
                    <p className="text-sm text-green-700">
                      Los estudiantes que aplican a tus ofertas son 100% gratuitos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay transacciones aún
              </h3>
              <p className="text-gray-600">
                Tus compras y usos de tokens aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(transaction.action)}
                    <div>
                      <p className="font-medium">{getActionLabel(transaction.action)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.student && (
                        <p className="text-xs text-gray-500">
                          {transaction.student.User.name} {transaction.student.User.surname}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} tokens
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
              
              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Ver más transacciones
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Confirmar Compra
            </DialogTitle>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Paquete:</span>
                  <span>{selectedPackage.tokens} Tokens</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Precio:</span>
                  <span className="text-lg font-bold">{selectedPackage.price}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio por token:</span>
                  <span className="text-sm text-gray-600">
                    {(selectedPackage.price / selectedPackage.tokens).toFixed(2)}€
                  </span>
                </div>
                {selectedPackage.savings > 0 && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-sm font-medium text-green-600">Ahorras:</span>
                    <span className="text-sm font-medium text-green-600">{selectedPackage.savings}€</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handlePurchase(selectedPackage)}
                  disabled={processingPurchase}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {processingPurchase ? 'Procesando...' : 'Comprar'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Los tokens se agregarán inmediatamente a tu cuenta.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TokenManagementPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <TokenManagementContent />
    </AuthGuard>
  );
}