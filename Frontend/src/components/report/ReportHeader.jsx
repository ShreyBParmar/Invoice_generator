import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ReportTable from "./ReportTable";
import { getReportData } from "../../services/dashboardApi";

const ReportHeader = () => {
  const [showReport, setShowReport] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["report"],
    queryFn: getReportData,
    enabled: showReport,
  });

  const reportData = data?.report || [];

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

  const getReportUserName = () => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName) return storedName;
    if (storedEmail) return storedEmail.split("@")[0];

    return "Logged-in user";
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handleDownloadPdf = () => {
    if (!showReport) {
      setShowReport(true);
      return;
    }

    if (!reportData.length) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = "Invoice Report";
    const dateText = `Generated: ${new Date().toLocaleString()}`;
    const userName = getReportUserName();

    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(`User: ${userName}`, 40, 60);
    doc.text("Client: All Types", 40, 74);
    doc.text("Period: All Time", 40, 88);
    doc.text(dateText, 40, 102);

    const tableHeaders = [
      "Statement ID",
      "Client",
      "Date Issued",
      "Date Due",
      "Status",
      "Currency",
      "Tax",
      "Discount",
      "Payments",
      "Total",
    ];

    const tableRows = reportData.map((invoice) => [
      invoice.invoice_number || "-",
      invoice.organization_name || `${invoice.first_name || ""} ${invoice.last_name || ""}`.trim() || "-",
      new Date(invoice.invoice_date).toLocaleDateString("en-GB"),
      new Date(invoice.due_date).toLocaleDateString("en-GB"),
      invoice.payment_status || "-",
      invoice.currency || "-",
      ` ${Number(invoice.tax_amount || 0).toLocaleString()}`,
      ` ${Number(invoice.discount_amount || 0).toLocaleString()}`,
      ` ${Number(invoice.payment_amount || invoice.amount_paid || invoice.paid_amount || 0).toLocaleString()}`,
      ` ${Number(invoice.total_amount || 0).toLocaleString()}`,
    ]);

    tableRows.push([
      "Total",
      "",
      "",
      "",
      "",
      "",
      ` ${totalTax.toLocaleString()}`,
      ` ${totalDiscount.toLocaleString()}`,
      ` ${totalPayment.toLocaleString()}`,
      ` ${grandTotal.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 80,
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      didParseCell: function (data) {
    // Last row (Total row)
    if (
      data.section === "body" &&
      data.row.index === tableRows.length - 1
    ) {
      data.cell.styles.fillColor = [235, 235, 235]; // Light grey
      data.cell.styles.fontStyle = "bold";
      
      data.cell.styles.textColor = [0, 0, 0];
    }
  },
    });

    doc.save(`invoice-report-${Date.now()}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Invoice Report</h1>

          <p className="text-slate-400 mt-2">
            Generate and download invoice reports.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="
              flex
              items-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-gradient-to-r
              from-orange-500
              to-orange-600
              text-white
              font-medium
              hover:scale-105
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            <FileText size={18} />
            Generate Report
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isLoading || !showReport}
            className="
              flex
              items-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-fuchsia-600
              text-white
              font-medium
              hover:scale-105
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            <FileDown size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Business Information */}
      <div
        className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-7
        "
      >

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-slate-400">Report</p>
            <p className="text-white">Invoice Report</p>
          </div>

          <div>
            <p className="text-slate-400">Period</p>
            <p className="text-white">All Time</p>
          </div>

          <div>
            <p className="text-slate-400">Generated</p>
            <p className="text-white">29/06/2026</p>
          </div>

          <div>
            <p className="text-slate-400">Currency</p>
            <p className="text-white">INR</p>
          </div>
        </div>
      </div>

      {/* Report Table */}
      {showReport && (
        <ReportTable reportData={reportData} isLoading={isLoading} error={error} />
      )}
    </motion.div>
  );
};

export default ReportHeader