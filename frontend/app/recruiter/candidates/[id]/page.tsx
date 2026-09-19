import { redirect } from 'next/navigation';

export default function RecruiterCandidateDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/company/candidates/${params.id}`);
}
