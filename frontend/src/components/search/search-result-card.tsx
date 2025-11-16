'use client';

import Link from 'next/link';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/lib/api/search';
import { DocumentsAPI } from '@/lib/api/documents';
import { cn } from '@/lib/utils';
import hackLog from '@/lib/logger';

export interface SearchResultCardProps {
  /**
   * Search result data
   */
  result: SearchResult;
  /**
   * Additional className for card
   */
  className?: string;
}

/**
 * SearchResultCard component to display a single search result
 * 
 * Features:
 * - Display document title, file type
 * - Show relevance score (0-1)
 * - Show text snippet with query highlighting
 * - Show chunk position
 * - Link to document detail page
 * - Consistent card styling
 * 
 * @example
 * ```tsx
 * <SearchResultCard result={searchResult} />
 * ```
 */
export function SearchResultCard({ result, className }: SearchResultCardProps) {
  const {
    documentId,
    documentTitle,
    text,
    score,
    page,
    sectionTitle,
    fileType,
    tags
  } = result;

  // Format score as percentage
  const scorePercentage = Math.round(score * 100);

  // Get score color based on relevance
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  // Truncate text if too long
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleClick = () => {
    hackLog.dev('SearchResultCard: Clicked', {
      documentId,
      documentTitle,
      score
    });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    hackLog.dev('SearchResultCard: Download clicked', { documentId, documentTitle });
    try {
      await DocumentsAPI.download(documentId, documentTitle);
    } catch (error) {
      hackLog.error('SearchResultCard: Download failed', { error });
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Link
                href={`/documents/${documentId}` as any}
                onClick={handleClick}
                className="text-lg font-semibold hover:underline line-clamp-1"
              >
                {documentTitle}
              </Link>
              {sectionTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {sectionTitle}
                </p>
              )}
            </div>
          </div>
          <div className={cn('text-sm font-semibold flex-shrink-0', getScoreColor(score))}>
            {scorePercentage}%
          </div>
        </div>

        {/* Snippet */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {truncateText(text)}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {fileType.toUpperCase()}
          </Badge>
          {page && (
            <Badge variant="outline" className="text-xs">
              Page {page}
            </Badge>
          )}
          {tags && tags.length > 0 && (
            <>
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 3} more
                </span>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t flex items-center gap-2">
          <Link href={`/documents/${documentId}` as any} onClick={handleClick}>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              View Document
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="h-8 px-3" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
