// app/static/js/main.js
document.addEventListener('DOMContentLoaded', () => {

    const generateBtn = document.getElementById('generate-button');
    const copyBtn = document.getElementById('copy-button');
    const passwordDisplay = document.getElementById('password-display');
    const lengthSlider = document.getElementById('length-slider');
    const lengthLabel = document.getElementById('length-label');

    lengthSlider.addEventListener('input', (e) => {
        lengthLabel.textContent = e.target.value;
    });

    const fetchPassword = async () => {
        const options = {
            length: lengthSlider.value,
            upper: document.getElementById('option-upper').checked,
            lower: document.getElementById('option-lower').checked,
            digits: document.getElementById('option-digits').checked,
            symbols: document.getElementById('option-symbols').checked,
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
            copyBtn.textContent = 'Copied!'; // Text in English
            setTimeout(() => {
                copyBtn.textContent = 'Copy'; // Text in English
            }, 2000);
        }).catch(err => {
            console.error('Error copying:', err);
        });
    };

    generateBtn.addEventListener('click', fetchPassword);
    copyBtn.addEventListener('click', copyPassword);

    fetchPassword();
});