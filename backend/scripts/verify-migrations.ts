/**
 * Database Migration Verification Script
 * 
 * This script verifies that all database migrations have been applied correctly
 * and checks for data integrity issues.
 * 
 * Usage:
 *   npm run verify-migrations
 *   or
 *   ts-node scripts/verify-migrations.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
// @ts-ignore - postgres types not available in build
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Expected tables in the database
const EXPECTED_TABLES = [
  'users',
  'organizations',
  'user_organizations',
  'groups',
  'user_groups',
  'documents',
  'document_acl_groups',
  'document_versions',
  'chunks',
  'embeddings',
  'search_logs',
];

// Expected indexes
const EXPECTED_INDEXES = [
  'users_email_unique',
  'organizations_name_unique',
  'user_organizations_pkey',
  'groups_org_id_name_unique',
  'user_groups_pkey',
  'document_acl_groups_pkey',
  'document_versions_document_id_version_unique',
  'chunks_document_id_version_id_position_unique',
  'embeddings_index_name_namespace_vector_id_unique',
];

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

class MigrationVerifier {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;
  private results: VerificationResult[] = [];

  constructor() {
    this.client = postgres(DATABASE_URL!);
    this.db = drizzle(this.client);
  }

  async verify(): Promise<boolean> {
    console.log('🔍 Starting database migration verification...\n');

    try {
      await this.checkConnection();
      await this.checkTables();
      await this.checkIndexes();
      await this.checkForeignKeys();
      await this.checkDataIntegrity();
      await this.checkEnumValues();

      this.printResults();

      return this.results.every((r) => r.passed);
    } catch (error) {
      console.error('❌ Verification failed with error:', error);
      return false;
    } finally {
      await this.client.end();
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.db.execute(sql`SELECT 1`);
      this.addResult(true, 'Database connection successful');
    } catch (error) {
      this.addResult(false, 'Database connection failed', error);
    }
  }

  private async checkTables(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const existingTables = result.map((row: any) => row.table_name);
      const missingTables = EXPECTED_TABLES.filter(
        (table) => !existingTables.includes(table)
      );

      if (missingTables.length === 0) {
        this.addResult(
          true,
          `All ${EXPECTED_TABLES.length} expected tables exist`,
          { tables: existingTables }
        );
      } else {
        this.addResult(
          false,
          `Missing tables: ${missingTables.join(', ')}`,
          { existing: existingTables, missing: missingTables }
        );
      }
    } catch (error) {
      this.addResult(false, 'Failed to check tables', error);
    }
  }

  private async checkIndexes(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY indexname
      `);

      const existingIndexes = result.map((row: any) => row.indexname);
      const missingIndexes = EXPECTED_INDEXES.filter(
        (index) => !existingIndexes.includes(index)
      );

      if (missingIndexes.length === 0) {
        this.addResult(
          true,
          `All ${EXPECTED_INDEXES.length} expected indexes exist`,
          { count: existingIndexes.length }
        );
      } else {
        this.addResult(
          false,
          `Missing indexes: ${missingIndexes.join(', ')}`,
          { existing: existingIndexes.length, missing: missingIndexes }
        );
      }
    } catch (error) {
      this.addResult(false, 'Failed to check indexes', error);
    }
  }

  private async checkForeignKeys(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
      `);

      const foreignKeys = result.length;

      if (foreignKeys > 0) {
        this.addResult(
          true,
          `Found ${foreignKeys} foreign key constraints`,
          { count: foreignKeys }
        );
      } else {
        this.addResult(
          false,
          'No foreign key constraints found',
          { count: 0 }
        );
      }
    } catch (error) {
      this.addResult(false, 'Failed to check foreign keys', error);
    }
  }

  private async checkDataIntegrity(): Promise<void> {
    try {
      // Check for orphaned user_organizations records
      const orphanedUserOrgs = await this.db.execute(sql`
        SELECT COUNT(*) as count
        FROM user_organizations uo
        LEFT JOIN users u ON uo.user_id = u.id
        WHERE u.id IS NULL
      `);

      const orphanedUserOrgsCount = Number(orphanedUserOrgs[0]?.count || 0);

      if (orphanedUserOrgsCount === 0) {
        this.addResult(true, 'No orphaned user_organizations records');
      } else {
        this.addResult(
          false,
          `Found ${orphanedUserOrgsCount} orphaned user_organizations records`
        );
      }

      // Check for orphaned documents
      const orphanedDocs = await this.db.execute(sql`
        SELECT COUNT(*) as count
        FROM documents d
        LEFT JOIN organizations o ON d.org_id = o.id
        WHERE o.id IS NULL
      `);

      const orphanedDocsCount = Number(orphanedDocs[0]?.count || 0);

      if (orphanedDocsCount === 0) {
        this.addResult(true, 'No orphaned documents records');
      } else {
        this.addResult(
          false,
          `Found ${orphanedDocsCount} orphaned documents records`
        );
      }

      // Check for orphaned chunks
      const orphanedChunks = await this.db.execute(sql`
        SELECT COUNT(*) as count
        FROM chunks c
        LEFT JOIN documents d ON c.document_id = d.id
        WHERE d.id IS NULL
      `);

      const orphanedChunksCount = Number(orphanedChunks[0]?.count || 0);

      if (orphanedChunksCount === 0) {
        this.addResult(true, 'No orphaned chunks records');
      } else {
        this.addResult(
          false,
          `Found ${orphanedChunksCount} orphaned chunks records`
        );
      }

      // Check for orphaned embeddings
      const orphanedEmbeddings = await this.db.execute(sql`
        SELECT COUNT(*) as count
        FROM embeddings e
        LEFT JOIN chunks c ON e.chunk_id = c.id
        WHERE c.id IS NULL
      `);

      const orphanedEmbeddingsCount = Number(
        orphanedEmbeddings[0]?.count || 0
      );

      if (orphanedEmbeddingsCount === 0) {
        this.addResult(true, 'No orphaned embeddings records');
      } else {
        this.addResult(
          false,
          `Found ${orphanedEmbeddingsCount} orphaned embeddings records`
        );
      }
    } catch (error) {
      this.addResult(false, 'Failed to check data integrity', error);
    }
  }

  private async checkEnumValues(): Promise<void> {
    try {
      // Check role enum values
      const roles = await this.db.execute(sql`
        SELECT DISTINCT role 
        FROM user_organizations
        ORDER BY role
      `);

      const roleValues = roles.map((row: any) => row.role);
      const expectedRoles = ['admin', 'editor', 'viewer'];
      const invalidRoles = roleValues.filter(
        (role: string) => !expectedRoles.includes(role)
      );

      if (invalidRoles.length === 0) {
        this.addResult(
          true,
          'All role enum values are valid',
          { roles: roleValues }
        );
      } else {
        this.addResult(
          false,
          `Found invalid role values: ${invalidRoles.join(', ')}`,
          { invalid: invalidRoles }
        );
      }

      // Check document status values
      const statuses = await this.db.execute(sql`
        SELECT DISTINCT status 
        FROM documents
        ORDER BY status
      `);

      const statusValues = statuses.map((row: any) => row.status);
      const expectedStatuses = ['queued', 'processing', 'ready', 'failed'];
      const invalidStatuses = statusValues.filter(
        (status: string) => !expectedStatuses.includes(status)
      );

      if (invalidStatuses.length === 0) {
        this.addResult(
          true,
          'All document status values are valid',
          { statuses: statusValues }
        );
      } else {
        this.addResult(
          false,
          `Found invalid status values: ${invalidStatuses.join(', ')}`,
          { invalid: invalidStatuses }
        );
      }
    } catch (error) {
      this.addResult(false, 'Failed to check enum values', error);
    }
  }

  private addResult(
    passed: boolean,
    message: string,
    details?: any
  ): void {
    this.results.push({ passed, message, details });
  }

  private printResults(): void {
    console.log('\n📊 Verification Results:\n');
    console.log('='.repeat(60));

    let passedCount = 0;
    let failedCount = 0;

    this.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      const status = result.passed ? 'PASS' : 'FAIL';

      console.log(`${icon} [${status}] ${result.message}`);

      if (result.details && !result.passed) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }

      if (result.passed) {
        passedCount++;
      } else {
        failedCount++;
      }
    });

    console.log('='.repeat(60));
    console.log(
      `\n📈 Summary: ${passedCount} passed, ${failedCount} failed out of ${this.results.length} checks\n`
    );

    if (failedCount === 0) {
      console.log('✨ All verification checks passed! Database is healthy.\n');
    } else {
      console.log(
        '⚠️  Some verification checks failed. Please review the issues above.\n'
      );
    }
  }
}

// Run verification
async function main() {
  const verifier = new MigrationVerifier();
  const success = await verifier.verify();

  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
