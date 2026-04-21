
import React from 'react';

export enum ServiceType {
  RD = 'R&D',
  DATA_SCIENCE = 'Data Science',
  FULL_STACK = 'Full-Stack Development'
}

export interface ServiceFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Service {
  type: ServiceType;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: ServiceFeature[];
  image: string;
  story: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
  thumbnail: string;
  contentImages?: string[];
}

// Added TeamMember interface to resolve missing export error in app/team/page.tsx
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  expertise: string[];
}
