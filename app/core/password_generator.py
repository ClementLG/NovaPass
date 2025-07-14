# app/core/password_generator.py
import string
import secrets


def generate_secure_password(length: int = 16, upper: bool = True, lower: bool = True, digits: bool = True,
                             symbols: bool = True) -> str:
    """
    Generates a secure password using the secrets module.

    Args:
        length (int): Desired password length.
        upper (bool): Include uppercase letters.
        lower (bool): Include lowercase letters.
        digits (bool): Include numbers.
        symbols (bool): Include symbols.

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

    # CORRECTION : The error message is now in English.
    if not alphabet:
        return "Error: Please select at least one character type."

    password = ''.join(secrets.choice(alphabet) for i in range(length))

    return password