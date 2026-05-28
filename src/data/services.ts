import { Globe, Smartphone, Palette, Search, Lightbulb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ServiceEntry {
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  path: string;
  index: string;
}

export const services: ServiceEntry[] = [
  {
    title: 'Website Development',
    description:
      'High-performance, responsive websites engineered for speed, accessibility, and conversion — from marketing sites to complex web applications.',
    icon: Globe,
    badge: 'Web',
    path: '/services/website-development',
    index: '01',
  },
  {
    title: 'App Development',
    description:
      'Cross-platform and native mobile applications built for scale, with seamless API integrations and polished user experiences.',
    icon: Smartphone,
    badge: 'Mobile',
    path: '/services/app-development',
    index: '02',
  },
  {
    title: 'UI/UX Design',
    description:
      'Research-driven design that balances aesthetics with usability — from wireframes and prototypes to complete design systems.',
    icon: Palette,
    badge: 'Design',
    path: '/services/ui-ux-design',
    index: '03',
  },
  {
    title: 'SEO & Digital Marketing',
    description:
      'Data-backed strategies to improve search visibility, drive qualified traffic, and maximize your digital presence.',
    icon: Search,
    badge: 'Marketing',
    path: '/services/seo-digital-marketing',
    index: '04',
  },
  {
    title: 'Technology Consulting',
    description:
      'Strategic advisory on architecture, technology selection, scalability planning, and digital transformation roadmaps.',
    icon: Lightbulb,
    badge: 'Strategy',
    path: '/services/consulting',
    index: '05',
  },
];
