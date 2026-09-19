import { fetchApplications } from '@/data/apiClient';

export async function generateStaticParams() {
  try {
    const apps = await fetchApplications();
    if (apps && apps.length > 0) {
      return apps.map((a) => ({ id: a.application_id }));
    }
  } catch (err) {
    console.warn('Failed to fetch applications for recruiter generateStaticParams:', err);
  }
  return [{ id: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
