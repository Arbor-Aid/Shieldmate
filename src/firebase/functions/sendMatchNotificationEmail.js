
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize admin if not already initialized
try {
  admin.initializeApp();
} catch (e) {
  console.log('Admin already initialized');
}

// Create a transporter using environment variables
// Note: In production, you would store these in Firebase environment configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Replace with your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'yourapp@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'app-password'
  }
});

/**
 * Cloud Function to send email notifications when a new client matches with an organization
 */
exports.sendMatchNotificationEmail = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const {
      organizationId,
      organizationName,
      organizationEmail,
      userName,
      userNeeds,
      matchId
    } = data;

    // Validate required fields
    if (!organizationEmail || !userName || !userNeeds || !matchId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Create email content
    const mailOptions = {
      from: `2Marines Support Platform <${process.env.EMAIL_USER || 'yourapp@gmail.com'}>`,
      to: organizationEmail,
      subject: `New Client Match: ${userName} needs your services`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Client Match</h2>
          <p>Hello ${organizationName},</p>
          <p>A new client has been matched with your organization based on their needs:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Client:</strong> ${userName}</p>
            <p><strong>Needs assistance with:</strong> ${userNeeds.join(', ')}</p>
          </div>
          
          <p>Please log in to your organization dashboard to view more details and contact this client.</p>
          
          <div style="margin: 25px 0;">
            <a href="https://2marines.org/organization?tab=matches&matchId=${matchId}" 
               style="background-color: #3b82f6; color: white; padding: 10px 15px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Client Details
            </a>
          </div>
          
          <p>Thank you for your partnership in supporting our veterans!</p>
          <p>- The 2Marines Support Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log the email sent in Firestore
    await admin.firestore().collection('email_logs').add({
      to: organizationEmail,
      subject: mailOptions.subject,
      organizationId,
      matchId,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent'
    });

    // Update the match record to indicate notification was sent
    await admin.firestore().collection('organization_matches').doc(matchId).update({
      notifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    
    // Log the error
    await admin.firestore().collection('error_logs').add({
      function: 'sendMatchNotificationEmail',
      error: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      data: data
    });
    
    throw new functions.https.HttpsError(
      'internal',
      'Error sending email notification',
      error.message
    );
  }
});
