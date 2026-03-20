-- פונקציה: שלח התראות לסיום מכרז
-- מריץ pg_cron כל דקה — מוצא מכרזים שזה עתה פגו תוקפם

CREATE OR REPLACE FUNCTION notify_auction_winners()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  auction RECORD;
  winner RECORD;
  winner_token TEXT;
  seller_token TEXT;
BEGIN
  -- מצא מכרזים שפגו תוקפם בדקה האחרונה ועדיין פעילים
  FOR auction IN
    SELECT l.*, u.push_token AS seller_token
    FROM listings l
    LEFT JOIN users u ON u.id = l.seller_id
    WHERE l.status = 'active'
      AND l.ends_at <= NOW()
      AND l.ends_at > NOW() - INTERVAL '1 minute'
  LOOP
    -- מצא הזוכה (ההצעה הגבוהה ביותר)
    SELECT b.bidder_id, u.push_token
    INTO winner
    FROM bids b
    LEFT JOIN users u ON u.id = b.bidder_id
    WHERE b.listing_id = auction.id
    ORDER BY b.amount DESC
    LIMIT 1;

    -- עדכן סטטוס המכרז
    IF winner.bidder_id IS NOT NULL THEN
      UPDATE listings
      SET status = 'ended', winner_id = winner.bidder_id
      WHERE id = auction.id;

      -- התראה לזוכה
      IF winner.push_token IS NOT NULL THEN
        PERFORM
          net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
              'user_id', winner.bidder_id,
              'title', '🏆 זכית במכרז!',
              'body', 'זכית ב"' || auction.title || '" — היכנס לביצוע תשלום',
              'data', jsonb_build_object('screen', '/won')
            )
          );
      END IF;

      -- התראה למוכר
      IF auction.seller_id IS NOT NULL THEN
        PERFORM
          net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
              'user_id', auction.seller_id,
              'title', '🎉 המכרז שלך הסתיים!',
              'body', '"' || auction.title || '" נמכר ב-₪' || (SELECT MAX(amount) FROM bids WHERE listing_id = auction.id),
              'data', jsonb_build_object('screen', '/profile')
            )
          );
      END IF;

    ELSE
      -- אין הצעות — מסמן expired
      UPDATE listings SET status = 'expired' WHERE id = auction.id;
    END IF;

  END LOOP;
END;
$$;

-- הפעל pg_cron כל דקה
SELECT cron.schedule(
  'notify-auction-end',
  '* * * * *',
  $$ SELECT notify_auction_winners(); $$
);
