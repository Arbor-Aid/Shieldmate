import { Link } from 'react-router-dom';

import SiteLayout from '../../components/site/SiteLayout';
import { programsDataset } from '../../data/site-data';

const ProgramsIndex = () => {
  return (
    <SiteLayout>
      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h1 className="site-section-title">{programsDataset.meta?.index_title}</h1>
            <p className="site-section-summary">
              {programsDataset.meta?.index_summary}
            </p>
          </div>
        </div>
        <div className="site-grid">
          {programsDataset.items.map((program) => (
            <div key={program.id} className="data-card">
              <div className="data-meta">
                <span className="data-pill">{program.service_area}</span>
                <span className="data-pill">{program.last_updated}</span>
              </div>
              <h3>{program.name}</h3>
              <p>{program.summary}</p>
              <ul className="data-list">
                <li>Eligibility: {program.eligibility}</li>
                <li>How to apply: {program.how_to_apply}</li>
              </ul>
              <Link className="site-button secondary" to={`/programs/${program.slug}`}>
                {program.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default ProgramsIndex;