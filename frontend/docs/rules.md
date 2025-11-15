## 🚀 Hackathon Development Rules - Simple & Fast

This document defines **simplified rules** for rapid hackathon development with easy debugging and quick iteration.

### 🎯 Hackathon Goals
- **Speed first** - Get features working fast
- **Easy debugging** - Clear logs and simple error handling
- **Minimal complexity** - Keep it simple, avoid over-engineering
- **Quick fixes** - Easy to find and modify code

---

## 📝 CUSTOM LOGGER Rules (MANDATORY!)

### **🚀 Custom Logger Integration**
- **✅ Implemented:** Custom hackathon-friendly logger in `@/lib/logger.ts`
- **✅ Next.js Compatible:** No external dependencies, works in all environments  
- **✅ Integrated:** ALL console.log replaced with hackLog methods
- **⚠️ Note:** Originally planned to use Nexlog but had Next.js compatibility issues

### **🤖 Why Custom Logger + Detailed Logs?**
- **Zero dependencies** - No external packages to break
- **Next.js optimized** - Works perfectly with SSR/SSG/API routes
- **AI can help you** - Give full context to AI tools with structured data
- **Quick debugging** - Know exactly what happened with timestamps
- **Demo troubleshooting** - Fix issues during presentation with clear logs
- **Team collaboration** - Others can understand your code flow
- **Production ready** - Easy to adjust log levels for production

### **🔧 Custom Logger Setup & Usage**

#### **Import Statement (Use everywhere!):**
```javascript
import hackLog from '@/lib/logger';
```

### **📋 MANDATORY Logging Methods**

#### **1. API Request Logging (in helpers/request.ts):**
```javascript
// Before making API call - use hackLog.apiRequest()
hackLog.apiRequest('POST', '/api/users', {
  name: 'John', 
  email: 'john@email.com',
  component: 'UserForm',
  hook: 'useUsers'
});

// Success response - use hackLog.apiSuccess()
hackLog.apiSuccess('POST', '/api/users', {
  data: { id: 123, name: 'John' },
  timing: '250ms'
});

// Error response - use hackLog.apiError()  
hackLog.apiError('POST', '/api/users', {
  status: 400,
  message: 'Validation failed',
  context: 'UserForm'
});
```

#### **2. State Management Logging (in lib/store.ts):**
```javascript
// Log all Zustand store actions with hackLog.storeAction()
hackLog.storeAction('addUser', {
  oldCount: oldUsers.length,
  newCount: newUsers.length,
  trigger: 'API response',
  component: 'UserList'
});
```

#### **3. Error Handling Logging (in helpers/errors.ts):**
```javascript
// Log all errors with full context using hackLog.error()
hackLog.error('User validation failed', {
  type: 'ValidationError',
  userInput: formData,
  component: 'UserForm',
  hook: 'useUsers',
  action: 'createUser'
});
```

#### **4. Component Lifecycle Logging:**
```javascript
// Component mounting - use hackLog.componentMount()
hackLog.componentMount('UserList', {
  showInactive: false,
  selectedUser: null
});

// Form submissions - use hackLog.formSubmit()
hackLog.formSubmit('createUser', {
  formData: values,
  isValid: true,
  component: 'UserForm'
});
```

### **🎯 Complete Logger Methods Reference**

#### **API & Network Logging:**
- `hackLog.apiRequest(method, url, data?)` - Log outgoing API calls
- `hackLog.apiSuccess(method, url, response?)` - Log successful responses
- `hackLog.apiError(method, url, error)` - Log API errors
- `hackLog.cacheHit(key)` - Log SWR/cache hits
- `hackLog.cacheMiss(key)` - Log SWR/cache misses

#### **State & Store Logging:**
- `hackLog.storeAction(action, data?)` - Log Zustand store actions
- `hackLog.storeUpdate(store, changes?)` - Log state updates

#### **Component & UI Logging:**
- `hackLog.componentMount(name, props?)` - Log component mounting
- `hackLog.componentUpdate(name, changes?)` - Log component re-renders
- `hackLog.formSubmit(name, data?)` - Log form submissions
- `hackLog.formValidation(name, errors?)` - Log validation errors

