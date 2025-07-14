document.addEventListener('DOMContentLoaded', () => {

    // --- Selectors ---
    const passwordDisplay = document.getElementById('password-display');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const strengthTime = document.getElementById('strength-time');
    const modeToggle = document.getElementById('mode-toggle');
    const passwordOptions = document.getElementById('password-options');
    const passphraseOptions = document.getElementById('passphrase-options');

    // Selectors for password mode
    const lengthSlider = document.getElementById('length-slider');
    const lengthInput = document.getElementById('length-input');

    // Selectors for passphrase mode
    const ppLengthSlider = document.getElementById('pp-length-slider');
    const ppLengthInput = document.getElementById('pp-length-input');
    const dictionarySelect = document.getElementById('dictionary-select');
    const passphraseSeparatorInput = document.getElementById('passphrase-separator-input');

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
            options.separator = passphraseSeparatorInput.value;
            options.dictionary = dictionarySelect.value;
        } else {
            options.length = lengthInput.value;
            options.upper = document.getElementById('option-upper').checked;
            options.lower = document.getElementById('option-lower').checked;
            options.digits = document.getElementById('option-digits').checked;
            options.symbols = document.getElementById('option-symbols').checked;
            options.exclude = document.getElementById('exclude-input').value;
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
                dictionarySelect.innerHTML = '<option disabled>No dictionaries found</option>';
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

    // --- Event Listeners ---
    document.getElementById('generate-button').addEventListener('click', fetchPassword);
    document.getElementById('copy-button').addEventListener('click', copyPassword);

    modeToggle.addEventListener('change', toggleMode);
    document.querySelectorAll('#password-options input, #password-options .toggle').forEach(item => item.addEventListener('input', fetchPassword));
    document.querySelectorAll('#passphrase-options input, #passphrase-options select').forEach(item => item.addEventListener('input', fetchPassword));

    // --- Initialization ---
    loadDictionaries().then(() => {
        fetchPassword();
    });
});