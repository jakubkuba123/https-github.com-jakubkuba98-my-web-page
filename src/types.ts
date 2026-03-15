export type HealthStatus = 'healthy' | 'sick' | 'improving' | 'recovering';

export interface Medication {
  name: string;
  startDate: string;
  notes?: string;
}

export interface Chicken {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  status: HealthStatus;
  medications: Medication[];
}

export interface EggEntry {
  id: string;
  date: string;
  count: number;
  extraLarge: number;
  extraSmall: number;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  eggCount: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  totalSpent: number;
  totalEggsBought: number;
}

export interface FeedEntry {
  id: string;
  date: string;
  amountKg: number;
  cost: number;
  waterLiters: number;
  durationDays?: number;
}

export interface CleaningEntry {
  id: string;
  date: string;
  type: 'cleaning' | 'bedding';
  nextPlannedDate: string;
}

export interface BroodingEntry {
  id: string;
  chickenId: string;
  startDate: string;
  expectedHatchDate: string;
  endDate?: string;
  notes?: string;
}

export interface FarmData {
  chickens: Chicken[];
  eggEntries: EggEntry[];
  sales: Sale[];
  customers: Customer[];
  feedEntries: FeedEntry[];
  cleaningEntries: CleaningEntry[];
  broodingEntries: BroodingEntry[];
  eggStock: number;
}
