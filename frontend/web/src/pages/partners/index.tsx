import { Link } from 'react-router-dom';

import SiteLayout from '../../components/site/SiteLayout';
import { orgsDataset } from '../../data/site-data';

const PartnersIndex = () => {
  return (
    <SiteLayout>
      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h1 className="site-section-title">{orgsDataset.meta?.index_title}</h1>
            <p className="site-section-summary">{orgsDataset.meta?.index_summary}</p>
          </div>
        </div>
        <div className="site-grid">
          {orgsDataset.items.map((org) => (
            <div key={org.id} className="data-card">
              <div className="data-meta">
                <span className="data-pill">{org.category}</span>
                <span className="data-pill">{org.service_area}</span>
              </div>
              <h3>{org.name}</h3>
              <p>{org.description}</p>
              <ul className="data-list">
                {org.intake_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <Link className="site-button secondary" to={`/partners/${org.slug}`}>
                {org.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default PartnersIndex;