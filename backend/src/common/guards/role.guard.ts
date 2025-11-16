import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { DrizzleService } from "../../core/database/drizzle.service";
import { userOrganizations } from "../../core/database/schema/user-organizations";
import { eq, and } from "drizzle-orm";

/**
 * RoleGuard that checks if user has required role in the organization
 * Must be used with AuthGuard to ensure user is authenticated
 * Requires @Roles decorator to specify required roles
 *
 * @example
 * @Controller('users')
 * export class UsersController {
 *   @Delete(':id')
 *   @UseGuards(AuthGuard, RoleGuard)
 *   @Roles('admin')
 *   async deleteUser(@Param('id') id: string) {
 *     // Only admins can delete users
 *   }
 * }
 */
@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly db: DrizzleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const requestId = crypto.randomUUID();

    this.logger.log("Role authorization attempt started", {
      operation: "canActivate",
      requestId,
      method: request.method,
      url: request.url,
      requiredRoles,
      timestamp: new Date().toISOString(),
    });

    try {
      const user = request.user;

      if (!user) {
        this.logger.error("User not found in request", {
          operation: "canActivate",
          requestId,
          error: "AuthGuard must be applied before RoleGuard",
        });
        throw new ForbiddenException(
          "Authentication required. Apply @UseGuards(AuthGuard) before RoleGuard.",
        );
      }

      // Extract orgId from request params or query
      const orgId = request.params?.orgId || request.query?.orgId;

      if (!orgId) {
        this.logger.warn("Organization ID not found in request", {
          operation: "canActivate",
          requestId,
          userId: user.id,
          params: request.params,
          query: request.query,
        });
        throw new BadRequestException(
          "Organization ID is required for role-based access control",
        );
      }

      this.logger.debug("Checking user role in organization", {
        operation: "checkRole",
        requestId,
        userId: user.id,
        orgId,
        requiredRoles,
      });

      // Query user's role in the organization
      const startTime = Date.now();
      const userOrg = await this.db.db
        .select()
        .from(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, user.id),
            eq(userOrganizations.orgId, orgId as string),
          ),
        )
        .limit(1);

      const queryTime = Date.now() - startTime;

      if (!userOrg || userOrg.length === 0) {
        this.logger.warn("User not found in organization", {
          operation: "checkRole",
          requestId,
          userId: user.id,
          orgId,
          queryTime: `${queryTime}ms`,
        });
        throw new ForbiddenException(
          "You do not have access to this organization",
        );
      }

      const userRole = userOrg[0].role;
      const hasRequiredRole = requiredRoles.includes(userRole);

      if (!hasRequiredRole) {
        this.logger.warn("User does not have required role", {
          operation: "checkRole",
          requestId,
          userId: user.id,
          orgId,
          userRole,
          requiredRoles,
          queryTime: `${queryTime}ms`,
        });
        throw new ForbiddenException(
          `Insufficient permissions. Required roles: ${requiredRoles.join(", ")}. Your role: ${userRole}`,
        );
      }

      this.logger.log("Role authorization successful", {
        operation: "canActivate",
        requestId,
        userId: user.id,
        orgId,
        userRole,
        requiredRoles,
        queryTime: `${queryTime}ms`,
        timestamp: new Date().toISOString(),
      });

      // Attach orgId and role to request for use in controllers
      (request as any).orgId = orgId;
      (request as any).userRole = userRole;

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : "";
      const errorName =
        error instanceof Error ? error.constructor.name : "Unknown";

      this.logger.error("Role authorization failed", {
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
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new ForbiddenException("Role authorization failed");
    }
  }
}
