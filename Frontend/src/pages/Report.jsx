import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

const Report = () => {
  return (
    <div>
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              bg-white/10
              backdrop-blur-xl
              border
              border-white/10
              rounded-3xl
              p-10
            "
          >

            <h1 className="text-4xl font-bold mb-6">
              Reports
            </h1>

            <p className="text-slate-300">
              Analytics and reports section.
            </p>

          </motion.div>
    </div>
  )
}

export default Report