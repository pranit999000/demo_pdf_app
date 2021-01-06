const http = require('http');
const express = require('express');
const app = express();
const { PDFDocument, canBeConvertedToUint8Array }  = require('pdf-lib');
const base64 = require('base64topdf');
const bodyParser = require('body-parser');


app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.post('/post', (req, res, next) => {
var data = req.body;
var pdfsToMerge = []

for(var i=0; i<data.FileValues.length; i++){
  pdfsToMerge.push(data.FileValues[i].Data);
}

run().catch(err => console.log(err));
async function run() {
const mergedPdf = await PDFDocument.create(); 
for (const pdfBytes of pdfsToMerge) { 
    const pdf = await PDFDocument.load(pdfBytes); 
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
         mergedPdf.addPage(page); 
    }); 
}
 
const mergedPdfFile = await mergedPdf.save();
var base64data = Buffer.from(mergedPdfFile, 'binary').toString('base64');

var Files = [{
  "FileName":data.FileValues[0]["Name"],
  "FileData":base64data
}]

res.status(200).json({
  MergedB64Files: Files
}); 

}
});




app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  });
  
  app.use((error, req, res, next) => {
      res.status(error.status || 500);
      res.json({
          error:{
              message: error.message
          }
      })
  
  
  });



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
