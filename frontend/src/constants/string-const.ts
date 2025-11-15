export const API_URL_PREFIX = "api";

// HTTP Status Codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const;

// API Messages
export const API_MESSAGES = {
	NETWORK_ERROR: 'Network error occurred. Please check your connection.',
	SERVER_ERROR: 'Server error occurred. Please try again later.',
	UNAUTHORIZED: 'You are not authorized to perform this action.',
	FORBIDDEN: 'Access denied.',
	NOT_FOUND: 'Resource not found.',
	VALIDATION_ERROR: 'Validation failed.',
	INVALID_CREDENTIALS: 'Invalid email or password.',
	SUCCESS: 'Operation completed successfully.',
} as const;


// API Endpoints
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: 'auth/login',
		SIGNUP: 'auth/signup',
		LOGOUT: 'auth/logout',
		IS_LOGGED_IN: 'auth/isLoggedIn',
		FORGOT_PASSWORD: 'auth/forgot-password',
	},
	USERS: {
		ME: 'users/me',
		ORGANIZATION_MEMBERSHIP: 'users/organization-membership',
	},
	SENDER: {
		VERIFY: 'sender/verify',
		STATUS: (senderId: string) => `sender/status/${senderId}`,
		SEND: 'sender/send',
		STATUS_BY_EMAIL: (email: string) => `sender/status-by-email/${encodeURIComponent(email)}`,
		LIST: 'sender/list',
	},
} as const;

// Auth/User domain constants
export const USER_ROLES = {
	ADMIN: 'admin',
	MODERATOR: 'moderator',
	USER: 'user',
	SENIOR_MODERATOR: 'senior_moderator',
	TEAM_LEAD: 'team_lead',
} as const;

export const USER_STATUSES = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	PENDING: 'pending',
} as const;

// Tickets domain constants
export const TICKET_STATUS = {
	OPEN: 'open',
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	RESOLVED: 'resolved',
	CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
	CRITICAL: 'critical',
	HIGH: 'high',
	MEDIUM: 'medium',
	LOW: 'low',
} as const;

export const TICKET_CATEGORIES = {
	TECHNICAL: 'technical',
	BILLING: 'billing',
	FEATURE: 'feature',
	BUG: 'bug',
	ACCOUNT: 'account',
	OTHER: 'other',
} as const;

// Organization/People domain
export const DEPARTMENTS = {
	SUPPORT: 'support',
	TECHNICAL: 'technical',
	BILLING: 'billing',
	PRODUCT: 'product',
	MARKETING: 'marketing',
	OTHER: 'other',
} as const;

export const ORGANIZATION_ROLES = {
	OWNER: 'owner',
	ADMIN: 'admin',
	MEMBER: 'member',
} as const;

// Project domain constants
export const PROJECT_STATUS = {
	DRAFT: 'draft',
	ACTIVE: 'active',
	PAUSED: 'paused',
	COMPLETED: 'completed',
	ARCHIVED: 'archived',
} as const;

export const PROVIDER_POLICIES = {
	HYBRID: 'hybrid',
	APOLLO: 'apollo',
	OUTSCRAPER: 'outscraper',
	PUPPETEER: 'puppeteer',
} as const;

// Leads domain constants
export const LEAD_SOURCES = {
	APOLLO: 'apollo',
	OUTSCRAPER: 'outscraper',
	PUPPETEER: 'puppeteer',
} as const;

export const LEAD_VERIFICATION_STATUS = {
	PENDING: 'pending',
	VERIFIED: 'verified',
	UNVERIFIED: 'unverified',
} as const;

export const LEAD_SORT_FIELDS = {
	FULL_NAME: 'fullName',
	COMPANY_NAME: 'companyName',
	TITLE: 'title',
	CONFIDENCE_SCORE: 'confidenceScore',
	RELEVANCE_SCORE: 'relevanceScore',
	CREATED_AT: 'createdAt',
} as const;

export const SORT_ORDER = {
	ASC: 'asc',
	DESC: 'desc',
} as const;

// Form validation messages
export const FORM_MESSAGES = {
	FIRST_NAME_REQUIRED: 'First name is required',
	LAST_NAME_REQUIRED: 'Last name is required',
	FULL_NAME_REQUIRED: 'Full name is required',
	EMAIL_REQUIRED: 'Email is required',
	EMAIL_INVALID: 'Please enter a valid email address',
	PASSWORD_REQUIRED: 'Password is required',
	PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
	CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
	PASSWORDS_DONT_MATCH: "Passwords don't match",
	TERMS_REQUIRED: 'You must agree to the terms',
} as const;

// Form field labels
export const FORM_LABELS = {
	FIRST_NAME: 'First name',
	LAST_NAME: 'Last name',
	FULL_NAME: 'Full name',
	EMAIL: 'Email',
	PASSWORD: 'Password',
	CONFIRM_PASSWORD: 'Confirm password',
	TERMS: 'I agree to the',
} as const;

// Form placeholders
export const FORM_PLACEHOLDERS = {
	FIRST_NAME: 'John',
	LAST_NAME: 'Doe',
	FULL_NAME: 'John Doe',
	EMAIL: 'john@example.com',
	PASSWORD: 'Create a strong password',
	CONFIRM_PASSWORD: 'Confirm your password',
} as const;


