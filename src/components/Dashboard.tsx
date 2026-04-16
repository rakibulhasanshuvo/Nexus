"use client";

import React from 'react';
import VortexaFeed from './VortexaFeed';
import VortexaSidebar from './VortexaSidebar';
import { useAcademicStats } from '@/hooks/useAcademicStats';

const Dashboard: React.FC = () => {
  const { cgpa, totalCredits } = useAcademicStats();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 xl:col-span-8 order-1">
          <VortexaFeed />
        </div>

        {/* Right Widget Sidebar (Repositioned to bottom on mobile via flex-order in future refactors, but for now we just use a single instance and rely on CSS layout to move it below on mobile) */}
        <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto no-scrollbar lg:px-4 lg:pt-2 lg:pb-12 mt-10 lg:mt-0 order-2">
          <VortexaSidebar stats={{ cgpa, credits: totalCredits }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
