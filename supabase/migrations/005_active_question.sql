-- Add is_active flag to questions; only one question may be active at a time.

ALTER TABLE questions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- Trigger function: when a question is set active, deactivate any other active question.
CREATE OR REPLACE FUNCTION questions_single_active()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE questions SET is_active = FALSE WHERE id <> NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_active_question
  BEFORE INSERT OR UPDATE OF is_active ON questions
  FOR EACH ROW EXECUTE FUNCTION questions_single_active();
