export type EngagementStatus = 'active' | 'pending' | 'at-risk';

export interface Company {
  id: string;
  name: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  participantCount: number;
  engagementStatus: EngagementStatus;
}
