import { fetchJobs } from '@/data/apiClient';

export async function generateStaticParams() {
  try {
    const jobs = await fetchJobs();
    if (jobs && jobs.length > 0) {
      return jobs.map((j) => ({ id: j.job_id || j.id }));
    }
  } catch (err) {
    console.warn('Failed to fetch jobs for opportunities generateStaticParams:', err);
  }
  return [{ id: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
