import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import {
  orgsDataset,
  programsDataset,
  tieProgram,
} from '../../data/site-data';

const navItems = [
  { label: programsDataset.meta?.nav_home ?? 'Home', to: '/' },
  { label: programsDataset.meta?.nav_programs ?? 'Programs', to: '/programs' },
  { label: tieProgram?.name ?? 'TIE Program', to: '/tie' },
  { label: orgsDataset.meta?.nav_partners ?? 'Partners', to: '/partners' },
  { label: orgsDataset.meta?.contact_title ?? 'Contact', to: '/contact' },
];

type SiteLayoutProps = {
  children: ReactNode;
};

const SiteLayout = ({ children }: SiteLayoutProps) => {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            {programsDataset.meta?.site_title ?? 'ShieldMate'}
          </div>
          <nav className="site-nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-brand">
            {programsDataset.meta?.site_title ?? 'ShieldMate'}
          </div>
          <div>{programsDataset.meta?.site_tagline ?? ''}</div>
        </div>
      </footer>
    </div>
  );
};

export default SiteLayout;