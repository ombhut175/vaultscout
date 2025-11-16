import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";
import { ENV } from "../../common/constants/string-const";

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private pool!: Pool;
  public db!: ReturnType<typeof drizzle>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.pool = new Pool(this.getPoolConfig());
      this.db = drizzle(this.pool);

      // Test the connection
      await this.pool.query("SELECT 1");
      this.logger.log("Database connection established successfully");
    } catch (error) {
      this.logger.error("Failed to establish database connection", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log("Database connection closed");
    }
  }

  private getPoolConfig(): PoolConfig {
    const databaseUrl = this.configService.get<string>(ENV.DATABASE_URL);

    const baseConfig: PoolConfig = {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    if (databaseUrl) {
      return {
        ...baseConfig,
        connectionString: databaseUrl,
      };
    }

    return {
      ...baseConfig,
      host: this.configService.get<string>(ENV.DATABASE_HOST),
      port: this.configService.get<number>(ENV.DATABASE_PORT),
      database: this.configService.get<string>(ENV.DATABASE_NAME),
      user: this.configService.get<string>(ENV.DATABASE_USER),
      password: this.configService.get<string>(ENV.DATABASE_PASSWORD),
    };
  }

  getDatabase() {
    return this.db;
  }

  getPool() {
    return this.pool;
  }
}
