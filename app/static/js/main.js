document.addEventListener('DOMContentLoaded', () => {

    // --- Selectors ---
    const passwordDisplay = document.getElementById('password-display');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const strengthTime = document.getElementById('strength-time');
    const modeToggle = document.getElementById('mode-toggle');
    const passwordOptions = document.getElementById('password-options');
    const passphraseOptions = document.getElementById('passphrase-options');
    const lengthSlider = document.getElementById('length-slider');
    const lengthInput = document.getElementById('length-input');
    const ppLengthSlider = document.getElementById('pp-length-slider');
    const ppLengthInput = document.getElementById('pp-length-input');
    const dictionarySelect = document.getElementById('dictionary-select');
    const helpIcon = document.getElementById('help-icon');
    const infoIcon = document.getElementById('info-icon');
    const helpModal = document.getElementById('help_modal');
    const infoModal = document.getElementById('info_modal');
    const excludeConfusableToggle = document.getElementById('exclude-confusable-toggle');
    const excludeInput = document.getElementById('exclude-input');

    // --- Confusable Characters ---
    const confusableChars = "iIlL1oO0'`";

    const updateExcludeInput = () => {
        const currentExcludes = excludeInput.value.split('');
        const confusable = confusableChars.split('');

        let newExcludes;

        if (excludeConfusableToggle.checked) {
            // Add confusable characters, avoiding duplicates
            newExcludes = [...new Set([...currentExcludes, ...confusable])];
        } else {
            // Remove only the confusable characters
            newExcludes = currentExcludes.filter(char => !confusable.includes(char));
        }

        excludeInput.value = newExcludes.join('');
        fetchPassword();
    };

     // --- Slider Synchronization ---
     lengthSlider.addEventListener('input', (e) => { lengthInput.value = e.target.value; });
    lengthInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        const sliderMax = parseInt(lengthSlider.max);
        const inputMax = parseInt(e.target.max);
        if (value > inputMax) { value = inputMax; e.target.value = inputMax; }
        if (value >= lengthSlider.min && value <= sliderMax) { lengthSlider.value = value; }
        else if (value > sliderMax) { lengthSlider.value = sliderMax; }
    });

    ppLengthSlider.addEventListener('input', (e) => { ppLengthInput.value = e.target.value; });
    ppLengthInput.addEventListener('input', (e) => { ppLengthSlider.value = e.target.value; });

    // --- Main Logic ---
    const toggleMode = () => {
        const isPassphrase = modeToggle.checked;
        passwordOptions.classList.toggle('hidden', isPassphrase);
        passphraseOptions.classList.toggle('hidden', !isPassphrase);
        fetchPassword();
    };

    const updateStrengthIndicator = (strength) => {
        strengthBar.value = strength.entropy;
        strengthText.textContent = strength.text;
        strengthTime.textContent = strength.time_to_crack;
        strengthBar.classList.remove('progress-error', 'progress-warning', 'progress-info', 'progress-success');
        if (strength.entropy < 40) { strengthBar.classList.add('progress-error'); }
        else if (strength.entropy < 80) { strengthBar.classList.add('progress-warning'); }
        else { strengthBar.classList.add('progress-success'); }
    };

    const fetchPassword = async () => {
        const isPassphrase = modeToggle.checked;
        let options = {
            mode: isPassphrase ? 'passphrase' : 'password'
        };

        if (isPassphrase) {
            options.length = ppLengthInput.value;
            options.separator = document.getElementById('passphrase-separator-input').value;
            options.dictionary = dictionarySelect.value;
        } else {
            options.length = lengthInput.value;
            options.upper = document.getElementById('option-upper').checked;
            options.lower = document.getElementById('option-lower').checked;
            options.digits = document.getElementById('option-digits').checked;
            options.symbols = document.getElementById('option-symbols').checked;
            options.exclude_chars = document.getElementById('exclude-input').value;
        }

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options),
            });
            const data = await response.json();
            passwordDisplay.value = data.password;
            updateStrengthIndicator(data.strength);
        } catch (error) {
            console.error("Error generating password:", error);
            passwordDisplay.value = "Generation Error";
        }
    };

    const loadDictionaries = async () => {
        try {
            const response = await fetch('/api/dictionaries');
            const dicts = await response.json();
            dictionarySelect.innerHTML = '';
            if (dicts.length === 0) {
                dictionarySelect.innerHTML = '<option disabled>No dictionaries found in ./dictionaries/</option>';
            } else {
                dicts.forEach(dictName => {
                    const option = document.createElement('option');
                    option.value = dictName;
                    option.textContent = dictName.replace('.txt', '').replace(/_/g, ' ');
                    dictionarySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load dictionaries:', error);
        }
    };

    const copyPassword = () => {
        if (!passwordDisplay.value || passwordDisplay.value.includes('Error')) return;
        navigator.clipboard.writeText(passwordDisplay.value).then(() => {
            document.getElementById('copy-button').textContent = 'Copied!';
            setTimeout(() => { document.getElementById('copy-button').textContent = 'Copy'; }, 2000);
        }).catch(err => { console.error('Error copying:', err); });
    };

    // --- Slogan Animation Logic ---
    const dynamicWordEl = document.getElementById('dynamic-word');
    if (dynamicWordEl) {
        const wordsToAnimate = ["Secure", "Robust", "Unique", "Unbreakable", "Private"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeAnimation = () => {
            const currentWord = wordsToAnimate[wordIndex];
            const part = isDeleting
                ? currentWord.substring(0, charIndex - 1)
                : currentWord.substring(0, charIndex + 1);

            dynamicWordEl.textContent = part;
            isDeleting ? charIndex-- : charIndex++;

            let delay = isDeleting ? 100 : 150;

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                delay = 2000; // Pause before deleting
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % wordsToAnimate.length;
                delay = 500; // Pause before typing next word
            }
            setTimeout(typeAnimation, delay);
        };
        typeAnimation(); // Start the animation
    }

    // --- Event Listeners ---
    document.getElementById('generate-button').addEventListener('click', fetchPassword);
    document.getElementById('copy-button').addEventListener('click', copyPassword);

    modeToggle.addEventListener('change', toggleMode);
    document.querySelectorAll('#password-options input, #password-options .toggle').forEach(item => {
        if (item.id !== 'exclude-confusable-toggle') { // Avoid double-triggering
            item.addEventListener('input', fetchPassword);
        }
    });
    excludeConfusableToggle.addEventListener('change', updateExcludeInput);
    document.querySelectorAll('#passphrase-options input, #passphrase-options select').forEach(item => item.addEventListener('input', fetchPassword));

    helpIcon.addEventListener('click', (e) => {
        e.preventDefault();
        helpModal.showModal();
    });

    infoIcon.addEventListener('click', (e) => {
        e.preventDefault();
        infoModal.showModal();
    });

    // --- Initialization ---
    loadDictionaries().then(() => {
        fetchPassword();
    });
});