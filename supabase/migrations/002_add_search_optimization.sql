-- Add search optimization indexes for User Story 5 (Content Discovery)
-- These indexes support efficient full-text search and sorting operations

-- Create additional indexes for view_count sorting (for "Most Viewed" sort option)
CREATE INDEX idx_questions_view_count ON questions(view_count DESC);

-- Create composite index for category + created_at (for category filter + newest sort)
CREATE INDEX idx_questions_category_created_at ON questions(category, created_at DESC);

-- Create composite index for category + view_count (for category filter + most viewed sort)
CREATE INDEX idx_questions_category_view_count ON questions(category, view_count DESC);

-- Add search vector column for efficient full-text search
ALTER TABLE questions ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector on insert/update
CREATE OR REPLACE FUNCTION update_questions_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to maintain search vector
DROP TRIGGER IF EXISTS questions_search_vector_update ON questions;
CREATE TRIGGER questions_search_vector_update
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_search_vector();

-- Create GIN index on search vector for optimal FTS performance
CREATE INDEX idx_questions_search_vector ON questions USING GIN(search_vector);

-- Update existing rows to populate search_vector
UPDATE questions SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(body, '')), 'B')
WHERE search_vector IS NULL;
