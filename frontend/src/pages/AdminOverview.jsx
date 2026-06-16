import React from "react";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers"; 
import AdminSubscriptionAnalytics from "./AdminSubscriptionAnalytics";
import AdminReports from "./AdminReports";
import AdminSubscriptionManager from "../components/components/AdminSubscriptionManager";

export default function AdminOverview() {
  return (
    <div style={{ padding: "20px" }}>

      <section>
        {/* <h2>Dashboard</h2> */}
        < AdminDashboard/>
      </section>

      <hr />

      <section>
        {/* <h2>Subscriptions</h2> */}
        < AdminSubscriptionAnalytics/>
      </section>

      <hr />

      <section>
        <AdminSubscriptionManager />
      </section>

       <hr />

      <section>
        {/* <h2>Reports</h2> */}
        < AdminReports/>
      </section>

      <hr />

      <section>
        {/* <h2>Users</h2> */}
        < AdminUsers/>
      </section>
    </div>




  );
}