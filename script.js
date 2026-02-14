// script.js

// Function to generate QR Code
function generateQRCode(text) {
    const qrCode = new QRCode(document.getElementById("qrcode"), {
        text: text,
        width: 128,
        height: 128,
    });
}

// Function to download SVG
function downloadSVG() {
    const svgElement = document.getElementById("qrcode").getElementsByTagName("svg")[0];
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml+xml" });
    const url = URL.createObjectURL(svgBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event listener for button click to generate QR code
document.getElementById("generateButton").addEventListener("click", function() {
    const textInput = document.getElementById("textInput").value;
    generateQRCode(textInput);
});

// Event listener for download button click
document.getElementById("downloadButton").addEventListener("click", downloadSVG);