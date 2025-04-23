import { useTheme } from "./components/theme-provider";

export function TermsOfService() {
  const { theme } = useTheme();

  return (
    <div className={`tos-page ${theme}`}>
      <div className="tos-container">
        <header className="tos-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </header>
        
        <div className="tos-content">
          <section id="start" className="tos-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using FreelanceFinder ("the Platform"), you agree to be bound by these Terms of Service and our <a href="/privacy-policy">Privacy Policy</a>. If you disagree with any part, you may not use our services.</p>
          </section>

          <section className="tos-section">
            <h2>2. Platform Services</h2>
            <p>FreelanceFinder provides a marketplace that:</p>
            <ul>
              <li>Connects freelancers with potential clients</li>
              <li>Facilitates job applications and hiring processes</li>
              <li>Provides tools for project management and communication</li>
              <li>Offers payment processing services</li>
            </ul>
            <p>We act as an intermediary between freelancers and clients but are not a party to any agreements between them.</p>
          </section>

          <section className="tos-section">
            <h2>3. User Responsibilities</h2>
            <div className="responsibility-grid">
              <div className="responsibility-card">
                <h3>For Freelancers</h3>
                <ul>
                  <li>Provide accurate information about skills and experience</li>
                  <li>Deliver work as described in project agreements</li>
                  <li>Communicate professionally with clients</li>
                  <li>Adhere to agreed timelines and deadlines</li>
                </ul>
              </div>
              <div className="responsibility-card">
                <h3>For Clients</h3>
                <ul>
                  <li>Provide clear project requirements</li>
                  <li>Make timely payments for completed work</li>
                  <li>Respect freelancers' time and expertise</li>
                  <li>Provide constructive feedback</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="tos-section">
            <h2>4. Payments and Fees</h2>
            <ul>
              <li>Freelancers set their own rates and payment terms</li>
              <li>We charge a service fee of 10% per transaction</li>
              <li>Payments are held in escrow until work is approved</li>
              <li>Refund disputes are mediated by our support team</li>
            </ul>
          </section>

          <section className="tos-section">
            <h2>5. Intellectual Property</h2>
            <p>Unless otherwise agreed:</p>
            <ul>
              <li>Freelancers retain ownership of their portfolio work</li>
              <li>Clients own work product after full payment</li>
              <li>Platform content is protected by copyright laws</li>
            </ul>
            <p>Unauthorized use of any content may result in account termination.</p>
          </section>

          <section className="tos-section">
            <h2>6. Account Termination</h2>
            <p>We may suspend or terminate accounts for:</p>
            <ul>
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Non-payment or payment disputes</li>
              <li>Abusive behavior</li>
            </ul>
            <p>You may delete your account at any time through settings.</p>
          </section>

          <section className="tos-section">
            <h2>7. Limitation of Liability</h2>
            <p>FreelanceFinder is not responsible for:</p>
            <ul>
              <li>Quality of work delivered by freelancers</li>
              <li>Client non-payment beyond our escrow protection</li>
              <li>Disputes between users</li>
              <li>Technical issues beyond our control</li>
            </ul>
          </section>

          <section className="tos-section">
            <h2>8. Changes to Terms</h2>
            <p>We may update these terms periodically. Material changes will be:</p>
            <ul>
              <li>Communicated via email to registered users</li>
              <li>Highlighted on our platform for 30 days</li>
              <li>Reflected in the "Last Updated" date above</li>
            </ul>
            <p>Continued use constitutes acceptance of updated terms.</p>
          </section>

          <section className="tos-section">
            <h2>9. Governing Law</h2>
            <p>These terms are governed by the laws of the State of Delaware, USA. Any disputes shall be resolved through binding arbitration in Wilmington, DE.</p>
          </section>

          <section className="tos-section">
            <h2>10. Contact Us</h2>
            <div className="contact-info">
              <p><strong>Legal Department</strong></p>
              <p>Email: legal@freelancefinder.com</p>
              <p>Phone: +1 (555) 987-6543</p>
              <p>Mailing Address: 123 Legal Street, Wilmington, DE 19801</p>
              <p>For fastest response, please include your account email in all correspondence.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}