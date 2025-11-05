import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar } from "lucide-react";
import * as XLSX from "xlsx/xlsx.mjs";
import logo from "../logo/Patel Tailor.jpg";
import qrImage from "../logo/PhonePeQR.jpg"; // ✅ QR image for invoice

export default function BillGenerator() {
  const { t } = useTranslation();

  const [stores, setStores] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billData, setBillData] = useState(null);

  // ✅ Load API base from environment (fallback to /api for local)
  const API_BASE = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}/api`
    : "/api";

  // ✅ Fetch all stores and work orders
  useEffect(() => {
    fetch(`${API_BASE}/stores`)
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch((err) => console.error("Error fetching stores:", err));

    fetch(`${API_BASE}/workOrders`)
      .then((res) => res.json())
      .then((data) => setWorkOrders(data))
      .catch((err) => console.error("Error fetching work orders:", err));
  }, [API_BASE]);

  // ✅ Generate Bill (Filter Data)
  const generateBill = () => {
    if (!selectedStoreId || !startDate || !endDate) return;

    const selectedStore = stores.find((s) => s._id === selectedStoreId);
    if (!selectedStore) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredOrders = workOrders.filter((order) => {
      const orderDate = new Date(order.date);
      return (
        order.storeId === selectedStoreId &&
        orderDate >= start &&
        orderDate <= end
      );
    });

    const totalAmount = filteredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    setBillData({
      orders: filteredOrders,
      totalAmount,
      totalOrders: filteredOrders.length,
      storeName: selectedStore.name,
      dateRange: `${startDate} to ${endDate}`,
    });
  };

  // ✅ PDF Generation (with Logo + QR)
  const downloadPDF = async () => {
    if (!billData) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const htmlContent = `
      <html>
        <head>
          <title>${t("billGenerator.billReport")} - ${billData.storeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 25px; }
            .logo { width: 90px; height: 90px; object-fit: cover; border-radius: 10px; }
            .title { font-size: 22px; font-weight: bold; margin-top: 10px; }
            .store-name { font-size: 18px; color: #555; }
            .period { color: #777; margin-bottom: 10px; }
            .summary { background: #f8f9fa; border: 1px solid #ddd; padding: 12px; margin-bottom: 20px; border-radius: 6px; }
            .summary h3 { margin: 0 0 10px 0; font-size: 18px; color: #444; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f1f1f1; }
            tr:nth-child(even) { background-color: #fafafa; }
            .total-row td { font-weight: bold; background-color: #eafbea; }
            .qr-section { text-align: center; margin-top: 30px; }
            .qr-section img { width: 160px; height: 160px; border-radius: 10px; margin-top: 10px; }
            .qr-section p { font-size: 14px; color: #444; margin: 5px 0; }
            footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" class="logo" alt="Patel Tailor Logo" />
            <div class="title">Patel Tailor ${t("billGenerator.billReport")}</div>
            <div class="store-name">${billData.storeName}</div>
            <div class="period">${t("billGenerator.period")}: ${billData.dateRange}</div>
          </div>

          <div class="summary">
            <h3>${t("billGenerator.summary")}</h3>
            <p>${t("billGenerator.totalOrders")}: ${billData.totalOrders}</p>
            <p>${t("billGenerator.totalRevenue")}: ₹${billData.totalAmount}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t("billGenerator.date")}</th>
                <th>${t("billGenerator.customer")}</th>
                <th>${t("billGenerator.works")}</th>
                <th>${t("billGenerator.amount")}</th>
              </tr>
            </thead>
            <tbody>
              ${billData.orders
                .map(
                  (order) => `
                <tr>
                  <td>${new Date(order.date).toLocaleDateString()}</td>
                  <td>${order.customerName}</td>
                  <td>${order.repairWorks.map((rw) => rw.name).join(", ")}</td>
                  <td>₹${order.totalAmount}</td>
                </tr>`
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3">${t("billGenerator.total")}</td>
                <td>₹${billData.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="qr-section">
            <p>Scan to Pay using PhonePe / UPI</p>
            <img src="${qrImage}" alt="PhonePe QR Code" />
            <p><strong>Vansh Patel</strong></p>
            <p>UPI ID: 9016171297@axl</p>
          </div>

          <footer>Generated by Patel Tailor System</footer>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    const opt = {
      margin: 0.4,
      filename: `Bill_${billData.storeName}_${startDate}_to_${endDate}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    setTimeout(() => {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => document.body.removeChild(element));
    }, 500);
  };

  // ✅ Excel Export
  const downloadExcel = () => {
    if (!billData) return;

    const summaryData = [
      [`Patel Tailor ${t("billGenerator.billReport")}`],
      [`${t("billGenerator.store")}: ${billData.storeName}`],
      [`${t("billGenerator.period")}: ${billData.dateRange}`],
      [`${t("billGenerator.totalOrders")}: ${billData.totalOrders}`],
      [`${t("billGenerator.totalRevenue")}: Rs${billData.totalAmount}`],
      ["", "", "", ""],
    ];

    const header = [
      t("billGenerator.date"),
      t("billGenerator.customer"),
      t("billGenerator.works"),
      t("billGenerator.amount"),
    ];

    const tableData = billData.orders.map((order) => [
      new Date(order.date).toLocaleDateString(),
      order.customerName,
      order.repairWorks.map((rw) => rw.name).join("; "),
      order.totalAmount,
    ]);

    const totalRow = ["", "", t("billGenerator.total"), billData.totalAmount];
    const data = [...summaryData, header, ...tableData, totalRow];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    ws["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 45 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Bill Report");
    XLSX.writeFile(wb, `bill_${billData.storeName}_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t("billGenerator.title")}</h2>
        <p className="text-gray-600">{t("billGenerator.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("billGenerator.generateBill")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="store">{t("billGenerator.selectStore")}</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("billGenerator.chooseStore")} />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">{t("billGenerator.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t("billGenerator.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={generateBill}
              disabled={!selectedStoreId || !startDate || !endDate}
              className="w-full md:w-auto"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t("billGenerator.generateBill")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {billData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {t("billGenerator.billReport")} - {billData.storeName}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadPDF}>
                  <Download className="w-4 h-4 mr-2" /> {t("billGenerator.pdf")}
                </Button>
                <Button variant="outline" onClick={downloadExcel}>
                  <Download className="w-4 h-4 mr-2" /> {t("billGenerator.excel")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {billData.orders.length === 0 ? (
              <p>{t("billGenerator.noOrders")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("billGenerator.date")}</TableHead>
                    <TableHead>{t("billGenerator.customer")}</TableHead>
                    <TableHead>{t("billGenerator.works")}</TableHead>
                    <TableHead className="text-right">{t("billGenerator.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billData.orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.repairWorks.map((rw) => rw.name).join(", ")}</TableCell>
                      <TableCell className="text-right">{order.totalAmount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Badge>{t("billGenerator.total")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{billData.totalAmount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
