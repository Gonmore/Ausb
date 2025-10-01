"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCV } from '@/hooks/useCV';
import { apiClient } from '@/lib/api';
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Award, 
    ExternalLink, 
    Clock, 
    Target,
    BookOpen,
    Code,
    Briefcase,
    Palette,
    Cpu,
    Users,
    TrendingUp,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface Skill {
    id: number;
    name: string;
    category: string;
    description: string;
    demandLevel: string;
}

interface CvSkill {
    id: number;
    skillId: number;
    skill: {
        id: number;
        name: string;
        category?: string;
    };
    proficiencyLevel: 'bajo' | 'medio' | 'alto';
    yearsOfExperience: number;
    isHighlighted: boolean;
    notes?: string;
    addedAt: string;
}

interface StudentSkillsManagerProps {
    studentId: number;
    readonly?: boolean;
}

const PROFICIENCY_LEVELS = {
    bajo: { label: 'Bajo', value: 33, color: 'bg-red-500' },
    medio: { label: 'Medio', value: 66, color: 'bg-yellow-500' },
    alto: { label: 'Alto', value: 100, color: 'bg-green-500' }
};

const CATEGORY_ICONS: Record<string, any> = {
    'Programación': Code,
    'Diseño': Palette,
    'Tecnología': Cpu,
    'Comunicación': Users,
    'Negocios': Briefcase,
    'Educación': BookOpen,
    'Marketing': TrendingUp,
    'default': Target
};

