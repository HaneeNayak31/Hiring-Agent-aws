// app/candidate/page.tsx
import { redirect } from 'next/navigation';

export default function CandidateRedirect() {
  redirect('/company');
}
