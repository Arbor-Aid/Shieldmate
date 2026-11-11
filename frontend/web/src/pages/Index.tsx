import { Link } from 'react-router-dom';

import SiteLayout from '../components/site/SiteLayout';
import { orgsDataset, programsDataset, tieProgram } from '../data/site-data';

const Index = () => {
  const programsPreview = programsDataset.items.slice(0, 3);
  const orgsPreview = orgsDataset.items.slice(0, 3);

  return (
    <SiteLayout>
      <section className="site-hero">
        <div className="eyebrow">{programsDataset.meta?.site_title}</div>
        <h1>{tieProgram?.name}</h1>
        <p>{tieProgram?.summary}</p>
        <div className="site-hero-actions">
          <Link className="site-button secondary" to="/tie">
            {tieProgram?.name}
          </Link>
          <Link className="site-button" to="/programs">
            {programsDataset.meta?.nav_programs}
          </Link>
        </div>
      </section>

      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h2 className="site-section-title">{programsDataset.meta?.index_title}</h2>
            <p className="site-section-summary">
              {programsDataset.meta?.index_summary}
            </p>
          </div>
          <Link className="site-button secondary" to="/programs">
            {programsDataset.meta?.nav_programs}
          </Link>
        </div>
        <div className="site-grid">
          {programsPreview.map((program) => (
            <Link
              key={program.id}
              className="data-card"
              to={`/programs/${program.slug}`}
            >
              <div className="data-meta">
                <span className="data-pill">{program.service_area}</span>
                <span className="data-pill">{program.last_updated}</span>
              </div>
              <h3>{program.name}</h3>
              <p>{program.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h2 className="site-section-title">{orgsDataset.meta?.index_title}</h2>
            <p className="site-section-summary">
              {orgsDataset.meta?.index_summary}
            </p>
          </div>
          <Link className="site-button secondary" to="/partners">
            {orgsDataset.meta?.nav_partners}
          </Link>
        </div>
        <div className="site-grid">
          {orgsPreview.map((org) => (
            <Link
              key={org.id}
              className="data-card"
              to={`/partners/${org.slug}`}
            >
              <div className="data-meta">
                <span className="data-pill">{org.category}</span>
                <span className="data-pill">{org.service_area}</span>
              </div>
              <h3>{org.name}</h3>
              <p>{org.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;