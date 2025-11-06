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
import qrImage from "../logo/AryanPhonePeQR.jpg";

export default function BillGenerator() {
  const { t } = useTranslation();

  const [stores, setStores] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billData, setBillData] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}`
    : "/stores";

  // Fetch stores and work orders
  useEffect(() => {
    fetch(`${API_BASE}/stores`)
      .then((res) => res.json())
      .then(setStores)
      .catch((err) => console.error("Error fetching stores:", err));

    fetch(`${API_BASE}/workOrders`)
      .then((res) => res.json())
      .then(setWorkOrders)
      .catch((err) => console.error("Error fetching work orders:", err));
  }, [API_BASE]);

  // Generate Bill Data
  const generateBill = () => {
    if (!selectedStoreId || !startDate || !endDate) return;

    const store = stores.find((s) => s._id === selectedStoreId);
    if (!store) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredOrders = workOrders.filter((order) => {
      const orderDate = new Date(order.date);
      return order.storeId === selectedStoreId && orderDate >= start && orderDate <= end;
    });

    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    setBillData({
      orders: filteredOrders,
      totalAmount,
      totalOrders: filteredOrders.length,
      storeName: store.name,
      dateRange: `${startDate} to ${endDate}`,
    });
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!billData) return;

  const html2pdf = (await import("html2pdf.js")).default;

    const htmlContent = `
      <html>
        <head>
          <title>${t("billGenerator.billReport")} - ${billData.storeName}</title>
          <style>
            /* --- Updated Styles for a Professional Look --- */
            body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                margin: 0; /* Use 0 margin for clean PDF generation */
                padding: 40px; 
                color: #333; 
                font-size: 10pt; /* Slightly smaller base font */
            }
            .invoice-container { 
                padding: 20px; 
                border: 1px solid #ccc; 
                border-radius: 8px; /* Slight rounding on the container */
            }
            .header { 
                display: flex; /* Flexbox for logo and text alignment */
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px; 
                padding-bottom: 15px;
                border-bottom: 3px solid #007bff; /* Primary color separator */
            }
            .header-text {
                text-align: right;
            }
            .logo { 
                width: 70px; 
                height: 70px; 
                object-fit: cover; 
                border-radius: 50%; /* Make logo round for modern look */
                vertical-align: middle;
            }
            .title { 
                font-size: 20pt; 
                font-weight: bold; 
                margin-top: 5px; 
                color: #007bff; /* Primary color for title */
                display: inline-block;
                margin-left: 15px;
            }
            .store-name { 
                font-size: 14pt; 
                color: #555; 
                font-weight: 600;
            }
            .period { 
                color: #777; 
                margin-bottom: 10px; 
                font-size: 10pt;
            }
            .summary { 
                background: #e9f7ff; /* Light blue background for summary */
                border: 1px solid #b3e0ff; /* Light blue border */
                padding: 15px; 
                margin-bottom: 25px; 
                border-radius: 6px; 
            }
            .summary h3 { 
                margin: 0 0 10px 0; 
                font-size: 12pt; 
                color: #0056b3; /* Darker blue for heading */
                border-bottom: 1px solid #b3e0ff;
                padding-bottom: 5px;
            }
            .summary p { 
                margin: 5px 0;
            }
            
            table { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 10pt; 
                margin-bottom: 35px; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* Subtle shadow for table */
            }
            th, td { 
                border: none; /* Remove default border */
                padding: 12px 10px; 
                text-align: left; 
            }
            th { 
                background-color: #007bff; /* Primary color header */
                color: white; 
                font-weight: 600;
                border-bottom: 3px solid #0056b3;
                text-transform: uppercase;
            }
            tr:nth-child(even) { 
                background-color: #f7f7f7; /* Light gray stripe */
            }
            tr:last-child td {
                border-bottom: 1px solid #ccc;
            }
            .total-row td { 
                font-weight: bold; 
                background-color: #d4edda; /* Light green total row */
                color: #155724; /* Dark green text */
                border-top: 2px solid #c3e6cb;
                font-size: 11pt;
            }
            
            .qr-section { 
                text-align: right; /* Align QR section to the right */
                margin-top: 30px; 
                padding-top: 20px;
                border-top: 1px dashed #ccc;
            }
            .qr-section img { 
                width: 120px; /* Reduced QR size */
                height: 120px; 
                border: 1px solid #ddd;
                padding: 5px;
                border-radius: 4px; 
                margin-top: 10px; 
            }
            .qr-section p { 
                font-size: 10pt; 
                color: #444; 
                margin: 3px 0; 
            }
            
            footer { 
                clear: both;
                text-align: center; 
                margin-top: 50px; 
                font-size: 9pt; 
                color: #888; 
                padding-top: 10px;
                border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <img src="${logo}" class="logo" alt="Patel Tailor Logo" />
              <div class="header-text">
                <div class="title">Patel Tailor ${t("billGenerator.billReport")}</div>
                <div class="store-name">${billData.storeName}</div>
                <div class="period">${t("billGenerator.period")}: ${billData.dateRange}</div>
              </div>
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
                  <th style="text-align: right;">${t("billGenerator.amount")}</th>
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
                      <td style="text-align: right;">₹${order.totalAmount}</td>
                    </tr>`
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3">${t("billGenerator.total")}</td>
                  <td style="text-align: right;">₹${billData.totalAmount}</td>
                </tr>
              </tbody>
            </table>
            <div class="qr-section">
              <p>Scan to Pay using GooglePay / UPI</p>
              <img src="${qrImage}" alt="PhonePe QR Code" />
              <p><strong>Aryan Patel</strong></p>
              <p>UPI ID: pa9221169@okhdfcbank</p>
            </div>
            <footer>Generated by Patel Tailor System</footer>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    // Note: I've updated the selector here to target the invoice-container for a cleaner PDF border.
    const opt = {
      margin: 0.4,
      filename: `Bill_${billData.storeName}_${startDate}_to_${endDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    setTimeout(() => {
      html2pdf()
        .set(opt)
        .from(element.querySelector('.invoice-container')) // Target the new container class
        .save()
        .then(() => document.body.removeChild(element));
    }, 500);
  };

  
  // Download Excel
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
