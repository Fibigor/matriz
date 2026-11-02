ALTER TABLE app_user ADD COLUMN email VARCHAR(254);
ALTER TABLE app_user ALTER COLUMN password_hash TYPE VARCHAR(255);
CREATE UNIQUE INDEX app_user_email_lower_unique ON app_user (lower(email)) WHERE email IS NOT NULL;
