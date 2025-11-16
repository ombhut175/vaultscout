'use client';

import { Organization } from '@/lib/api/organizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useOrgsStore } from '@/hooks/use-orgs-store';
import hackLog from '@/lib/logger';

interface OrganizationCardProps {
  organization: Organization;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
  showActions?: boolean;
}

export function OrganizationCard({ 
  organization, 
  onEdit, 
  onDelete, 
  showActions = true 
}: OrganizationCardProps) {
  const router = useRouter();
  const { setSelectedOrg, setOrgDialogOpen, setDeleteDialogOpen } = useOrgsStore();

  const handleViewDetails = () => {
    hackLog.dev('OrganizationCard: View details clicked', { orgId: organization.id });
    router.push(`/organizations/${organization.id}` as any);
  };

  const handleEdit = () => {
    hackLog.dev('OrganizationCard: Edit clicked', { orgId: organization.id });
    setSelectedOrg(organization);
    setOrgDialogOpen(true);
    onEdit?.(organization);
  };

  const handleDelete = () => {
    hackLog.dev('OrganizationCard: Delete clicked', { orgId: organization.id });
    setSelectedOrg(organization);
    setDeleteDialogOpen(true);
    onDelete?.(organization);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {organization.name}
            </CardTitle>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(organization.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Namespace: {organization.pineconeNamespace}
            </Badge>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
