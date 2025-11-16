'use client';

import { motion } from 'framer-motion';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentFilters } from '@/components/documents/document-filters';
import { DocumentDeleteDialog } from '@/components/documents/document-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PremiumPageLayout, itemVariants } from '@/components/layouts/premium-page-layout';
import { SectionCard } from '@/components/ui/section-card';
import hackLog from '@/lib/logger';

export default function DocumentsPage() {
  const router = useRouter();

  const handleUploadClick = () => {
    hackLog.dev('DocumentsPage: Upload button clicked');
    router.push('/documents/upload' as any);
  };

  return (
    <PremiumPageLayout
      icon={FileText}
      title="Documents"
      description="Manage and search your uploaded documents with ease"
      actions={
        <Button 
          onClick={handleUploadClick}
          size="lg"
          className="gap-2 h-11 px-6 btn-super"
        >
          <Plus className="h-5 w-5" />
          Upload Document
        </Button>
      }
    >
      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <SectionCard
          title="Filter Documents"
          icon={Filter}
          className="shadow-lg"
        >
          <DocumentFilters />
        </SectionCard>
      </motion.div>

      {/* Document List */}
      <motion.div variants={itemVariants}>
        <DocumentList />
      </motion.div>

      {/* Delete Dialog */}
      <DocumentDeleteDialog />
    </PremiumPageLayout>
  );
}
