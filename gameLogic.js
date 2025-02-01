document.addEventListener('DOMContentLoaded', () => {
    // ========= Global Variables =========
    let wallet = 500;
    let isLoggedIn = false;

    // For Single selection
    const singleSelectDiv = document.getElementById('singleSelect');

    // Variables for Patti functionality
    let pattiSelectedNumbers = [];  // For normal Patti mode (3 numbers in ascending order)
    let cpSelectedNumbers = [];     // For CP mode (minimum 4 numbers required)
    let pattiStored = [];           // Final stored Patti entries (each is a 3-digit string)
    let isCPMode = false;           // Flag for CP mode in Patti area

    // ========= Existing Functions =========
    function showWallet() {
        document.getElementById('walletContainer').style.display = 'flex';
        document.getElementById('walletDisplay').textContent = `Wallet: $${wallet}`;
    }

    function showLoginForm() {
        if (!isLoggedIn) {
            document.getElementById('loginForm').style.display = 'block';
        }
    }

    function hideLoginForm() {
        document.getElementById('loginForm').style.display = 'none';
    }

    // ========= Event Listeners for Navigation =========
    document.getElementById('playButton').addEventListener('click', showLoginForm);
    document.getElementById('singleButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            // Hide Patti area if open
            document.getElementById('pattiContainer').style.display = 'none';
            showSingleSelection();
        }
    });
    document.getElementById('pattiButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            // Hide Single area if open
            singleSelectDiv.style.display = 'none';
            showPattiContainer();
        }
    });
    document.getElementById('juriButton').addEventListener('click', showLoginForm);

    document.getElementById('loginButton').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            isLoggedIn = true;
            alert('Login Successful!');
            hideLoginForm();
            showWallet();
        } else {
            alert('Please enter valid credentials.');
        }
    });

    document.getElementById('addMoneyButton').addEventListener('click', () => {
        const amount = prompt('Enter the amount to add:');
        if (amount && !isNaN(amount) && amount > 0) {
            wallet += parseFloat(amount);
            document.getElementById('walletDisplay').textContent = `Wallet: $${wallet}`;
            alert(`$${amount} added to your wallet.`);
        } else {
            alert('Invalid amount.');
        }
    });

    async function fetchData(game) {
        try {
            const response = await fetch(`/api/games/${game}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    function createRow(date, values) {
        const row = document.createElement('div');
        row.classList.add('row');
        const dateBox = document.createElement('div');
        dateBox.classList.add('date');
        dateBox.textContent = date;
        row.appendChild(dateBox);
        const baziResults = document.createElement('div');
        baziResults.classList.add('bazi-results');
        values.forEach(value => {
            const baziBox = document.createElement('div');
            baziBox.classList.add('bazi-box');
            baziBox.textContent = value;
            baziResults.appendChild(baziBox);
        });
        row.appendChild(baziResults);
        return row;
    }

    const gameTable = document.getElementById('gameTable');
    const gameSelector = document.getElementById('gameSelector');

    async function populateTable(selectedGame) {
        gameTable.innerHTML = '';
        const data = await fetchData(selectedGame);
        if (data.length === 0) {
            const message = document.createElement('p');
            message.textContent = "No data available for this game.";
            gameTable.appendChild(message);
            return;
        }
        data.forEach(entry => {
            const row = createRow(entry.date, entry.values);
            gameTable.appendChild(row);
        });
    }

    gameSelector.addEventListener('change', () => {
        populateTable(gameSelector.value);
    });
    populateTable(gameSelector.value);

    // ========= Single Number Selection =========
    function showSingleSelection() {
        singleSelectDiv.style.display = 'block';
        singleSelectDiv.innerHTML = ''; // Clear previous selections
        for (let i = 0; i <= 9; i++) {
            const numButton = document.createElement('button');
            numButton.textContent = i;
            numButton.classList.add('singleNumButton');
            numButton.addEventListener('click', () => {
                numButton.classList.toggle('selected');
            });
            singleSelectDiv.appendChild(numButton);
        }
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = 'Enter Amount';
        singleSelectDiv.appendChild(amountInput);
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => {
            const selectedBtns = singleSelectDiv.querySelectorAll('.singleNumButton.selected');
            const selectedValues = Array.from(selectedBtns).map(btn => parseInt(btn.textContent));
            const amount = parseInt(amountInput.value);
            if (selectedValues.length > 0 && !isNaN(amount) && amount > 0) {
                const totalAmount = selectedValues.length * amount;
                if (wallet >= totalAmount) {
                    wallet -= totalAmount;
                    document.getElementById('walletDisplay').textContent = `Wallet: $${wallet}`;
                    alert(`Bet placed for ${selectedValues.join(', ')} with amount $${amount} each. Total deducted: $${totalAmount}`);
                    singleSelectDiv.style.display = 'none';
                } else {
                    alert("Insufficient wallet balance.");
                }
            } else {
                alert("Please select at least one number and enter a valid amount.");
            }
        });
        singleSelectDiv.appendChild(submitButton);
    }

    // ========= Patti Functionality =========
    function showPattiContainer() {
        const pattiContainer = document.getElementById('pattiContainer');
        pattiContainer.style.display = 'block';
        pattiContainer.innerHTML = ''; // Clear previous content

        // Build Patti number boxes container (arranged horizontally in one line without scrolling)
        const boxContainer = document.createElement('div');
        boxContainer.id = 'pattiBoxContainer';
        // Removed overflow-x:auto for no scrolling; boxes will wrap if necessary
        boxContainer.style.display = 'flex';
        boxContainer.style.gap = '10px';
        boxContainer.style.marginBottom = '15px';
        pattiContainer.appendChild(boxContainer);

        // Create boxes for numbers 1 to 9
        for (let i = 1; i <= 9; i++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.textContent = i;
            box.style.userSelect = 'none';
            box.addEventListener('click', () => {
                pattiNumberClicked(i);
            });
            boxContainer.appendChild(box);
        }
        // Create box for "0" (represents 10 internally)
        const boxZero = document.createElement('div');
        boxZero.className = 'box';
        boxZero.textContent = '0';
        boxZero.style.userSelect = 'none';
        boxZero.addEventListener('click', () => {
            pattiNumberClicked(10);
        });
        boxContainer.appendChild(boxZero);

        // Patti CP Controls
        const cpButton = document.createElement('div');
        cpButton.id = 'pattiCpButton';
        cpButton.textContent = 'CP';
        cpButton.style.width = '120px';
        cpButton.addEventListener('click', togglePattiCP);
        pattiContainer.appendChild(cpButton);

        const cpOkButton = document.createElement('div');
        cpOkButton.id = 'pattiCpOkButton';
        cpOkButton.textContent = 'CP OK';
        cpOkButton.style.width = '120px';
        cpOkButton.style.display = 'none';
        cpOkButton.addEventListener('click', pattiCpOk);
        pattiContainer.appendChild(cpOkButton);

        // Display for CP Selected Numbers
        const cpSelectedDisplay = document.createElement('div');
        cpSelectedDisplay.id = 'pattiCpSelectedDisplay';
        cpSelectedDisplay.style.display = 'none';
        pattiContainer.appendChild(cpSelectedDisplay);

        // Stored Pattis Display
        const storedDisplay = document.createElement('div');
        storedDisplay.id = 'pattiStoreArea';
        storedDisplay.style.marginTop = '10px';
        storedDisplay.style.fontWeight = 'bold';
        storedDisplay.textContent = 'Stored Pattis: ' + pattiStored.join(', ');
        pattiContainer.appendChild(storedDisplay);

        // Amount input section for Patti
        const amountSection = document.createElement('div');
        amountSection.id = 'pattiAmountSection';
        amountSection.innerHTML = '<label>Enter Amount per Patti (₹): </label>';
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.id = 'pattiAmountInput';
        amountInput.min = '1';
        amountInput.value = '0';
        amountSection.appendChild(amountInput);
        pattiContainer.appendChild(amountSection);

        // Patti Submit and Clear buttons
        const submitButton = document.createElement('div');
        submitButton.id = 'pattiSubmitButton';
        submitButton.textContent = 'Submit';
        submitButton.style.width = '120px';
        submitButton.addEventListener('click', pattiCalculateTotal);
        pattiContainer.appendChild(submitButton);

        const clearButton = document.createElement('div');
        clearButton.id = 'pattiClearButton';
        clearButton.textContent = 'Clear Last Patti';
        clearButton.style.width = '120px';
        clearButton.addEventListener('click', pattiClearLast);
        pattiContainer.appendChild(clearButton);

        // Reset Patti variables for a fresh start.
        pattiSelectedNumbers = [];
        cpSelectedNumbers = [];
        pattiStored = [];
        isCPMode = false;
    }

    // Patti number click handler
    function pattiNumberClicked(num) {
        if (isCPMode) {
            if (!cpSelectedNumbers.includes(num)) {
                cpSelectedNumbers.push(num);
                updatePattiCpSelectedDisplay();
            }
        } else {
            if (pattiSelectedNumbers.length < 3) {
                pattiSelectedNumbers.push(num);
            }
            if (pattiSelectedNumbers.length === 3) {
                let sorted = [...pattiSelectedNumbers].sort((a, b) => a - b);
                if (JSON.stringify(pattiSelectedNumbers) === JSON.stringify(sorted)) {
                    let patti = pattiSelectedNumbers.join('');
                    let pattiDisplay = patti.replace('10', '0');
                    pattiStored.push(pattiDisplay);
                    updatePattiStoreArea();
                } else {
                    alert('Invalid Patti! Numbers should be in ascending order.');
                }
                pattiSelectedNumbers = [];
            }
        }
    }

    // Update Patti stored display
    function updatePattiStoreArea() {
        const storedDisplay = document.getElementById('pattiStoreArea');
        storedDisplay.textContent = 'Stored Pattis: ' + pattiStored.join(', ');
    }

    // Toggle Patti CP mode
    function togglePattiCP() {
        const cpButton = document.getElementById('pattiCpButton');
        const cpOkButton = document.getElementById('pattiCpOkButton');
        const cpSelectedDisplay = document.getElementById('pattiCpSelectedDisplay');
        isCPMode = !isCPMode;
        if (isCPMode) {
            cpButton.classList.add('selected');
            cpOkButton.style.display = 'inline-block';
            cpSelectedDisplay.style.display = 'block';
            cpSelectedNumbers = [];
            updatePattiCpSelectedDisplay();
        } else {
            cpButton.classList.remove('selected');
            cpOkButton.style.display = 'none';
            cpSelectedDisplay.style.display = 'none';
            cpSelectedNumbers = [];
        }
    }

    // Update CP selected display in Patti area
    function updatePattiCpSelectedDisplay() {
        const cpSelectedDisplay = document.getElementById('pattiCpSelectedDisplay');
        let displayNumbers = cpSelectedNumbers.map(n => n === 10 ? '0' : n);
        cpSelectedDisplay.textContent = 'CP Selected Numbers: ' + displayNumbers.join(', ');
    }

    // When CP OK is pressed in Patti area, generate unique 3-digit combinations
    function pattiCpOk() {
        if (cpSelectedNumbers.length < 4) {
            alert('Select at least 4 numbers for CP mode.');
            return;
        }
        let combinations = generateUniqueCombinations(cpSelectedNumbers);
        combinations.forEach(combo => {
            if (!pattiStored.includes(combo)) {
                pattiStored.push(combo);
            }
        });
        updatePattiStoreArea();
        cpSelectedNumbers = [];
        updatePattiCpSelectedDisplay();
    }

    // Generate unique 3-digit combinations from an array of numbers
    function generateUniqueCombinations(numbers) {
        let combos = [];
        let n = numbers.length;
        for (let i = 0; i < n - 2; i++) {
            for (let j = i + 1; j < n - 1; j++) {
                for (let k = j + 1; k < n; k++) {
                    let arr = [numbers[i], numbers[j], numbers[k]].sort((a, b) => a - b);
                    let combo = arr.join('');
                    let comboDisplay = combo.replace('10', '0');
                    if (!combos.includes(comboDisplay)) {
                        combos.push(comboDisplay);
                    }
                }
            }
        }
        return combos;
    }

    // Calculate total for Patti bets (minimum amount per Patti is ₹10)
    function pattiCalculateTotal() {
        const amountInput = document.getElementById('pattiAmountInput');
        let betAmount = parseInt(amountInput.value);
        betAmount = (betAmount < 10) ? 10 : betAmount;
        let totalAmount = pattiStored.length * betAmount;
        if (wallet >= totalAmount) {
            wallet -= totalAmount;
            document.getElementById('walletDisplay').textContent = `Wallet: $${wallet}`;
            alert(`Total bet on Pattis: ₹${totalAmount} for ${pattiStored.length} Patti entries.`);
            pattiStored = [];
            updatePattiStoreArea();
        } else {
            alert('Insufficient wallet balance.');
        }
    }

    // Clear the last Patti entry
    function pattiClearLast() {
        if (pattiStored.length > 0) {
            pattiStored.pop();
            updatePattiStoreArea();
        } else {
            alert('No Patti to clear!');
        }
    }

    // ========= Modify Existing Button Listeners =========
    document.getElementById('juriButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            alert("Juri button clicked (Simulated).");
        }
    });

    document.getElementById('playButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            alert("Play button clicked (Simulated).");
        }
    });
});
