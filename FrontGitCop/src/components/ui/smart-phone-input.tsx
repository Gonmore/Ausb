'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  phonePrefix: string;
}

interface City {
  id: string;
  name: string;
  state?: string;
  country: Country;
}

interface SmartPhoneInputProps {
  phone: string;
  selectedCountryCode: string | null;
  selectedCityId: string | null;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (countryCode: string) => void;
  onCityChange: (cityId: string) => void;
  className?: string;
}

export function SmartPhoneInput({
  phone,
  selectedCountryCode,
  selectedCityId,
  onPhoneChange,
  onCountryChange,
  onCityChange,
  className = ''
}: SmartPhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [phoneError, setPhoneError] = useState<string>('');
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [openCountrySelector, setOpenCountrySelector] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState('');

  // Cargar países al montar
  useEffect(() => {
    fetchCountries();
  }, []);

  // Cargar ciudades cuando cambia el país
  useEffect(() => {
    if (selectedCountryCode) {
      fetchCitiesByCountry(selectedCountryCode);
    } else {
      setCities([]);
    }
  }, [selectedCountryCode]);

  // Validar teléfono cuando cambia
  useEffect(() => {
    if (phone && selectedCountryCode) {
      validatePhone();
    }
  }, [phone, selectedCountryCode]);

  const fetchCountries = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('🔍 FetchCountries - API URL:', apiUrl);
      console.log('🔍 FetchCountries - Full URL:', `${apiUrl}/api/geography/countries`);
      
      const response = await fetch(`${apiUrl}/api/geography/countries`);
      console.log('🔍 FetchCountries - Response status:', response.status);
      
      const data = await response.json();
      console.log('🔍 FetchCountries - Response data:', data);
      
      if (data.success) {
        setCountries(data.data);
        console.log('✅ FetchCountries - Countries loaded:', data.data.length);
      } else {
        console.error('❌ FetchCountries - API error:', data.message);
      }
    } catch (error) {
      console.error('❌ FetchCountries - Network error:', error);
      console.error('❌ FetchCountries - Error details:', error instanceof Error ? error.message : String(error));
    }
  };

  const fetchCitiesByCountry = async (countryCode: string) => {
    setIsLoadingCities(true);
    try {
      console.log('Fetching cities for country:', countryCode);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/geography/countries/${countryCode}/cities?limit=50`);
      const data = await response.json();
      
      console.log('Cities response:', data);
      
      if (data.success) {
        setCities(data.data);
      } else {
        console.error('Error from API:', data.message);
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const validatePhone = () => {
    if (!phone || !selectedCountryCode) return;

    const selectedCountry = countries.find(c => c.code === selectedCountryCode);
    if (!selectedCountry) return;

    try {
      // Construir número completo
      const fullNumber = `${selectedCountry.phonePrefix}${phone}`;
      const phoneNumber = parsePhoneNumber(fullNumber);
      
      if (phoneNumber && phoneNumber.isValid()) {
        setPhoneError('');
      } else {
        setPhoneError('Número de teléfono inválido');
      }
    } catch (error) {
      setPhoneError('Formato de teléfono inválido');
    }
  };

  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    const cleanValue = value.replace(/[^\d]/g, '');
    onPhoneChange(cleanValue);
    
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    onCountryChange(countryCode);
    setOpenCountrySelector(false);
    setCountrySearchValue(''); // Limpiar búsqueda
  };

  const selectedCountry = countries.find(c => c.code === selectedCountryCode);
  const selectedCity = cities.find(c => c.id === selectedCityId);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Teléfono con código de país separado */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Número de teléfono *
        </Label>
        
        <div className="flex gap-3">
          {/* 🔍 DROPDOWN CON BÚSQUEDA MEJORADA */}
          <div className="w-1/3">
            <Popover open={openCountrySelector} onOpenChange={setOpenCountrySelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountrySelector}
                  className="w-full justify-between h-11 text-left"
                >
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{selectedCountry.phonePrefix}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[80px]">
                        {selectedCountry.name}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500">Seleccionar país...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command shouldFilter={false}>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput 
                      placeholder="Buscar país... (ej: 'bo' para Bolivia)" 
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      value={countrySearchValue}
                      onValueChange={setCountrySearchValue}
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-6 text-center text-sm">
                        <div className="text-gray-500">No se encontró el país</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Intenta con "{countrySearchValue}" o el código del país
                        </div>
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {countries
                        .filter(country => {
                          if (!countrySearchValue) return true;
                          const searchLower = countrySearchValue.toLowerCase();
                          return (
                            country.name.toLowerCase().includes(searchLower) ||
                            country.code.toLowerCase().includes(searchLower) ||
                            country.phonePrefix.includes(searchLower)
                          );
                        })
                        .map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.code}
                          onSelect={() => handleCountrySelect(country.code)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedCountryCode === country.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-mono text-sm min-w-[60px] text-left font-medium">
                                {country.phonePrefix}
                              </span>
                              <span className="truncate">{country.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                              {country.code}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Input del número */}
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="123456789"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`h-11 ${phoneError ? 'border-red-500' : ''}`}
              disabled={!selectedCountryCode}
            />
          </div>
        </div>
        
        {phoneError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span>
            {phoneError}
          </p>
        )}
        
        {!selectedCountryCode && (
          <p className="text-xs text-gray-500">
            💡 Tip: Puedes buscar tu país escribiendo las primeras letras (ej: "bo" para Bolivia)
          </p>
        )}
        
        {selectedCountryCode && selectedCountry && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span>✅</span>
            Número completo: {selectedCountry.phonePrefix} {phone}
          </p>
        )}
      </div>

      {/* Selector de ciudad */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
          Ciudad de residencia *
        </Label>
        <Select 
          value={selectedCityId || ''} 
          onValueChange={onCityChange}
          disabled={!selectedCountryCode || isLoadingCities}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={
              !selectedCountryCode 
                ? "Primero selecciona un país" 
                : isLoadingCities
                  ? "Cargando ciudades..." 
                  : "Selecciona tu ciudad"
            }>
              {selectedCity && (
                <span className="flex items-center gap-2">
                  <span>{selectedCity.name}</span>
                  {selectedCity.state && (
                    <span className="text-gray-500">({selectedCity.state})</span>
                  )}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {cities.length > 0 ? (
              cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  <span className="flex items-center gap-2">
                    <span>{city.name}</span>
                    {city.state && (
                      <span className="text-gray-500 text-sm">({city.state})</span>
                    )}
                  </span>
                </SelectItem>
              ))
            ) : (
              !isLoadingCities && selectedCountryCode && (
                <SelectItem value="no-cities" disabled>
                  No se encontraron ciudades
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        
        {selectedCountryCode && cities.length === 0 && !isLoadingCities && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <span>⚠️</span>
            No se pudieron cargar las ciudades para este país.
          </p>
        )}
      </div>
    </div>
  );
}