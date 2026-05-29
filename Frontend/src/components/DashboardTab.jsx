import { motion } from "framer-motion";
import {
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Wallet,
  Plus,
  PackageOpen,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const DashboardTab = ({ setActivePage }) => {
  const kpis = [
    {
      label: "Total Revenue",
      value: "₹2.4M",
      delta: "+18.4%",
      icon: ArrowUpRight,
      accent: "from-indigo-500 to-violet-500",
      description: "Year-over-year growth",
    },
    {
      label: "Outstanding",
      value: "₹92.1K",
      delta: "+6.2%",
      icon: ArrowUpRight,
      accent: "from-cyan-500 to-blue-500",
      description: "Invoices due in 30 days",
    },
    {
      label: "Overdue",
      value: "14",
      delta: "-4.8%",
      icon: ArrowDownRight,
      accent: "from-rose-500 to-pink-500",
      description: "Late payments to collect",
    },
    {
      label: "Clients",
      value: "128",
      delta: "+12.8%",
      icon: Users,
      accent: "from-violet-500 to-fuchsia-500",
      description: "Active accounts this month",
    },
  ];

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Invoices",
        data: [18, 24, 32, 38, 49, 55, 60, 68, 76, 84, 92, 108],
        borderColor: "rgba(99,102,241,0.9)",
        backgroundColor: "rgba(99,102,241,0.2)",
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#6366F1",
        fill: true,
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, mode: "index", intersect: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#CBD5E1" },
      },
      y: {
        grid: { color: "rgba(148,163,184,0.18)" },
        ticks: { color: "#CBD5E1" },
      },
    },
  };

  const doughnutData = {
    labels: ["Paid", "Pending", "Overdue"],
    datasets: [
      {
        data: [62, 24, 14],
        backgroundColor: ["#8B5CF6", "#6366F1", "#0F172A"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: { position: "bottom", labels: { color: "#E2E8F0" } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">
            Dashboard overview
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Premium Invoice Analytics
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl">
            Visualize revenue, client performance, and cash flow with a premium glassmorphism experience.
          </p>
        </div>

        
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -6 }}
              className="group bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl shadow-slate-950/20 transition-transform duration-300"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{card.value}</h2>
                </div>
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-3xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-indigo-500/20`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <p>{card.description}</p>
                <span className="font-medium text-white">{card.delta}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Revenue analytics</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Monthly invoice growth</h2>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full bg-slate-950/70 px-4 py-3 text-sm text-slate-300 border border-white/10">
              <TrendingUp size={18} />
              +32.4% this year
            </div>
          </div>
          <div className="h-[360px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoice summary</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Payment status</h2>
              </div>
              <div className="rounded-full bg-slate-950/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300 border border-white/10">Last 30 days</div>
            </div>
            <div className="h-[280px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Accounts receivable</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">₹168K</h2>
              </div>
              <Wallet size={24} className="text-violet-400" />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-4">
                <p className="text-sm text-slate-400">Due in 7 days</p>
                <p className="mt-2 text-xl font-semibold text-white">₹74,200</p>
              </div>
              <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-4">
                <p className="text-sm text-slate-400">Due in 30 days</p>
                <p className="mt-2 text-xl font-semibold text-white">₹93,800</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Accounts payable</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">₹82K</h2>
              </div>
              <PackageOpen size={24} className="text-cyan-400" />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-4">
                <p className="text-sm text-slate-400">Due in 5 days</p>
                <p className="mt-2 text-xl font-semibold text-white">₹28,600</p>
              </div>
              <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-4">
                <p className="text-sm text-slate-400">Due in 14 days</p>
                <p className="mt-2 text-xl font-semibold text-white">₹53,400</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardTab;
