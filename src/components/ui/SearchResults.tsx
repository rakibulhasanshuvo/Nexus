'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SearchResultItem } from '@/app/actions/search';
import Image from 'next/image';
import { Play, Globe } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
  isLoading?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full p-8 text-center rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
        <p className="text-white/50 font-medium">No results found.</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((item, index) => (
        <motion.a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group relative flex flex-col h-full overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(255,255,255,0.05)]"
        >
          {/* Top Glass Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />

          <div className="relative w-full h-48 overflow-hidden bg-white/5">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                 {item.platform === 'youtube' ? <Play className="w-12 h-12 text-white/20" /> : <Globe className="w-12 h-12 text-white/20" />}
              </div>
            )}

            {/* Platform Badge */}
            <div className="absolute top-4 right-4 z-20">
               <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                 {item.platform === 'youtube' ? (
                   <>
                    <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    <span className="text-xs font-medium text-white/90">Video</span>
                   </>
                 ) : (
                   <>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-white/90">Article</span>
                   </>
                 )}
               </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          </div>

          <div className="flex flex-col flex-grow p-6 z-20">
            <h3 className="text-lg font-semibold text-white/90 line-clamp-2 mb-2 group-hover:text-white transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-white/50 line-clamp-3 flex-grow leading-relaxed">
              {item.description}
            </p>
          </div>

           {/* Bottom subtle glow */}
           <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500 z-0" />
        </motion.a>
      ))}
    </div>
  );
};
