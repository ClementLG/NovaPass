import string
import secrets


def generate_secure_password(length: int = 16, upper: bool = True, lower: bool = True, digits: bool = True,
                             symbols: bool = True, exclude_chars: str = '') -> str:
    """
    Generates a secure password using the secrets module.

    Args:
        length (int): Desired password length.
        upper (bool): Include uppercase letters.
        lower (bool): Include lowercase letters.
        digits (bool): Include numbers.
        symbols (bool): Include symbols.
        exclude_chars (str): Characters to exclude from the password.

    Returns:
        str: The generated password.
    """
    alphabet = ''
    if upper:
        alphabet += string.ascii_uppercase
    if lower:
        alphabet += string.ascii_lowercase
    if digits:
        alphabet += string.digits
    if symbols:
        alphabet += '!@#$%^&*()_+-=[]{}|;'

    # Remove the characters to be excluded from the alphabet
    if exclude_chars:
        for char_to_exclude in exclude_chars:
            alphabet = alphabet.replace(char_to_exclude, '')

    # If no more characters are possible, an error is returned
    if not alphabet:
        return "Error: No available characters."

    # Ensures that the length is not negative or zero
    length = max(0, length)

    password = ''.join(secrets.choice(alphabet) for i in range(length))

    return password
