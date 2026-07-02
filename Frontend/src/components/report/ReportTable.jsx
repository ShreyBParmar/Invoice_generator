import { motion } from "framer-motion";

const ReportTable = ({ reportData = [], isLoading = false, error = null }) => {
  if (isLoading) {
    return <h1 className="text-white">Loading...</h1>;
  }

  if (error) {
    return <h1 className="text-red-400">Unable to load report right now.</h1>;
  }

  if (!reportData.length) {
    return <h1 className="text-slate-400">No invoice data available.</h1>;
  }

  const totalTax = reportData.reduce(
    (sum, item) => sum + Number(item.tax_amount || 0),
    0
  );

  const totalDiscount = reportData.reduce(
    (sum, item) => sum + Number(item.discount_amount || 0),
    0
  );

  const totalPayment = reportData.reduce(
    (sum, item) => sum + Number(item.payment_amount || item.amount_paid || item.paid_amount || 0),
    0
  );

  const grandTotal = reportData.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/10
        rounded-3xl
        overflow-hidden
      "
    >
      <div className="rounded-3xl max-h-[340px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-white/10 text-xs">
            <tr className="text-sm">
              <th className="px-5 py-4 text-left">Statement ID</th>
              <th className="px-5 py-4 text-left">Client</th>
              <th className="px-5 py-4 text-left">Date Issued</th>
              <th className="px-5 py-4 text-left">Date Due</th>
              <th className="px-5 py-4 text-left">Date Paid</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Currency</th>
              <th className="px-5 py-4 text-right">Tax</th>
              <th className="px-5 py-4 text-right">Discount</th>
              <th className="px-5 py-4 text-right">Payments</th>
              <th className="px-5 py-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((invoice) => (
              <tr
                key={invoice.id}
                className="
                  border-t
                  border-white/10
                  hover:bg-white/5
                  transition
                "
              >
                <td className="px-3 py-4 text-violet-400 font-medium">
                  {invoice.invoice_number}
                </td>

                <td className="px-3 py-4 text-white truncate max-w-[170px]">
                  {invoice.organization_name || `${invoice.first_name} ${invoice.last_name}`}
                </td>

                <td className="px-3 py-4 text-slate-300">
                  {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
                </td>

                <td className="px-3 py-4 text-slate-300">
                  {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                </td>

                <td className="px-3 py-4 text-slate-300">-</td>

                <td className="px-3 py-4 text-center">
                  <span
                    className="
                      px-3
                      py-1
                      rounded-lg
                      bg-red-500/20
                      text-red-400
                      text-sm
                    "
                  >
                    {invoice.payment_status}
                  </span>
                </td>

                <td className="px-3 py-4 text-center text-white">{invoice.currency}</td>

                <td className="px-3 py-4 text-right text-white">
                  {Number(invoice.tax_amount).toFixed(2)}
                </td>

                <td className="px-3 py-4 text-right text-white">
                  {Number(invoice.discount_amount).toFixed(2)}
                </td>

                <td className="px-3 py-4 text-right text-white">0.00</td>

                <td className="px-3 py-4 text-right font-semibold text-white">
                  {Number(invoice.total_amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot className="bg-white/10 border-t-2 border-violet-400/60">
            <tr>
              <td colSpan={7} className="px-3 py-4 font-bold text-violet-300">
                Total
              </td>
              <td className="px-3 py-4 text-right font-semibold text-white">
                {totalTax.toFixed(2)}
              </td>

              <td className="px-3 py-4 text-right font-semibold text-white">
                {totalDiscount.toFixed(2)}
              </td>

              <td className="px-3 py-4 text-right font-semibold text-white">
                {totalPayment.toFixed(2)}
              </td>

              <td className="px-3 py-4 text-right font-bold text-violet-400">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>

        </table>

      </div>

    </motion.div>

  );

};

export default ReportTable;