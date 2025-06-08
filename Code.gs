/**
 * @fileoverview A Google Apps Script to automatically save PDF attachments
 * from incoming Gmail messages to a specified Google Drive folder.
 * This script is designed to run periodically (e.g., daily)
 * to keep your Drive organized with relevant PDF documents.
 */

/**
 * Saves PDF attachments from Gmail messages to a Google Drive folder.
 *
 * This function searches for emails containing PDF attachments based on a
 * defined search query, iterates through them, and saves the PDF files
 * to a target Google Drive folder.
 */
function saveGmailPdfsToDrive() {

  // === Configuration Section ===
  // IMPORTANT: Replace 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE' with the actual ID
  // of the Google Drive folder where you want to save your PDFs.
  // You can find this ID in the URL of your Drive folder (it's the string
  // after '/folders/' in the URL).
  var FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

  // Define the Gmail search query.
  // This query determines which emails the script will process.
  // Examples:
  // - 'has:attachment filename:pdf newer_than:1d'
  //   Searches for emails with PDF attachments received in the last 1 day.
  //   This is ideal for ongoing, daily automation.
  // - 'has:attachment filename:pdf'
  //   Searches for ALL emails with PDF attachments (use this for a one-time
  //   initial bulk transfer of old PDFs, then revert to a 'newer_than' query).
  // - 'label:inbox has:attachment filename:pdf newer_than:7d'
  //   Searches for PDFs in the inbox received within the last 7 days.
  // - 'from:invoices@example.com has:attachment filename:pdf newer_than:1d'
  //   Searches for PDFs from a specific sender received in the last day.
  var SEARCH_QUERY = 'has:attachment filename:pdf newer_than:1d';

  // === Script Logic Section ===

  // 1. Get the target Google Drive folder by its ID.
  // This line accesses your Google Drive to find the folder where PDFs will be saved.
  var folder = DriveApp.getFolderById(FOLDER_ID);

  // 2. Search Gmail for threads matching the defined query.
  // This line uses the Gmail service to find email conversations (threads)
  // that contain PDF attachments based on your SEARCH_QUERY.
  var threads = GmailApp.search(SEARCH_QUERY);

  // 3. Iterate through each found email thread.
  for (var i = 0; i < threads.length; i++) {
    // Get all messages within the current thread.
    var messages = threads[i].getMessages();

    // 4. Iterate through each message in the thread.
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      // Get all attachments from the current message.
      var attachments = message.getAttachments();

      // 5. Iterate through each attachment in the message.
      for (var k = 0; k < attachments.length; k++) {
        var attachment = attachments[k];

        // 6. Check if the current attachment is a PDF.
        // We ensure we only process PDF files by checking their MIME type.
        if (attachment.getContentType() === 'application/pdf') {
          try {
            // 7. Save the PDF attachment to the specified Google Drive folder.
            folder.createFile(attachment);
            // Log a success message to the Apps Script execution log.
            Logger.log('Saved PDF: ' + attachment.getName() + ' from email: ' + message.getSubject());
          } catch (e) {
            // 8. Log any errors that occur during saving.
            // This helps in debugging if a file fails to save.
            Logger.log('Error saving ' + attachment.getName() + ': ' + e.toString());
          }
        }
      }
    }
  }
}

// To set up automated execution (trigger):
// 1. In the Google Apps Script editor, click the 'Triggers' icon (clock) on the left sidebar.
// 2. Click '+ Add Trigger'.
// 3. Set:
//    - Choose which function to run: `saveGmailPdfsToDrive`
//    - Select event source: `Time-driven`
//    - Select type of time based trigger: `Day timer` (or `Hour timer` for more frequency)
//    - Select time of day: e.g., `Every day between 1 AM and 2 AM`
// 4. Click 'Save'.
// The script will now run automatically at your chosen interval.
