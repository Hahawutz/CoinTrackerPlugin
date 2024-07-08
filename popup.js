//const baseURL = 'https://api-sepolia.etherscan.io/api';
const baseURL = 'https://api.etherscan.io/api';

document.getElementById('walletForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const walletAddress = document.getElementById('walletAddress').value.trim();
    console.log('Wallet address:', walletAddress);
    const apiKey = 'HPAT57U6XV72B3U6E5H461VKMS5H47NE42'; 

    async function getTransactions(walletAddress, apiKey) {
        const url = `${baseURL}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseob = await response.json();
            transactions = responseob.result;

            const tableBody = document.getElementById('transactionBody');
            tableBody.innerHTML = '';

            let taxFreeCoins = 0;
            let taxableSoldCoins = 0;

            transactions.forEach((tx) => {
                const value = parseInt(tx.value) / 1e18;
                const fromAddress = tx.from.toLowerCase();
                const toAddress = tx.to.toLowerCase();
                const timeStamp = parseInt(tx.timeStamp) * 1000;
                const date = new Date(timeStamp);
                const holdingPeriod = (Date.now() - timeStamp) / (1000 * 60 * 60 * 24 * 365);
                const isTaxFree = holdingPeriod > 1;

                let transactionType, taxFreeStatus;
                if (fromAddress === walletAddress.toLowerCase()) {
                    transactionType = 'Outgoing (Sale)';
                    taxFreeStatus = isTaxFree ? 'Yes' : 'No';
                    if (isTaxFree) {
                        taxFreeCoins += value;
                    } else {
                        taxableSoldCoins += value;
                    }
                } else if (toAddress === walletAddress.toLowerCase()) {
                    transactionType = 'Incoming (Purchase)';
                    taxFreeStatus = 'N/A'; 
                } else {
                    transactionType = 'Internal Transfer';
                    taxFreeStatus = 'N/A';
                }

                // Neue Zeile zur Tabelle hinzufügen
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                  <td>${date.toLocaleDateString()}</td>
                  <td>${value.toFixed(2)}</td>
                  <td>${transactionType}</td>
                  <td>${taxFreeStatus}</td>
                `;
                tableBody.appendChild(newRow);
            });

            document.getElementById('taxFreeCoins').innerHTML = `<strong>Tax Free Coins:</strong> <span>${taxFreeCoins.toFixed(2)}</span> ETH`;
            document.getElementById('taxableSoldCoins').innerHTML = `<strong>Taxable Sold Coins:</strong> <span>${taxableSoldCoins.toFixed(2)}</span> ETH`;


        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Error fetching transactions. Please check your wallet address and API key.');
        }
    }
    getTransactions(walletAddress, apiKey);
});
