// Vercel Serverless Function for Mailchimp Newsletter Subscription
// This endpoint handles newsletter subscriptions via Mailchimp API

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        // Get Mailchimp credentials from environment variables
        const API_KEY = process.env.MAILCHIMP_API_KEY;
        const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
        const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

        // Verify environment variables are set
        if (!API_KEY || !AUDIENCE_ID || !SERVER_PREFIX) {
            console.error('Missing Mailchimp environment variables');
            return res.status(500).json({
                error: 'Server configuration error. Please contact support.'
            });
        }

        // Mailchimp API endpoint
        const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

        // Make request to Mailchimp
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`
            },
            body: JSON.stringify({
                email_address: email,
                status: 'subscribed',
                tags: ['Website Newsletter']
            })
        });

        const data = await response.json();

        // Handle Mailchimp response
        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: 'Successfully subscribed to newsletter!'
            });
        } else {
            // Handle specific Mailchimp errors
            if (data.title === 'Member Exists') {
                return res.status(400).json({
                    error: 'This email is already subscribed to our newsletter.'
                });
            }

            console.error('Mailchimp API error:', data);
            return res.status(400).json({
                error: data.detail || 'Unable to subscribe. Please try again.'
            });
        }

    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
}
