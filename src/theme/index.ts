export const lightTheme = {
  background: '#F8FAFC', // slate-50
  card: '#FFFFFF',
  text: '#0F172A', // slate-900
  textSecondary: '#64748B', // slate-500
  primary: '#2563EB', // blue-600
  success: '#16A34A', // green-600
  warning: '#D97706', // amber-600
  danger: '#DC2626', // red-600
  border: '#E2E8F0', // slate-200
  income: '#16A34A',
  expense: '#DC2626',
  mode: 'light' as const,
};

export const darkTheme = {
  background: '#0F172A', // slate-900
  card: '#1E293B', // slate-800
  text: '#F8FAFC', // slate-50
  textSecondary: '#94A3B8', // slate-400
  primary: '#3B82F6', // blue-500
  success: '#22C55E', // green-500
  warning: '#F59E0B', // amber-500
  danger: '#EF4444', // red-500
  border: '#334155', // slate-700
  income: '#22C55E',
  expense: '#EF4444',
  mode: 'dark' as const,
};

export type Theme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  income: string;
  expense: string;
  mode: 'light' | 'dark';
};
