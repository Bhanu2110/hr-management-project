export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'Public' | 'Optional';
  location?: string;
}
