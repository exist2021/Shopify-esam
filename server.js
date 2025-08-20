const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const resultsFilePath = path.join(__dirname, 'survey_results.csv');

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
    // If value is an array (from checkboxes), join it with semicolons
    if (Array.isArray(value)) {
      value = value.join('; ');
    }
    const stringValue = String(value);
    // If the value contains a comma, a double quote, or a newline, enclose it in double quotes.
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Escape double quotes by doubling them
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
    res.status(200).send('Survey submitted successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
