import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";


const DashboardTab = () => {
  return (
    <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-10">

              <div className="
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                p-6
                rounded-3xl
                hover:scale-[1.03]
                transition-all
                duration-300
                shadow-2xl
              ">
                <p className="text-slate-400 mb-3">
                  Total Revenue
                </p>

                <h2 className="text-4xl font-bold">
                  ₹1,24,000
                </h2>
              </div>

              <div className="
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                p-6
                rounded-3xl
                hover:scale-[1.03]
                transition-all
                duration-300
                shadow-2xl
              ">
                <p className="text-slate-400 mb-3">
                  Pending Invoices
                </p>

                <h2 className="text-4xl font-bold">
                  18
                </h2>
              </div>

              <div className="
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                p-6
                rounded-3xl
                hover:scale-[1.03]
                transition-all
                duration-300
                shadow-2xl
              ">
                <p className="text-slate-400 mb-3">
                  Clients
                </p>

                <h2 className="text-4xl font-bold">
                  48
                </h2>
              </div>

            </div>

            {/* Recent Activity */}
            <div className="
              bg-white/10
              backdrop-blur-xl
              border
              border-white/10
              rounded-3xl
              p-8
              shadow-2xl
            ">

              <h2 className="text-2xl font-semibold mb-6">
                Recent Activity
              </h2>

              <div className="flex flex-col gap-4">

                <div className="bg-white/5 p-4 rounded-2xl">
                  Invoice #INV-101 created successfully.
                </div>

                <div className="bg-white/5 p-4 rounded-2xl">
                  Payment received from ABC Company.
                </div>

                <div className="bg-white/5 p-4 rounded-2xl">
                  Monthly report generated.
                </div>

              </div>

            </div>

          </motion.div>

        
    </div>
  )
}

export default DashboardTab