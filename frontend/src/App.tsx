import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/shell/Layout';
import OverviewPage from '@/features/overview/OverviewPage';
import CompaniesPage from '@/features/companies/CompaniesPage';
import ParticipantsPage from '@/features/participants/ParticipantsPage';
import PreTrainingPage from '@/features/pre-training/PreTrainingPage';
import PreTrainingSessionTasksPage from '@/features/pre-training/PreTrainingSessionTasksPage';
import LiveSessionPage from '@/features/live-session/LiveSessionPage';
import PostTrainingPage from '@/features/post-training/PostTrainingPage';
import PostTrainingChecklistPage from '@/features/post-training/PostTrainingChecklistPage';
import PostTrainingSessionTasksPage from '@/features/post-training/PostTrainingSessionTasksPage';
import MaterialsPage from '@/features/materials/MaterialsPage';
import CertificatesPage from '@/features/certificates/CertificatesPage';
import CertificatePrintPage from '@/features/certificates/CertificatePrintPage';
import SchedulePage from '@/features/schedule/SchedulePage';
import TrainingSessionsPage from '@/features/training-sessions/TrainingSessionsPage';
import RebateTrackerPage from '@/features/rebate-tracker/RebateTrackerPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'participants', element: <ParticipantsPage /> },
      { path: 'rebate-tracker', element: <RebateTrackerPage /> },
      { path: 'pre-training', element: <PreTrainingPage /> },
      { path: 'pre-training/:sessionId/:companyId/tasks', element: <PreTrainingSessionTasksPage /> },
      { path: 'training-sessions', element: <TrainingSessionsPage /> },
      { path: 'live-session', element: <LiveSessionPage /> },
      { path: 'post-training', element: <PostTrainingPage /> },
      { path: 'post-training/checklist', element: <PostTrainingChecklistPage /> },
      { path: 'post-training/:sessionId/:companyId/tasks', element: <PostTrainingSessionTasksPage /> },
      { path: 'materials', element: <MaterialsPage /> },
      { path: 'certificates', element: <CertificatesPage /> },
      { path: 'certificates/:certId/print', element: <CertificatePrintPage /> },
      { path: 'schedule', element: <SchedulePage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
