class QRGenerator {
    constructor() {
        this.qrContainer = document.getElementById('qr-container');
        this.linksInput = document.getElementById('links-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.downloadAllBtn = document.getElementById('download-all-btn');
        this.printBtn = document.getElementById('print-btn');
        this.qrSizeSelect = document.getElementById('qr-size');
        this.qrColorInput = document.getElementById('qr-color');
        this.qrBgColorInput = document.getElementById('qr-bg-color');
        this.loadingDiv = document.getElementById('loading');
        this.printContainer = document.getElementById('print-container');
        
        this.qrCodes = [];
        this.initEventListeners();
    }

    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateQRCodes());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
        this.printBtn.addEventListener('click', () => this.printQRCodes());
    }

    showLoading() {
        this.loadingDiv.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingDiv.classList.add('hidden');
    }

    extractLinks() {
        const text = this.linksInput.value.trim();
        if (!text) return [];

        // Dividir por líneas nuevas Y por comas
        const lines = text.split('\n');
        const links = [];

        lines.forEach(line => {
            // Si la línea contiene comas, dividir por comas también
            if (line.includes(',')) {
                const commaSeparated = line.split(',');
                commaSeparated.forEach(link => {
                    const trimmedLink = link.trim();
                    if (trimmedLink && this.isValidURL(trimmedLink)) {
                        links.push(trimmedLink);
                    }
                });
            } else {
                const trimmedLine = line.trim();
                if (trimmedLine && this.isValidURL(trimmedLine)) {
                    links.push(trimmedLine);
                }
            }
        });

        return links;
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async generateQRCodes() {
        const links = this.extractLinks();
        
        if (links.length === 0) {
            alert('Por favor, ingresa al menos un enlace válido.');
            return;
        }

        this.showLoading();
        this.qrContainer.innerHTML = '';
        this.qrCodes = [];

        try {
            for (let i = 0; i < links.length; i++) {
                await this.generateSingleQR(links[i], i + 1);
            }
            
            this.downloadAllBtn.disabled = false;
            this.printBtn.disabled = false;
        } catch (error) {
            console.error('Error generando códigos QR:', error);
            alert('Hubo un error generando los códigos QR. Por favor, inténtalo de nuevo.');
        } finally {
            this.hideLoading();
        }
    }

    async generateSingleQR(url, index) {
        return new Promise((resolve, reject) => {
            try {
                // Crear un contenedor para el QR
                const qrContainer = document.createElement('div');
                const size = parseInt(this.qrSizeSelect.value);
                const color = this.qrColorInput.value;
                const bgColor = this.qrBgColorInput.value;

                // Generar el QR usando QRCode.js
                const qr = new QRCode(qrContainer, {
                    text: url,
                    width: size,
                    height: size,
                    colorDark: color,
                    colorLight: bgColor,
                    correctLevel: QRCode.CorrectLevel.M
                });

                // Esperar un momento para que se genere
                setTimeout(() => {
                    try {
                        // Buscar el elemento img o canvas generado
                        let qrElement = qrContainer.querySelector('img') || qrContainer.querySelector('canvas');
                        
                        if (qrElement) {
                            // Si es una imagen, convertir a canvas para la descarga
                            if (qrElement.tagName === 'IMG') {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                canvas.width = size;
                                canvas.height = size;

                                const img = qrElement;
                                img.onload = () => {
                                    ctx.drawImage(img, 0, 0, size, size);
                                    this.finishQRGeneration(canvas, qrElement, url, index);
                                    resolve();
                                };

                                if (img.complete) {
                                    ctx.drawImage(img, 0, 0, size, size);
                                    this.finishQRGeneration(canvas, qrElement, url, index);
                                    resolve();
                                }
                            } else {
                                // Es un canvas
                                this.finishQRGeneration(qrElement, qrElement, url, index);
                                resolve();
                            }
                        } else {
                            reject(new Error('No se pudo generar el código QR'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 200);

            } catch (error) {
                reject(error);
            }
        });
    }

    finishQRGeneration(canvasForDownload, displayElement, url, index) {
        // Crear el elemento contenedor
        const qrItem = this.createQRItem(displayElement, url, index);
        this.qrContainer.appendChild(qrItem);
        
        // Guardar la referencia del canvas para descarga
        this.qrCodes.push({
            canvas: canvasForDownload,
            url: url,
            index: index
        });
    }

    createQRItem(qrElement, url, index) {
        const qrItem = document.createElement('div');
        qrItem.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200';

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-gray-800 mb-2';
        title.textContent = `QR Code #${index}`;

        const qrElementContainer = document.createElement('div');
        qrElementContainer.className = 'flex justify-center mb-3';
        
        // Clonar el elemento QR y añadir estilos
        const clonedQR = qrElement.cloneNode(true);
        clonedQR.style.maxWidth = '100%';
        clonedQR.style.height = 'auto';
        qrElementContainer.appendChild(clonedQR);

        const urlDisplay = document.createElement('p');
        urlDisplay.className = 'text-sm text-gray-600 mb-3 break-all';
        urlDisplay.textContent = this.truncateUrl(url);

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200';
        downloadBtn.textContent = 'Descargar PNG';
        downloadBtn.addEventListener('click', () => this.downloadSingleByIndex(index));

        qrItem.appendChild(title);
        qrItem.appendChild(qrElementContainer);
        qrItem.appendChild(urlDisplay);
        qrItem.appendChild(downloadBtn);

        return qrItem;
    }

    truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    downloadSingle(canvas, index) {
        const link = document.createElement('a');
        link.download = `qr-code-${index}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    downloadSingleByIndex(index) {
        const qrCode = this.qrCodes.find(qr => qr.index === index);
        if (qrCode) {
            this.downloadSingle(qrCode.canvas, index);
        }
    }

    async downloadAll() {
        if (this.qrCodes.length === 0) {
            alert('No hay códigos QR para descargar.');
            return;
        }

        // Crear un ZIP usando JSZip (lo implementaremos de forma simple)
        for (let i = 0; i < this.qrCodes.length; i++) {
            const qrCode = this.qrCodes[i];
            this.downloadSingle(qrCode.canvas, qrCode.index);
            
            // Pequeña pausa entre descargas para evitar problemas del navegador
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    clearAll() {
        this.linksInput.value = '';
        this.qrContainer.innerHTML = '';
        this.printContainer.innerHTML = '';
        this.qrCodes = [];
        this.downloadAllBtn.disabled = true;
        this.printBtn.disabled = true;
    }

    async printQRCodes() {
        if (this.qrCodes.length === 0) {
            alert('No hay códigos QR para imprimir.');
            return;
        }

        try {
            // Limpiar el contenedor de impresión
            this.printContainer.innerHTML = '';

            // Crear la estructura para impresión
            await this.createPrintLayout();

            // Ocultar el contenido principal y mostrar el de impresión
            document.body.classList.add('printing');
            this.printContainer.style.display = 'block';
            
            // Ocultar elementos que no se deben imprimir
            document.querySelector('.container').classList.add('no-print');

            // Imprimir
            window.print();

            // Restaurar la vista normal después de imprimir
            setTimeout(() => {
                document.body.classList.remove('printing');
                this.printContainer.style.display = 'none';
                document.querySelector('.container').classList.remove('no-print');
            }, 1000);

        } catch (error) {
            console.error('Error preparando la impresión:', error);
            alert('Hubo un error preparando la impresión. Por favor, inténtalo de nuevo.');
        }
    }

    async createPrintLayout() {
        const qrPerPage = 4; // 4 códigos QR por página (2x2)
        
        for (let i = 0; i < this.qrCodes.length; i += qrPerPage) {
            // Crear una nueva página
            const printPage = document.createElement('div');
            printPage.className = 'print-page';

            // Agregar hasta 4 QR en esta página
            for (let j = 0; j < qrPerPage && (i + j) < this.qrCodes.length; j++) {
                const qrData = this.qrCodes[i + j];
                
                const qrItem = document.createElement('div');
                qrItem.className = 'qr-print-item';

                // Título
                const title = document.createElement('div');
                title.className = 'qr-print-title';
                title.textContent = `Código QR #${qrData.index}`;

                // QR Code - crear una nueva imagen desde el canvas
                const qrCodeContainer = document.createElement('div');
                qrCodeContainer.className = 'qr-print-code';
                
                // Convertir canvas a imagen para mejor compatibilidad de impresión
                const img = document.createElement('img');
                img.src = qrData.canvas.toDataURL('image/png');
                img.style.width = '150px';
                img.style.height = '150px';
                img.style.border = 'none';
                qrCodeContainer.appendChild(img);

                // URL
                const urlElement = document.createElement('div');
                urlElement.className = 'qr-print-url';
                urlElement.textContent = qrData.url;

                // Ensamblar el elemento
                qrItem.appendChild(title);
                qrItem.appendChild(qrCodeContainer);
                qrItem.appendChild(urlElement);
                
                printPage.appendChild(qrItem);
            }

            this.printContainer.appendChild(printPage);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});

// Funciones de utilidad adicionales
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Mostrar feedback visual
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        toast.textContent = 'URL copiada al portapapeles';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }).catch(err => {
        console.error('Error copiando al portapapeles:', err);
    });
}

// Función para convertir enlaces de Google Drive al formato de descarga directa
function convertGoogleDriveUrl(url) {
    const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    return url; // Retornar la URL original si no es un enlace de Google Drive
}
