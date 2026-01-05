-- Migration: Add sales chat support fields to chat_messages table
-- Adds fields for sales chat sessions that don't require authentication

BEGIN;

-- Add missing columns to chat_messages table if they don't exist
DO $$
BEGIN
  -- Add session_id for unauthenticated sales chat tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS 
    WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='session_id'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN session_id TEXT;
  END IF;

  -- Add user_id for optional authentication
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS 
    WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='user_id'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  -- Add type field to distinguish between support and sales chat
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS 
    WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='type'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN type TEXT DEFAULT 'support' CHECK (type IN ('support', 'sales'));
  END IF;
END $$;

-- Create index on session_id for sales chat lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON public.chat_messages(type);

-- Update constraint on role to include all valid values
-- (Already includes 'user' and 'assistant', so no change needed)

COMMIT;
