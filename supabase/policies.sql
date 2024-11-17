-- Add policies for profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_profile_views"
ON profile_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "read_own_profile_views"
ON profile_views FOR SELECT
USING (
  auth.uid() = profile_id OR 
  auth.uid() = viewer_id OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);