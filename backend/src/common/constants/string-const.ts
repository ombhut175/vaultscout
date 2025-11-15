// Environment Variables
export enum ENV {
  SUPABASE_URL = "SUPABASE_URL",
  SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY",
  SUPABASE_SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY",
  NODE_ENV = "NODE_ENV",
  PORT = "PORT",
  SWAGGER_USER = "SWAGGER_USER",
  SWAGGER_PASSWORD = "SWAGGER_PASSWORD",
  SWAGGER_ENABLED = "SWAGGER_ENABLED",
  SWAGGER_UI_DEEP_LINKING = "SWAGGER_UI_DEEP_LINKING",
  SWAGGER_UI_DOC_EXPANSION = "SWAGGER_UI_DOC_EXPANSION",
  SWAGGER_UI_FILTER = "SWAGGER_UI_FILTER",
  FRONTEND_URL = "FRONTEND_URL",
  REDIRECT_TO_FRONTEND_URL = "REDIRECT_TO_FRONTEND_URL",
  COOKIE_DOMAIN = "COOKIE_DOMAIN",

  // Database Configuration
  DATABASE_URL = "DATABASE_URL",
  DATABASE_HOST = "DATABASE_HOST",
  DATABASE_PORT = "DATABASE_PORT",
  DATABASE_NAME = "DATABASE_NAME",
  DATABASE_USER = "DATABASE_USER",
  DATABASE_PASSWORD = "DATABASE_PASSWORD",

  // Hugging Face Configuration
  HF_API_TOKEN = "HF_API_TOKEN",
  HF_EMBEDDING_URL = "HF_EMBEDDING_URL",
  HF_EMBEDDING_MODEL = "HF_EMBEDDING_MODEL",
  EMBEDDING_DIMENSIONS = "EMBEDDING_DIMENSIONS",
  BGE_NORMALIZE = "BGE_NORMALIZE",

  // Pinecone Configuration
  PINECONE_API_KEY = "PINECONE_API_KEY",
  PINECONE_INDEX_NAME = "PINECONE_INDEX_NAME",
}

// Common Messages
export enum MESSAGES {
  // Generic
  SUCCESS = "Success",
  CREATED = "Created",
  UPDATED = "Updated",
  DELETED = "Deleted",

  // Errors
  UNEXPECTED_ERROR = "Unexpected error occurred",
  VALIDATION_ERROR = "Validation error",
  NOT_FOUND = "Resource not found",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",

  // Auth
  INVALID_TOKEN = "Invalid token",
  TOKEN_EXPIRED = "Token expired",
  USER_NOT_FOUND = "User not found",
  TASK_NOT_FOUND = "Task not found",
  LOGIN_SUCCESSFUL = "Login successful",
  SIGNUP_SUCCESSFUL = "Account created successfully",
  PASSWORD_RESET_SENT = "Password reset email sent",
  INVALID_CREDENTIALS = "Invalid email or password",
  EMAIL_ALREADY_EXISTS = "Email already exists",
  WEAK_PASSWORD = "Password is too weak",
  INVALID_EMAIL = "Invalid email format",

  // Supabase
  SUPABASE_CONNECTION_ERROR = "Failed to connect to database",
  SUPABASE_QUERY_ERROR = "Database query failed",

  // Pinecone
  PINECONE_UPSERT_SUCCESS = "Vectors upserted successfully",
  PINECONE_FETCH_SUCCESS = "Vectors fetched successfully",
  PINECONE_DELETE_SUCCESS = "Vectors deleted successfully",
  PINECONE_SEARCH_SUCCESS = "Search completed successfully",
  PINECONE_CONNECTION_ERROR = "Failed to connect to Pinecone",
  PINECONE_OPERATION_ERROR = "Pinecone operation failed",

  // Document Processing
  DOCUMENT_UPLOAD_SUCCESS = "Document uploaded successfully",
  DOCUMENT_PROCESSING_STARTED = "Document processing started",
  DOCUMENT_PROCESSING_COMPLETE = "Document processed successfully",
  DOCUMENT_PROCESSING_FAILED = "Document processing failed",
  DOCUMENT_NOT_FOUND = "Document not found",
  INVALID_FILE_TYPE = "Invalid file type",
  FILE_TOO_LARGE = "File size exceeds limit",
  STORAGE_UPLOAD_ERROR = "Failed to upload file to storage",
  TEXT_EXTRACTION_ERROR = "Failed to extract text from document",
  CHUNKING_ERROR = "Failed to chunk document text",
  EMBEDDING_ERROR = "Failed to generate embeddings",
}

// API Response Messages
export enum API_MESSAGES {
  USERS_FETCHED = "Users fetched successfully",
  USER_CREATED = "User created successfully",
  USER_UPDATED = "User updated successfully",
  USER_DELETED = "User deleted successfully",
}

// Table Names (for future use)
export enum TABLES {
  USERS = "users",
  TASKS = "tasks",
  PROFILES = "profiles",
}

// Queue Names (for future BullMQ usage)
export enum QUEUES {
  JOBS = "jobs",
  EMAILS = "emails",
  NOTIFICATIONS = "notifications",
}

// Cookie Keys
export enum COOKIES {
  AUTH_TOKEN = "auth_token",
}

// Supabase Storage Buckets
export enum SUPABASE_BUCKETS {
  RAW = "vs-raw-private",
  EXTRACTED = "vs-extracted-private",
  PREVIEWS = "vs-previews-public",
  EXPORTS = "vs-exports-private",
  TEMP = "vs-temp-private",
}
