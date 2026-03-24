import crypto from "crypto";
import fetch from "node-fetch";

// 1. LOGIN → redirect to LinkedIn
export const linkedinLogin = async (req, res) => {
    const state = crypto.randomUUID();

    // Save state in session to verify later
    req.session = req.session || {};
    req.session.linkedinState = state;

    const baseUrl = "https://www.linkedin.com/oauth/v2/authorization";

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        scope: "openid profile email w_member_social",
        state: state
    });

    res.redirect(`${baseUrl}?${params.toString()}`);
};

// 2. CALLBACK → LinkedIn returns code and state
export const linkedinCallback = async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send("No code received");
    }

    if (!req.session || state !== req.session.linkedinState) {
        return res.status(400).send("Invalid state");
    }

    try {
        // 3. Exchange code for access token
        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET
        });

        const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 4. GET for user info
        const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userData = await userResponse.json();

        const linkedinId = userData.sub;
        const personUrn = `urn:li:person:${linkedinId}`;

        // 5. Save necessary information for future use
        req.session.linkedin = {
            accessToken,
            linkedinId,
            personUrn
        };

        res.send({
            message: "Login successful",
            linkedinId,
            personUrn
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error during LinkedIn auth");
    }
};