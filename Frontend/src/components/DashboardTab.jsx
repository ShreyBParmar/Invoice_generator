import InvoiceStatusChart from "./dashboard/InvoiceStatusChart";
import RevenueChart from "./dashboard/RevenueChart";
import StatCard from "./dashboard/StatCard";
import RecentInvoicesTable from "./dashboard/RecentInvoicesTable";

const DashboardTab = () => {
  return (
    <div>
      <StatCard />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        <RevenueChart />

        <InvoiceStatusChart />

      </div>

      <div className="mt-8">

        <RecentInvoicesTable />

      </div>
    </div>
  )
}

export default DashboardTab