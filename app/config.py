import os

class Config:
    # Password Generator Settings
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_MAX_LENGTH = 1024
    PASSWORD_DEFAULT_LENGTH = 16
    PASSWORD_SLIDER_MAX = 64

    # Passphrase Generator Settings
    PASSPHRASE_MIN_WORDS = 3
    PASSPHRASE_MAX_WORDS = 20
    PASSPHRASE_SLIDER_MAX = 10
    PASSPHRASE_DEFAULT_WORDS = 6
    
    # Dictionaries path
    DICTIONARY_DIR = os.path.join(os.path.dirname(__file__), '..', 'dictionaries')

    # UI and API limits
    MAX_QUANTITY = 100