'use client';

import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/search-bar';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchResults } from '@/components/search/search-results';
import { SearchHistory } from '@/components/search/search-history';
import { Search } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function SearchPage() {
  return (
    <div className="relative min-h-full bg-gradient-to-b from-white to-slate-50 text-slate-900 transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100">
      {/* Background decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Search Documents</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Search across all your accessible documents using semantic search
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="relative">
          <div className="rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 p-6">
            <SearchBar
              placeholder="Search for documents, topics, or keywords..."
              showSearchButton={true}
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 overflow-hidden sticky top-20">
              <div className="p-6">
                <SearchFilters />
              </div>
            </div>
          </aside>

          {/* Main Content - Results */}
          <div className="lg:col-span-2">
            <SearchResults />
          </div>

          {/* Right Sidebar - History */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-black/10 bg-white/60 shadow-sm dark:border-white/10 dark:bg-slate-900/40 overflow-hidden sticky top-20">
              <div className="p-6">
                <SearchHistory maxItems={10} />
              </div>
            </div>
          </aside>
        </motion.div>
      </motion.div>
    </div>
  );
}
