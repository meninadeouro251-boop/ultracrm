-- Revert the 'key' column type from TEXT back to VARCHAR(255)
-- WARNING: This may fail if there are keys longer than 255 characters
ALTER TABLE ultra_core_api_keys 
ALTER COLUMN key TYPE VARCHAR(255);

