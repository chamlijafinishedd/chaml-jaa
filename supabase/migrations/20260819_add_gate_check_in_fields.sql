-- Add opaque gate check-in data without changing existing booking/payment fields.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS check_in_token text,
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS checked_in_by text;

UPDATE public.bookings
SET check_in_token = encode(gen_random_bytes(32), 'hex')
WHERE check_in_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_check_in_token_unique
  ON public.bookings (check_in_token)
  WHERE check_in_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS bookings_check_in_token_idx
  ON public.bookings (check_in_token);
