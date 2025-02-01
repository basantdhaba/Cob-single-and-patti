document.addEventListener('DOMContentLoaded', () => {
    // ========= Global Variables =========
    let wallet = 500;
    let isLoggedIn = false;

    // For Single selection
    const singleSelectDiv = document.getElementById('singleSelect');

    // For Patti functionality (normal mode & CP mode)
    let pattiSelectedNumbers = [];     // For normal Patti mode (exactly 3 numbers in ascending order)
    let cpSelectedNumbers = [];        // For CP mode (user must select at least 4 numbers)
    let pattiStored = [];              // Final stored Patti entries (each a 3-digit string)
    let isCPMode = false;              // Flag for CP mode in the Patti section

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

    // ========= Event Listeners for Login and Wallet =========
    document.getElementById('playButton').addEventListener('click', showLoginForm);
    document.getElementById('singleButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            showSingleSelection();
        }
    });
    document.getElementById('pattiButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            showPattiContainer(); // Build and display the Patti functional area
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

    // ========= Single Number Selection Functionality =========
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
    // The Patti container (with id="pattiContainer") should already exist in your HTML.
    // This functionality builds the Patti UI (number boxes, CP mode, etc.) dynamically.
    function showPattiContainer() {
        const pattiContainer = document.getElementById('pattiContainer');
        pattiContainer.style.display = 'block';
        // Clear any previous content in the Patti container
        pattiContainer.innerHTML = '';

        // Create a sub-container for the Patti number boxes
        const boxContainer = document.createElement('div');
        boxContainer.id = 'pattiBoxContainer';
        // (Optional: add styling classes as needed)
        pattiContainer.appendChild(boxContainer);

        // Build Patti number boxes: numbers 1 to 9 and a box shown as "0" (represents 10 internally)
        for (let i = 1; i <= 9; i++) {
            const box = document.createElement('div');
            box.className = 'box';  // reusing your existing .box style
            box.textContent = i;
            box.addEventListener('click', () => {
                pattiNumberClicked(i);
            });
            boxContainer.appendChild(box);
        }
        const boxZero = document.createElement('div');
        boxZero.className = 'box';
        boxZero.textContent = '0';
        boxZero.addEventListener('click', () => {
            pattiNumberClicked(10);  // internally treat as 10
        });
        boxContainer.appendChild(boxZero);

        // Create CP mode controls
        const cpButton = document.createElement('div');
        cpButton.id = 'pattiCpButton';
        cpButton.textContent = 'CP';
        cpButton.style.cursor = 'pointer';
        cpButton.style.padding = '10px';
        cpButton.style.backgroundColor = 'lightgray';
        cpButton.style.border = '1px solid black';
        cpButton.addEventListener('click', togglePattiCP);
        pattiContainer.appendChild(cpButton);

        const cpOkButton = document.createElement('div');
        cpOkButton.id = 'pattiCpOkButton';
        cpOkButton.textContent = 'CP OK';
        cpOkButton.style.cursor = 'pointer';
        cpOkButton.style.padding = '10px';
        cpOkButton.style.backgroundColor = 'lightgray';
        cpOkButton.style.border = '1px solid black';
        cpOkButton.style.display = 'none'; // initially hidden
        cpOkButton.addEventListener('click', pattiCpOk);
        pattiContainer.appendChild(cpOkButton);

        // Display area for CP selected numbers
        const cpSelectedDisplay = document.createElement('div');
        cpSelectedDisplay.id = 'pattiCpSelectedDisplay';
        cpSelectedDisplay.style.display = 'none';
        pattiContainer.appendChild(cpSelectedDisplay);

        // Stored Pattis display (reuse id "storeArea" if you like, or create a new one)
        const storedDisplay = document.createElement('div');
        storedDisplay.id = 'pattiStoreArea';
        storedDisplay.style.marginTop = '10px';
        storedDisplay.style.fontWeight = 'bold';
        storedDisplay.textContent = 'Stored Pattis: ' + pattiStored.join(', ');
        pattiContainer.appendChild(storedDisplay);

        // Amount input section
        const amountSection = document.createElement('div');
        amountSection.id = 'pattiAmountSection';
        amountSection.style.marginTop = '10px';
        amountSection.innerHTML = '<label>Enter Amount per Patti (₹): </label>';
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.id = 'pattiAmountInput';
        amountInput.min = '1';
        amountInput.value = '0';
        amountSection.appendChild(amountInput);
        pattiContainer.appendChild(amountSection);

        // Submit and Clear buttons for Patti
        const submitButton = document.createElement('div');
        submitButton.id = 'pattiSubmitButton';
        submitButton.textContent = 'Submit';
        submitButton.style.cursor = 'pointer';
        submitButton.style.padding = '10px';
        submitButton.style.backgroundColor = 'lightgray';
        submitButton.style.border = '1px solid black';
        submitButton.addEventListener('click', pattiCalculateTotal);
        pattiContainer.appendChild(submitButton);

        const clearButton = document.createElement('div');
        clearButton.id = 'pattiClearButton';
        clearButton.textContent = 'Clear Last Patti';
        clearButton.style.cursor = 'pointer';
        clearButton.style.padding = '10px';
        clearButton.style.backgroundColor = 'lightgray';
        clearButton.style.border = '1px solid black';
        clearButton.addEventListener('click', pattiClearLast);
        pattiContainer.appendChild(clearButton);

        // Reset any previously stored Patti selections for a fresh start.
        pattiSelectedNumbers = [];
        cpSelectedNumbers = [];
        pattiStored = [];
        isCPMode = false;
    }

    // Handler when a Patti number box is clicked
    function pattiNumberClicked(num) {
        if (isCPMode) {
            // In CP mode, allow selection in any order (prevent duplicate)
            if (!cpSelectedNumbers.includes(num)) {
                cpSelectedNumbers.push(num);
                updatePattiCpSelectedDisplay();
            }
        } else {
            // Normal Patti mode: user selects exactly 3 numbers
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

    // Update stored Patti display in the Patti container
    function updatePattiStoreArea() {
        const storedDisplay = document.getElementById('pattiStoreArea');
        storedDisplay.textContent = 'Stored Pattis: ' + pattiStored.join(', ');
    }

    // Toggle CP mode for Patti selection
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

    // Update CP selected numbers display for Patti
    function updatePattiCpSelectedDisplay() {
        const cpSelectedDisplay = document.getElementById('pattiCpSelectedDisplay');
        let displayNumbers = cpSelectedNumbers.map(n => n === 10 ? '0' : n);
        cpSelectedDisplay.textContent = 'CP Selected Numbers: ' + displayNumbers.join(', ');
    }

    // When CP OK is pressed, generate unique 3-digit combinations from cpSelectedNumbers.
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

    // Generate unique 3-digit combinations from an array of numbers.
    // Each combination is sorted (ascending) and internal '10' is displayed as '0'.
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

    // Clear the last stored Patti entry
    function pattiClearLast() {
        if (pattiStored.length > 0) {
            pattiStored.pop();
            updatePattiStoreArea();
        } else {
            alert('No Patti to clear!');
        }
    }

    // ========= End Patti Functionality =========

    // ========= Existing Single Number Selection =========
    document.getElementById('singleButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            showSingleSelection();
        }
    });

    function showSingleSelection() {
        singleSelectDiv.style.display = 'block';
        singleSelectDiv.innerHTML = ''; // Clear previous numbers
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
            const selectedNumbers = singleSelectDiv.querySelectorAll('.singleNumButton.selected');
            const selectedValues = Array.from(selectedNumbers).map(btn => parseInt(btn.textContent));
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

    // ========= Modify Existing Button Listeners =========
    document.getElementById('pattiButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            // Instead of alerting, show the Patti functionality container.
            showPattiContainer();
        }
    });

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
