document.getElementById('captureButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith('chrome://')) {
    alert('Cannot capture screenshot of a chrome:// URL');
    return;
  }
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
    if (response.success) {
      updateCounter(response.screenshotCount);
      document.getElementById('generatePDFButton').style.display = 'block';
    } else {
      console.error(response.error);
      alert(`Error capturing screenshot: ${response.error}`);
    }
  });
});

document.getElementById('generatePDFButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "getScreenshots" }, (response) => {
    if (response.success) {
      generatePDF(response.screenshots);
    } else {
      alert('Error getting screenshots');
    }
  });
});

function updateCounter(count) {
  document.getElementById('counter').innerText = `Screenshots captured: ${count}`;
}

function generatePDF(screenshots) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  screenshots.forEach((imageData, index) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width * 0.264583; // Convert px to mm
      const height = img.height * 0.264583; // Convert px to mm

      // Ensure image fits within the PDF page width
      if (width > pdf.internal.pageSize.getWidth()) {
        const ratio = pdf.internal.pageSize.getWidth() / width;
        pdf.addImage(img, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), height * ratio);
      } else {
        pdf.addImage(img, 'PNG', 0, 0, width, height);
      }

      if (index !== screenshots.length - 1) {
        pdf.addPage(); // Add new page for next image
      }

      if (index === screenshots.length - 1) {
        const pdfData = pdf.output('blob');
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = URL.createObjectURL(pdfData);
        downloadLink.download = 'screenshots.pdf';
        downloadLink.style.display = 'block';
        downloadLink.innerHTML = 'Download PDF';
        chrome.runtime.sendMessage({ action: "clearScreenshots" });
      }
    };
    img.src = imageData;
  });
}
