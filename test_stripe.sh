#!/bin/bash
curl -X POST "https://qxpueymbeawmlroknjwe.supabase.co/functions/v1/create-payment-intent" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cHVleW1iZWF3bWxyb2tuandlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzUxMTksImV4cCI6MjA4OTc1MTExOX0.rV3zJa-jw9rXyIsCiY1MzF1WlZhdDbs99EHCufrlM9s" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cHVleW1iZWF3bWxyb2tuandlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzUxMTksImV4cCI6MjA4OTc1MTExOX0.rV3zJa-jw9rXyIsCiY1MzF1WlZhdDbs99EHCufrlM9s" \
  -d '{"amount":29400,"currency":"ils","listingId":"test","userId":"test"}'
