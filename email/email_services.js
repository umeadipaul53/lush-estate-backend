const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const handlebars = require("handlebars");
const mjmlModule = require("mjml");

// Safe fallback for mjml import
const mjml = typeof mjmlModule === "function" ? mjmlModule : mjmlModule.default;

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, templateName, variables }) {
  try {
    // ✅ 1. Load the MJML email template
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.mjml`
    );

    const mjmlRaw = fs.readFileSync(templatePath, "utf-8");

    // ✅ 2. Compile the MJML template with Handlebars
    const compiledTemplate = handlebars.compile(mjmlRaw);
    const mjmlCompiled = compiledTemplate(variables);

    // ✅ 3. Convert MJML to HTML
    const { html, errors } = mjml(mjmlCompiled);
    if (errors && errors.length > 0) {
      throw new Error("MJML compilation error: " + JSON.stringify(errors));
    }

    // ✅ 4. Send email using Resend
    const response = await resend.emails.send({
      from: "Tehlex <noreply@tehlex.co>", // must match your verified domain
      to,
      subject,
      html,
    });

    console.log("✅ Email sent via Resend:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to send email via Resend:", error.message);
    return false;
  }
}

module.exports = { sendEmail };
