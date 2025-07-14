document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.getElementById('generate-button');
    const copyBtn = document.getElementById('copy-button');
    const passwordDisplay = document.getElementById('password-display');
    const lengthSlider = document.getElementById('length-slider');
    const lengthInput = document.getElementById('length-input');
    const excludeInput = document.getElementById('exclude-input');

    // Nouveaux sélecteurs pour l'indicateur de force
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const strengthTime = document.getElementById('strength-time');

    lengthSlider.addEventListener('input', (e) => {
        lengthInput.value = e.target.value;
    });

    lengthInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        const sliderMax = parseInt(lengthSlider.max);
        const inputMax = parseInt(e.target.max);
        if (value > inputMax) { value = inputMax; e.target.value = inputMax; }
        if (value >= lengthSlider.min && value <= sliderMax) { lengthSlider.value = value; }
        else if (value > sliderMax) { lengthSlider.value = sliderMax; }
    });


    // Fonction pour mettre à jour les couleurs de la barre de progression
    const updateStrengthIndicator = (strength) => {
        strengthBar.value = strength.entropy;
        strengthText.textContent = strength.text;
        strengthTime.textContent = strength.time_to_crack;

        // On enlève toutes les classes de couleur précédentes
        strengthBar.classList.remove('progress-error', 'progress-warning', 'progress-info', 'progress-success');

        if (strength.entropy < 40) {
            strengthBar.classList.add('progress-error');
        } else if (strength.entropy < 80) {
            strengthBar.classList.add('progress-warning');
        } else {
            strengthBar.classList.add('progress-success');
        }
    };

    const fetchPassword = async () => {
        const options = {
            length: lengthInput.value,
            upper: document.getElementById('option-upper').checked,
            lower: document.getElementById('option-lower').checked,
            digits: document.getElementById('option-digits').checked,
            symbols: document.getElementById('option-symbols').checked,
            exclude: excludeInput.value
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options),
            });
            const data = await response.json();

            // Mise à jour de l'affichage du mot de passe ET de l'indicateur
            passwordDisplay.value = data.password;
            updateStrengthIndicator(data.strength);

        } catch (error) {
            console.error("Error generating password:", error);
            passwordDisplay.value = "Generation Error";
        }
    };

    const copyPassword = () => {
        if (!passwordDisplay.value || passwordDisplay.value.includes('Error')) return;
        navigator.clipboard.writeText(passwordDisplay.value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }).catch(err => { console.error('Error copying:', err); });
    };

    generateBtn.addEventListener('click', fetchPassword);
    copyBtn.addEventListener('click', copyPassword);
    document.querySelectorAll('.toggle').forEach(item => item.addEventListener('change', fetchPassword));
    lengthInput.addEventListener('input', fetchPassword);
    lengthSlider.addEventListener('input', fetchPassword);
    excludeInput.addEventListener('input', fetchPassword);

    fetchPassword();
});