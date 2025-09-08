// AGREGAR este componente para mostrar tokens:

import { useEffect, useState } from 'react';
import { CreditCard, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

// Componente de Tokens para el Nav
function TokenDisplay() {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!token || user?.role !== 'company') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/students/tokens/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTokens(data.balance);
        }
      } catch (error) {
        console.error('Error cargando tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  if (!token || user?.role !== 'company' || loading) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
      <Star className="w-4 h-4 text-purple-600" />
      <span className="text-sm font-medium text-purple-700">
        {tokens} tokens
      </span>
    </div>
  );
}

// AGREGAR al Navbar principal donde estén los otros elementos:
// (busca la sección donde estén los links de navegación y agrega)

<TokenDisplay />