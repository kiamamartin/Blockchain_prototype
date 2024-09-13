const crypto = require('crypto');

class Block {
    constructor(blockid, previousHash, data) {
        this.blockid = blockid;
        this.timestamp = Date.now();
        this.data = data;
        this.prevHash = previousHash || '0';
        this.blockhash = this.getHash();
    }

    getHash() {
        return crypto.createHash('sha256').update(
            this.blockid + this.timestamp + this.prevHash + JSON.stringify(this.data)
        ).digest('hex');
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.voters = new Set(); // Track voters to prevent double voting
    }

    createGenesisBlock() {
        return new Block(0, '0', { message: "Genesis Block" });
    }

    // Generate a public/private key pair for a voter
    generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // 2048-bit encryption
        });
        return { publicKey, privateKey };
    }

    // Encrypt vote data using the voter's private key
    encryptVote(privateKey, data) {
        const encryptedData = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(data)));
        return encryptedData.toString('base64'); // Return as base64 string
        console.log(voteData);

    }

    // Decrypt vote data using the voter's public key
    decryptVote(publicKey, encryptedData) {
        const decryptedData = crypto.publicDecrypt(publicKey, Buffer.from(encryptedData, 'base64'));
        return JSON.parse(decryptedData.toString()); // Convert decrypted data back to object
    }

    // Add a block (vote) to the chain
    addBlock(voterPublicKey, voterPrivateKey, voteData) {
        if (this.voters.has(voterPublicKey)) {
            console.log(`Voter has already voted!`);
            return false;
        }

        const blockid = this.chain.length;
        const previousHash = this.chain[this.chain.length - 1].blockhash;

        // Encrypt the vote data before adding to the block
        const encryptedVote = this.encryptVote(voterPrivateKey, voteData);

        const newBlock = new Block(blockid, previousHash, { encryptedVote });
        this.chain.push(newBlock);
        this.voters.add(voterPublicKey);

        console.log(`Block added: ${JSON.stringify(newBlock, null, 4)}`);
        return true;
    }

    // Validate the blockchain
    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.blockhash !== currentBlock.getHash()) {
                return false;
            }

            if (currentBlock.prevHash !== previousBlock.blockhash) {
                return false;
            }
        }
        return true;
    }

    // Verify and decrypt vote from a specific block
    verifyVote(blockIndex, voterPublicKey) {
        const block = this.chain[blockIndex];
        const encryptedVote = block.data.encryptedVote;

        try {
            const vote = this.decryptVote(voterPublicKey, encryptedVote);
            console.log(`Decrypted Vote: `, vote);
            return vote;
        } catch (error) {
            console.log("Failed to verify or decrypt the vote.");
            return null;
        }
    }
}

const Myfirstblockchain = new BlockChain();

// Generate key pairs for two voters
const voter1Keys = Myfirstblockchain.generateKeyPair();
const voter2Keys = Myfirstblockchain.generateKeyPair();

// Example of adding encrypted votes to the blockchain
Myfirstblockchain.addBlock(voter1Keys.publicKey, voter1Keys.privateKey, { candidate: "Alice" });
Myfirstblockchain.addBlock(voter2Keys.publicKey, voter2Keys.privateKey, { candidate: "Bob" });

// Verify and decrypt the votes
Myfirstblockchain.verifyVote(1, voter1Keys.publicKey); // Decrypt vote from block 1 (voter 1)
Myfirstblockchain.verifyVote(2, voter2Keys.publicKey); // Decrypt vote from block 2 (voter 2)

console.log("Is blockchain valid? " + Myfirstblockchain.isValidChain());
console.log(JSON.stringify(Myfirstblockchain, null, 6));

module.exports = BlockChain;