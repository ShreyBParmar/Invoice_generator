import { motion } from "framer-motion";
import {useQuery} from "@tanstack/react-query";
import {
  Users,
  FileText,
  Clock3
} from "lucide-react";
import {getDashboardStats} from "../../services/dashboardApi";

const StatCard = () => {
      const { data: dashboardStats } = useQuery({

  queryKey: ["dashboardStats"],

  queryFn: getDashboardStats

});

const totalClients =
dashboardStats?.totalClients || 0;

const totalRevenue =
dashboardStats?.totalRevenue || 0;

const totalInvoices =
dashboardStats?.totalInvoices || 0;

  console.log("dash:", dashboardStats);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >

      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">
          Dashboard overview
        </p>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-3 text-slate-400">
          View your business statistics and performance.
        </p>
      </div>

      {/* Total Clients Card */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

  {/* Total Clients */}

  <motion.div
    whileHover={{ y: -6 }}
    className="
      bg-white/10
      backdrop-blur-xl
      border
      border-white/10
      p-6
      rounded-[2rem]
      shadow-2xl
      shadow-slate-950/20
    "
  >

    <div className="flex items-center justify-between">

      <div>

        <p className="text-sm text-slate-400">
          Total Clients
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-white">
          {totalClients}
        </h2>

      </div>

      <div
        className="
          h-12
          w-12
          rounded-3xl
          bg-gradient-to-br
          from-violet-500
          to-fuchsia-500
          flex
          items-center
          justify-center
          text-white
        "
      >
        <Users size={20} />
      </div>

    </div>

    <p className="mt-5 text-sm text-slate-400">
      Registered clients
    </p>

  </motion.div>

  <motion.div
  whileHover={{ y: -6 }}
  className="
    bg-white/10
    backdrop-blur-xl
    border
    border-white/10
    p-6
    rounded-[2rem]
    shadow-2xl
    shadow-slate-950/20
  "
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Total Invoices
      </p>

      <h2 className="mt-3 text-3xl font-semibold text-white">
        {totalInvoices}
      </h2>

    </div>

    <div
      className="
        h-12
        w-12
        rounded-3xl
        bg-gradient-to-br
        from-sky-500
        to-cyan-500
        flex
        items-center
        justify-center
        text-white
      "
    >
      <FileText size={20}/>
    </div>

  </div>

  <p className="mt-5 text-sm text-slate-400">
    Invoices generated
  </p>

</motion.div>

  {/* Total Revenue */}

  <motion.div
    whileHover={{ y: -6 }}
    className="
      bg-white/10
      backdrop-blur-xl
      border
      border-white/10
      p-6
      rounded-[2rem]
      shadow-2xl
      shadow-slate-950/20
    "
  >

    <div className="flex items-center justify-between">

      <div>

        <p className="text-sm text-slate-400">
          Total Revenue
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-white">
          ₹ {Number(totalRevenue).toLocaleString()}
        </h2>

      </div>

      <div
        className="
          h-12
          w-12
          rounded-3xl
          bg-gradient-to-br
          from-emerald-500
          to-green-500
          flex
          items-center
          justify-center
          text-white
          font-bold
          text-xl
        "
      >
        ₹
      </div>

    </div>

    <p className="mt-5 text-sm text-slate-400">
      Total revenue generated
    </p>

  </motion.div>

  <motion.div
  whileHover={{ y: -6 }}
  className="
    bg-white/10
    backdrop-blur-xl
    border
    border-white/10
    p-6
    rounded-[2rem]
    shadow-2xl
    shadow-slate-950/20
  "
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Pending Invoices
      </p>

      <h2 className="mt-3 text-3xl font-semibold text-white">
        0
      </h2>

    </div>

    <div
      className=" 
        h-12
        w-12
        rounded-3xl
        bg-gradient-to-br
        from-amber-500
        to-orange-500
        flex
        items-center
        justify-center
        text-white
      "
    >
      <Clock3 size={20}/>
    </div>

  </div>

  <p className="mt-5 text-sm text-slate-400">
    Awaiting review
  </p>

</motion.div>

</div>

    </motion.div>
  )
}

export default StatCard