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
    const quantityInput = document.getElementById('quantity-input');
    const exportCsvButton = document.getElementById('export-csv-button');
    const passwordListItems = document.getElementById('password-list-items');
    const selectAllPasswords = document.getElementById('select-all-passwords');
    const copySelectedButton = document.getElementById('copy-selected-button');
    const copyArrow = document.getElementById('copy-arrow');
    const copyButtonText = document.getElementById('copy-button-text');

    let generatedPasswords = [];

    // --- Confusable Characters ---
    const confusableChars = "iIlL1oO0'`";

    const updateExcludeInput = () => {
        const currentExcludes = excludeInput.value.split('');
        const confusable = confusableChars.split('');
        let newExcludes;
        if (excludeConfusableToggle.checked) {
            newExcludes = [...new Set([...currentExcludes, ...confusable])];
        } else {
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
    ppLengthInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        const sliderMax = parseInt(ppLengthSlider.max);
        const inputMax = parseInt(e.target.max);
        if (value > inputMax) { value = inputMax; e.target.value = inputMax; }
        if (value >= ppLengthSlider.min && value <= sliderMax) { ppLengthSlider.value = value; }
        else if (value > sliderMax) { ppLengthSlider.value = sliderMax; }
    });

    // --- Main Logic ---
    const toggleMode = () => {
        const isPassphrase = modeToggle.checked;
        passwordOptions.classList.toggle('hidden', isPassphrase);
        passphraseOptions.classList.toggle('hidden', !isPassphrase);
        fetchPassword();
    };

    const updateStrengthIndicator = (strength) => {
        if (!strength) {
            strengthBar.value = 0;
            strengthText.textContent = '';
            strengthTime.textContent = '';
            return;
        }
        strengthBar.value = Math.min(strength.entropy, strengthBar.max);
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
            mode: isPassphrase ? 'passphrase' : 'password',
            quantity: parseInt(quantityInput.value) || 1
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
            
            passwordListItems.innerHTML = '';
            if (data && data.length > 0) {
                generatedPasswords = data;
                passwordDisplay.value = data[0].password;
                updateStrengthIndicator(data[0].strength);

                if (data.length > 1) {
                    copyArrow.classList.remove('hidden');
                    document.getElementById('password-list-dropdown').classList.remove('hidden');
                    selectAllPasswords.checked = true;
                    data.forEach((p, index) => {
                        const item = document.createElement('div');
                        item.className = 'flex items-center p-2';
                        item.innerHTML = `
                            <label class="label cursor-pointer min-w-0">
                                <input type="checkbox" class="password-checkbox checkbox checkbox-sm" data-password='${p.password}' checked />
                                <span class="label-text ml-2 break-all">${p.password}</span>
                            </label>
                        `;
                        item.querySelector('.label-text').addEventListener('click', () => {
                            passwordDisplay.value = p.password;
                            updateStrengthIndicator(p.strength);
                        });
                        passwordListItems.appendChild(item);
                    });
                } else {
                    copyArrow.classList.add('hidden');
                    document.getElementById('password-list-dropdown').classList.add('hidden');
                }
                exportCsvButton.classList.toggle('hidden', data.length <= 1);
            } else {
                generatedPasswords = [];
                passwordDisplay.value = "Error";
                updateStrengthIndicator(null);
                exportCsvButton.classList.add('hidden');
            }
        } catch (error) {
            console.error("Error generating password:", error);
            passwordDisplay.value = "Generation Error";
            passwordListItems.innerHTML = '';
            exportCsvButton.classList.add('hidden');
        }
    };
    
    const exportToCsv = () => {
        if (generatedPasswords.length === 0) return;
        const headers = "Password,Strength,Time to Crack,Entropy\n";
        const rows = generatedPasswords.map(p =>
            `"${p.password}","${p.strength.text}","${p.strength.time_to_crack}","${p.strength.entropy}"`
        ).join('\n');
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "passwords.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            copyButtonText.textContent = 'Copied!';
            setTimeout(() => { copyButtonText.textContent = 'Copy'; }, 2000);
        }).catch(err => { console.error('Error copying:', err); });
    };

    const copySelectedPasswords = () => {
        const selectedPasswords = [];
        document.querySelectorAll('.password-checkbox:checked').forEach(checkbox => {
            selectedPasswords.push(checkbox.dataset.password);
        });

        if (selectedPasswords.length > 0) {
            navigator.clipboard.writeText(selectedPasswords.join('\n')).then(() => {
                copySelectedButton.textContent = 'Copied!';
                setTimeout(() => { copySelectedButton.textContent = 'Copy Selected'; }, 2000);
            }).catch(err => { console.error('Error copying selected:', err); });
        }
    };

    const toggleSelectAll = (e) => {
        document.querySelectorAll('.password-checkbox').forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
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
            const part = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
            dynamicWordEl.textContent = part;
            isDeleting ? charIndex-- : charIndex++;
            let delay = isDeleting ? 100 : 150;
            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                delay = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % wordsToAnimate.length;
                delay = 500;
            }
            setTimeout(typeAnimation, delay);
        };
        typeAnimation();
    }

    // --- Event Listeners ---
    document.getElementById('generate-button').addEventListener('click', fetchPassword);
    document.getElementById('copy-button').addEventListener('click', copyPassword);
    exportCsvButton.addEventListener('click', exportToCsv);
    copySelectedButton.addEventListener('click', copySelectedPasswords);
    selectAllPasswords.addEventListener('change', toggleSelectAll);
    modeToggle.addEventListener('change', toggleMode);
    
    const allOptions = document.querySelectorAll('#password-options input, #password-options .toggle, #passphrase-options input, #passphrase-options select');
    allOptions.forEach(item => {
        if (item.id !== 'exclude-confusable-toggle') {
            item.addEventListener('input', fetchPassword);
        }
    });
    quantityInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        const max = parseInt(e.target.max);
        if (value > max) {
            e.target.value = max;
        }
        fetchPassword();
    });
    excludeConfusableToggle.addEventListener('change', updateExcludeInput);

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