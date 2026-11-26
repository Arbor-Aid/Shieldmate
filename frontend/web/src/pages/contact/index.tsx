import SiteLayout from '../../components/site/SiteLayout';
import { orgsDataset } from '../../data/site-data';

const ContactPage = () => {
  const primaryOrg = orgsDataset.items[0];

  if (!primaryOrg) {
    return (
      <SiteLayout>
        <section className="site-section">
          <h1 className="site-section-title">{orgsDataset.meta?.contact_title}</h1>
          <p className="site-section-summary">Contact data unavailable.</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h1 className="site-section-title">{orgsDataset.meta?.contact_title}</h1>
            <p className="site-section-summary">{orgsDataset.meta?.contact_summary}</p>
          </div>
        </div>
        <div className="site-grid">
          <div className="data-card">
            <h3>{primaryOrg.name}</h3>
            <ul className="data-list">
              <li>Address: {primaryOrg.address}</li>
              <li>Phone: {primaryOrg.phone}</li>
              <li>Website: {primaryOrg.website}</li>
              <li>Service area: {primaryOrg.service_area}</li>
            </ul>
          </div>
          <div className="data-card">
            <h3>Intake Steps</h3>
            <ul className="data-list">
              {primaryOrg.intake_steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ContactPage;