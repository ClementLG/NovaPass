document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.getElementById('generate-button');
    const copyBtn = document.getElementById('copy-button');
    const passwordDisplay = document.getElementById('password-display');

    const lengthSlider = document.getElementById('length-slider');
    const lengthInput = document.getElementById('length-input');
    const excludeInput = document.getElementById('exclude-input'); // Nouveau sélecteur

    // --- Logique de synchronisation ---

    lengthSlider.addEventListener('input', (e) => {
        lengthInput.value = e.target.value;
    });

    lengthInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        const sliderMax = parseInt(lengthSlider.max);
        const inputMax = parseInt(e.target.max);

        if (value > inputMax) {
            value = inputMax;
            e.target.value = inputMax;
        }

        if (value >= lengthSlider.min && value <= sliderMax) {
            lengthSlider.value = value;
        } else if (value > sliderMax) {
            lengthSlider.value = sliderMax;
        }
    });

    const fetchPassword = async () => {
        const options = {
            length: lengthInput.value,
            upper: document.getElementById('option-upper').checked,
            lower: document.getElementById('option-lower').checked,
            digits: document.getElementById('option-digits').checked,
            symbols: document.getElementById('option-symbols').checked,
            exclude: excludeInput.value // Ajout des caractères à exclure
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            });
            const data = await response.json();
            passwordDisplay.value = data.password;
        } catch (error) {
            console.error("Error generating password:", error);
            passwordDisplay.value = "Generation Error";
        }
    };

    const copyPassword = () => {
        if (!passwordDisplay.value) return;

        navigator.clipboard.writeText(passwordDisplay.value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Error copying:', err);
        });
    };

    generateBtn.addEventListener('click', fetchPassword);
    copyBtn.addEventListener('click', copyPassword);

    // Ajout des écouteurs pour la génération automatique
    document.querySelectorAll('.toggle').forEach(item => item.addEventListener('change', fetchPassword));
    lengthInput.addEventListener('input', fetchPassword);
    lengthSlider.addEventListener('input', fetchPassword);
    excludeInput.addEventListener('input', fetchPassword);


    fetchPassword();
});