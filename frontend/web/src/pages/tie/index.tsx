import SiteLayout from '../../components/site/SiteLayout';
import { tieProgram } from '../../data/site-data';

const TieProgramPage = () => {
  if (!tieProgram) {
    return (
      <SiteLayout>
        <section className="site-section">
          <h1 className="site-section-title">TIE Program</h1>
          <p className="site-section-summary">Program data unavailable.</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="site-section">
        <div className="site-section-header">
          <div>
            <h1 className="site-section-title">{tieProgram.name}</h1>
            <p className="site-section-summary">{tieProgram.summary}</p>
          </div>
          <div className="data-meta">
            <span className="data-pill">{tieProgram.last_updated}</span>
          </div>
        </div>
        <div className="site-grid">
          <div className="data-card">
            <h3>Steps</h3>
            <ul className="data-list">
              {tieProgram.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
          <div className="data-card">
            <h3>Eligibility</h3>
            <ul className="data-list">
              {tieProgram.eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="data-card">
            <h3>Partner Roles</h3>
            <ul className="data-list">
              {tieProgram.partner_roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default TieProgramPage;