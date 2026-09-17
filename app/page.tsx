// app/page.tsx
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import CandidateNeverComesSection from '@/components/CandidateNeverComesSection';
import VisionSection from '@/components/VisionSection';
import CompanyControlRoomPreview from '@/components/CompanyControlRoomPreview';
import FeatureSection from '@/components/FeatureSection';
import MCPInfrastructureSection from '@/components/MCPInfrastructureSection';
import FinalCTASection from '@/components/FinalCTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <div id="problem">
        <ProblemSection />
      </div>
      <CandidateNeverComesSection />
      <VisionSection />
      <CompanyControlRoomPreview />
      <FeatureSection />
      <MCPInfrastructureSection />
      <FinalCTASection />
    </>
  );
}
