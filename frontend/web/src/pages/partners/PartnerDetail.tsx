import { Link, useParams } from 'react-router-dom';

import SiteLayout from '../../components/site/SiteLayout';
import { findOrgBySlug, orgsDataset } from '../../data/site-data';

const PartnerDetail = () => {
  const { orgSlug } = useParams();
  const org = orgSlug ? findOrgBySlug(orgSlug) : undefined;

  if (!org) {
    return (
      <SiteLayout>
        <section className="site-section">
          <h1 className="site-section-title">{orgsDataset.meta?.index_title}</h1>
          <p className="site-section-summary">Partner not found.</p>
          <Link className="site-button secondary" to="/partners">
            {orgsDataset.meta?.nav_partners}
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h1 className="site-section-title">{org.name}</h1>
            <p className="site-section-summary">{org.description}</p>
          </div>
          <Link className="site-button secondary" to="/partners">
            {orgsDataset.meta?.nav_partners}
          </Link>
        </div>
        <div className="site-grid">
          <div className="data-card">
            <div className="data-meta">
              <span className="data-pill">{org.category}</span>
              <span className="data-pill">{org.service_area}</span>
            </div>
            <ul className="data-list">
              <li>Address: {org.address}</li>
              <li>Phone: {org.phone}</li>
              <li>Website: {org.website}</li>
            </ul>
          </div>
          <div className="data-card">
            <h3>Intake Steps</h3>
            <ul className="data-list">
              {org.intake_steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PartnerDetail;