document.addEventListener('DOMContentLoaded', () => {
    let wallet = 500;
    let isLoggedIn = false;

    // --- Existing functionality ---
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

    document.getElementById('playButton').addEventListener('click', showLoginForm);
    document.getElementById('singleButton').addEventListener('click', showLoginForm);
    document.getElementById('pattiButton').addEventListener('click', showLoginForm);
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

    // --- Single Number Selection (existing) ---
    const singleSelectDiv = document.getElementById('singleSelect');
    document.getElementById('singleButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
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
                const selectedValues = Array.from(selectedNumbers).map(button => parseInt(button.textContent));
                const amount = parseInt(amountInput.value);

                if (selectedValues.length > 0 && !isNaN(amount) && amount > 0) {
                    const totalAmount = selectedValues.length * amount;
                    if (wallet >= totalAmount) {
                        wallet -= totalAmount;
                        document.getElementById('walletDisplay').textContent = `Wallet: $${wallet}`;
                        alert(`Bet placed for ${selectedValues.join(', ')} with amount $${amount} each. Total deducted: $${totalAmount}`);
                        singleSelectDiv.style.display = 'none'; // Hide after submit
                    } else {
                        alert("Insufficient wallet balance.");
                    }
                } else {
                    alert("Please select at least one number and enter a valid amount.");
                }
            });
            singleSelectDiv.appendChild(submitButton);
        }
    });

    // --- Patti Button Event Integration ---
    // Replace the simulated alert with showing the Patti functionality.
    document.getElementById('pattiButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            // Instead of a simulated alert, reveal the Patti container and initialize the Patti UI.
            document.getElementById("pattiContainer").style.display = "block";
            showPattiBoxes();
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

    // --- Patti Functionality ---
    // The Patti container is assumed to exist in the HTML (see combined HTML file).
    // We now define all functions for Patti mode.

    // Variables for Patti functionality
    let selectedNumbers = [];    // For normal Patti mode (3 numbers in ascending order)
    let cpSelectedNumbers = [];  // For CP mode (numbers in any order; minimum 4 required)
    let storedPattis = [];       // Final stored pattis (each is a 3-digit string)
    let isCPMode = false;        // Flag for CP mode

    // Build the Patti number boxes inside the pattiContainer's boxContainer
    function showPattiBoxes() {
        const boxContainer = document.querySelector("#pattiContainer #boxContainer");
        boxContainer.innerHTML = ""; // Clear previous boxes

        // Create boxes for numbers 1 to 9
        for (let i = 1; i <= 9; i++) {
            let box = document.createElement("div");
            box.className = "box patti-box";
            box.textContent = i;
            box.onclick = function() { numberClicked(i); };
            boxContainer.appendChild(box);
        }
        // Create the 10th box: displayed as "0" but represents 10 internally
        let boxZero = document.createElement("div");
        boxZero.className = "box patti-box";
        boxZero.textContent = "0";
        boxZero.onclick = function() { numberClicked(10); };
        boxContainer.appendChild(boxZero);

        // Show Patti controls (within pattiContainer)
        document.querySelector("#pattiContainer #cpButton").style.display = "inline-block";
        document.querySelector("#pattiContainer #amountSection").style.display = "block";
        document.querySelector("#pattiContainer #submitButton").style.display = "inline-block";
        document.querySelector("#pattiContainer #clearButton").style.display = "inline-block";
        document.querySelector("#pattiContainer #storeArea").style.display = "block";
        // Initially hide CP selected display and CP OK button
        document.querySelector("#pattiContainer #cpSelectedDisplay").style.display = "none";
        document.querySelector("#pattiContainer #cpOkButton").style.display = "none";
    }

    // Called when a Patti number box is clicked (works in both normal and CP modes)
    function numberClicked(num) {
        if (isCPMode) {
            // In CP mode, allow any order; prevent duplicate selection
            if (!cpSelectedNumbers.includes(num)) {
                cpSelectedNumbers.push(num);
                updateCPSelectedDisplay();
            }
        } else {
            // Normal mode: allow exactly 3 numbers
            if (selectedNumbers.length < 3) {
                selectedNumbers.push(num);
            }
            if (selectedNumbers.length === 3) {
                // Check if numbers are in ascending order
                let sorted = [...selectedNumbers].sort((a, b) => a - b);
                if (JSON.stringify(selectedNumbers) === JSON.stringify(sorted)) {
                    let patti = selectedNumbers.join("");
                    let pattiDisplay = patti.replace("10", "0");
                    storedPattis.push(pattiDisplay);
                    updateStoreArea();
                } else {
                    alert("Invalid Patti! Numbers should be in ascending order.");
                }
                selectedNumbers = []; // Reset for next attempt
            }
        }
    }

    // Update the CP Selected Numbers display (for CP mode)
    function updateCPSelectedDisplay() {
        const cpSelectedDisplay = document.getElementById("cpSelectedDisplay");
        let displayNumbers = cpSelectedNumbers.map(n => n === 10 ? "0" : n);
        cpSelectedDisplay.textContent = "CP Selected Numbers: " + displayNumbers.join(", ");
        cpSelectedDisplay.style.display = "block";
    }

    // Update the Stored Pattis display (inside pattiContainer)
    function updateStoreArea() {
        document.getElementById("storeArea").textContent = "Stored Pattis: " + storedPattis.join(", ");
    }

    // Toggle CP mode on/off in the Patti container
    function toggleCP() {
        const cpButton = document.getElementById("cpButton");
        const cpOkButton = document.getElementById("cpOkButton");
        const cpSelectedDisplay = document.getElementById("cpSelectedDisplay");

        isCPMode = !isCPMode;
        if (isCPMode) {
            cpButton.classList.add("selected");
            cpOkButton.style.display = "inline-block"; // Show CP OK button in CP mode
            cpSelectedDisplay.style.display = "block";   // Show CP selected display
            // Clear previous CP selection
            cpSelectedNumbers = [];
            updateCPSelectedDisplay();
        } else {
            cpButton.classList.remove("selected");
            cpOkButton.style.display = "none";
            cpSelectedDisplay.style.display = "none";
            cpSelectedNumbers = [];
        }
    }

    // When CP OK is pressed, generate unique 3-digit combinations from cpSelectedNumbers.
    function cpOkButton() {
        if (cpSelectedNumbers.length < 4) {
            alert("Select at least 4 numbers for CP mode.");
            return;
        }
        let combinations = generateUniqueCombinations(cpSelectedNumbers);
        combinations.forEach(combo => {
            if (!storedPattis.includes(combo)) {
                storedPattis.push(combo);
            }
        });
        updateStoreArea();
        // Clear CP selection after generating combinations
        cpSelectedNumbers = [];
        updateCPSelectedDisplay();
    }

    // Generate unique 3-digit combinations from an array of numbers.
    // Each combination is sorted (ascending) and internal 10 is displayed as "0".
    function generateUniqueCombinations(numbers) {
        let combos = [];
        let n = numbers.length;
        for (let i = 0; i < n - 2; i++) {
            for (let j = i + 1; j < n - 1; j++) {
                for (let k = j + 1; k < n; k++) {
                    let arr = [numbers[i], numbers[j], numbers[k]].sort((a, b) => a - b);
                    let combo = arr.join("");
                    let comboDisplay = combo.replace("10", "0");
                    if (!combos.includes(comboDisplay)) {
                        combos.push(comboDisplay);
                    }
                }
            }
        }
        return combos;
    }

    // Calculate the total based on stored pattis and the entered amount (minimum 10 per Patti)
    function calculateTotal() {
        let amountInput = parseInt(document.getElementById("amountInput").value);
        let amountPerPatti = (amountInput < 10) ? 10 : amountInput;
        let totalAmount = storedPattis.length * amountPerPatti;
        alert(`Total Amount: ₹${totalAmount}`);
        alert("Pattis submitted successfully!");
        storedPattis = [];
        updateStoreArea();
    }

    // Clear the last stored patti (if any)
    function clearLastPatti() {
        if (storedPattis.length > 0) {
            storedPattis.pop();
            updateStoreArea();
        } else {
            alert("No Patti to clear!");
        }
    }
});
