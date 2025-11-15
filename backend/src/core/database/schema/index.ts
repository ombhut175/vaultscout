import { healthChecking } from "./health-checking";
import { users } from "./users";
import { organizations } from "./organizations";
import { roleEnum } from "./roles";
import { userOrganizations } from "./user-organizations";
import { groups } from "./groups";
import { userGroups } from "./user-groups";
import { documents } from "./documents";
import { documentAclGroups } from "./document-acl-groups";
import { documentVersions } from "./document-versions";
import { files } from "./files";
import { chunks } from "./chunks";
import { embeddings } from "./embeddings";
import { ingestJobs } from "./ingest-jobs";
import { searchLogs } from "./search-logs";

// Schema exports
export const schema = {
  healthChecking,
  users,
  organizations,
  roleEnum,
  userOrganizations,
  groups,
  userGroups,
  documents,
  documentAclGroups,
  documentVersions,
  files,
  chunks,
  embeddings,
  ingestJobs,
  searchLogs,
};

// Export individual tables for convenience
export {
  healthChecking,
  users,
  organizations,
  roleEnum,
  userOrganizations,
  groups,
  userGroups,
  documents,
  documentAclGroups,
  documentVersions,
  files,
  chunks,
  embeddings,
  ingestJobs,
  searchLogs,
};
