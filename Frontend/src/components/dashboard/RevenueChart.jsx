import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { getRevenueAnalytics } from "../../services/dashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = () => {

  // Dummy data for now
 const { data: revenueData } = useQuery({
  queryKey: ["revenueAnalytics"],
  queryFn: getRevenueAnalytics,
});

console.log("Revenue data: ",revenueData);

const data = {
  labels: revenueData?.revenue?.map(item => item.month) || [],

  datasets: [
    {
      label: "Revenue",

      data:
        revenueData?.revenue?.map(item => Number(item.revenue)) || [],

      borderColor: "#8B5CF6",

      backgroundColor: "rgba(139,92,246,0.15)",

      fill: true,

      tension: 0.4,

      pointRadius: 5,

      pointHoverRadius: 8,

      pointBackgroundColor: "#8B5CF6",

      borderWidth: 3,
    },
  ],
};
console.log(revenueData);

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false,
      },

      tooltip: {

        backgroundColor: "#1e293b",

        titleColor: "#fff",

        bodyColor: "#fff",

        padding: 12,
      },

    },

    scales: {

      x: {

        grid: {
          display: false,
        },

        ticks: {
          color: "#94A3B8",
        },

      },

      y: {

        beginAtZero: true,

        grid: {
          color: "rgba(255,255,255,0.08)",
        },

        ticks: {
          color: "#94A3B8",
        },

      },

    },

  };

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.4,
      }}

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

      <div className="mb-6">

        <h2 className="text-xl font-semibold text-white">
          Revenue Analytics
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Monthly revenue overview
        </p>

      </div>

      <div className="h-[320px]">

        <Line
          data={data}
          options={options}
        />

      </div>

    </motion.div>

  );

};

export default RevenueChart;