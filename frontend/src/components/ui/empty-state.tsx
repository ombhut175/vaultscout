// Empty state component for lists with no data
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Plus, Search, Users, Building2, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <FileQuestion className="h-8 w-8 text-muted-foreground" />}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export function NoUsersEmptyState({ onAddUser }: { onAddUser?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No users found"
      description="Get started by adding your first user to the organization."
      action={onAddUser ? { label: 'Add User', onClick: onAddUser } : undefined}
    />
  );
}

export function NoOrganizationsEmptyState({ onAddOrg }: { onAddOrg?: () => void }) {
  return (
    <EmptyState
      icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
      title="No organizations found"
      description="Create your first organization to get started with VaultScout."
      action={onAddOrg ? { label: 'Create Organization', onClick: onAddOrg } : undefined}
    />
  );
}

export function NoDocumentsEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8 text-muted-foreground" />}
      title="No documents found"
      description="Upload your first document to start building your knowledge base."
      action={onUpload ? { label: 'Upload Document', onClick: onUpload } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description={
        query
          ? `No documents match your search for "${query}". Try different keywords or filters.`
          : 'Try searching with different keywords or adjusting your filters.'
      }
    />
  );
}
