import { redirect } from 'next/navigation';

export default function RecruiterCandidateBriefRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/company/candidates/${params.id}/brief`);
}
