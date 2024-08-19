# HubSpot Contact Phone Number Formatter

This project automates the process of formatting phone numbers for HubSpot contacts and updating the `hs_whatsapp_phone_number` property. It supports batch processing and can start from a specific contact ID, making it easy to manage large datasets.

## Features

- **Batch Processing:** Process a set number of contacts at a time.
- **Start from Specific Contact ID:** Allows starting from a specified contact ID to process in batches.
- **Phone Number Formatting:** Automatically adds a "+" to phone numbers if missing.
- **Avoid Duplicate Updates:** Skips contacts where the `hs_whatsapp_phone_number` is already correctly set.
- **Detailed Logging:** Logs all actions, errors, and processing details into a uniquely named log file for each run.

## Prerequisites

- Node.js and npm installed on your machine.
- A HubSpot API key with the necessary permissions to read and update contact properties.

## Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/hubspot-phone-formatter.git
   cd hubspot-phone-formatter
2. **Install Dependencies:**
   ```bash
   npm install

3. **Configure the .env File:**
The .env file is already included in the repository with empty values. 
Open it and add your HubSpot API key, contact limit, and optional starting contact ID:
   ```bash
   HUBSPOT_API_KEY=your_hubspot_api_key_here
   CONTACT_LIMIT=100
   STARTING_CONTACT_ID=12345  # Set this to a specific contact ID or leave it empty to start from the beginning
4. **Run the Script:**
   ```bash
   node index.js



**The script will process the contacts based on the configuration in your .env file.**
## Configuration
<ul>
  <li>HUBSPOT_API_KEY: Your HubSpot API key, required for authenticating API requests.</li>
  <li>CONTACT_LIMIT: The number of contacts to process in each batch. Defaults to 100 if not set.</li>
  <li>STARTING_CONTACT_ID: The contact ID from which to start processing. If not set, the script starts from the first contact.</li>
</ul>

## Logging
Each run of the script generates a log file in the root directory with a name like contact_processing_log_YYYY-MM-DDTHH-MM-SS.txt. 
This file contains detailed logs of the processing, including any errors.

## License
This project is licensed under the MIT License.

## Contributions
Contributions are welcome! Feel free to open an issue or submit a pull request with improvements.
