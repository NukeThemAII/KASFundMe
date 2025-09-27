import AdminDashboard from "@/components/sections/admin-dashboard";
import Footer from "@/components/layout/footer";
import TopNav from "@/components/layout/top-nav";

export default function AdminPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pb-24 sm:px-6 lg:px-8">
      <TopNav />
      <main className="mt-16 flex w-full flex-col items-center gap-16">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}
