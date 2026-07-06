import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import logo from "../assets/invoice.png";
import Report from "./Report";
import Invoice from "./Invoice";
import DashboardTab from "../components/DashboardTab";
import AddClient from "../components/AddClient";
import CreateInvocie from "../components/CreateInvocie";
import { displayTokenStatus } from "../utils/tokenDebug";

const Dashboard = () => {

  const [businessName, setBusinessName] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [tokenStatus, setTokenStatus] = useState("");

  useEffect(() => {
    // CHECK TOKEN STATUS
    const token = localStorage.getItem("token");
    
    const status = displayTokenStatus();
    
    if(token) {
      setTokenStatus("✅ Token Found");
    } else {
      setTokenStatus("❌ No Token");
    }

    const fetchDashboard = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        setBusinessName(
          data.business.business_name
        );

      } catch (error) {

        console.log(error);

      }
    };

    fetchDashboard();

  }, []);

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">

      {/* Sidebar */}
      <div className="
        w-[270px]
        bg-white/5
        backdrop-blur-xl
        border-r
        border-white/10
        p-6
        flex
        flex-col
        justify-between
      ">

        <div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">

            <img
              src={logo}
              alt="logo"
              className="w-12 h-12 rounded-xl object-cover shadow-lg"
            />

            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                Invoicely
              </h1>

              <p className="text-sm text-slate-400">
                Invoice Platform
              </p>
            </div>

          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">

            <button
              onClick={() => setActivePage("dashboard")}
              className={`
                flex
                items-center
                gap-3
                p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${activePage === "dashboard"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button
              onClick={() => setActivePage("reports")}
              className={`
                flex
                items-center
                gap-3
                p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${activePage === "reports"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <BarChart3 size={20} />
              Reports
            </button>

            <button
              onClick={() => setActivePage("invoices")}
              className={`
                flex
                items-center
                gap-3
                p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${activePage === "invoices"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <BarChart3 size={20} />
              Invoices
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-10 space-y-3">
          <div className="text-sm text-slate-400">
            © 2026 Invoicely
          </div>
          <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${
            tokenStatus.includes("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {tokenStatus}
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="relative group">
          
          <button
    className="
      bg-white/10
      backdrop-blur-lg
      border
      border-white/10
      px-5
      py-3
      rounded-2xl
      hover:bg-white/20
      transition-all
      duration-300
      flex
      items-center
      gap-2
      inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition
      ml-260
    "
  >
    + Add New
  </button>

  {/* Dropdown */}
  <div
    className="
      absolute
      right-0
      mt-3
      w-[220px]
      bg-slate-900/95
      backdrop-blur-xl
      border
      border-white/10
      rounded-2xl
      shadow-2xl
      opacity-0
      invisible
      group-hover:opacity-100
      group-hover:visible
      transition-all
      duration-300
      overflow-hidden
      z-50
    "
  >

    {/* Client Option */}
    <button
      className="
        w-full
        text-left
        px-5
        py-4
        hover:bg-white/10
        transition-all
        duration-200
        border-b
        border-white/5
      "
      onClick={()=> setActivePage("add client")}
    >
      Add Client
    </button>

    {/* Invoice Option */}
    <button
      className="
        w-full
        text-left
        px-5
        py-4
        hover:bg-white/10
        transition-all
        duration-200
      "
      onClick={()=> setActivePage("create invoice")}
    >
      Create Invoice
    </button>
        </div>
      </div></div>
        {/* Dynamic Content */}
        {activePage === "dashboard" && (<DashboardTab setActivePage={setActivePage} />)}

        {activePage === "reports" && (<Report />)}

        {activePage === "invoices" && (<Invoice />)}

        {activePage ==="add client" && (<AddClient setActivePage={setActivePage}/>)}

        {activePage ==="create invoice" && (<CreateInvocie setActivePage={setActivePage}/>)}

      </div>

    </div>
  );
};

export default Dashboard;
