'use client';

import { Document, DocumentsAPI } from '@/lib/api/documents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, MoreVertical, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useDocsStore } from '@/hooks/use-docs-store';
import hackLog from '@/lib/logger';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  showActions?: boolean;
}

export function DocumentCard({ document, onEdit, onDelete, showActions = true }: DocumentCardProps) {
  const router = useRouter();
  const { setSelectedDoc, setDeleteDialogOpen, setDocDialogOpen } = useDocsStore();

  const handleViewDetails = () => {
    hackLog.dev('DocumentCard: View details clicked', { documentId: document.id });
    router.push(`/documents/${document.id}` as any);
  };

  const handleEdit = () => {
    hackLog.dev('DocumentCard: Edit clicked', { documentId: document.id });
    setSelectedDoc(document);
    setDocDialogOpen(true);
    onEdit?.(document);
  };

  const handleDelete = () => {
    hackLog.dev('DocumentCard: Delete clicked', { documentId: document.id });
    setSelectedDoc(document);
    setDeleteDialogOpen(true);
    onDelete?.(document);
  };

  const handleDownload = async () => {
    hackLog.dev('DocumentCard: Download clicked', { documentId: document.id });
    try {
      await DocumentsAPI.download(document.id, document.title);
    } catch (error) {
      hackLog.error('DocumentCard: Download failed', { error });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {document.fileType}
              </Badge>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Upload date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Uploaded {formatDate(document.createdAt)}</span>
          </div>

          {/* File icon */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="truncate">{document.id.slice(0, 8)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
