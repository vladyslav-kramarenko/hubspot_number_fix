const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// HubSpot API Key from environment variable
const apiKey = process.env.HUBSPOT_API_KEY;

// Set the limit for the number of contacts to process (from environment variable or default to 100)
const contactLimit = process.env.CONTACT_LIMIT || 10;

// Optional: Set a starting contact ID (from environment variable or default to start from the beginning)
const startingContactId = process.env.STARTING_CONTACT_ID || '';

// Generate a unique log file name based on the current date and time
const logFileName = `contact_processing_log_${new Date().toISOString().replace(/:/g, '-')}.txt`;
const logFilePath = path.join(__dirname, logFileName);

// Function to log messages to a file
function logToFile(message) {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

// Function to get contacts and update phone numbers
async function processContacts() {
    let hasMore = true;
    let offset = startingContactId || 0;
    let processedCount = 0;

    while (hasMore && processedCount < contactLimit) {
        try {
            // Define the request parameters
            const requestParams = {
                limit: contactLimit, // Use contactLimit for API request
                after: offset,
                properties: 'phone,firstname,hs_whatsapp_phone_number', // Fetch only the necessary properties
            };

            // Define the request headers
            const requestHeaders = {
                'Authorization': `Bearer ${apiKey}`
            };

            // Log the request details
            const requestUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;
            // logToFile(`Making API request to: ${requestUrl}`);
            // logToFile(`Request Headers: ${JSON.stringify(requestHeaders, null, 2)}`);
            // logToFile(`Request Params: ${JSON.stringify(requestParams, null, 2)}`);

            // Fetch a batch of contacts based on the contactLimit
            const response = await axios.get(requestUrl, {
                headers: requestHeaders,
                params: requestParams
            });

            // logToFile(`API Response: ${JSON.stringify(response.data, null, 2)}`);

            const contacts = response.data.results;
            hasMore = response.data.paging && response.data.paging.next;
            offset = hasMore ? response.data.paging.next.after : null;

            // Iterate through the contacts (up to contactLimit)
            for (let contact of contacts) {
                const contactName = `${contact.properties.firstname || ''}`.trim();
                logToFile(`Processing contact: ${contactName} (ID: ${contact.id})`);

                // Check phone and WhatsApp phone properties
                let phoneNumber = contact.properties.phone;
                let whatsappPhoneNumber = contact.properties.hs_whatsapp_phone_number;

                if (phoneNumber) {
                    logToFile(`Original phone number for ${contactName}: ${phoneNumber}`);

                    if (!phoneNumber.startsWith('+')) {
                        phoneNumber = `+${phoneNumber}`;
                        logToFile(`Formatted phone number for ${contactName}: ${phoneNumber}`);
                    } else {
                        logToFile(`Phone number for ${contactName} is already formatted.`);
                    }

                    // Check if the WhatsApp phone number is already set correctly
                    if (whatsappPhoneNumber === phoneNumber) {
                        logToFile(`WhatsApp phone number for ${contactName} (ID: ${contact.id}) is already set correctly. Skipping update.`);
                    } else {
                        // Update the contact's WhatsApp phone number
                        try {
                            const patchResponse = await axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
                                properties: {
                                    hs_whatsapp_phone_number: phoneNumber // Updated to use hs_whatsapp_phone_number property
                                }
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${apiKey}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            // Commenting out the success response logging
                            // logToFile(`PATCH Response: ${JSON.stringify(patchResponse.data, null, 2)}`);
                            logToFile(`Updated contact ${contactName} (ID: ${contact.id}) with WhatsApp phone number: ${phoneNumber}`);
                        } catch (patchError) {
                            // Log the error response
                            logToFile(`Error updating contact ${contactName} (ID: ${contact.id}): ${patchError.response ? JSON.stringify(patchError.response.data, null, 2) : patchError.message}`);
                        }
                    }
                } else {
                    logToFile(`No phone number found for contact ${contactName} (ID: ${contact.id}).`);
                }

                processedCount++;
                if (processedCount >= contactLimit) {
                    break;
                }
            }
        } catch (error) {
            logToFile(`Error processing contacts: ${error.response ? JSON.stringify(error.response.data, null, 2) : error.message}`);
        }
    }

    if (processedCount === 0) {
        logToFile('No contacts were processed.');
    } else {
        logToFile(`Successfully processed ${processedCount} contact(s).`);
    }
}

// Execute the script
processContacts();