document.getElementById('generateKeysBtn').addEventListener('click', () => {
    fetch('/generate-keys')
        .then(response => response.json())
        .then(data => {
            document.getElementById('publicKey').textContent = data.publicKey;
            document.getElementById('privateKey').textContent = data.privateKey;
        })
        .catch(error => console.error('Error generating keys:', error));
});

document.getElementById('castVoteBtn').addEventListener('click', () => {
    const publicKey = document.getElementById('publicKey').textContent;
    const privateKey = document.getElementById('privateKey').textContent;
    const candidate = document.getElementById('candidateSelect').value;

    if (!publicKey || !privateKey) {
        alert('Please generate keys first.');
        return;
    }

    const voteData = { publicKey, privateKey, candidate };

    fetch('/cast-vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Vote cast successfully!');
            displayBlockchain();
        } else {
            alert('Error casting vote: ' + data.message);
        }
    })
    .catch(error => console.error('Error casting vote:', error));
});

function displayBlockchain() {
    fetch('/get-blockchain')
        .then(response => response.json())
        .then(data => {
            document.getElementById('blockchainDisplay').textContent = JSON.stringify(data, null, 4);
        })
        .catch(error => console.error('Error fetching blockchain:', error));
}

// Initial display of blockchain
displayBlockchain();
