'use client';

import { useParams } from 'next/navigation';
import EmpresaOfertasNewPage from '../../new/page';

export default function EmpresaOfertasEditPage() {
  const params = useParams();
  const offerId = params.id as string;

  // Pasar el ID como prop para que la página de creación sepa que está en modo edición
  return <EmpresaOfertasNewPage editId={offerId} />;
}