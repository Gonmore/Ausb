'use client';

import { useQuery } from '@tanstack/react-query';
import { offerService } from '@/lib/services';

export default function TestOffersPage() {
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerService.getAllOffers(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Ofertas</h1>
      <p>Número de ofertas: {offers?.length || 0}</p>
      
      <div className="mt-6 space-y-4">
        {offers?.map(offer => (
          <div key={offer.id} className="p-4 border rounded">
            <h3 className="font-bold">{offer.name}</h3>
            <p className="text-gray-600">{offer.description}</p>
            <p className="text-sm text-gray-500">
              📍 {offer.location} | ⏰ {offer.mode} | 🏢 {offer.sector}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
