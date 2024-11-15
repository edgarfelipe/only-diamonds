-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS approve_user;
DROP FUNCTION IF EXISTS reject_user;

-- Function to approve a user
CREATE OR REPLACE FUNCTION approve_user(
  user_id UUID
) RETURNS users AS $$
DECLARE
  updated_user users;
BEGIN
  UPDATE users
  SET 
    status = 'approved',
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO updated_user;
  
  RETURN updated_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a user
CREATE OR REPLACE FUNCTION reject_user(
  user_id UUID
) RETURNS users AS $$
DECLARE
  updated_user users;
BEGIN
  UPDATE users
  SET 
    status = 'rejected',
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO updated_user;
  
  RETURN updated_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;