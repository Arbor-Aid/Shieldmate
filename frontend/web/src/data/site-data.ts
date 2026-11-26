import programsSeed from './programs.seed.json';
import orgsSeed from './orgs.seed.json';
import tieSeed from './tie.seed.json';

export interface ProgramItem {
  id: string;
  slug: string;
  name: string;
  summary: string;
  eligibility: string;
  how_to_apply: string;
  service_area: string;
  last_updated: string;
}

export interface ProgramsMeta {
  site_title: string;
  site_tagline: string;
  nav_home: string;
  nav_programs: string;
  index_title: string;
  index_summary: string;
}

export interface OrgItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  service_area: string;
  intake_steps: string[];
  last_updated: string;
}

export interface OrgsMeta {
  nav_partners: string;
  index_title: string;
  index_summary: string;
  contact_title: string;
  contact_summary: string;
}

export interface TieItem {
  id: string;
  slug: string;
  name: string;
  summary: string;
  steps: string[];
  eligibility: string[];
  partner_roles: string[];
  last_updated: string;
}

export interface Dataset<T, M = undefined> {
  schema_version: string;
  meta?: M;
  items: T[];
}

export const programsDataset = programsSeed as Dataset<ProgramItem, ProgramsMeta>;
export const orgsDataset = orgsSeed as Dataset<OrgItem, OrgsMeta>;
export const tieDataset = tieSeed as Dataset<TieItem>;

export const programs = programsDataset.items;
export const orgs = orgsDataset.items;
export const tieProgram = tieDataset.items[0];

export const findProgramBySlug = (slug: string) =>
  programs.find((program) => program.slug === slug);

export const findOrgBySlug = (slug: string) =>
  orgs.find((org) => org.slug === slug);