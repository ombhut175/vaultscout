'use client';

import { useRouter } from 'next/navigation';
import { useDocumentMutations } from '@/hooks/useDocumentMutations';
import { useDocsStore } from '@/hooks/use-docs-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import hackLog from '@/lib/logger';

interface DocumentDeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DocumentDeleteDialog({ 
  open: controlledOpen, 
  onOpenChange, 
  onSuccess 
}: DocumentDeleteDialogProps) {
  const router = useRouter();
  const { deleteDocument, isDeleting } = useDocumentMutations();
  const { selectedDoc, isDeleteDialogOpen, setDeleteDialogOpen, setSelectedDoc } = useDocsStore();

  // Use controlled open state if provided, otherwise use store state
  const open = controlledOpen !== undefined ? controlledOpen : isDeleteDialogOpen;
  const setOpen = onOpenChange || setDeleteDialogOpen;

  const handleDelete = async () => {
    if (!selectedDoc) {
      hackLog.error('DocumentDeleteDialog: No document selected');
      return;
    }

    hackLog.dev('DocumentDeleteDialog: Deleting document', { 
      documentId: selectedDoc.id,
      title: selectedDoc.title 
    });

    try {
      await deleteDocument(selectedDoc.id);
      
      hackLog.dev('DocumentDeleteDialog: Document deleted successfully', { 
        documentId: selectedDoc.id 
      });

      setOpen(false);
      setSelectedDoc(null);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/documents' as any);
      }
    } catch (error) {
      hackLog.error('DocumentDeleteDialog: Delete failed', { error });
    }
  };

  const handleCancel = () => {
    hackLog.dev('DocumentDeleteDialog: Cancelled');
    setOpen(false);
    setSelectedDoc(null);
  };

  if (!selectedDoc) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{selectedDoc.title}"?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action cannot be undone. This will permanently delete the document and all its
            associated data, including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Document metadata and content</li>
              <li>All document chunks</li>
              <li>Vector embeddings in Pinecone</li>
              <li>Version history</li>
            </ul>
          </AlertDescription>
        </Alert>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Document'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
