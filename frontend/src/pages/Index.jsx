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
Loader2,
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
const [loading, setLoading] = useState(false);

const [stats, setStats] = useState({
totalOrders: 0,
totalRevenue: 0,
totalStores: 0,
totalRepairWorks: 0,
recentOrders: [],
});

const API_BASE = import.meta.env.VITE_API_BASE;

useEffect(() => {
const token = localStorage.getItem("authToken");
if (token) {
setIsLoggedIn(true);
updateStats();
}
}, []);

const updateStats = async () => {
try {
setLoading(true);
const res = await fetch(`${API_BASE}/workOrders/stats`);
if (!res.ok) throw new Error("Failed to fetch stats");
const data = await res.json();
setStats({
totalOrders: data.totalOrders || 0,
totalRevenue: data.totalRevenue || 0,
totalStores: data.totalStores || 0,
totalRepairWorks: data.totalRepairWorks || 0,
recentOrders: data.recentOrders || [],
});
} catch (err) {
console.error("Failed to fetch stats:", err);
} finally {
setLoading(false);
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
if (loading) {
return ( <div className="flex justify-center items-center h-64"> <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" /> <p className="text-blue-600 font-medium">Loading data...</p> </div>
);
}

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

        {/* Stats Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalOrders")}
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalRevenue")}
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{stats.totalRevenue}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("activeStores")}
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalStores}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("repairServices")}
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalRepairWorks}
              </div>
            </CardContent>
          </Card>
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
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.storeName}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="secondary">
                        ₹{order.totalAmount}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
}


};

return ( <div className="min-h-screen bg-gray-50">
{/* Header */} <header className="bg-white shadow-sm border-b sticky top-0 z-10"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div className="flex justify-between items-center h-16"> <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"> <img src={Logo} alt="Patel Tailor Logo" className="w-full h-full object-cover" /> </div> <h1 className="text-xl font-bold text-gray-900">Patel Tailor</h1> </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            {t("welcomeUser")}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("logout")}</span>
            <span className="sm:hidden">{t("logOutShort")}</span>
          </Button>
        </div>
      </div>
    </div>
  </header>

  {/* Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div
        className={`lg:w-64 flex-shrink-0 ${
          isSidebarOpen
            ? "fixed inset-0 z-20 bg-white p-4 shadow-xl w-64 h-full"
            : "hidden"
        } lg:block lg:relative lg:shadow-none lg:p-0`}
      >
        <nav className="space-y-2 pt-4 lg:pt-0">
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
      </div>

      {/* Main Content */}
      <main className="flex-1">{renderContent()}</main>
    </div>
  </div>

  {/* Mobile Bottom Navigation */}
  <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t shadow-lg lg:hidden z-30">
    <div className="flex justify-around h-full">
      {menuItems.slice(0, 6).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center w-full text-xs transition-colors ${
              isActive
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  </div>
</div>
);
}
