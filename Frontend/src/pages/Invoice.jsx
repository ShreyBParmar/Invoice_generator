/*
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import {CreateInvoice} from "../components/CreateInvocie"


const Invoice = () => {
  return (
    <div>
      <CreateInvoice />
    </div>
  )
}

export default Invoice
*/

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileDown
} from "lucide-react";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "../services/dashboardApi";

const Invoice = () => {

  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState([]);

  const {

    data,

    isLoading,

    error

} = useQuery({

    queryKey:["invoices"],

    queryFn:getInvoices

});

const invoices =
data?.invoices || [];

  const toggleSelect = (id) => {

    if (selected.includes(id)) {

      setSelected(
        selected.filter(item => item !== id)
      );

    } else {

      setSelected([
        ...selected,
        id
      ]);

    }

  };

  const toggleSelectAll = () => {

    if (selected.length === invoices.length) {

      setSelected([]);

    } else {

      setSelected(
        invoices.map(invoice => invoice.id)
      );

    }

  };

  const getBadge = (status) => {

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
        return "";

    }

  };

  const exportSelectedInvoicesPdf = () => {
    const selectedInvoices = invoices.filter((invoice) =>
      selected.includes(invoice.id)
    );

    if (!selectedInvoices.length) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = "Individual Invoices";
    const dateText = `Export date: ${new Date().toLocaleString()}`;

    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(dateText, 40, 60);

    const tableHeaders = [
      "Invoice #",
      "Date",
      "Due",
      "Client",
      "Status",
      "Total"
    ];

    const tableRows = selectedInvoices.map((invoice) => [
      invoice.invoice_number,
      new Date(invoice.invoice_date).toLocaleDateString("en-GB"),
      new Date(invoice.due_date).toLocaleDateString("en-GB"),
      invoice.organization_name || `${invoice.first_name} ${invoice.last_name}`,
      invoice.payment_status,
      `Rs. ${Number(invoice.total_amount).toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 80,
      styles: {
        fontSize: 10,
        cellPadding: 6
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    const totalAmount = selectedInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.total_amount),
      0
    );

    const finalY = doc.lastAutoTable?.finalY || 80;
    doc.setFontSize(12);
    doc.text(`Selected invoices: ${selectedInvoices.length}`, 40, finalY + 30);
    doc.text(`Total amount: Rs. ${totalAmount.toLocaleString()}`, 40, finalY + 50);

    doc.save(`invoices-export-${Date.now()}.pdf`);
  };

  if(isLoading){

    return <h1 className="text-white">
        Loading...
    </h1>;
}

  return (

    <motion.div

      initial={{opacity:0,y:20}}

      animate={{opacity:1,y:0}}

      className="space-y-6"

    >

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Invoices

          </h1>

          <p className="text-slate-400 mt-2">

            Manage all your invoices

          </p>

        </div>

      </div>

      {/* Search */}

      <div
        className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/10
        rounded-3xl
        p-5
      "
      >

        <div
          className="
          flex
          items-center
          gap-3
        "
        >

          <Search
            className="text-slate-400"
            size={18}
          />

          <input

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

            placeholder="Search invoice..."

            className="
              bg-transparent
              outline-none
              text-white
              w-full
              placeholder:text-slate-500
            "

          />

        </div>

      </div>

      {/* Table */}

      <div
        className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/10
        rounded-3xl
        overflow-hidden
      "
      >

        <table className="w-full">

          <thead>

            <tr
              className="
              border-b
              border-white/10
              text-slate-400
            "
            >

              <th className="p-5">

                <input

                  type="checkbox"

                  checked={
                    selected.length===invoices.length
                  }

                  onChange={toggleSelectAll}

                />

              </th>

              <th className="text-left">

                Date

              </th>

              <th className="text-left">

                Due

              </th>

              <th className="text-left">

                Invoice

              </th>

              <th className="text-left">

                Client

              </th>

              <th className="text-left">

                Status

              </th>

              <th className="text-right pr-8">

                Total

              </th>

            </tr>

          </thead>

          <tbody>

            {

              invoices

              .filter(invoice=>

invoice.invoice_number

.toLowerCase()

.includes(search.toLowerCase())

)

              .map(invoice=>(

                <tr

                  key={invoice.id}

                  className="
                    border-b
                    border-white/5
                    hover:bg-white/5
                    transition
                  "

                >

                  <td className="p-5">

                    <input

                      type="checkbox"

                      checked={
                        selected.includes(invoice.id)
                      }

                      onChange={()=>
                        toggleSelect(invoice.id)
                      }

                    />

                  </td>

                  <td className="text-slate-300">

                    {
new Date(invoice.invoice_date)

.toLocaleDateString("en-GB")
}

                  </td>

                  <td className="text-slate-300">

                    {
new Date(invoice.due_date)

.toLocaleDateString("en-GB")
}

                  </td>

                  <td className="font-medium text-white">

                    {invoice.invoice_number}

                  </td>

                  <td className="text-slate-300">

                    {
invoice.organization_name ||

`${invoice.first_name} ${invoice.last_name}`
}

                  </td>

                  <td>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        ${getBadge(invoice.payment_status)}
                      `}
                    >

                      {invoice.payment_status}

                    </span>

                  </td>

                  <td
                    className="
                    text-right
                    pr-8
                    font-semibold
                    text-white
                  "
                  >

                    ₹ {Number(invoice.total_amount).toLocaleString()}

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div
        className="
        flex
        justify-between
        items-center
      "
      >

        <p className="text-slate-400">

          {selected.length}

          {" "}selected

        </p>

        <button

          disabled={!selected.length}
          onClick={exportSelectedInvoicesPdf}

          className={`
            flex
            items-center
            gap-2
            px-6
            py-3
            rounded-xl
            font-medium
            transition

            ${
              selected.length

              ?

              "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"

              :

              "bg-slate-700 text-slate-400 cursor-not-allowed"

            }
          `}

        >

          <FileDown size={18}/>

          Export PDF

        </button>

      </div>

    </motion.div>

  );

};

export default Invoice;