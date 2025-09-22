import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Eye, MessageSquare, Calendar, CheckCircle, Clock } from 'lucide-react';

interface LoadingStatsProps {
  isLoading?: boolean;
  stats?: {
    totalApplications?: number;
    viewedCVs?: number;
    interviews?: number;
    accepted?: number;
    pending?: number;
    contacted?: number;
  };
}

const LoadingStats: React.FC<LoadingStatsProps> = ({ 
  isLoading = false, 
  stats = {} 
}) => {
  const {
    totalApplications = 0,
    viewedCVs = 0,
    interviews = 0,
    accepted = 0,
    pending = 0,
    contacted = 0
  } = stats;

  const statItems = [
    {
      icon: Users,
      label: 'Aplicaciones',
      value: totalApplications,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Eye,
      label: 'CVs Vistos',
      value: viewedCVs,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: MessageSquare,
      label: 'Contactados',
      value: contacted,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Calendar,
      label: 'Entrevistas',
      value: interviews,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: CheckCircle,
      label: 'Aceptados',
      value: accepted,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Clock,
      label: 'Pendientes',
      value: pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statItems.map((item, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${item.bgColor}`}>
                <div className="w-full h-full bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {item.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LoadingStats;