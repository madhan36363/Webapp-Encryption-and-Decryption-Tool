// Utility function to generate a random key
function generateKey() {
    return crypto.getRandomValues(new Uint8Array(32)); // 256-bit AES key
}

// Function to encrypt a file using the generated key
async function encryptFile(file) {
    const key = generateKey(); // Generate encryption key
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const fileData = await file.arrayBuffer();

    // Encrypt the file data
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt"]),
        fileData
    );

    // Create a new Uint8Array to hold IV + encrypted data + key
    const result = new Uint8Array(iv.length + encryptedData.byteLength + key.length);
    result.set(iv); // Set IV at the beginning
    result.set(new Uint8Array(encryptedData), iv.length); // Set encrypted data after IV
    result.set(key, iv.length + encryptedData.byteLength); // Set the key at the end

    return result;
}

// Function to decrypt a file using the generated key
async function decryptFile(file) {
    const fileData = await file.arrayBuffer();
    
    // Extract the IV, encrypted data, and key from the file
    const iv = fileData.slice(0, 12); // First 12 bytes for IV
    const encryptedData = fileData.slice(12, fileData.byteLength - 32); // Next segment for encrypted data
    const key = fileData.slice(fileData.byteLength - 32); // Last 32 bytes for key

    try {
        // Decrypt the data using the extracted key and IV
        return await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]),
            encryptedData
        );
    } catch (e) {
        throw new Error("Decryption failed. Check your file and try again.");
    }
}

// Handling encrypt form submission
document.getElementById('encrypt-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('encrypt-file').files[0];

    if (fileInput) {
        try {
            const encryptedData = await encryptFile(fileInput);

            // Create blob for encrypted file
            const encryptedBlob = new Blob([encryptedData], { type: "application/octet-stream" });
            const encryptedLink = document.getElementById('encrypted-download');
            encryptedLink.href = URL.createObjectURL(encryptedBlob);
            encryptedLink.download = `${fileInput.name}.enc`;
            encryptedLink.style.display = 'block';
            encryptedLink.textContent = 'Download Encrypted File';
        } catch (error) {
            alert('Encryption failed: ' + error.message);
        }
    }
});

// Handling decrypt form submission
document.getElementById('decrypt-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('decrypt-file').files[0];

    if (fileInput) {
        try {
            const decryptedData = await decryptFile(fileInput);

            // Create blob for decrypted file
            const decryptedBlob = new Blob([decryptedData], { type: "application/octet-stream" });
            const decryptedLink = document.getElementById('decrypted-download');
            decryptedLink.href = URL.createObjectURL(decryptedBlob);
            decryptedLink.download = fileInput.name.replace('.enc', '');
            decryptedLink.style.display = 'block';
            decryptedLink.textContent = 'Download Decrypted File';
        } catch (error) {
            alert('Decryption failed: ' + error.message);
        }
    }
});
