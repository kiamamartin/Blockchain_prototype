document.getElementById('vote-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const candidate = document.getElementById('candidate').value;
    const messageDiv = document.getElementById('vote-message');
    
    if (!candidate) {
        messageDiv.textContent = 'Please select a candidate.';
        return;
    }

    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageDiv.textContent = 'Vote submitted successfully!';
        } else {
            messageDiv.textContent = 'Failed to submit vote.';
        }
    })
    .catch(error => {
        messageDiv.textContent = 'Error: ' + error.message;
    });
});

document.getElementById('fetch-blockchain').addEventListener('click', function() {
    fetch('/blockchain')
    .then(response => response.json())
    .then(data => {
        document.getElementById('blockchain-data').textContent = JSON.stringify(data, null, 4);
    })
    .catch(error => {
        document.getElementById('blockchain-data').textContent = 'Error: ' + error.message;
    });
});
