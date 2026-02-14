// script.js

// Complete QR Code Generation Functionality

// Configuration constants
const MAX_URL_DISPLAY_LENGTH = 50;
const TRUNCATED_URL_LENGTH = 47;
const LOADING_DISPLAY_DELAY_MS = 100;
const DOWNLOAD_DELAY_MS = 300;
const QR_CODES_PER_PAGE = 4;
const MESSAGE_DISPLAY_DURATION_MS = 3000;

// Store generated QR codes
let generatedQRCodes = [];

// Function to parse links from input (separated by lines or commas)
function getLinksFromInput() {
    const input = document.getElementById('links-input').value.trim();
    if (!input) return [];
    
    // Split by new lines and commas, then filter and clean
    const links = input
        .split(/[\n,]+/)
        .map(link => link.trim())
        .filter(link => link.length > 0);
    
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

// Function to show loading state
function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (show) {
        loadingEl.classList.remove('hidden');
    } else {
        loadingEl.classList.add('hidden');
    }
}

// Function to generate QR codes for multiple links
function generateQRCode(links) {
    if (!links || links.length === 0) {
        alert('Por favor, ingresa al menos un enlace válido');
        return;
    }
    
    showLoading(true);
    
    // Clear previous QR codes
    const container = document.getElementById('qr-container');
    container.innerHTML = '';
    generatedQRCodes = [];
    
    // Get configuration
    const size = parseInt(document.getElementById('qr-size').value);
    const colorDark = document.getElementById('qr-color').value;
    const colorLight = document.getElementById('qr-bg-color').value;
    
    // Generate QR codes with slight delay to show loading
    setTimeout(() => {
        let validCount = 0;
        
        links.forEach((link, index) => {
            if (!isValidURL(link)) {
                console.warn(`URL inválida ignorada: ${link}`);
                return;
            }
            
            validCount++;
            
            // Create container for each QR code
            const qrItem = document.createElement('div');
            qrItem.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col items-center';
            qrItem.setAttribute('data-index', index);
            
            // Create title
            const title = document.createElement('div');
            title.className = 'text-sm font-medium text-gray-700 mb-2 text-center break-all';
            title.textContent = `QR #${validCount}`;
            qrItem.appendChild(title);
            
            // Create QR code container
            const qrDiv = document.createElement('div');
            qrDiv.id = `qr-${index}`;
            qrDiv.className = 'mb-4 flex justify-center';
            qrItem.appendChild(qrDiv);
            
            // Create URL display
            const urlText = document.createElement('div');
            urlText.className = 'text-xs text-gray-500 mb-3 text-center break-all max-w-full';
            urlText.textContent = link.length > MAX_URL_DISPLAY_LENGTH ? link.substring(0, TRUNCATED_URL_LENGTH) + '...' : link;
            qrItem.appendChild(urlText);
            
            // Create buttons container
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex gap-2 w-full';
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition';
            downloadBtn.innerHTML = '⬇️ Descargar';
            downloadBtn.onclick = () => downloadQRCode(index);
            buttonsDiv.appendChild(downloadBtn);
            
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition';
            copyBtn.innerHTML = '📋 Copiar';
            copyBtn.onclick = () => copyQRCode(index);
            buttonsDiv.appendChild(copyBtn);
            
            qrItem.appendChild(buttonsDiv);
            container.appendChild(qrItem);
            
            // Generate QR code using QRCode.js
            try {
                const qrcode = new QRCode(qrDiv, {
                    text: link,
                    width: size,
                    height: size,
                    colorDark: colorDark,
                    colorLight: colorLight,
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                // Store reference
                generatedQRCodes.push({
                    index: index,
                    link: link,
                    qrDiv: qrDiv,
                    title: `QR #${validCount}`
                });
            } catch (error) {
                console.error(`Error generando QR para ${link}:`, error);
                qrDiv.innerHTML = '<p class="text-red-500 text-sm">Error al generar QR</p>';
            }
        });
        
        showLoading(false);
        
        if (validCount === 0) {
            alert('No se encontraron URLs válidas');
        } else {
            // Enable download all and print buttons
            document.getElementById('download-all-btn').disabled = false;
            document.getElementById('print-btn').disabled = false;
        }
    }, LOADING_DISPLAY_DELAY_MS);
}

// Function to download individual QR code as PNG
function downloadQRCode(index) {
    const qrDiv = document.getElementById(`qr-${index}`);
    if (!qrDiv) return;
    
    try {
        // Get the canvas element generated by QRCode.js
        const canvas = qrDiv.querySelector('canvas');
        if (!canvas) {
            alert('Error: No se pudo obtener el código QR');
            return;
        }
        
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `qr-code-${index + 1}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show feedback
        showTemporaryMessage('QR descargado correctamente', 'success');
    } catch (error) {
        console.error('Error al descargar QR:', error);
        alert('Error al descargar el código QR');
    }
}

// Function to copy QR code to clipboard
async function copyQRCode(index) {
    const qrDiv = document.getElementById(`qr-${index}`);
    if (!qrDiv) return;
    
    try {
        const canvas = qrDiv.querySelector('canvas');
        if (!canvas) {
            alert('Error: No se pudo obtener el código QR');
            return;
        }
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                // Try to use Clipboard API with ClipboardItem
                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    showTemporaryMessage('QR copiado al portapapeles', 'success');
                } else {
                    // Fallback: copy data URL as text
                    const dataURL = canvas.toDataURL('image/png');
                    await navigator.clipboard.writeText(dataURL);
                    showTemporaryMessage('URL del QR copiada al portapapeles', 'success');
                }
            } catch (err) {
                console.error('Error al copiar:', err);
                // Final fallback: show message with instructions
                alert('No se pudo copiar automáticamente. Por favor, haz clic derecho en el QR y selecciona "Copiar imagen"');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error al copiar QR:', error);
        alert('Error al copiar el código QR');
    }
}

// Function to download all QR codes
function downloadAllQRCodes() {
    if (generatedQRCodes.length === 0) {
        alert('No hay códigos QR para descargar');
        return;
    }
    
    showLoading(true);
    
    // Download each QR code with a small delay
    generatedQRCodes.forEach((qr, idx) => {
        setTimeout(() => {
            downloadQRCode(qr.index);
            if (idx === generatedQRCodes.length - 1) {
                showLoading(false);
                showTemporaryMessage(`${generatedQRCodes.length} códigos QR descargados`, 'success');
            }
        }, idx * DOWNLOAD_DELAY_MS);
    });
}

// Function to clear all QR codes
function clearAll() {
    const container = document.getElementById('qr-container');
    container.innerHTML = '';
    generatedQRCodes = [];
    document.getElementById('links-input').value = '';
    document.getElementById('download-all-btn').disabled = true;
    document.getElementById('print-btn').disabled = true;
    showTemporaryMessage('Todo limpiado', 'success');
}

// Function to print QR codes
function printQRCodes() {
    if (generatedQRCodes.length === 0) {
        alert('No hay códigos QR para imprimir');
        return;
    }
    
    const printContainer = document.getElementById('print-container');
    printContainer.innerHTML = '';
    
    // Create pages with QR codes in a grid layout
    const qrPerPage = QR_CODES_PER_PAGE;
    const totalPages = Math.ceil(generatedQRCodes.length / qrPerPage);
    
    for (let page = 0; page < totalPages; page++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'print-page';
        
        const start = page * qrPerPage;
        const end = Math.min(start + qrPerPage, generatedQRCodes.length);
        
        for (let i = start; i < end; i++) {
            const qr = generatedQRCodes[i];
            const qrDiv = document.getElementById(`qr-${qr.index}`);
            const canvas = qrDiv.querySelector('canvas');
            
            if (canvas) {
                const printItem = document.createElement('div');
                printItem.className = 'qr-print-item';
                
                const titleEl = document.createElement('div');
                titleEl.className = 'qr-print-title';
                titleEl.textContent = qr.title;
                printItem.appendChild(titleEl);
                
                const qrCodeDiv = document.createElement('div');
                qrCodeDiv.className = 'qr-print-code';
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                qrCodeDiv.appendChild(img);
                printItem.appendChild(qrCodeDiv);
                
                const urlEl = document.createElement('div');
                urlEl.className = 'qr-print-url';
                urlEl.textContent = qr.link;
                printItem.appendChild(urlEl);
                
                pageDiv.appendChild(printItem);
            }
        }
        
        printContainer.appendChild(pageDiv);
    }
    
    // Trigger print dialog
    window.print();
}

// Function to show temporary message
function showTemporaryMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white font-medium`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, MESSAGE_DISPLAY_DURATION_MS);
}

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Generate button
    document.getElementById('generate-btn').addEventListener('click', function() {
        const links = getLinksFromInput();
        generateQRCode(links);
    });
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearAll);
    
    // Download all button
    document.getElementById('download-all-btn').addEventListener('click', downloadAllQRCodes);
    
    // Print button
    document.getElementById('print-btn').addEventListener('click', printQRCodes);
    
    // Enable Enter key to generate
    document.getElementById('links-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            const links = getLinksFromInput();
            generateQRCode(links);
        }
    });
});