-- טבלת הודעות פנימיות קונה-מוכר
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS messages_listing_id_idx ON messages(listing_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- RLS — הפעלת Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- משתמש יכול לראות רק הודעות שהוא שלח או קיבל
CREATE POLICY "Users see own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- משתמש יכול לשלוח הודעה רק בשמו
CREATE POLICY "Users send own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- משתמש יכול לסמן הודעות שלו כנקראו
CREATE POLICY "Users update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- bs-simple.com | בועז סעדה - פתרונות יצירתיים