#### **Navigation & User Actions:**
- `hackLog.routeChange(from, to)` - Log route navigation
- `hackLog.authLogin(userId?)` - Log user authentication
- `hackLog.authLogout(userId?)` - Log user logout

#### **Performance & Features:**
- `hackLog.performanceStart(label)` - Start performance timer
- `hackLog.performanceEnd(label, duration?)` - End performance timer
- `hackLog.feature(name, enabled, data?)` - Log feature usage
- `hackLog.dataProcess(operation, inputCount?, outputCount?)` - Log data processing

#### **General Purpose Logging:**
- `hackLog.dev(message, data?)` - Development/debug logs
- `hackLog.info(message, data?)` - Information messages
- `hackLog.warn(message, data?)` - Warning messages
- `hackLog.error(message, error?)` - Error logging

#### **Advanced Console Methods (Development Only):**
- `hackLog.group(label, data?)` - Start console group
- `hackLog.groupEnd()` - End console group
- `hackLog.table(data, label?)` - Display data as table
- `hackLog.dir(object, label?)` - Deep object inspection
- `hackLog.trace(message, data?)` - Stack trace logging

### **🚨 MANDATORY Logger Usage Rules**

#### **Replace ALL Console Methods:**
- ❌ `console.log()` → ✅ `hackLog.dev()`
- ❌ `console.error()` → ✅ `hackLog.error()`
- ❌ `console.warn()` → ✅ `hackLog.warn()`
- ❌ `console.info()` → ✅ `hackLog.info()`
- ❌ `console.table()` → ✅ `hackLog.table()`

