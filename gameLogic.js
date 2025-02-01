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

    // Single Number Selection
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

    document.getElementById('pattiButton').addEventListener('click', () => {
        showLoginForm();
        if (isLoggedIn) {
            alert("Patti button clicked (Simulated).");
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