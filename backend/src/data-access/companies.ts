import type { Company } from '../companies/company.model';

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'Acme Corp',
    industry: 'Technology',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@acme.com',
    participantCount: 3,
    engagementStatus: 'active',
  },
  {
    id: 'c2',
    name: 'ByteWave',
    industry: 'Software',
    contactName: 'Michael Chen',
    contactEmail: 'mchen@bytewave.io',
    participantCount: 3,
    engagementStatus: 'active',
  },
  {
    id: 'c3',
    name: 'Cloudify',
    industry: 'Cloud Services',
    contactName: 'Lisa Park',
    contactEmail: 'lpark@cloudify.net',
    participantCount: 2,
    engagementStatus: 'at-risk',
  },
  {
    id: 'c4',
    name: 'DataPulse',
    industry: 'Data Analytics',
    contactName: 'Tom Rivera',
    contactEmail: 'trivera@datapulse.co',
    participantCount: 2,
    engagementStatus: 'pending',
  },
];
