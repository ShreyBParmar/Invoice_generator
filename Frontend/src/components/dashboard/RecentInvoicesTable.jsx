import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getRecentInvoices } from "../../services/dashboardApi";

const RecentInvoicesTable = () => {
const { data } = useQuery({

    queryKey:["recentInvoices"],

    queryFn:getRecentInvoices

});

const invoices =
data?.invoices || [];

//const date = new Date(invoice.invoice_date).toLocaleDateString()

const getStatusStyle = (status) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-500/20 text-emerald-400";

    case "Pending":
      return "bg-amber-500/20 text-amber-400";

    case "Draft":
      return "bg-sky-500/20 text-sky-400";

    case "Overdue":
      return "bg-red-500/20 text-red-400";

    default:
      return "bg-slate-500/20 text-slate-300";
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/10
        rounded-[2rem]
        p-7
        shadow-2xl
        shadow-slate-950/20
      "
    >
      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            Recent Invoices
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Latest invoices created
          </p>

        </div>

        <button
          className="
            text-violet-400
            hover:text-violet-300
            text-sm
            font-medium
          "
        >
          View All →
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="text-slate-400 text-sm border-b border-white/10">

              <th className="text-left py-4">Invoice</th>

              <th className="text-left py-4">Client</th>

              <th className="text-left py-4">Amount</th>

              <th className="text-left py-4">Status</th>

              <th className="text-left py-4">Date</th>

            </tr>

          </thead>

          <tbody>

            {invoices.map((invoice) => (

              <tr
                key={invoice.id}
                className="
                  border-b
                  border-white/5
                  hover:bg-white/5
                  transition
                "
              >

                <td className="py-5 text-white font-medium">
                  {invoice.invoice_number}
                </td>

                <td className="text-slate-300">
                  {
invoice.organization_name
?

invoice.organization_name

:

`${invoice.first_name} ${invoice.last_name}`
}
                </td>

                <td className="text-white font-semibold">
                  ₹ {Number(invoice.total_amount).toLocaleString()}
                </td>

                <td>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${getStatusStyle(invoice.payment_status)}
                    `}
                  >
                    {invoice.payment_status}
                  </span>

                </td>

                <td className="text-slate-400">
                  {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </motion.div>
  );
};

export default RecentInvoicesTable;