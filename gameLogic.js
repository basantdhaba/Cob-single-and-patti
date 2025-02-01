document.addEventListener('DOMContentLoaded', () => {
    let wallet = 500;
    let isLoggedIn = false;

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

    // Show Login Form if not logged in
    document.getElementById('playButton').addEventListener('click', showLoginForm);
    document.getElementById('singleButton').addEventListener('click', () => {
        if (!isLoggedIn) {
            showLoginForm();
        } else {
            showSingleSelection();
        }
    });
    document.getElementById('pattiButton').addEventListener('click', () => {
        if (!isLoggedIn) {
            showLoginForm();
        } else {
            showPattiSelection();
        }
    });
    document.getElementById('juriButton').addEventListener('click', showLoginForm);

    // Login Process
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

    // Add Money Function
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

    // === SINGLE NUMBER SELECTION ===
    function showSingleSelection() {
        const singleSelectDiv = document.getElementById('singleSelect');
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
            const selectedNumbers = Array.from(document.querySelectorAll('.singleNumButton.selected'))
                .map(btn => btn.textContent);
            const betAmount = parseInt(amountInput.value);

            if (selectedNumbers.length === 0 || isNaN(betAmount) || betAmount <= 0) {
                alert('Select at least one number and enter a valid amount.');
                return;
            }

            if (wallet >= betAmount) {
                wallet -= betAmount;
                showWallet();
                alert(`Bet placed on ${selectedNumbers.join(', ')} for $${betAmount}`);
            } else {
                alert('Insufficient balance.');
            }
        });

        singleSelectDiv.appendChild(submitButton);
    }

    // === PATTI SELECTION FUNCTIONALITY ===
    function showPattiSelection() {
        const pattiContainer = document.getElementById('pattiContainer');
        pattiContainer.style.display = 'block';
        pattiContainer.innerHTML = ''; // Clear previous data

        const pattiInput = document.createElement('input');
        pattiInput.type = 'text';
        pattiInput.placeholder = 'Enter 3-digit number (e.g., 123)';
        pattiContainer.appendChild(pattiInput);

        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = 'Enter Bet Amount';
        pattiContainer.appendChild(amountInput);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Patti';
        submitButton.addEventListener('click', () => {
            const pattiNumber = pattiInput.value;
            const betAmount = parseInt(amountInput.value);

            if (!/^\d{3}$/.test(pattiNumber)) {
                alert('Please enter a valid 3-digit number.');
                return;
            }

            if (isNaN(betAmount) || betAmount <= 0) {
                alert('Enter a valid betting amount.');
                return;
            }

            if (wallet >= betAmount) {
                wallet -= betAmount;
                showWallet();
                alert(`Bet placed on Patti ${pattiNumber} for $${betAmount}`);
            } else {
                alert('Insufficient balance.');
            }
        });

        pattiContainer.appendChild(submitButton);
    }
});
