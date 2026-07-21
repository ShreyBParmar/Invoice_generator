import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const InvoiceStatusChart = () => {

  const data = {

    labels: [
      "Sent",
      "Pending",
      "Draft",
      "Overdue"
    ],

    datasets: [
      {
        data: [
          18,
          8,
          5,
          2
        ],

        backgroundColor: [
          "#10B981",
          "#F59E0B",
          "#3B82F6",
          "#EF4444"
        ],

        borderWidth: 0,

        hoverOffset: 10,
      }
    ]

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {

      legend: {

        position: "bottom",

        labels: {

          color: "#CBD5E1",

          padding: 20,

          boxWidth: 14,

          usePointStyle: true,

          pointStyle: "circle"

        }

      },

      tooltip: {

        backgroundColor: "#1E293B",

        titleColor: "#fff",

        bodyColor: "#fff"

      }

    }

  };

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.4
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
          Invoice Status
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Distribution of invoices
        </p>

      </div>

      <div className="h-[320px]">

        <Doughnut
          data={data}
          options={options}
        />

      </div>

    </motion.div>

  );

};

export default InvoiceStatusChart;