#### **Required in Every File:**
1. **helpers/request.ts** - Use `hackLog.apiRequest()`, `hackLog.apiSuccess()`, `hackLog.apiError()`
2. **helpers/errors.ts** - Use `hackLog.error()` for all error handling
3. **lib/store.ts** - Use `hackLog.storeAction()` for all state changes
4. **hooks/*.ts** - Use `hackLog.dev()` for hook execution logging
5. **components/*.tsx** - Use `hackLog.componentMount()`, `hackLog.formSubmit()`

### **✨ Logger Benefits**

#### **Native Object Inspection:**
- Objects passed directly (not stringified) for better DevTools experience
- Expandable/collapsible object trees in console
- Type preservation (functions, dates, arrays display correctly)
- Interactive debugging with right-click context menus
- Better performance (no JSON.stringify overhead)

#### **Structured Data Format:**
- Consistent timestamp and emoji formatting
- Automatic categorization by log type
- Rich context information included
- Easy filtering and searching in DevTools
- Professional presentation for demos

### **🤖 AI-Friendly Logging for Instant Help**

#### **Perfect Context for AI Assistance:**
When you encounter issues, the logger provides complete context that you can copy-paste to AI tools:

```javascript
// Example of rich context automatically provided
hackLog.error('User creation failed', {
  type: 'ValidationError',
  userInput: { name: 'John', email: '' },
  component: 'UserForm',
  hook: 'useUsers',
  apiCall: 'POST /api/users',
  timestamp: '2025-09-04T10:30:00.000Z',
  stack: 'Error stack trace...'
});
```

Copy these logs to AI with prompts like:
> "I'm getting this error in my Next.js app, here's the complete context: [paste log]"

#### **Emergency Debug Function:**
```javascript
// Available globally for instant context dumping
window.debugContext = () => {
  hackLog.dev('🚨 EMERGENCY DEBUG CONTEXT', {
    currentRoute: window.location.pathname,
    storeState: useAppStore.getState(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    online: navigator.onLine
  });
}
```

### **📊 Demo-Ready Logging**

#### **For Live Presentations:**
- Clean, professional console output with emojis
- Easy to filter logs by category (API, ERROR, COMPONENT, etc.)
- Timing information for performance demonstrations
- Rich object inspection for technical audiences
- Structured data that looks impressive in DevTools

#### **Quick Demo Debugging:**
```javascript
// Use during presentations to quickly identify issues
hackLog.group('🎪 Demo Session', { presenter: 'YourName' });
hackLog.info('Feature demonstration starting');
// ... your demo code ...
hackLog.groupEnd();
```

### **🔧 Logger Testing & Verification**

#### **Test All Logger Methods:**
Visit `/testing` route to see the logger demo page that tests all logging methods:
- API request/response/error simulation
- State management logging
- Component lifecycle logging
- Performance timing
- Error handling
- Advanced console methods

#### **Verify Logger Integration:**
Check these files have been updated to use hackLog:
- ✅ `src/helpers/request.ts` - API logging
- ✅ `src/helpers/errors.ts` - Error logging  
- ✅ `src/lib/store.ts` - State logging
- ✅ `src/app/layout.tsx` - App initialization logging

---

## 📁 Project Folder Structure (USE THESE!)

```
src/
  app/                 # Next.js pages and routes
  components/          # All UI components
    ui/                # Shadcn/ui components
  hooks/               # Custom React hooks (USE THIS!)
  lib/                 # Core setup (API, stores, configs)
  helpers/             # Business logic helpers (USE THIS!)
  constants/           # All constants (USE THIS!)
  styles/              # CSS files
```

### 🔗 Import Rules
Always use `@/` imports:
- `@/hooks/useUsers` 
- `@/helpers/request` ← **MANDATORY for ALL API calls**
- `@/helpers/errors` ← **MANDATORY for ALL error handling**
- `@/constants/messages`

---

## 🚨 CRITICAL RULES - READ THIS FIRST!

### **MANDATORY FILE USAGE:**
1. **`src/helpers/request.ts`** - ALL API calls MUST go through this file
   - **Even with SWR** - SWR fetcher must use this
   - **Even with fetch()** - Replace all fetch() with helpers/request
   - **Even in libs** - lib files must import from helpers/request

2. **`src/helpers/errors.ts`** - ALL error handling MUST go through this file
   - **Even with SWR** - SWR errors must be processed here
   - **Even with Zustand** - Store error states use this
   - **Even in try/catch** - All catches must use helpers/errors

### **NEVER DO THIS:**
- ❌ `fetch('/api/users')` - Use helpers/request instead
- ❌ `try/catch` inline - Use helpers/errors instead
- ❌ Direct API calls in components
- ❌ Hardcoded error messages

### **ALWAYS DO THIS:**
- ✅ `import { apiRequest } from '@/helpers/request'`
- ✅ `import { handleError } from '@/helpers/errors'`
- ✅ API calls → helpers/request → SWR → hooks → components
- ✅ Errors → helpers/errors → constants/messages → UI

---

## 📄 Constants Folder - Put ALL Constants Here

### What Goes in `constants/`:
- **API endpoints** - All your backend URLs
- **Success/error messages** - User-facing text
- **Route paths** - Navigation routes
- **App configuration** - Settings, limits, timeouts
- **Theme colors** - UI colors and breakpoints

### Files to Create:
- `constants/api.ts` - API_BASE_URL, endpoints
- `constants/messages.ts` - SUCCESS, ERROR, LOADING messages
- `constants/routes.ts` - All app routes
- `constants/config.ts` - App settings, file limits, etc.

### Why Use Constants:
- **Easy to change** - Update messages in one place
- **No typos** - TypeScript autocomplete
- **Consistent** - Same messages everywhere
- **Fast debugging** - Know where to look

---

## 🔧 Helpers Folder - Business Logic Only (MANDATORY!)

### What Goes in `helpers/`:
- **Error handling** - Process API errors into user messages
- **Form processing** - Validate and submit forms
- **API requests** - ALL API calls must go through helpers
- **Data transformation** - Convert API data for UI

### **REQUIRED FILES - MUST USE THESE:**
- `helpers/errors.ts` - **ALL ERROR HANDLING** (handleError, processApiError)
- `helpers/request.ts` - **ALL API CALLS** (apiRequest, fetch wrappers)
- `helpers/formHandler.ts` - validateForm, submitForm

### **STRICT RULES FOR API & ERRORS:**
- **🚨 NEVER use fetch() directly** - Always use `@/helpers/request`
- **🚨 NEVER handle errors inline** - Always use `@/helpers/errors`
- **🚨 Even with SWR** - SWR calls must use helpers/request
- **🚨 Even with Zustand** - Error states must use helpers/errors

### Rules for Helpers:
- **App-specific logic** - Not generic utilities
- **Handle complex operations** - Form submission, error processing
- **Use constants** - Import from `@/constants/`
- **Easy to test** - Simple input/output functions

---

## 📚 Lib Folder - Core Setup (No Direct API Calls!)

### What Goes in `lib/`:
- **SWR configuration** - Global SWR settings (uses helpers/request!)
- **Zustand stores** - App state management (uses helpers/errors!)
- **Third-party configs** - External service setup
- **API endpoints** - URL definitions only (actual calls use helpers/request!)

### **REQUIRED FILES:**
- `lib/store.ts` - Zustand global store
- `lib/swr-config.ts` - SWR global configuration
- `lib/apiClient.ts` - API client setup (imports from helpers/request!)

### **CRITICAL RULES:**
- **🚨 NO direct fetch() calls** - Must import from `@/helpers/request`
- **🚨 NO inline error handling** - Must import from `@/helpers/errors`
- **SWR fetcher** - Must use `@/helpers/request`
- **Store error states** - Must use `@/helpers/errors`

### Why Separate Lib:
- **Core functionality** - App foundation
- **Configuration heavy** - Setup once, use everywhere
- **Uses helpers** - All API calls through helpers/request

---

## 🪝 Hooks Folder - Custom React Logic (Use Helpers!)

### What Goes in `hooks/`:
- **Data fetching hooks** - useUsers, useProducts, etc.
- **Form hooks** - useForm, useValidation
- **UI state hooks** - useModal, useToggle
- **Combined logic** - SWR + Zustand + **ALWAYS use helpers**

### Hook Naming:
- `useUsers` - For user data management
- `useProducts` - For product operations
- `useForm` - For form handling
- `useApi` - For generic API calls

### **MANDATORY Hook Rules:**
- **🚨 Import apiRequest from `@/helpers/request`** - Never fetch() directly
- **🚨 Import handleError from `@/helpers/errors`** - Never inline error handling
- **SWR fetcher** - Must use function from helpers/request
- **Error handling** - Must use functions from helpers/errors
- **All async operations** - Wrapped with helpers/errors

### Hook Responsibilities:
- **Connect SWR + Zustand** - Data fetching + state management
- **Use helpers/request** - For ALL API calls
- **Use helpers/errors** - For ALL error handling
- **Loading states** - Provide loading/error states

---

## 🎯 Development Workflow (Helpers First!)

### 1. Start with Constants
- Define all API endpoints in `constants/api.ts`
- Add all user messages in `constants/messages.ts`
- Set up routes in `constants/routes.ts`

### 2. **Build Core Helpers (DO THIS FIRST!)**
- **Create `helpers/request.ts`** - ALL API calls go here
- **Create `helpers/errors.ts`** - ALL error handling goes here
- Set up basic request/error patterns

### 3. Set up Lib (Uses Helpers!)
- Configure SWR in `lib/swr-config.ts` (import from helpers/request)
- Create Zustand store in `lib/store.ts` (import from helpers/errors)
- Set up API client in `lib/apiClient.ts` (import from helpers/request)

### 4. Create Hooks (Must Use Helpers!)
- Build `hooks/useUsers.ts` with SWR + Zustand
- **ALWAYS import from helpers/request for API calls**
- **ALWAYS import from helpers/errors for error handling**
- Keep hooks focused on one feature

### 5. Build Components (Through Hooks Only!)
- Import from hooks, never directly from lib or helpers
- Use constants for all text and URLs
- All API calls happen through hooks → helpers

---

## 🐛 DETAILED LOGGING Rules (For AI Context!)

### **🤖 Why Detailed Logs?**
- **AI can help you** - Give full context to AI tools
- **Quick debugging** - Know exactly what happened
- **Demo troubleshooting** - Fix issues during presentation
- **Team collaboration** - Others can understand your code

### **� MANDATORY Logging Format:**

#### **1. API Request Logging (in helpers/request.ts):**
```javascript
// ALWAYS use hackLog.apiRequest() - automatically formats with emojis
hackLog.apiRequest('POST', '/api/users', {
  name: 'John', 
  email: 'john@email.com',
  component: 'UserForm',
  hook: 'useUsers'
});
```

#### **2. API Response Logging (in helpers/request.ts):**
```javascript
// Success - use hackLog.apiSuccess()
hackLog.apiSuccess('POST', '/api/users', {
  data: { id: 123, name: 'John' },
  timing: '250ms'
});

// Error - use hackLog.apiError()
hackLog.apiError('POST', '/api/users', {
  status: 400,
  message: 'Validation failed',
  context: 'UserForm'
});
```

#### **3. Error Logging (in helpers/errors.ts):**
```javascript
// ALWAYS use hackLog.error() for all errors
hackLog.error('User validation failed', {
  type: 'ValidationError',
  userInput: { name: 'John', email: '' },
  component: 'UserForm',
  hook: 'useUsers',
  action: 'createUser'
});
```

#### **4. State Changes (in Zustand stores):**
```javascript
// ALWAYS use hackLog.storeAction() for state changes
hackLog.storeAction('addUser', {
  oldCount: oldUsers.length,
  newCount: newUsers.length,
  trigger: 'API response',
  component: 'UserList'
});
```

#### **5. Hook Execution (in hooks/*.ts):**
```javascript
// ALWAYS log hook execution with hackLog.dev()
hackLog.dev('useUsers hook executed', {
  input: { filters: { active: true } },
  result: { count: 5, loading: false },
  timing: '120ms',
  component: 'UserList'
});
```

#### **6. Component Lifecycle:**
```javascript
// Component mounting
hackLog.componentMount('UserList', {
  showInactive: false,
  selectedUser: null
});
```

### **🔍 Context-Rich Logging Rules:**

#### **For helpers/request.ts:**
- Log **before** API call with full payload
- Log **after** API call with response/error
- Include **component name** that triggered call
- Include **hook name** that made request
- Include **user action** that started it
- Include **timing** information

#### **For helpers/errors.ts:**
- Log **original error** with full stack trace
- Log **processed error** with user-friendly message
- Include **user context** (what they were doing)
- Include **app state** at time of error
- Include **recovery actions** taken

#### **For hooks/*.ts:**
- Log **hook entry** with parameters
- Log **SWR cache** hits/misses
- Log **state updates** before/after
- Log **side effects** triggered
- Log **performance** metrics

#### **For components:**
- Log **major user interactions** (clicks, form submits)
- Log **prop changes** that cause re-renders
- Log **conditional rendering** decisions
- Log **error boundaries** triggers

### **🤖 AI-Friendly Log Structure:**
```javascript
// Template for ALL logs - copy this format!
console.log('[LOG-TYPE]', {
  // Core info
  timestamp: new Date().toISOString(),
  component: 'ComponentName',
  action: 'whatHappened',
  
  // Context
  userAction: 'what user did',
  appState: 'relevant state',
  
  // Data
  input: 'what went in',
  output: 'what came out',
  
  // Meta
  timing: 'how long',
  success: true/false,
  
  // Debug info
  stack: 'for errors',
  additionalInfo: 'anything else helpful'
})
```

### **🎯 Custom Logger Methods Reference:**

#### **API Logging:**
- `hackLog.apiRequest(method, url, data?)` - Log API calls
- `hackLog.apiSuccess(method, url, response?)` - Log successful API responses
- `hackLog.apiError(method, url, error)` - Log API errors

#### **State & Store Logging:**
- `hackLog.storeAction(action, data?)` - Log store actions
- `hackLog.storeUpdate(store, changes?)` - Log store state updates

#### **Component Logging:**
- `hackLog.componentMount(name, props?)` - Log component mounting
- `hackLog.componentUpdate(name, changes?)` - Log component updates

#### **Form Logging:**
- `hackLog.formSubmit(name, data?)` - Log form submissions
- `hackLog.formValidation(name, errors?)` - Log validation errors

#### **Navigation & Auth:**
- `hackLog.routeChange(from, to)` - Log route changes
- `hackLog.authLogin(userId?)` - Log user login
- `hackLog.authLogout(userId?)` - Log user logout

#### **Performance & Features:**
- `hackLog.performanceStart(label)` - Start performance timing
- `hackLog.performanceEnd(label, duration?)` - End performance timing
- `hackLog.feature(name, enabled, data?)` - Log feature flags

#### **General Logging:**
- `hackLog.dev(message, data?)` - Development logs (debug level)
- `hackLog.info(message, data?)` - Info messages
- `hackLog.warn(message, data?)` - Warning messages
- `hackLog.error(message, error?)` - Error logging

#### **Cache & Data:**
- `hackLog.cacheHit(key)` - Log cache hits
- `hackLog.cacheMiss(key)` - Log cache misses
- `hackLog.dataProcess(operation, inputCount?, outputCount?)` - Log data processing

#### **Advanced Console Methods (Development Only):**
- `hackLog.group(label, data?)` - Start console group (uses console.group)
- `hackLog.groupEnd()` - End console group (uses console.groupEnd)
- `hackLog.table(data, label?)` - Display data as table (uses console.table)
- `hackLog.dir(object, label?)` - Deep object inspection (uses console.dir)
- `hackLog.trace(message, data?)` - Stack trace logging (uses console.trace)

### **✨ Object Logging Benefits:**
- **Native console inspection** - Objects are passed directly, not stringified
- **Expandable/collapsible** - Click to explore nested objects
- **Type preservation** - Functions, dates, arrays display correctly
- **Interactive debugging** - Right-click for more options in DevTools
- **Better performance** - No JSON.stringify overhead

### **🚨 NEVER Use Console.log Again!**
- ❌ `console.log()` → ✅ `hackLog.dev()`
- ❌ `console.error()` → ✅ `hackLog.error()`
- ❌ `console.warn()` → ✅ `hackLog.warn()`
- ❌ `console.info()` → ✅ `hackLog.info()`

### **🔧 Debug Tools for AI Context:**

#### **Global Debug Function (create in utils/debug.ts):**
```javascript
// One function to rule them all - use everywhere!
export const debugLog = (type: string, data: any, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${type}]`, {
      timestamp: new Date().toISOString(),
      ...data,
      context: context || 'no context provided',
      url: window.location.href,
      userAgent: navigator.userAgent.slice(0, 50)
    })
  }
}

// Usage examples:
debugLog('API-REQUEST', { url, method, payload }, { component: 'UserForm' })
debugLog('STATE-CHANGE', { field, oldValue, newValue }, { hook: 'useUsers' })
debugLog('ERROR', { message, stack }, { userAction: 'clicked save button' })
```

#### **AI Helper Debug Panel (add to components):**
```javascript
// Add this to ANY component for instant AI context
{process.env.NODE_ENV === 'development' && (
  <div style={{ position: 'fixed', top: 0, right: 0, background: 'yellow', padding: '10px', zIndex: 9999 }}>
    <h4>🤖 AI DEBUG PANEL</h4>
    <button onClick={() => {
      const fullContext = {
        component: 'UserList', // Update this
        currentState: useAppStore.getState(),
        props: props,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        recentActions: 'list recent user actions here',
        errorHistory: 'any recent errors',
        networkStatus: navigator.onLine
      }
      console.log('🤖 [AI-CONTEXT]', fullContext)
      console.log('📋 Copy this entire log to AI for help!')
    }}>
      📋 Copy Full Context to AI
    </button>
  </div>
)}
```

### **📊 Performance & Analytics Logging:**

#### **Track User Journey:**
```javascript
// Track complete user flows for AI analysis
const trackUserJourney = (action: string, details: any) => {
  debugLog('USER-JOURNEY', {
    action,
    details,
    sessionId: 'generate or get session id',
    stepNumber: 'current step in flow',
    previousAction: 'what they did before',
    timeSpentOnPage: 'how long on current page'
  })
}

// Usage:
trackUserJourney('form-submit', { form: 'createUser', isValid: true })
trackUserJourney('navigation', { from: '/users', to: '/products' })
```

#### **Performance Monitoring:**
```javascript
// Log performance issues for AI optimization
const logPerformance = (operation: string, timing: number, details?: any) => {
  debugLog('PERFORMANCE', {
    operation,
    timing: `${timing}ms`,
    threshold: timing > 1000 ? 'SLOW' : 'OK',
    details,
    memoryUsage: (performance as any).memory?.usedJSHeapSize
  })
}
```

### **🚨 Error Context for AI:**

#### **Complete Error Context:**
```javascript
// When error occurs, give AI EVERYTHING
const logErrorForAI = (error: any, context: string) => {
  debugLog('AI-ERROR-CONTEXT', {
    // Error details
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: error.constructor.name,
    
    // App context
    currentRoute: window.location.pathname,
    userActions: 'last 3-5 actions user took',
    appState: useAppStore.getState(),
    
    // Technical context
    browserInfo: navigator.userAgent,
    timestamp: new Date().toISOString(),
    networkStatus: navigator.onLine,
    
    // User context
    whatUserWasDoing: context,
    expectedBehavior: 'what should have happened',
    actualBehavior: 'what actually happened',
    
    // Code context
    component: 'which component',
    hook: 'which hook if applicable',
    apiCall: 'which API call if applicable'
  })
  
  console.log('🤖 ☝️ COPY THE ABOVE LOG TO AI FOR INSTANT HELP!')
}
```

### **📱 Real-time AI Assistance:**

#### **AI Prompt Generator:**
```javascript
// Generate AI prompts automatically
const generateAIPrompt = (issue: string) => {
  const prompt = `
🤖 AI DEBUGGING REQUEST:

ISSUE: ${issue}

CURRENT STATE: ${JSON.stringify(useAppStore.getState(), null, 2)}

RECENT LOGS: ${JSON.stringify(getRecentLogs(), null, 2)}

COMPONENT: ${getCurrentComponent()}

USER ACTION: ${getLastUserAction()}

EXPECTED: [Describe what should happen]

ACTUAL: [Describe what actually happened]

STACK TRACE: [Include if error]

Please help debug this issue. Provide:
1. Root cause analysis
2. Step-by-step fix
3. Code examples
4. Prevention tips
`
  
  console.log('🤖 [AI-PROMPT]', prompt)
  return prompt
}
```

---

## 🤖 Using Logs with AI Tools

### **How to Get AI Help:**
1. **Reproduce the issue** - Make it happen again
2. **Check console logs** - Look for the detailed logs
3. **Copy full context** - Use the AI debug panel button
4. **Paste to AI** - Give complete log to AI assistant
5. **Follow AI guidance** - Implement suggested fixes

### **Perfect AI Prompt Structure:**
```
Hi AI! I need help with my React app. Here's the full context:

ISSUE: [Brief description]

LOGS: [Paste the detailed logs from console]

EXPECTED BEHAVIOR: [What should happen]

ACTUAL BEHAVIOR: [What actually happens]

Please provide:
1. Root cause analysis
2. Step-by-step fix
3. Code examples
4. Prevention tips
```

### **Log Categories for AI:**
- **🌐 [API-REQUEST]** - For API issues
- **📨 [API-RESPONSE]** - For response problems
- **❌ [ERROR]** - For error debugging  
- **🔄 [STATE-CHANGE]** - For state issues
- **🪝 [HOOK-EXEC]** - For hook problems
- **🎨 [COMPONENT]** - For UI issues
- **🤖 [AI-CONTEXT]** - Complete app context
- **📊 [PERFORMANCE]** - Track performance issues

### **Emergency AI Debug:**
```javascript
// When everything breaks, run this:
const emergencyDebug = () => {
  console.log('🚨 [EMERGENCY-DEBUG]', {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    
    // App state
    storeState: useAppStore.getState(),
    
    // Recent errors
    recentErrors: getRecentErrors(),
    
    // Network status
    online: navigator.onLine,
    
    // Performance
    memory: (performance as any).memory,
    
    // User context
    lastActions: getLastUserActions(),
    
    // Tech context
    browser: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    
    // App context
    currentRoute: window.location.pathname,
    components: getCurrentComponents()
  })
  
  console.log('🤖 EMERGENCY: Copy above log to AI immediately!')
}

// Add to window for easy access
window.emergencyDebug = emergencyDebug
```
---

## 🛂 Auth pages & related logic (frontend/src/app/(auth))

The repo contains a small auth area under `frontend/src/app/(auth)`; document the pages and supporting logic here so developers know where to look and what to change.

- `frontend/src/app/(auth)/layout.tsx` — Layout wrapper for all auth pages. Minimal header, theme toggle, background visuals and entrance animations. Logs mount with `hackLog.componentMount('AuthLayout', ...)`.
- `frontend/src/app/(auth)/_components/auth-card.tsx` — Shared UI primitives used by auth pages: `AuthCard`, `Field`, `Input`, `PasswordInput`, `SubmitButton`, `MutedLink`. Provides motion, focus halos and small UX helpers.
- `frontend/src/app/(auth)/login/page.tsx` — Login page. Uses `useAuthStore()` for `login`, `isLoginLoading`, `loginError`, and `clearErrors`. Uses `useGuestProtection()` to avoid rendering when authenticated. Validates form, logs events (`hackLog.formSubmit`, `hackLog.formValidation`), and redirects on success to `ROUTES.DASHBOARD`.
- `frontend/src/app/(auth)/signup/page.tsx` — Signup page. Uses `useAuthStore()` for `signup`, `isSignupLoading`, `signupError`. Validates name/email/password/confirm, logs events and redirects to `ROUTES.AUTH.LOGIN` on success.
- `frontend/src/app/(auth)/forgot-password/page.tsx` — Forgot-password page. Uses `useAuthStore()` for `forgotPassword`, validates email input, logs events and shows a sent confirmation UI.

Related supporting logic used by the auth pages:

- `frontend/src/hooks/use-auth-store.ts` — Zustand-based auth store used across auth pages and app layout. Exposes actions like `login`, `signup`, `forgotPassword`, loading flags, and error state.
- `frontend/src/components/auth/auth-provider.tsx` — Auth provider and helpers (`useAuthProtection`, `useGuestProtection`) that gate page rendering based on auth state.
- `frontend/src/constants/routes.ts` — Central route constants (e.g. `ROUTES.AUTH.LOGIN`, `ROUTES.DASHBOARD`) used for navigation and redirects.
- `frontend/src/lib/logger.ts` — `hackLog` used throughout auth pages for structured logs (`componentMount`, `formSubmit`, `formValidation`, `storeAction`, `error`). Follow the logger rules in this document when updating auth flows.

Notes for contributors:
- All API calls invoked by `useAuthStore` should follow the helpers rules: go through `@/helpers/request` and errors processed with `@/helpers/errors`.
- Keep UI-only logic inside `_components/auth-card.tsx` and place business logic in hooks/stores/constants.

## 🧩 Other pages with components (frontend/src/app/(other))

I couldn't find a `frontend/src/app/(other)` folder in this workspace. If you add pages that live under an `(other)` group, document them here using the same pattern as the auth section:

Example template to add:

- `frontend/src/app/(other)/<page>/page.tsx` — Short description of the page and what components it uses.
- `frontend/src/app/(other)/<page>/_components/...` — Reusable UI components for the page and where logic lives (hooks/stores/constants).

If you want, I can scan for other top-level app folders (like `dashboard`, `testing`, etc.) and add them the same way.
