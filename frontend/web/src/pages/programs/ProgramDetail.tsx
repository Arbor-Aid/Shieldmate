import { Link, useParams } from 'react-router-dom';

import SiteLayout from '../../components/site/SiteLayout';
import { findProgramBySlug, programsDataset } from '../../data/site-data';

const ProgramDetail = () => {
  const { programSlug } = useParams();
  const program = programSlug ? findProgramBySlug(programSlug) : undefined;

  if (!program) {
    return (
      <SiteLayout>
        <section className="site-section">
          <h1 className="site-section-title">{programsDataset.meta?.index_title}</h1>
          <p className="site-section-summary">Program not found.</p>
          <Link className="site-button secondary" to="/programs">
            {programsDataset.meta?.nav_programs}
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
            <h1 className="site-section-title">{program.name}</h1>
            <p className="site-section-summary">{program.summary}</p>
          </div>
          <Link className="site-button secondary" to="/programs">
            {programsDataset.meta?.nav_programs}
          </Link>
        </div>
        <div className="data-card">
          <div className="data-meta">
            <span className="data-pill">{program.service_area}</span>
            <span className="data-pill">{program.last_updated}</span>
          </div>
          <ul className="data-list">
            <li>Eligibility: {program.eligibility}</li>
            <li>How to apply: {program.how_to_apply}</li>
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ProgramDetail;