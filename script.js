// script.js

// Get DOM elements
const linksInput = document.getElementById('links-input');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const printBtn = document.getElementById('print-btn');
const qrContainer = document.getElementById('qr-container');
const printContainer = document.getElementById('print-container');
const loadingDiv = document.getElementById('loading');
const qrSizeSelect = document.getElementById('qr-size');
const qrColorInput = document.getElementById('qr-color');
const qrBgColorInput = document.getElementById('qr-bg-color');

// Store generated QR codes
let generatedQRCodes = [];

// Function to parse links from textarea input
function getLinksFromInput() {
    const input = linksInput.value.trim();
    if (!input) return [];
    
    // Split by newlines and commas, then filter valid URLs
    const links = input
        .split(/[\n,]+/)
        .map(link => link.trim())
        .filter(link => link.length > 0)
        .filter(link => isValidURL(link));
    
    return links;
}

// Function to validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Function to generate QR codes for multiple links
function generateQRCode() {
    const links = getLinksFromInput();
    
    if (links.length === 0) {
        alert('Por favor, ingresa al menos un enlace válido.');
        return;
    }
    
    // Show loading
    loadingDiv.classList.remove('hidden');
    
    // Clear previous QR codes
    qrContainer.innerHTML = '';
    printContainer.innerHTML = '';
    generatedQRCodes = [];
    
    // Get configuration
    const size = parseInt(qrSizeSelect.value);
    const color = qrColorInput.value;
    const bgColor = qrBgColorInput.value;
    
    // Generate QR codes with a slight delay for better UX
    setTimeout(() => {
        links.forEach((link, index) => {
            createQRCodeCard(link, index, size, color, bgColor);
        });
        
        // Hide loading
        loadingDiv.classList.add('hidden');
        
        // Enable download and print buttons
        downloadAllBtn.disabled = false;
        printBtn.disabled = false;
    }, 100);
}

// Function to create a QR code card
function createQRCodeCard(link, index, size, color, bgColor) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-4';
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'text-sm font-semibold text-gray-700 mb-2 truncate';
    title.textContent = `QR #${index + 1}`;
    title.title = link;
    card.appendChild(title);
    
    // Create QR code container
    const qrDiv = document.createElement('div');
    qrDiv.id = `qr-${index}`;
    qrDiv.className = 'flex justify-center mb-3 bg-white p-2';
    card.appendChild(qrDiv);
    
    // Generate QR code
    const qrCode = new QRCode(qrDiv, {
        text: link,
        width: size,
        height: size,
        colorDark: color,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Store for later use
    generatedQRCodes.push({
        link: link,
        element: qrDiv,
        index: index
    });
    
    // Create URL display
    const urlDisplay = document.createElement('p');
    urlDisplay.className = 'text-xs text-gray-500 mb-3 break-all';
    urlDisplay.textContent = link;
    card.appendChild(urlDisplay);
    
    // Create buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex gap-2';
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition';
    downloadBtn.innerHTML = '⬇️ Descargar';
    downloadBtn.onclick = () => downloadQRCode(index);
    buttonsDiv.appendChild(downloadBtn);
    
    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.onclick = () => copyToClipboard(index);
    buttonsDiv.appendChild(copyBtn);
    
    card.appendChild(buttonsDiv);
    qrContainer.appendChild(card);
    
    // Also create a print version
    createPrintVersion(link, index, qrDiv);
}

// Function to create print version
function createPrintVersion(link, index, qrDiv) {
    // Create or get the current print page
    let currentPage = printContainer.lastElementChild;
    if (!currentPage || currentPage.children.length >= 6) {
        currentPage = document.createElement('div');
        currentPage.className = 'print-page';
        printContainer.appendChild(currentPage);
    }
    
    const printItem = document.createElement('div');
    printItem.className = 'qr-print-item';
    
    const printTitle = document.createElement('div');
    printTitle.className = 'qr-print-title';
    printTitle.textContent = `QR #${index + 1}`;
    printItem.appendChild(printTitle);
    
    const printQr = document.createElement('div');
    printQr.className = 'qr-print-code';
    printQr.innerHTML = qrDiv.innerHTML;
    printItem.appendChild(printQr);
    
    const printUrl = document.createElement('div');
    printUrl.className = 'qr-print-url';
    printUrl.textContent = link;
    printItem.appendChild(printUrl);
    
    currentPage.appendChild(printItem);
}

// Function to download individual QR code as PNG
function downloadQRCode(index) {
    const qrData = generatedQRCodes[index];
    const canvas = qrData.element.querySelector('canvas');
    
    if (canvas) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `qr-code-${index + 1}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
}

// Function to copy QR code to clipboard
function copyToClipboard(index) {
    const qrData = generatedQRCodes[index];
    const canvas = qrData.element.querySelector('canvas');
    
    if (canvas) {
        canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item])
                .then(() => {
                    alert('Código QR copiado al portapapeles');
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                    alert('No se pudo copiar al portapapeles. Intenta descargarlo.');
                });
        });
    }
}

// Function to download all QR codes
function downloadAllQRCodes() {
    if (generatedQRCodes.length === 0) {
        alert('No hay códigos QR para descargar.');
        return;
    }
    
    generatedQRCodes.forEach((qrData, index) => {
        setTimeout(() => {
            downloadQRCode(index);
        }, index * 200); // Stagger downloads to avoid browser blocking
    });
}

// Function to clear all
function clearAll() {
    linksInput.value = '';
    qrContainer.innerHTML = '';
    printContainer.innerHTML = '';
    generatedQRCodes = [];
    downloadAllBtn.disabled = true;
    printBtn.disabled = true;
}

// Function to print QR codes
function printQRCodes() {
    if (generatedQRCodes.length === 0) {
        alert('No hay códigos QR para imprimir.');
        return;
    }
    window.print();
}

// Event listeners
generateBtn.addEventListener('click', generateQRCode);
clearBtn.addEventListener('click', clearAll);
downloadAllBtn.addEventListener('click', downloadAllQRCodes);
printBtn.addEventListener('click', printQRCodes);

// Allow Enter key in textarea to generate
linksInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        generateQRCode();
    }
});