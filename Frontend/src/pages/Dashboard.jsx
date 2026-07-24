import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import logo from "../assets/invoice.png";
import Report from "./Report";
import Invoice from "./Invoice";
import DashboardTab from "../components/DashboardTab";
import AddClient from "../components/AddClient";
import CreateInvocie from "../components/CreateInvocie";
import { displayTokenStatus } from "../utils/tokenDebug";
import { getApiUrl } from "../utils/api";

const Dashboard = () => {

  const [businessName, setBusinessName] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [tokenStatus, setTokenStatus] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          getApiUrl("/api/dashboard"),
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

    <div className="
flex
min-h-screen
overflow-x-hidden
bg-gradient-to-br
from-slate-950
via-slate-900
to-slate-800
text-white
">

      {/* Sidebar */}
<div
  className={`
    fixed
    inset-y-0
    left-0
    z-40
    w-[270px]

    ${
      sidebarOpen
        ? "translate-x-0 border-r border-white/10 shadow-2xl"
        : "-translate-x-[110%] border-r-0 shadow-none"
    }

    bg-white/5
    backdrop-blur-xl
    p-6
    flex
    flex-col
    justify-between
    transition-all
    duration-300
    ease-in-out
  `}
>

        <div>

          {/* Logo */}
          <div className={`flex items-center gap-3 mb-10 md:mb-14 ${sidebarOpen ? "" : "md:justify-center"}`}>

            <img
              src={logo}
              alt="logo"
              className="w-11 h-11 rounded-xl object-cover shadow-lg shrink-0"
            />

            <div className={sidebarOpen ? "" : "md:hidden"}>
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
                w-full p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${sidebarOpen ? "justify-start" : "md:justify-center"}
                ${activePage === "dashboard"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <LayoutDashboard size={20} />
              <span className={sidebarOpen ? "" : "md:hidden"}>Dashboard</span>
            </button>

            <button
              onClick={() => setActivePage("reports")}
              className={`
                flex
                items-center
                gap-3
                w-full p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${sidebarOpen ? "justify-start" : "md:justify-center"}
                ${activePage === "reports"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <BarChart3 size={20} />
              <span className={sidebarOpen ? "" : "md:hidden"}>Reports</span>
            </button>

            <button
              onClick={() => setActivePage("invoices")}
              className={`
                flex
                items-center
                gap-3
                w-full p-4
                rounded-2xl
                transition-all
                duration-300
                hover:scale-[1.02]
                ${sidebarOpen ? "justify-start" : "md:justify-center"}
                ${activePage === "invoices"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  : "hover:bg-white/10"
                }
              `}
            >
              <BarChart3 size={20} />
              <span className={sidebarOpen ? "" : "md:hidden"}>Invoices</span>
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className={`mt-10 space-y-3 ${sidebarOpen ? "" : "md:hidden"}`}>
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

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/70 md:hidden"
        />
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">

  {/* Header */}
  <div className="flex items-center justify-between mb-10">

    {/* Left */}
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="
        p-3
        rounded-xl
        bg-white/10
        border
        border-white/10
        hover:bg-white/20
        transition-all
        duration-300
      "
    >
      {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
    </button>

    {/* Right */}
    <div className="relative group">

      <button
        className="
          inline-flex
          items-center
          gap-2
          rounded-3xl
          bg-gradient-to-r
          from-indigo-500
          to-fuchsia-500
          px-6
          py-4
          text-sm
          font-semibold
          text-white
          shadow-lg
          shadow-violet-500/20
          hover:scale-[1.03]
          transition-all
          duration-300
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

        <button
          onClick={() => {
            setActivePage("add client");
            setSidebarOpen(false);
          }}
          className="
            w-full
            text-left
            px-5
            py-4
            hover:bg-white/10
            transition-all
            border-b
            border-white/5
          "
        >
          Add Client
        </button>

        <button
          onClick={() => {
            setActivePage("create invoice");
            setSidebarOpen(false);
          }}
          className="
            w-full
            text-left
            px-5
            py-4
            hover:bg-white/10
            transition-all
          "
        >
          Create Invoice
        </button>

      </div>

    </div>

  </div>

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
