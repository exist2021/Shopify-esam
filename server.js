const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const resultsFilePath = path.join(__dirname, 'survey_results.csv');
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbz8xBpkM0GTIH6BIwZg8hQ13Fg_9-ZxTZuXs0mN58PJqK25tdRqpcgtZ7B4fzvpcJ9d/exec';

app.post('/submit', (req, res) => {
  const data = req.body;
  const headers = [
    'businessName', 'contactPerson', 'turnover', 'businessType', 'deliveryOffered',
    'deliveryManagement', 'deliveryChallenges', 'deliveryImportance', 'preferLocalDelivery',
    'desiredFeatures', 'monthlyDeliveryCost', 'deliverySatisfaction', 'useApps',
    'currentApps', 'adoptionConfidence', 'switchEncouragement', 'keyConcerns',
    'customerAttraction', 'pilotParticipation', 'additionalFeedback'
  ];

  // Function to format a value for CSV
  const formatCsvValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      value = value.join('; ');
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvRow = headers.map(header => formatCsvValue(data[header])).join(',') + '\n';

  // Append the new submission to the CSV file
  fs.appendFile(resultsFilePath, csvRow, (err) => {
    if (err) {
      console.error('Error writing to CSV file', err);
      return res.status(500).send('Error saving survey data.');
    }

    // After saving to CSV, send the data to Google Apps Script
    // We do this in a non-blocking way and don't let it affect the client response.
    axios.post(googleScriptUrl, data)
      .then(response => {
        console.log('Successfully sent data to Google Sheet:', response.data);
      })
      .catch(error => {
        console.error('Error sending data to Google Sheet:', error.message);
      });

    res.status(200).send('Survey submitted successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
