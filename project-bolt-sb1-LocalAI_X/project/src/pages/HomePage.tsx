import React, { lazy, Suspense } from 'react';

const Hero = lazy(() => import('../components/Hero').then(module => ({ default: module.Hero })));
const FeatureGrid = lazy(() => import('../components/FeatureGrid').then(module => ({ default: module.FeatureGrid })));
const APIPlayground = lazy(() => import('../components/APIPlayground').then(module => ({ default: module.APIPlayground })));
const Documentation = lazy(() => import('../components/Documentation').then(module => ({ default: module.Documentation })));

const SectionLoader = () => (
  <div className="h-96 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<SectionLoader />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FeatureGrid />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <APIPlayground />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Documentation />
      </Suspense>
    </>
  );
} 