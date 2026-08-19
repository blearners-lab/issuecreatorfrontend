import IssueReportForm from "@/components/IssueReportForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <IssueReportForm />
      </main>
    </ProtectedRoute>
  );
}
