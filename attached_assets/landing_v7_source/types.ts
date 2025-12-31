import { LucideIcon } from 'lucide-react';

export interface FeatureStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
  buttonText: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
}
