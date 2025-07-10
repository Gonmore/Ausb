'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { FpraxLogo } from '@/components/ui/logos/FpraxLogo';
import { 
  Home, 
  Building, 
  Users, 
  BookOpen, 
  User, 
  LogOut, 
  Menu,
  X,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  // Este componente ya no es necesario ya que ConditionalHeader maneja toda la navegación
  return null;
}
