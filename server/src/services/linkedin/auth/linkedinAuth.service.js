export const linkedinLogin = async (req, res) => {
    const baseUrl = "https://www.linkedin.com/oauth/v2/authorization";
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        scope: "r_liteprofile r_emailaddress w_member_social",
        state: "123456789"
    });

    res.redirect(`${baseUrl}?${params.toString()}`);
}   