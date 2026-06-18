import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/shell/Layout';
import OverviewPage from '@/features/overview/OverviewPage';
import CompaniesPage from '@/features/companies/CompaniesPage';
import ParticipantsPage from '@/features/participants/ParticipantsPage';
import PreTrainingPage from '@/features/pre-training/PreTrainingPage';
import LiveSessionPage from '@/features/live-session/LiveSessionPage';
import PostTrainingPage from '@/features/post-training/PostTrainingPage';
import MaterialsPage from '@/features/materials/MaterialsPage';
import CertificatesPage from '@/features/certificates/CertificatesPage';
import SchedulePage from '@/features/schedule/SchedulePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'participants', element: <ParticipantsPage /> },
      { path: 'pre-training', element: <PreTrainingPage /> },
      { path: 'live-session', element: <LiveSessionPage /> },
      { path: 'post-training', element: <PostTrainingPage /> },
      { path: 'materials', element: <MaterialsPage /> },
      { path: 'certificates', element: <CertificatesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
