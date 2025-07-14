import string
import secrets
import math


def get_strength(password_length, pool_size):
    """Calculates password strength based on entropy."""
    if pool_size == 0 or password_length == 0:
        return {"text": "", "time_to_crack": "", "entropy": 0}

    # Entropy calculation: H = L * log2(N)
    entropy = password_length * math.log2(pool_size)

    # Time to crack estimation (assuming 1 trillion guesses per second)
    guesses_per_second = 1_000_000_000_000
    seconds_to_crack = (2 ** entropy) / guesses_per_second

    # Convert seconds to a readable format
    if seconds_to_crack < 60:
        time_str = "instantly"
    elif seconds_to_crack < 3600:
        time_str = f"{seconds_to_crack / 60:.0f} minutes"
    elif seconds_to_crack < 86400:
        time_str = f"{seconds_to_crack / 3600:.0f} hours"
    elif seconds_to_crack < 31536000:
        time_str = f"{seconds_to_crack / 86400:.0f} days"
    elif seconds_to_crack < 31536000 * 100:
        time_str = f"{seconds_to_crack / 31536000:.0f} years"
    else:
        time_str = "centuries"

    # Determine strength text based on entropy
    if entropy < 40:
        text = "Very Weak"
    elif entropy < 60:
        text = "Weak"
    elif entropy < 80:
        text = "Medium"
    elif entropy < 100:
        text = "Strong"
    else:
        text = "Excellent"

    return {
        "text": text,
        "time_to_crack": f"~ {time_str} to crack",
        "entropy": round(entropy)
    }


def generate_secure_password(length: int = 16, upper: bool = True, lower: bool = True, digits: bool = True,
                             symbols: bool = True, exclude_chars: str = '') -> dict:
    """
    Generates a secure password and calculates its strength.

    Returns:
        dict: A dictionary containing the password and strength info.
    """
    length = max(0, int(length))
    alphabet = ''
    if upper:
        alphabet += string.ascii_uppercase
    if lower:
        alphabet += string.ascii_lowercase
    if digits:
        alphabet += string.digits
    if symbols:
        alphabet += '!@#$%^&*()_+-=[]{}|;'

    if exclude_chars:
        for char_to_exclude in exclude_chars:
            alphabet = alphabet.replace(char_to_exclude, '')

    pool_size = len(alphabet)
    strength_info = get_strength(length, pool_size)

    if pool_size == 0:
        return {"password": "Error: No available characters.", "strength": strength_info}

    password = ''.join(secrets.choice(alphabet) for i in range(length))

    return {
        "password": password,
        "strength": strength_info
    }