

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { offerService, profamiliesService, companyService } from '@/lib/services';
import { apiClient } from '@/lib/api';
import { Profamily, CreateOfferData } from '@/types/index';
import SelectRS from 'react-select';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Briefcase, 
  Star,
  X,
  Save,
  ArrowLeft,
  Target,
  DollarSign
} from 'lucide-react';

export default function EmpresaOfertasNewPage({ editId: propEditId }: { editId?: string } = {}) {
	const router = useRouter();
	const { user } = useAuthStore();
		const [submitting, setSubmitting] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [newOffer, setNewOffer] = useState<CreateOfferData>({
			name: '',
			description: '',
			profamilyId: 0, // Legacy field for backward compatibility
			profamilyIds: [], // New field for multiple profamilies
			mode: 'presencial',
			location: '',
			type: 'full-time',
			period: '6 meses',
			schedule: 'Mañana',
			min_hr: 200,
			car: false,
			tag: 'programacion',
			jobs: '',
			requisites: '',
			skills: [],
		});
			const [editId, setEditId] = useState<number | null>(null);
	const [profamilies, setProfamilies] = useState<Profamily[]>([]);
	const [skills, setSkills] = useState<Array<{ id: number; name: string }>>([]);
	const [companyCity, setCompanyCity] = useState<string>('');
	const [companyCountry, setCompanyCountry] = useState<string>('');
	const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);

	const handleChange = (field: keyof CreateOfferData, value: any) => {
		setNewOffer(prev => ({ ...prev, [field]: value }));
	};

				useEffect(() => {
					profamiliesService.getAll().then(res => {
						setProfamilies(res.data || []);
					});
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, { cache: 'no-store' })
						.then(r => r.json())
						.then(data => {
							if (data.success) setSkills(data.data);
						});
					if (user?.role === 'company' && user?.companyId) {
						companyService.getById(user.companyId).then(res => {
							setCompanyCity(res.data.city || '');
							setNewOffer(prev => ({ ...prev, location: res.data.city || '' }));
						});
						if (user.countryCode) {
							fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/geography/countries/${user.countryCode}/cities?limit=50`)
								.then(r => r.json())
								.then(data => {
									if (data.success) setCities(data.data);
								});
						}
					}

					// Usar prop editId si está disponible, sino detectar por URL
					let id: number | null = propEditId ? Number(propEditId) : null;
					if (!id && typeof window !== 'undefined') {
						const path = window.location.pathname;
						const match = path.match(/\/empresa\/ofertas\/edit\/(\d+)/);
						if (match) id = Number(match[1]);
					}

					if (id) {
						setEditId(id);
						console.log('🔄 Cargando datos de oferta para edición, ID:', id);
						fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offers/${id}`)
							.then(r => r.json())
							.then(data => {
								console.log('📋 Datos recibidos del backend:', data);
								if (data && data.id) {
									console.log('✅ Configurando formulario con datos:', {
										name: data.name,
										profamilyId: data.profamilyId,
										profamilyIds: data.profamilyIds,
										profamily: data.profamily,
										profamilys: data.profamilys,
										skills: data.skills
									});
									setNewOffer({
										name: data.name || '',
										description: data.description || '',
										profamilyId: data.profamilyId ? Number(data.profamilyId) : (data.profamilys && data.profamilys.length > 0 ? data.profamilys[0].id : 0), // Legacy field
										profamilyIds: data.profamilyIds || (data.profamilys ? data.profamilys.map((p: any) => p.id) : (data.profamilyId ? [data.profamilyId] : [])), // New field
										mode: data.mode || 'presencial',
										location: data.location || '',
										type: data.type || 'full-time',
										period: data.period || '6 meses',
										schedule: data.schedule || 'Mañana',
										min_hr: data.min_hr || 200,
										car: data.car || false,
										tag: data.tag || '',
										jobs: data.jobs || '',
										requisites: data.requisites || '',
										skills: data.skills ? data.skills.map((s: any) => s.id) : [],
									});
									console.log('✅ Formulario configurado correctamente');
								} else {
									console.error('❌ Datos inválidos recibidos:', data);
								}
							})
							.catch(error => {
								console.error('❌ Error cargando datos de oferta:', error);
							});
					}
				}, [user, propEditId]);

			const handleSkillChange = (id: number) => {
				setNewOffer(prev => {
					const skills = prev.skills || [];
					return {
						...prev,
						skills: skills.includes(id)
							? skills.filter(sid => sid !== id)
							: [...skills, id],
					};
				});
			};

			const handleProfamilyChange = (selected: any) => {
				const profamilyIds = selected ? (Array.isArray(selected) ? selected.map((s: any) => s.value) : []) : [];
				setNewOffer(prev => ({
					...prev,
					profamilyIds,
					profamilyId: profamilyIds.length > 0 ? profamilyIds[0] : 0, // Set legacy field to first profamily for backward compatibility
				}));
			};

				const handleSubmit = async (e: React.FormEvent) => {
					e.preventDefault();
					setSubmitting(true);
					setError(null);

					// Validation
					const profamilyCount = newOffer.profamilyIds?.length || 0;
					const skillCount = newOffer.skills?.length || 0;

					if (profamilyCount < 1 || profamilyCount > 4) {
						setError(`Debes seleccionar entre 1 y 4 familias profesionales. Actualmente tienes ${profamilyCount} seleccionadas.`);
						setSubmitting(false);
						return;
					}

					if (skillCount < 3 || skillCount > 6) {
						setError(`Debes seleccionar entre 3 y 6 skills. Actualmente tienes ${skillCount} seleccionados.`);
						setSubmitting(false);
						return;
					}

					try {
						if (editId) {
							// Usar apiClient para PUT y manejo automático del token
							try {
								await apiClient.put(`/api/offers/${editId}`, newOffer);
							} catch (err: any) {
								setError('Error al actualizar la oferta');
								setSubmitting(false);
								return;
							}
						} else {
							await offerService.createOffer(newOffer);
						}
						router.push('/empresa/ofertas');
					} catch (err: any) {
						setError(editId ? 'Error al actualizar la oferta' : 'Error al crear la oferta');
					} finally {
						setSubmitting(false);
					}
				};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<Button 
						variant="ghost" 
						onClick={() => router.back()}
						className="mb-4 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Volver
					</Button>
					<div className="flex items-center gap-3 mb-2">
						<div className="p-2 bg-blue-600 rounded-lg">
							<Briefcase className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">
							{editId ? 'Actualizar Oferta' : 'Crear Nueva Oferta'}
						</h1>
					</div>
					<p className="text-gray-600">
						{editId ? 'Modifica los detalles de tu oferta' : 'Crea una nueva oferta de trabajo para atraer talento'}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Información Básica */}
					<Card className="shadow-lg border-0">
						<CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
							<CardTitle className="flex items-center gap-2">
								<Target className="w-5 h-5" />
								Información Básica
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="md:col-span-2">
									<Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
										Título de la Oferta *
									</Label>
									<Input 
										id="title"
										placeholder="ej. Desarrollador Frontend React" 
										value={newOffer.name} 
										onChange={e => handleChange('name', e.target.value)} 
										required 
										className="text-lg"
									/>
								</div>
								
								<div className="md:col-span-2">
									<Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
										Descripción *
									</Label>
									<Textarea 
										id="description"
										placeholder="Describe las responsabilidades, objetivos y lo que ofreces..." 
										value={newOffer.description} 
										onChange={e => handleChange('description', e.target.value)} 
										required 
										rows={4}
										className="resize-none"
									/>
								</div>

								<div className="md:col-span-2">
									<Label htmlFor="profamily" className="text-sm font-semibold text-gray-700 mb-2 block">
										Familias Profesionales * <span className="text-xs text-gray-500">(1-4 requeridas)</span>
									</Label>
									{profamilies.length > 0 ? (
										<SelectRS
											isMulti
											options={profamilies.map(profamily => ({ value: profamily.id, label: profamily.name }))}
											value={(newOffer.profamilyIds || []).map(id => {
												const profamily = profamilies.find(p => p.id === id);
												return profamily ? { value: profamily.id, label: profamily.name } : null;
											}).filter(Boolean)}
											onChange={handleProfamilyChange}
											placeholder="Selecciona familias profesionales..."
											className="react-select-container"
											classNamePrefix="react-select"
											styles={{
												control: (base) => ({
													...base,
													border: '2px solid #e2e8f0',
													borderRadius: '8px',
													padding: '4px',
													boxShadow: 'none',
													'&:hover': {
														border: '2px solid #cbd5e1'
													},
													'&:focus-within': {
														border: '2px solid #3b82f6',
														boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
													}
												}),
												multiValue: (base) => ({
													...base,
													backgroundColor: '#dbeafe',
													borderRadius: '6px'
												}),
												multiValueLabel: (base) => ({
													...base,
													color: '#1e40af',
													fontWeight: '500'
												}),
												multiValueRemove: (base) => ({
													...base,
													color: '#1e40af',
													'&:hover': {
														backgroundColor: '#bfdbfe',
														color: '#1e3a8a'
													}
												})
											}}
										/>
									) : (
										<div className="text-gray-400 p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
											Cargando familias profesionales...
										</div>
									)}
									<p className="text-xs text-gray-500 mt-1">
										Selecciona entre 1 y 4 familias profesionales relacionadas con la oferta
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Skills Requeridos */}
					<Card className="shadow-lg border-0">
						<CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
							<CardTitle className="flex items-center gap-2">
								<Star className="w-5 h-5" />
								Skills Requeridos
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							<div>
								<Label className="text-sm font-semibold text-gray-700 mb-2 block">
									Selecciona Skills <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(3-6 requeridos)</span>
								</Label>
								{skills.length > 0 ? (
									<SelectRS
										isMulti
										options={skills.map(skill => ({ value: skill.id, label: skill.name }))}
										value={(newOffer.skills || []).map(id => {
											const skill = skills.find(s => s.id === id);
											return skill ? { value: skill.id, label: skill.name } : null;
										}).filter(Boolean)}
										onChange={selected => {
											setNewOffer(prev => ({
												...prev,
												skills: selected ? (Array.isArray(selected) ? selected.map((s: any) => s.value) : []) : [],
											}));
										}}
										placeholder="Selecciona o escribe skills..."
										className="react-select-container"
										classNamePrefix="react-select"
										styles={{
											control: (base) => ({
												...base,
												border: '2px solid #e2e8f0',
												borderRadius: '8px',
												padding: '4px',
												boxShadow: 'none',
												'&:hover': {
													border: '2px solid #cbd5e1'
												},
												'&:focus-within': {
													border: '2px solid #3b82f6',
													boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
												}
											}),
											multiValue: (base) => ({
												...base,
												backgroundColor: '#dbeafe',
												borderRadius: '6px'
											}),
											multiValueLabel: (base) => ({
												...base,
												color: '#1e40af',
												fontWeight: '500'
											}),
											multiValueRemove: (base) => ({
												...base,
												color: '#1e40af',
												'&:hover': {
													backgroundColor: '#bfdbfe',
													color: '#1e3a8a'
												}
											})
										}}
									/>
								) : (
									<div className="text-gray-400 p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
										Cargando skills...
									</div>
								)}
							</div>
							
							<Separator />
							
							<div>
								<Label className="text-sm font-semibold text-gray-700 mb-2 block">
									Agregar Nuevos Skills
								</Label>
								<Input
									type="text"
									placeholder="Ejemplo: Python; React; Comunicación (separa con ;)"
									onBlur={async (e) => {
										const value = e.target.value.trim();
										if (!value) return;
										const newSkills = value.split(';').map(s => s.trim()).filter(Boolean);
										for (const skillName of newSkills) {
											await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
												method: 'POST',
												headers: { 'Content-Type': 'application/json' },
												body: JSON.stringify({ name: skillName }),
											});
										}
										e.target.value = '';
										// Recargar skills
										fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`)
											.then(r => r.json())
											.then(data => {
												if (data.success) setSkills(data.data);
											});
									}}
									className="border-dashed"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Separa múltiples skills con punto y coma (;)
								</p>
							</div>
						</CardContent>
					</Card>
					{/* Modalidad y Ubicación */}
					<Card className="shadow-lg border-0">
						<CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
							<CardTitle className="flex items-center gap-2">
								<MapPin className="w-5 h-5" />
								Modalidad y Ubicación
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="mode" className="text-sm font-semibold text-gray-700 mb-2 block">
										Modalidad de Trabajo
									</Label>
									<Select value={newOffer.mode} onValueChange={v => handleChange('mode', v)}>
										<SelectTrigger id="mode">
											<SelectValue placeholder="Modalidad" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="presencial">
												<div className="flex items-center gap-2">
													<Building2 className="w-4 h-4" />
													Presencial
												</div>
											</SelectItem>
											<SelectItem value="remoto">
												<div className="flex items-center gap-2">
													<Users className="w-4 h-4" />
													Remoto
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{newOffer.mode === 'presencial' && (
									<div>
										<Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-2 block">
											Ciudad
										</Label>
										<Select value={newOffer.location} onValueChange={v => handleChange('location', v)}>
											<SelectTrigger id="location">
												<SelectValue placeholder="Selecciona una ciudad" />
											</SelectTrigger>
											<SelectContent>
												{cities.map(city => (
													<SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								<div>
									<Label htmlFor="type" className="text-sm font-semibold text-gray-700 mb-2 block">
										Tipo de Contrato
									</Label>
									<Select value={newOffer.type} onValueChange={v => handleChange('type', v)}>
										<SelectTrigger id="type">
											<SelectValue placeholder="Tipo de contrato" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="full-time">Tiempo completo</SelectItem>
											<SelectItem value="part-time">Medio tiempo</SelectItem>
											<SelectItem value="internship">Prácticas</SelectItem>
											<SelectItem value="freelance">Freelance</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="period" className="text-sm font-semibold text-gray-700 mb-2 block">
										Periodo de Duración
									</Label>
									<Select value={newOffer.period} onValueChange={v => handleChange('period', v)}>
										<SelectTrigger id="period">
											<SelectValue placeholder="Periodo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="3 meses">3 meses</SelectItem>
											<SelectItem value="6 meses">6 meses</SelectItem>
											<SelectItem value="12 meses">12 meses</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Condiciones de Trabajo */}
					<Card className="shadow-lg border-0">
						<CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
							<CardTitle className="flex items-center gap-2">
								<Clock className="w-5 h-5" />
								Condiciones de Trabajo
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div>
									<Label htmlFor="schedule" className="text-sm font-semibold text-gray-700 mb-2 block">
										Horario
									</Label>
									<Select value={newOffer.schedule} onValueChange={v => handleChange('schedule', v)}>
										<SelectTrigger id="schedule">
											<SelectValue placeholder="Horario" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Mañana">Mañana</SelectItem>
											<SelectItem value="Tarde">Tarde</SelectItem>
											<SelectItem value="Mixto">Mixto</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="min_hr" className="text-sm font-semibold text-gray-700 mb-2 block">
										Horas Mínimas
									</Label>
									<div className="relative">
										<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
										<Input 
											id="min_hr"
											type="number" 
											placeholder="200" 
											value={newOffer.min_hr} 
											onChange={e => handleChange('min_hr', Number(e.target.value))} 
											className="pl-10"
										/>
									</div>
								</div>

								<div className="flex items-center space-x-2 pt-8">
									<input
										type="checkbox"
										id="car"
										checked={newOffer.car}
										onChange={e => handleChange('car', e.target.checked)}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
									/>
									<Label htmlFor="car" className="text-sm font-medium text-gray-700">
										Requiere vehículo propio
									</Label>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Error Display */}
					{error && (
						<Card className="border-red-200 bg-red-50">
							<CardContent className="p-4">
								<div className="flex items-center gap-2 text-red-700">
									<X className="w-4 h-4" />
									<span className="font-medium">{error}</span>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Submit Button */}
					<div className="flex justify-end space-x-4 pt-6">
						<Button 
							type="button" 
							variant="outline" 
							onClick={() => router.back()}
							className="px-8"
						>
							Cancelar
						</Button>
						<Button 
							type="submit" 
							disabled={submitting}
							className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
						>
							{submitting ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									{editId ? 'Actualizando...' : 'Creando...'}
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Save className="w-4 h-4" />
									{editId ? 'Actualizar Oferta' : 'Crear Oferta'}
								</div>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
