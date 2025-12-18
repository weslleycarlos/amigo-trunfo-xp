export type IconType = 'skull' | 'zap' | 'shield' | 'heart' | 'laptop' | 'brain' | 'smile' | 'rocket' | 'ghost' | 'gamepad';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'ultra_rare' | 'secret_rare' | 'founder';

export interface CardAttribute {
  label: string;
  value: number;
  icon: IconType;
}

export interface CardStats {
  attributes: CardAttribute[];
  specialAbility: string;
}

export interface FormData {
  name: string;
  image?: string | null; // Base64 (legacy)
  imageUrl?: string; // Base64 for new components
  age: number;
  maritalStatus: string;
  profession: string;
}

export enum AppStep {
  FORM = 'FORM',
  CARD = 'CARD',
  ADMIN = 'ADMIN'
}

export const MARITAL_STATUS_OPTIONS = [
  "Solteiro(a)",
  "Namorando",
  "Casado(a)",
  "Enrolado(a)",
  "Complicado(a)",
  "Viúvo(a) do Orkut",
  "Criança/Bebê"
];