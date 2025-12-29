import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleCheck from './components/RoleCheck';

const Public = React.lazy(() => import('./pages/Public'));
const ShieldmateFeatures = React.lazy(() => import('./pages/ShieldmateFeatures'));
const ShieldmatePricing = React.lazy(() => import('./pages/ShieldmatePricing'));
const ShieldmateAbout = React.lazy(() => import('./pages/ShieldmateAbout'));
const ShieldmateContact = React.lazy(() => import('./pages/ShieldmateContact'));
const TwoMarinesInfo = React.lazy(() => import('./pages/twomarines/TwoMarinesInfo'));
const TwoMarinesShieldMate = React.lazy(() => import('./pages/twomarines/TwoMarinesShieldMate'));
const TwoMarinesShop = React.lazy(() => import('./pages/twomarines/TwoMarinesShop'));
const TwoMarinesPartnerships = React.lazy(() => import('./pages/twomarines/TwoMarinesPartnerships'));
const TwoMarinesBrand = React.lazy(() => import('./pages/twomarines/TwoMarinesBrand'));
const TwoMarinesSocials = React.lazy(() => import('./pages/twomarines/TwoMarinesSocials'));
const MarineCoinRoute = React.lazy(() => import('./pages/MarineCoinRoute'));
const SignIn = React.lazy(() => import('./pages/SignIn'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const OrganizationDashboard = React.lazy(() => import('./pages/OrganizationDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Login = React.lazy(() => import('./pages/Login'));
const Questionnaire = React.lazy(() => import('./pages/Questionnaire'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Conversations = React.lazy(() => import('./pages/MyConversationsPage'));
const OrgLanding = React.lazy(() => import('./pages/OrgLanding'));
const OrgAdmin = React.lazy(() => import('./pages/OrgAdmin'));
const AdminRbac = React.lazy(() => import('./pages/AdminRbac'));
const AdminApprovals = React.lazy(() => import('./pages/AdminApprovals'));
const AdminApprovalNew = React.lazy(() => import('./pages/AdminApprovalNew'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const SiteLanding = React.lazy(() => import('./pages/site/SiteLanding'));
const SitePrograms = React.lazy(() => import('./pages/site/SitePrograms'));
const SiteVeterans = React.lazy(() => import('./pages/site/SiteVeterans'));
const SitePartners = React.lazy(() => import('./pages/site/SitePartners'));
const SiteDonate = React.lazy(() => import('./pages/site/SiteDonate'));
const SiteContact = React.lazy(() => import('./pages/site/SiteContact'));
const AppHub = React.lazy(() => import('./pages/app/AppHub'));
const AppUserDashboard = React.lazy(() => import('./pages/app/AppUserDashboard'));
const AppUserAssistant = React.lazy(() => import('./pages/app/AppUserAssistant'));
const AppUserProfile = React.lazy(() => import('./pages/app/AppUserProfile'));
const AppUserDocuments = React.lazy(() => import('./pages/app/AppUserDocuments'));
const AppUserResources = React.lazy(() => import('./pages/app/AppUserResources'));
const AppOrgDashboard = React.lazy(() => import('./pages/app/AppOrgDashboard'));
const AppOrgClients = React.lazy(() => import('./pages/app/AppOrgClients'));
const AppOrgIntake = React.lazy(() => import('./pages/app/AppOrgIntake'));
const AppOrgMessages = React.lazy(() => import('./pages/app/AppOrgMessages'));
const AppOrgReports = React.lazy(() => import('./pages/app/AppOrgReports'));
const AppOrgUploads = React.lazy(() => import('./pages/app/AppOrgUploads'));
const AppAdminDashboard = React.lazy(() => import('./pages/app/AppAdminDashboard'));
const AppAdminUsers = React.lazy(() => import('./pages/app/AppAdminUsers'));
const AppAdminOrgs = React.lazy(() => import('./pages/app/AppAdminOrgs'));
const AppAdminRbac = React.lazy(() => import('./pages/app/AppAdminRbac'));
const AppAdminAudit = React.lazy(() => import('./pages/app/AppAdminAudit'));
const AppAdminMcpHealth = React.lazy(() => import('./pages/app/AppAdminMcpHealth'));
const MarineCoinAbout = React.lazy(() => import('./pages/marinecoin/MarineCoinAbout'));
const MarineCoinHowItWorks = React.lazy(() => import('./pages/marinecoin/MarineCoinHowItWorks'));
const MarineCoinUseCases = React.lazy(() => import('./pages/marinecoin/MarineCoinUseCases'));
const MarineCoinPartners = React.lazy(() => import('./pages/marinecoin/MarineCoinPartners'));
const MarineCoinPartnerApply = React.lazy(() => import('./pages/marinecoin/MarineCoinPartnerApply'));
const MarineCoinImpact = React.lazy(() => import('./pages/marinecoin/MarineCoinImpact'));
const MarineCoinRoadmap = React.lazy(() => import('./pages/marinecoin/MarineCoinRoadmap'));
const MarineCoinFaq = React.lazy(() => import('./pages/marinecoin/MarineCoinFaq'));
const MarineCoinWaitlist = React.lazy(() => import('./pages/marinecoin/MarineCoinWaitlist'));
const MarineCoinContact = React.lazy(() => import('./pages/marinecoin/MarineCoinContact'));
const MarineCoinPrivacy = React.lazy(() => import('./pages/marinecoin/MarineCoinPrivacy'));
const MarineCoinTerms = React.lazy(() => import('./pages/marinecoin/MarineCoinTerms'));
const MarineCoinDisclaimer = React.lazy(() => import('./pages/marinecoin/MarineCoinDisclaimer'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="/info" element={<TwoMarinesInfo />} />
        <Route path="/shieldmate" element={<TwoMarinesShieldMate />} />
        <Route path="/features" element={<ShieldmateFeatures />} />
        <Route path="/pricing" element={<ShieldmatePricing />} />
        <Route path="/about" element={<ShieldmateAbout />} />
        <Route path="/contact" element={<ShieldmateContact />} />
        <Route path="/marinecoin" element={<MarineCoinRoute />} />
        <Route path="/shop" element={<TwoMarinesShop />} />
        <Route path="/partnerships" element={<TwoMarinesPartnerships />} />
        <Route path="/brand" element={<TwoMarinesBrand />} />
        <Route path="/socials" element={<TwoMarinesSocials />} />
        <Route path="/marinecoin/about" element={<MarineCoinAbout />} />
        <Route path="/marinecoin/how-it-works" element={<MarineCoinHowItWorks />} />
        <Route path="/marinecoin/use-cases" element={<MarineCoinUseCases />} />
        <Route path="/marinecoin/partners" element={<MarineCoinPartners />} />
        <Route path="/marinecoin/partners/apply" element={<MarineCoinPartnerApply />} />
        <Route path="/marinecoin/impact" element={<MarineCoinImpact />} />
        <Route path="/marinecoin/roadmap" element={<MarineCoinRoadmap />} />
        <Route path="/marinecoin/faq" element={<MarineCoinFaq />} />
        <Route path="/marinecoin/waitlist" element={<MarineCoinWaitlist />} />
        <Route path="/marinecoin/contact" element={<MarineCoinContact />} />
        <Route path="/marinecoin/legal/privacy" element={<MarineCoinPrivacy />} />
        <Route path="/marinecoin/legal/terms" element={<MarineCoinTerms />} />
        <Route path="/marinecoin/legal/disclaimer" element={<MarineCoinDisclaimer />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/site" element={<SiteLanding />} />
        <Route path="/site/programs" element={<SitePrograms />} />
        <Route path="/site/veterans" element={<SiteVeterans />} />
        <Route path="/site/partners" element={<SitePartners />} />
        <Route path="/site/donate" element={<SiteDonate />} />
        <Route path="/site/contact" element={<SiteContact />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org"
          element={
            <ProtectedRoute>
              <OrgLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org/admin"
          element={
            <ProtectedRoute>
              <OrgAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["super_admin"]} fallback={<NotFound />}>
                <AdminRbac />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals/new"
          element={
            <ProtectedRoute>
              <AdminApprovalNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/user"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["client"]} fallback={<NotFound />}>
                <AppUserDashboard />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/user/assistant"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["client"]} fallback={<NotFound />}>
                <AppUserAssistant />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/user/profile"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["client"]} fallback={<NotFound />}>
                <AppUserProfile />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/user/documents"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["client"]} fallback={<NotFound />}>
                <AppUserDocuments />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/user/resources"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["client"]} fallback={<NotFound />}>
                <AppUserResources />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgDashboard />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org/clients"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgClients />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org/intake"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgIntake />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org/messages"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgMessages />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org/reports"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgReports />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/org/uploads"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["organization", "org_admin", "staff"]} fallback={<NotFound />}>
                <AppOrgUploads />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminDashboard />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/users"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminUsers />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/orgs"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminOrgs />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/rbac"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminRbac />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/audit"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminAudit />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/mcp-health"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["admin", "super_admin"]} fallback={<NotFound />}>
                <AppAdminMcpHealth />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
