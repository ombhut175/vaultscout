import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";
import { DrizzleService } from "../../core/database/drizzle.service";
import { documents } from "../../core/database/schema/documents";
import { documentAclGroups } from "../../core/database/schema/document-acl-groups";
import { userGroups } from "../../core/database/schema/user-groups";
import { eq, and, inArray } from "drizzle-orm";

/**
 * ACLGuard that checks if user has access to a document based on ACL groups
 * Must be used with AuthGuard to ensure user is authenticated
 * Checks if user belongs to at least one of the document's ACL groups
 *
 * @example
 * @Controller('documents')
 * export class DocumentsController {
 *   @Get(':id')
 *   @UseGuards(AuthGuard, ACLGuard)
 *   async getDocument(@Param('id') id: string) {
 *     // Only users in document's ACL groups can access
 *   }
 *
 *   @Delete(':id')
 *   @UseGuards(AuthGuard, RoleGuard, ACLGuard)
 *   @Roles('admin', 'editor')
 *   async deleteDocument(@Param('id') id: string) {
 *     // Must be admin/editor AND have ACL access
 *   }
 * }
 */
@Injectable()
export class ACLGuard implements CanActivate {
  private readonly logger = new Logger(ACLGuard.name);

  constructor(private readonly db: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const requestId = crypto.randomUUID();

    this.logger.log("ACL authorization attempt started", {
      operation: "canActivate",
      requestId,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
    });

    try {
      const user = request.user;

      if (!user) {
        this.logger.error("User not found in request", {
          operation: "canActivate",
          requestId,
          error: "AuthGuard must be applied before ACLGuard",
        });
        throw new ForbiddenException(
          "Authentication required. Apply @UseGuards(AuthGuard) before ACLGuard.",
        );
      }

      // Extract documentId from request params
      const documentId = request.params?.id || request.params?.documentId;

      if (!documentId) {
        this.logger.warn("Document ID not found in request", {
          operation: "canActivate",
          requestId,
          userId: user.id,
          params: request.params,
        });
        throw new BadRequestException(
          "Document ID is required for ACL authorization",
        );
      }

      this.logger.debug("Checking document ACL access", {
        operation: "checkACL",
        requestId,
        userId: user.id,
        documentId,
      });

      // Step 1: Check if document exists
      const startTime = Date.now();
      const document = await this.db.db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!document || document.length === 0) {
        this.logger.warn("Document not found", {
          operation: "checkACL",
          requestId,
          documentId,
          queryTime: `${Date.now() - startTime}ms`,
        });
        throw new NotFoundException("Document not found");
      }

      // Step 2: Get user's groups
      const userGroupsResult = await this.db.db
        .select({ groupId: userGroups.groupId })
        .from(userGroups)
        .where(eq(userGroups.userId, user.id));

      const userGroupIds = userGroupsResult.map(
        (ug: { groupId: string }) => ug.groupId,
      );

      if (userGroupIds.length === 0) {
        this.logger.warn("User has no groups", {
          operation: "checkACL",
          requestId,
          userId: user.id,
          documentId,
        });
        throw new ForbiddenException("You do not have access to this document");
      }

      // Step 3: Check if any of user's groups are in document's ACL
      const documentAcl = await this.db.db
        .select()
        .from(documentAclGroups)
        .where(
          and(
            eq(documentAclGroups.documentId, documentId),
            inArray(documentAclGroups.groupId, userGroupIds),
          ),
        )
        .limit(1);

      const queryTime = Date.now() - startTime;

      if (!documentAcl || documentAcl.length === 0) {
        this.logger.warn("User does not have ACL access to document", {
          operation: "checkACL",
          requestId,
          userId: user.id,
          documentId,
          userGroupIds,
          queryTime: `${queryTime}ms`,
        });
        throw new ForbiddenException("You do not have access to this document");
      }

      this.logger.log("ACL authorization successful", {
        operation: "canActivate",
        requestId,
        userId: user.id,
        documentId,
        userGroupIds,
        queryTime: `${queryTime}ms`,
        timestamp: new Date().toISOString(),
      });

      // Attach document info to request for use in controllers
      (request as any).document = document[0];

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : "";
      const errorName =
        error instanceof Error ? error.constructor.name : "Unknown";

      this.logger.error("ACL authorization failed", {
        operation: "canActivate",
        requestId,
        method: request.method,
        url: request.url,
        error: {
          message: errorMessage,
          name: errorName,
          stack:
            process.env.NODE_ENV === "development" ? errorStack : undefined,
        },
        timestamp: new Date().toISOString(),
      });

      // Re-throw known exceptions
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new ForbiddenException("ACL authorization failed");
    }
  }
}
