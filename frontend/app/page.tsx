import {
  Hero,
  ProblemSection,
  CandidateNeverComesSection,
  VisionSection,
  CompanyControlRoomPreview,
  FeatureSection,
  MCPInfrastructureSection,
  FinalCTASection,
} from '@/components/landing';

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <CandidateNeverComesSection />
      <VisionSection />
      <CompanyControlRoomPreview />
      <FeatureSection />
      <MCPInfrastructureSection />
      <FinalCTASection />
    </>
  );
}
