import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Wrench,
  Store,
  ClipboardList,
  FileText,
  User,
  LogOut,
  TrendingUp,
  Users,
  Calendar,
  IndianRupee,
} from "lucide-react";

import LoginForm from "@/components/LoginForm";
import RepairWorkManager from "@/components/RepairWorkManager";
import StoreManager from "@/components/StoreManager";
import WorkAssignment from "@/components/WorkAssignment";
import BillGenerator from "@/components/BillGenerator";
import UserProfile from "@/components/UserProfile";

import Logo from "../logo/Patel Tailor.jpg";

export default function Index() {
  const { t } = useTranslation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalStores: 0,
    totalRepairWorks: 0,
    recentOrders: [],
  });

  // ✅ Load API base URL from .env with fallback
  const API_BASE =
    import.meta.env.VITE_API_BASE || "https://tailor-9pdf.onrender.com/api";

  useEffect(() => {
    console.log("🌐 Using API Base:", API_BASE);
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
      updateStats();
    }
  }, []);

  const updateStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const url = `${API_BASE}/workOrders/stats`;

      console.log("📡 Fetching stats from:", url);

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();

      setStats({
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        totalStores: data.totalStores || 0,
        totalRepairWorks: data.totalRepairWorks || 0,
        recentOrders: data.recentOrders || [],
      });
    } catch (err) {
      console.error("❌ Failed to fetch stats:", err.message);
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
    updateStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  if (!isLoggedIn) return <LoginForm onLogin={handleLogin} />;

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "repairs", label: t("repairWorks"), icon: Wrench },
    { id: "stores", label: t("storeManagement"), icon: Store },
    { id: "orders", label: t("workAssignment"), icon: ClipboardList },
    { id: "bills", label: t("billGeneration"), icon: FileText },
    { id: "profile", label: t("userProfile"), icon: User },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "repairs":
        return <RepairWorkManager updateStats={updateStats} />;
      case "stores":
        return <StoreManager updateStats={updateStats} />;
      case "orders":
        return <WorkAssignment updateStats={updateStats} />;
      case "bills":
        return <BillGenerator />;
      case "profile":
        return <UserProfile />;
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {t("dashboard")}
                </h2>
                <p className="text-gray-600">{t("welcomeMessage")}</p>
              </div>
              <Button onClick={updateStats} variant="outline">
                {t("refreshData")}
              </Button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title={t("totalOrders")}
                value={stats.totalOrders}
                icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
                color="text-blue-600"
                subtitle={t("allTimeOrders")}
              />
              <DashboardCard
                title={t("totalRevenue")}
                value={`₹${stats.totalRevenue}`}
                icon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
                color="text-green-600"
                subtitle={t("totalEarnings")}
              />
              <DashboardCard
                title={t("activeStores")}
                value={stats.totalStores}
                icon={<Store className="h-4 w-4 text-muted-foreground" />}
                color="text-purple-600"
                subtitle={t("storeLocations")}
              />
              <DashboardCard
                title={t("repairServices")}
                value={stats.totalRepairWorks}
                icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
                color="text-orange-600"
                subtitle={t("availableServices")}
              />
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t("recentOrders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>{t("noOrdersYet")}</p>
                    <p className="text-sm">{t("startCreatingOrder")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order) => (
                      <RecentOrderCard key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onLogout={handleLogout} t={t} />

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar
            menuItems={menuItems}
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

// ✅ Sub-components for clarity

function DashboardCard({ title, value, icon, color, subtitle }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function RecentOrderCard({ order }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-4 mb-2 sm:mb-0">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-gray-600">{order.storeName}</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <Badge variant="secondary">₹{order.totalAmount}</Badge>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Calendar className="w-3 h-3" />
          {new Date(order.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function Header({ onLogout, t }) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Patel Tailor"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <h1 className="text-xl font-bold text-gray-900">Patel Tailor</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ menuItems, activeTab, handleTabClick }) {
  return (
    <nav className="space-y-2 pt-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === item.id
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
