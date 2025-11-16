import { SetMetadata } from "@nestjs/common";

/**
 * Roles decorator to specify required roles for a route
 * Used with RoleGuard to enforce role-based access control
 *
 * @param roles - Array of roles that are allowed to access the route
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
 *
 *   @Put(':id')
 *   @UseGuards(AuthGuard, RoleGuard)
 *   @Roles('admin', 'editor')
 *   async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
 *     // Admins and editors can update users
 *   }
 * }
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
