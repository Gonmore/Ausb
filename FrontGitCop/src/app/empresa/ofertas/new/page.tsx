

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { offerService, profamiliesService, companyService } from '@/lib/services';
import { apiClient } from '@/lib/api';
import { Profamily, CreateOfferData } from '@/types/index';
import  SelectRS  from 'react-select';

export default function EmpresaOfertasNewPage() {
	const router = useRouter();
	const { user } = useAuthStore();
		const [submitting, setSubmitting] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [newOffer, setNewOffer] = useState<CreateOfferData>({
			name: '',
			description: '',
			profamilyId: 0,
			mode: 'presencial',
			location: '',
			type: 'full-time',
			period: '6 meses',
			schedule: 'Mañana',
			min_hr: 200,
			car: false,
			sector: 'Tecnología',
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
					if (user?.role === 'company' && user?.id) {
						companyService.getById(user.id).then(res => {
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
					// Detectar modo edición por URL (compatible con SSR y client)
					let id: number | null = null;
					if (typeof window !== 'undefined') {
						const path = window.location.pathname;
						const match = path.match(/\/empresa\/ofertas\/edit\/(\d+)/);
						if (match) id = Number(match[1]);
					}
					if (id) {
						setEditId(id);
						fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offers/${id}`)
							.then(r => r.json())
							.then(data => {
								if (data && data.id) {
									setNewOffer({
										name: data.name || '',
										description: data.description || '',
										profamilyId: data.profamilyId ? Number(data.profamilyId) : 0,
										mode: data.mode || 'presencial',
										location: data.location || '',
										type: data.type || 'full-time',
										period: data.period || '6 meses',
										schedule: data.schedule || 'Mañana',
										min_hr: data.min_hr || 200,
										car: data.car || false,
										sector: data.sector || '',
										tag: data.tag || '',
										jobs: data.jobs || '',
										requisites: data.requisites || '',
										skills: data.skills ? data.skills.map((s: any) => s.id) : [],
									});
								}
							});
					}
				}, [user]);

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

				const handleSubmit = async (e: React.FormEvent) => {
					e.preventDefault();
					setSubmitting(true);
					setError(null);
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
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<Card className="w-full max-w-2xl">
								<CardHeader>
									<CardTitle>{editId ? 'Actualizar Oferta' : 'Crear Nueva Oferta'}</CardTitle>
								</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
												<Input placeholder="Título de la oferta" value={newOffer.name} onChange={e => handleChange('name', e.target.value)} required />
																					<div className="mb-4">
																						<label className="block font-semibold mb-2">Skills requeridos</label>
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
																											/>
																										) : (
																											<div className="text-gray-400">Cargando skills...</div>
																										)}
																						<div className="mt-2">
																							<label className="block text-sm">Agregar nuevos skills (separa con ;)</label>
																							<Input
																								type="text"
																								placeholder="Ejemplo: Python; React; Comunicación"
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
																							/>
																						</div>
																					</div>
						<Textarea placeholder="Descripción" value={newOffer.description} onChange={e => handleChange('description', e.target.value)} required />
						<Select value={String(newOffer.profamilyId)} onValueChange={v => handleChange('profamilyId', Number(v))}>
							<SelectTrigger><SelectValue placeholder="Familia profesional" /></SelectTrigger>
							<SelectContent>
								{profamilies.map((fam) => (
									<SelectItem key={fam.id} value={String(fam.id)}>{fam.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={newOffer.mode} onValueChange={v => handleChange('mode', v)}>
							<SelectTrigger><SelectValue placeholder="Modalidad" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="presencial">Presencial</SelectItem>
								<SelectItem value="remoto">Remoto</SelectItem>
							</SelectContent>
						</Select>
						{newOffer.mode === 'presencial' && (
							<Select value={newOffer.location} onValueChange={v => handleChange('location', v)}>
								<SelectTrigger><SelectValue placeholder="Ciudad" /></SelectTrigger>
								<SelectContent>
									{cities.map(city => (
										<SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<Select value={newOffer.type} onValueChange={v => handleChange('type', v)}>
							<SelectTrigger><SelectValue placeholder="Tipo de contrato" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="full-time">Tiempo completo</SelectItem>
								<SelectItem value="part-time">Medio tiempo</SelectItem>
								<SelectItem value="internship">Prácticas</SelectItem>
								<SelectItem value="freelance">Freelance</SelectItem>
							</SelectContent>
						</Select>
						<Select value={newOffer.period} onValueChange={v => handleChange('period', v)}>
							<SelectTrigger><SelectValue placeholder="Periodo" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="3 meses">3 meses</SelectItem>
								<SelectItem value="6 meses">6 meses</SelectItem>
								<SelectItem value="12 meses">12 meses</SelectItem>
							</SelectContent>
						</Select>
						<Select value={newOffer.schedule} onValueChange={v => handleChange('schedule', v)}>
							<SelectTrigger><SelectValue placeholder="Horario" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="Mañana">Mañana</SelectItem>
								<SelectItem value="Tarde">Tarde</SelectItem>
								<SelectItem value="Mixto">Mixto</SelectItem>
							</SelectContent>
						</Select>
						<Input type="number" placeholder="Horas mínimas" value={newOffer.min_hr} onChange={e => handleChange('min_hr', Number(e.target.value))} />
						<Input placeholder="Sector" value={newOffer.sector} onChange={e => handleChange('sector', e.target.value)} />
						<Input placeholder="Etiqueta" value={newOffer.tag} onChange={e => handleChange('tag', e.target.value)} />
						<Input placeholder="Puesto" value={newOffer.jobs} onChange={e => handleChange('jobs', e.target.value)} />
						<Input placeholder="Requisitos" value={newOffer.requisites} onChange={e => handleChange('requisites', e.target.value)} />
						{error && <div className="text-red-500">{error}</div>}
										<Button type="submit" className="w-full" disabled={submitting}>
											{submitting ? (editId ? 'Actualizando...' : 'Crear Oferta') : (editId ? 'Actualizar Oferta' : 'Crear Oferta')}
										</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
