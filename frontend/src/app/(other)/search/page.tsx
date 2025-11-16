'use client';

import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/search-bar';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchResults } from '@/components/search/search-results';
import { SearchHistory } from '@/components/search/search-history';
import { Search, Filter, Clock } from 'lucide-react';
import { PremiumPageLayout, itemVariants } from '@/components/layouts/premium-page-layout';
import { SectionCard } from '@/components/ui/section-card';
import { InteractiveCard } from '@/components/ui/interactive-card';

export default function SearchPage() {
  return (
    <PremiumPageLayout
      icon={Search}
      title="Search Documents"
      description="Search across all your accessible documents using semantic search and advanced filters"
    >
      {/* Search Bar Section */}
      <motion.div variants={itemVariants}>
        <InteractiveCard variant="glass" tilt={false} glow={true} className="p-6">
          <SearchBar
            placeholder="Search for documents, topics, or keywords..."
            showSearchButton={true}
          />
        </InteractiveCard>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <SectionCard
              title="Filters"
              icon={Filter}
              className="shadow-lg"
            >
              <SearchFilters />
            </SectionCard>
          </div>
        </aside>

        {/* Main Content - Results */}
        <div className="lg:col-span-2">
          <SearchResults />
        </div>

        {/* Right Sidebar - History */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <SectionCard
              title="Recent Searches"
              icon={Clock}
              className="shadow-lg"
            >
              <SearchHistory maxItems={10} />
            </SectionCard>
          </div>
        </aside>
      </motion.div>
    </PremiumPageLayout>
  );
}
