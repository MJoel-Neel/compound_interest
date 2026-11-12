# app/services/auth_service.py
import bcrypt

def get_password_hash(password: str) -> str:
    """Turns a plain text password into a secure hash."""
    # Convert to bytes and truncate to 72 bytes (bcrypt's max limit)
    password_bytes = password.encode('utf-8')[:72]
    
    # Generate a salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Decode to string for the database
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the plain password matches the stored hash."""
    try:
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        
        # Verify
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False