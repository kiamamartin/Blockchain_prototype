const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain'); // Adjust to your actual blockchain class
const app = express();
const PORT = 3001;

let votingBlockchain = new Blockchain();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// Generate key pairs (this should ideally be done when a user registers)
let voterKeys = votingBlockchain.generateKeyPair();

// Endpoint to cast a vote
app.post('/vote', (req, res) => {
    const { candidate } = req.body;

    if (!candidate) {
        return res.json({ success: false, message: 'Candidate is required' });
    }

    // Encrypt the vote using the voter's private key
    const encryptedVote = votingBlockchain.encryptVote(voterKeys.privateKey, { candidate });

    // Add the encrypted vote to the blockchain
    const success = votingBlockchain.addBlock(voterKeys.publicKey, voterKeys.privateKey, { candidate });

    if (success) {
        res.json({ success: true, message: 'Vote added successfully' });
    } else {
        res.json({ success: false, message: 'Voter has already voted' });
    }
});

// Endpoint to get the blockchain
app.get('/blockchain', (req, res) => {
    res.json(votingBlockchain);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
