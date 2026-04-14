"use client";

import React from 'react';
import NexusFeed from './NexusFeed';
import NexusSidebar from './NexusSidebar';
import { useAcademicStats } from '@/hooks/useAcademicStats';

const Dashboard: React.FC = () => {
  const { cgpa, totalCredits } = useAcademicStats();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 xl:col-span-8">
          <NexusFeed />
        </div>

        {/* Right Widget Sidebar */}
        <div className="lg:col-span-4 xl:col-span-4 hidden lg:block sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar px-4 pt-2 pb-12">
          <NexusSidebar stats={{ cgpa, credits: totalCredits }} />
        </div>
      </div>
      
      {/* Mobile Sidebar (shown at bottom) */}
      <div className="lg:hidden mt-10">
        <NexusSidebar stats={{ cgpa, credits: totalCredits }} />
      </div>
    </div>
  );
};

export default Dashboard;
