// Serverless function for Mailchimp newsletter subscription
// Compatible with Vercel, Netlify, and similar platforms

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Get credentials from environment variables
        const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
        const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
        const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1', 'us6'

        // Validate environment variables
        if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
            console.error('Missing Mailchimp environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Mailchimp API endpoint
        const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

        // Make request to Mailchimp
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: email,
                status: 'subscribed', // Use 'pending' for double opt-in
                merge_fields: {
                    // Add any additional fields here if needed
                }
            }),
        });

        const data = await response.json();

        // Handle Mailchimp response
        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: 'Successfully subscribed!'
            });
        } else {
            // Check if already subscribed
            if (data.title === 'Member Exists') {
                return res.status(200).json({
                    success: true,
                    message: 'You are already subscribed!'
                });
            }

            console.error('Mailchimp error:', data);
            return res.status(400).json({
                error: data.detail || 'Subscription failed. Please try again.'
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'An error occurred. Please try again later.'
        });
    }
};
