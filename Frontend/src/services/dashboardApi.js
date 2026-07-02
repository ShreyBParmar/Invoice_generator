export const getDashboardStats =
async () => {

  const token =
  localStorage.getItem(
    "token"
  );

  console.log("Token:", token); 

  const res =
  await fetch(
    "/api/dashboard/stats",
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  if(!res.ok){
    throw new Error(
      "Failed to fetch"
    );
  }

  const data = await res.json();

console.log("Dashboard api: ", data);

return data;

};

export const getRevenueAnalytics = async () => {

  const token = localStorage.getItem("token");

  const res = await fetch(
    "http://localhost:3000/api/dashboard/revenue",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed");
  }

  return res.json();
};

export const getRecentInvoices = async () => {

    const token =
    localStorage.getItem("token");

    const res = await fetch(
        "http://localhost:3000/api/dashboard/recent_invoices",
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }

    );

    if(!res.ok){
        throw new Error("Failed");
    }

    return res.json();

};

// services/invoiceApi.js

export const getInvoices = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:3000/api/invoices/table",
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.log("Invoice Error:", error);
    throw new Error(error.message || "Failed to fetch invoices");
  }

  const data = await response.json();

  return data;
};

export const getReportData = async () => {

    const token =
    localStorage.getItem("token");

    const res = await fetch(
        "http://localhost:3000/api/invoices/report",
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    if(!res.ok){
      const error = await res.json();
      console.log("Report table Error:", error);
      throw new Error("Failed");
    }

    const data = await res.json();
    
    return data;
};