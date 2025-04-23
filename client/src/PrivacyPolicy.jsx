import { useTheme } from "./components/theme-provider";

export function PrivacyPolicy() {
  const { theme } = useTheme();

  return (
    <div className={`policy-page ${theme}`}>
      <div className="policy-container">
        <header className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: June 2023</p>
        </header>
        
        <div className="policy-content">
          <section id="start" className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>When you use FreelanceFinder, we may collect the following information:</p>
            <ul>
              <li>Personal identification information (Name, email address, phone number)</li>
              <li>Job application details (skills, experience, rate expectations)</li>
              <li>Communication history with our platform</li>
              <li>Device and usage data (IP address, browser type, pages visited)</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Match you with suitable freelance opportunities</li>
              <li>Process and manage your applications</li>
              <li>Provide customer support and improve our services</li>
              <li>Send important service notifications and updates</li>
              <li>Enhance platform security and prevent fraud</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul>
              <li>Potential clients for job applications you submit</li>
              <li>Payment processors to facilitate transactions</li>
              <li>Service providers that help operate our platform</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>End-to-end encryption of sensitive data</li>
              <li>Regular security audits and vulnerability testing</li>
              <li>Role-based access controls to personal information</li>
              <li>Secure data storage with regular backups</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and download your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain uses of your data</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. Changes to This Policy</h2>
            <p>We may update this policy periodically. Significant changes will be communicated through:</p>
            <ul>
              <li>Notifications within our platform</li>
              <li>Email alerts to registered users</li>
              <li>Updated "Last Updated" date on this page</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>7. Contact Us</h2>
            <p>For privacy-related questions or requests, please contact:</p>
            <div className="contact-info">
              <p><strong>Data Protection Officer</strong></p>
              <p>Email: privacy@freelancefinder.com</p>
              <p>Phone: +1 (555) 987-6543</p>
              <p>Mailing Address: 123 Privacy Lane, Data City, DC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}