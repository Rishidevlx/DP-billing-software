export const exportHTMLToDoc = (htmlContent, filename = 'document') => {
  const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Export HTML To Doc</title>
  <style>
    body { font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
    .label-grid { display: block; }
    .label-cell { border: 1px solid #ccc; width: 45%; margin: 5px; padding: 10px; float: left; page-break-inside: avoid; }
    .alias-text { text-align: right; border-top: 1px dashed #ccc; font-weight: bold; }
    .uppercase { text-transform: uppercase; }
  </style>
  </head><body>`;
  
  const postHtml = "</body></html>";
  const html = preHtml + htmlContent + postHtml;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  
  const downloadLink = document.createElement("a");
  document.body.appendChild(downloadLink);
  
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename + '.doc');
  } else {
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename + '.doc';
    downloadLink.click();
  }
  document.body.removeChild(downloadLink);
};
