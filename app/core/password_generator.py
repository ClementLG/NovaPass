import string
import secrets
import math
import os  # Imported to list files


def get_strength_from_entropy(entropy):
    """Calculates password strength based on a given entropy value."""
    if entropy == 0:
        return {"text": "", "time_to_crack": "", "entropy": 0}

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

    return {"text": text, "time_to_crack": f"~ {time_str} to crack", "entropy": round(entropy)}


def get_strength(password_length, pool_size):
    """Calculates password strength based on entropy."""
    if pool_size == 0 or password_length == 0:
        return get_strength_from_entropy(0)

    # Entropy calculation: H = L * log2(N)
    entropy = password_length * math.log2(pool_size)
    return get_strength_from_entropy(entropy)


def load_words_from_file(dictionary_name):
    """Loads words from a specified dictionary file."""
    # Security check to prevent path traversal
    if '..' in dictionary_name or dictionary_name.startswith('/'):
        return []

    filepath = os.path.join('dictionaries', dictionary_name)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        return []


def generate(mode: str = 'password', **options) -> dict:
    """Main generation function that dispatches to the correct generator."""
    if mode == 'passphrase':
        return generate_passphrase(**options)
    else:
        return generate_password(**options)


def generate_password(length: int = 16, upper: bool = True, lower: bool = True, digits: bool = True,
                      symbols: bool = True, exclude_chars: str = '', **kwargs) -> dict:
    """Generates a standard password."""
    length = max(0, int(length))
    alphabet = ''
    if upper: alphabet += string.ascii_uppercase
    if lower: alphabet += string.ascii_lowercase
    if digits: alphabet += string.digits
    if symbols: alphabet += '!@#$%^&*()_+-=[]{}|;'
    if exclude_chars:
        for char_to_exclude in exclude_chars:
            alphabet = alphabet.replace(char_to_exclude, '')

    pool_size = len(alphabet)
    strength_info = get_strength(length, pool_size)

    if pool_size == 0:
        return {"password": "Error: No available characters.", "strength": strength_info}

    password = ''.join(secrets.choice(alphabet) for _ in range(length))

    return {"password": password, "strength": strength_info}


def generate_passphrase(length: int = 4, separator: str = '-', dictionary: str = None, **kwargs) -> dict:
    """Generates a memorable passphrase from an external dictionary file."""
    length = max(1, int(length))

    if not dictionary:
        return {"password": "Error: No dictionary selected.", "strength": get_strength(0, 0)}

    words = load_words_from_file(dictionary)
    word_pool_size = len(words)

    if word_pool_size == 0:
        return {"password": f"Error: Dictionary '{dictionary}' is empty or not found.", "strength": get_strength(0, 0)}

    # Passphrase entropy is based on the number of possible words
    entropy = length * math.log2(word_pool_size)
    strength_info = get_strength_from_entropy(entropy)

    chosen_words = [secrets.choice(words) for _ in range(length)]
    passphrase = separator.join(chosen_words)

    return {"password": passphrase, "strength": strength_info}