# AI Selling Chat Module - Fixes Applied

## Overview

Fixed critical issues in the AI selling chat module that were preventing proper message streaming, action parsing, and error handling.

## Issues Fixed

### 1. **Streaming JSON Parsing Bug** ✅

**Problem**: The AIChatWidget had complex brace-counting logic for parsing streamed JSON that was unreliable and prone to breaking on nested JSON structures.

**Solution**:

- Changed to newline-delimited JSON (NDJSON) format
- Each streaming message is now a complete line ending with `\n`
- Simplified parsing: split by newline, parse each complete line
- Much more robust and standard approach for streaming APIs

**Files Modified**:

- [AIChatWidget.tsx](apps/web/src/components/AIChatWidget.tsx#L170-L200)

### 2. **Sales Chat Streaming Response Format** ✅

**Problem**: The sales-chat API was sending JSON objects without consistent delimiters, making client-side parsing difficult.

**Solution**:

- Updated [sales-chat route](apps/web/src/app/api/sales-chat/route.ts) to emit newline-delimited JSON
- Each chunk is now `JSON object\n` format
- Added proper error handling in stream processing
- Ensured `type: 'sales'` is logged for all sales chat messages

**Files Modified**:

- [sales-chat route](apps/web/src/app/api/sales-chat/route.ts#L255-L300)

### 3. **Error Handling in Chat Flows** ✅

**Problem**: Network errors and malformed responses weren't being handled gracefully, resulting in silent failures or confusing error states.

**Solution**:

- Added HTTP status checks before reading response body
- Added body availability check
- More descriptive error messages that surface to users
- Try-catch wrapping for database logging operations
- Database logging errors no longer break the stream

**Files Modified**:

- [AIChatWidget.tsx](apps/web/src/components/AIChatWidget.tsx#L135-L240)

### 4. **Action Parsing from AI Responses** ✅

**Problem**: Action extraction was unreliable. Responses with complex content could cause JSON parsing failures.

**Solution**:

- Created dedicated utility module: [chat-utils.ts](apps/web/src/lib/chat-utils.ts)
- `extractActionFromResponse()` - looks for `ACTION: {...}` pattern at end of message
- `isValidAction()` - validates action structure before using
- `formatActionJson()` - properly formats streaming output
- Cleaner content after action extraction

**Files Modified**:

- [New: chat-utils.ts](apps/web/src/lib/chat-utils.ts)
- [sales-chat route](apps/web/src/app/api/sales-chat/route.ts) - now imports and uses utilities
- [AIChatWidget.tsx](apps/web/src/components/AIChatWidget.tsx) - now imports and uses utilities

### 5. **Database Schema for Sales Chat** ✅

**Problem**: The `chat_messages` table was missing fields (`session_id`, `user_id`, `type`) needed for sales chat integration.

**Solution**:

- Created migration: [add_sales_chat_support.sql](infra/migrations/add_sales_chat_support.sql)
- Adds `session_id` (TEXT) for unauthenticated sales chat session tracking
- Adds `user_id` (UUID) for optional user linking
- Adds `type` (TEXT) with check constraint for 'support' or 'sales'
- Creates indexes on new columns for performance
- Uses safe `IF NOT EXISTS` checks to be idempotent

**Files Modified**:

- [New: add_sales_chat_support.sql](infra/migrations/add_sales_chat_support.sql)

## Technical Improvements

### Streaming Protocol

```text
Before: Concatenated JSON objects without delimiters
After: Newline-delimited JSON (NDJSON)
  {"message": "Hello", "action": null}
  {"message": " how", "action": null}
  {"message": " can", "action": null}
  {"message": " I help?", "action": null}
```

### Action Format

```text
AI Response: "Great! I'll get that started for you. 🚀

ACTION: {"action": "CREATE_CHECKOUT", "plan": "starter"}"

Parsed:
  content: "Great! I'll get that started for you. 🚀"
  action: {action: "CREATE_CHECKOUT", plan: "starter"}
```

### Error Recovery

- Network failures no longer hang the chat
- Malformed JSON is logged but doesn't break stream
- Database logging failures are isolated
- User sees descriptive error messages

## Deployment Steps

1. **Apply Database Migration**:

   ```bash
   npm run db:migrate -- infra/migrations/add_sales_chat_support.sql
   ```

2. **Deploy Updated Code**:
   - AIChatWidget component changes
   - Sales-chat API route changes
   - New chat-utils utilities

3. **Testing Checklist**:
   - ✓ Sales chat opens and accepts input
   - ✓ Messages stream without blocking
   - ✓ Actions are detected and executed
   - ✓ Network errors show user-friendly messages
   - ✓ Support chat continues to work
   - ✓ Chat history is preserved

## Files Changed

- [apps/web/src/components/AIChatWidget.tsx](apps/web/src/components/AIChatWidget.tsx)
- [apps/web/src/app/api/sales-chat/route.ts](apps/web/src/app/api/sales-chat/route.ts)
- [apps/web/src/lib/chat-utils.ts](apps/web/src/lib/chat-utils.ts) (new)
- [infra/migrations/add_sales_chat_support.sql](infra/migrations/add_sales_chat_support.sql) (new)

## Backwards Compatibility

✅ All changes are backwards compatible:

- Support chat mode unchanged
- Existing chat conversations still work
- Database migration is idempotent (safe to run multiple times)
- No breaking API changes
