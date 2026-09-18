// components/CandidateDrawer.tsx
'use client';

import { CandidateReport } from '@/data/mockData';
import CandidateAgentDrawer from './CandidateAgentDrawer';

interface CandidateDrawerProps {
  candidate: CandidateReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateDrawer(props: CandidateDrawerProps) {
  return <CandidateAgentDrawer {...props} />;
}