export default function StudentSkillsManager({ studentId, readonly = false }: StudentSkillsManagerProps) {
    const { cvData, loading: cvLoading, addSkillToCV, updateCVSkill, removeSkillFromCV } = useCV();
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<CvSkill | null>(null);
    const [formData, setFormData] = useState<{
        skillId: string;
        proficiencyLevel: 'bajo' | 'medio' | 'alto';
        yearsOfExperience: number;
        certificationUrl: string;
        notes: string;
    }>({
        skillId: '',
        proficiencyLevel: 'medio',
        yearsOfExperience: 0,
        certificationUrl: '',
        notes: ''
    });
    const { addToast, success, error: showError } = useToast();

    const fetchStudentSkills = useCallback(async () => {
        // Las skills ahora vienen del hook useCV
        // No necesitamos hacer fetch manual
    }, []);

    const fetchAvailableSkills = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/skills');
            setAvailableSkills(Array.isArray(response.data) ? response.data : response.data?.data || []);
        } catch (error) {
            console.error('Error fetching available skills:', error);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchAvailableSkills();
            setLoading(false);
        };

        loadData();
    }, [fetchAvailableSkills]);

    const handleAddSkill = async () => {
        try {
            const skillId = parseInt(formData.skillId);
            await addSkillToCV(skillId, formData.proficiencyLevel, formData.yearsOfExperience, false, formData.notes);
            success("La skill se agregó exitosamente a tu perfil");
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            showError(error instanceof Error ? error.message : "No se pudo agregar la skill");
        }
    };

    const handleUpdateSkill = async () => {
        if (!editingSkill) return;

        try {
            await updateCVSkill(editingSkill.id, {
                proficiencyLevel: formData.proficiencyLevel,
                yearsOfExperience: formData.yearsOfExperience,
                notes: formData.notes
            });
            success("Los datos de la skill se actualizaron exitosamente");
            setDialogOpen(false);
            setEditingSkill(null);
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            showError("No se pudo actualizar la skill");
        }
    };

    const handleDeleteSkill = async (skillId: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta skill?')) return;

        try {
            await removeSkillFromCV(skillId);
            success("La skill se eliminó de tu perfil");
        } catch (error) {
            console.error('Error:', error);
            showError("No se pudo eliminar la skill");
        }
    };

    const resetForm = () => {
        setFormData({
            skillId: '',
            proficiencyLevel: 'medio',
            yearsOfExperience: 0,
            certificationUrl: '',
            notes: ''
        });
    };

    const openEditDialog = (skill: CvSkill) => {
        setEditingSkill(skill);
        setFormData({
            skillId: skill.id.toString(),
            proficiencyLevel: skill.proficiencyLevel,
            yearsOfExperience: skill.yearsOfExperience,
            certificationUrl: '',
            notes: skill.notes || ''
        });
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingSkill(null);
        resetForm();
        setDialogOpen(true);
    };

    const getSkillsByCategory = () => {
        const categories: Record<string, CvSkill[]> = {};
        cvData.skills.forEach(skill => {
            const category = skill.skill.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(skill);
        });
        return categories;
    };

    const getOverallStats = () => {
        const totalSkills = cvData.skills.length;
        const avgExperience = totalSkills > 0 ? 
            cvData.skills.reduce((acc, s) => acc + s.yearsOfExperience, 0) / totalSkills : 0;
        
        const proficiencyDistribution = {
            bajo: cvData.skills.filter(s => s.proficiencyLevel === 'bajo').length,
            medio: cvData.skills.filter(s => s.proficiencyLevel === 'medio').length,
            alto: cvData.skills.filter(s => s.proficiencyLevel === 'alto').length
        };

        return { totalSkills, avgExperience, proficiencyDistribution };
    };

    if (cvLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Gestión de Skills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const stats = getOverallStats();
    const skillsByCategory = getSkillsByCategory();

    return (
        <div className="space-y-6">
            {/* Estadísticas generales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Resumen de Skills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalSkills}</div>
                            <div className="text-sm text-gray-600">Total Skills</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.avgExperience.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Años promedio</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.proficiencyDistribution.alto}</div>
                            <div className="text-sm text-gray-600">Nivel alto</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gestión de skills */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Mis Skills</CardTitle>
                            <CardDescription>
                                Gestiona tus habilidades y competencias técnicas
                            </CardDescription>
                        </div>
                        {!readonly && (
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddDialog} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Agregar Skill
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingSkill ? 'Editar Skill' : 'Agregar Nueva Skill'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingSkill 
                                                ? 'Actualiza los datos de tu skill'
                                                : 'Agrega una nueva skill a tu perfil profesional'
                                            }
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        {!editingSkill && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="skill">Skill</Label>
                                                <Select 
                                                    value={formData.skillId} 
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, skillId: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una skill" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableSkills
                                                            .filter(skill => 
                                                                !cvData.skills.some((cvSkill: CvSkill) => cvSkill.skillId === skill.id)
                                                            )
                                                            .map(skill => (
                                                            <SelectItem key={skill.id} value={skill.id.toString()}>
                                                                <div className="flex flex-col">
                                                                    <span>{skill.name}</span>
                                                                    <span className="text-xs text-gray-500">{skill.category}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="proficiency">Nivel de competencia</Label>
                                            <Select 
                                                value={formData.proficiencyLevel} 
                                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, proficiencyLevel: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(PROFICIENCY_LEVELS).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {config.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="experience">Años de experiencia</Label>
                                            <Input
                                                id="experience"
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={formData.yearsOfExperience}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    yearsOfExperience: parseFloat(e.target.value) || 0 
                                                }))}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="certification">URL de certificación (opcional)</Label>
                                            <Input
                                                id="certification"
                                                type="url"
                                                placeholder="https://..."
                                                value={formData.certificationUrl}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    certificationUrl: e.target.value 
                                                }))}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Describe tu experiencia con esta skill..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    notes: e.target.value 
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button 
                                            type="button" 
                                            onClick={editingSkill ? handleUpdateSkill : handleAddSkill}
                                            disabled={!editingSkill && !formData.skillId}
                                        >
                                            {editingSkill ? 'Actualizar' : 'Agregar'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {cvData.skills.length === 0 ? (
                        <div className="text-center py-8">
                            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tienes skills registradas
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Agrega tus habilidades para mejorar tu perfil profesional
                            </p>
                            {!readonly && (
                                <Button onClick={openAddDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar tu primera skill
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Tabs defaultValue={Object.keys(skillsByCategory)[0]} className="w-full">
                            <TabsList className="grid w-full" style={{ 
                                gridTemplateColumns: `repeat(${Object.keys(skillsByCategory).length}, minmax(0, 1fr))` 
                            }}>
                                {Object.keys(skillsByCategory).map(category => (
                                    <TabsTrigger key={category} value={category} className="text-xs">
                                        {category} ({skillsByCategory[category].length})
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                                <TabsContent key={category} value={category} className="space-y-4">
                                    <div className="grid gap-4">
                                        {categorySkills.map(skill => {
                                            const IconComponent = CATEGORY_ICONS[skill.skill.category || 'General'] || CATEGORY_ICONS.default;
                                            const proficiencyConfig = PROFICIENCY_LEVELS[skill.proficiencyLevel];
                                            
                                            return (
                                                <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <IconComponent className="h-5 w-5 text-blue-600" />
                                                            <div>
                                                                <h4 className="font-medium flex items-center gap-2">
                                                                    {skill.skill.name}
                                                                    {skill.isHighlighted && (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                </h4>
                                                                <p className="text-sm text-gray-600">{skill.skill.category || 'General'}</p>
                                                            </div>
                                                        </div>
                                                        {!readonly && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(skill)}
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteSkill(skill.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span>Nivel: {proficiencyConfig.label}</span>
                                                            <span>{proficiencyConfig.value}%</span>
                                                        </div>
                                                        <Progress 
                                                            value={proficiencyConfig.value} 
                                                            className="h-2"
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 text-sm">
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {skill.yearsOfExperience} años
                                                        </Badge>
                                                        
                                                        {skill.isHighlighted ? (
                                                            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                                                                <Award className="h-3 w-3" />
                                                                Destacada
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Normal
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {skill.notes && (
                                                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                            <strong>Notas:</strong> {skill.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}