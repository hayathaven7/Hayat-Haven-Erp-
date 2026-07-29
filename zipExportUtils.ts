import ExcelJS from 'exceljs';
import {
  Brand,
  Category,
  CompanySettings,
  Customer,
  CustomerLedgerEntry,
  CustomerPayment,
  Expense,
  Product,
  Purchase,
  SalesOrder,
  StockMovement,
  Supplier,
  SupplierLedgerEntry,
  SupplierPayment,
} from '../types/erp';
import { ALL_TABLE_SCHEMAS } from '../data/appsheetSpecs';

export async function generateERPWorkbook(data: {
  companySettings: CompanySettings;
  customers: Customer[];
  suppliers: Supplier[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  salesOrders: SalesOrder[];
  purchases: Purchase[];
  customerPayments: CustomerPayment[];
  supplierPayments: SupplierPayment[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  customerLedgers: CustomerLedgerEntry[];
  supplierLedgers: SupplierLedgerEntry[];
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hayat Haven Enterprise ERP System';
  workbook.created = new Date();
  workbook.modified = new Date();

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E3A8A' }, // Corporate Blue
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  const zebraFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F8FAFC' },
  };

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'E2E8F0' } },
    left: { style: 'thin', color: { argb: 'E2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
    right: { style: 'thin', color: { argb: 'E2E8F0' } },
  };

  const applySheetFormatting = (sheet: ExcelJS.Worksheet) => {
    sheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 0 }];
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 22;
        if (rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = zebraFill;
          });
        }
        row.eachCell((cell) => {
          cell.border = borderStyle;
          cell.font = { name: 'Segoe UI', size: 10 };
          if (typeof cell.value === 'number') {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });
      }
    });

    // Auto fit column widths
    sheet.columns.forEach((col) => {
      let maxLen = 12;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const valStr = cell.value ? String(cell.value) : '';
        if (valStr.length > maxLen) {
          maxLen = Math.min(valStr.length + 3, 40);
        }
      });
      col.width = maxLen;
    });
  };

  // 1. Company Settings
  const s1 = workbook.addWorksheet('1_Company_Settings');
  s1.columns = [
    { header: 'Setting_ID', key: 'id' },
    { header: 'Company_Name', key: 'companyName' },
    { header: 'Business_Type', key: 'businessType' },
    { header: 'Currency', key: 'currency' },
    { header: 'Country', key: 'country' },
    { header: 'Address', key: 'address' },
    { header: 'Phone', key: 'phone' },
    { header: 'Email', key: 'email' },
    { header: 'Tax_BIN_ID', key: 'taxId' },
    { header: 'Bank_Details', key: 'bankDetails' },
    { header: 'Terms_Conditions', key: 'terms' },
  ];
  s1.addRow({
    id: 'SET-001',
    companyName: data.companySettings.companyName,
    businessType: data.companySettings.businessType,
    currency: data.companySettings.currency,
    country: data.companySettings.country,
    address: data.companySettings.address,
    phone: data.companySettings.phone,
    email: data.companySettings.email,
    taxId: data.companySettings.taxId,
    bankDetails: data.companySettings.bankDetails,
    terms: data.companySettings.termsAndConditions,
  });
  applySheetFormatting(s1);

  // 2. Dashboard
  const s2 = workbook.addWorksheet('2_Dashboard');
  s2.columns = [
    { header: 'Metric_ID', key: 'id' },
    { header: 'Metric_Name', key: 'name' },
    { header: 'Calculated_Value_BDT', key: 'value' },
    { header: 'Excel_Formula_Reference', key: 'formula' },
  ];
  const totalSales = data.salesOrders.reduce((a, b) => a + b.grandTotal, 0);
  const totalPurchases = data.purchases.reduce((a, b) => a + b.grandTotal, 0);
  const totalExpenses = data.expenses.reduce((a, b) => a + b.amount, 0);
  const totalCustomerDue = data.customers.reduce((a, b) => a + b.currentBalance, 0);
  const totalSupplierDue = data.suppliers.reduce((a, b) => a + b.currentBalance, 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;
  const lowStockCount = data.products.filter((p) => p.currentStock <= p.lowStockAlert).length;

  s2.addRow({ id: 'MTR-01', name: 'Total Sales Revenue (BDT)', value: totalSales, formula: '=SUM(8_Sales_Orders!H2:H100)' });
  s2.addRow({ id: 'MTR-02', name: 'Total Purchase Cost (BDT)', value: totalPurchases, formula: '=SUM(10_Purchases!H2:H100)' });
  s2.addRow({ id: 'MTR-03', name: 'Total Operational Expenses (BDT)', value: totalExpenses, formula: '=SUM(14_Expenses!D2:D100)' });
  s2.addRow({ id: 'MTR-04', name: 'Total Customer Due (Receivables)', value: totalCustomerDue, formula: '=SUM(3_Customers!I2:I100)' });
  s2.addRow({ id: 'MTR-05', name: 'Total Supplier Due (Payables)', value: totalSupplierDue, formula: '=SUM(4_Suppliers!H2:H100)' });
  s2.addRow({ id: 'MTR-06', name: 'Net Profit Estimate (BDT)', value: netProfit, formula: '=C2-C3-C4' });
  s2.addRow({ id: 'MTR-07', name: 'Low Stock SKU Items Count', value: lowStockCount, formula: '=COUNTIF(7_Products!M2:M100,"<=10")' });
  applySheetFormatting(s2);

  // 3. Customers
  const s3 = workbook.addWorksheet('3_Customers');
  s3.columns = [
    { header: 'Customer_ID', key: 'id' },
    { header: 'Customer_Name', key: 'name' },
    { header: 'Phone', key: 'phone' },
    { header: 'Email', key: 'email' },
    { header: 'Address', key: 'address' },
    { header: 'Customer_Type', key: 'type' },
    { header: 'Credit_Limit', key: 'creditLimit' },
    { header: 'Opening_Balance', key: 'openingBalance' },
    { header: 'Current_Balance', key: 'currentBalance' },
    { header: 'Status', key: 'status' },
  ];
  data.customers.forEach((c) => {
    s3.addRow({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      type: c.type,
      creditLimit: c.creditLimit,
      openingBalance: c.openingBalance,
      currentBalance: c.currentBalance,
      status: c.status,
    });
  });
  applySheetFormatting(s3);

  // 4. Suppliers
  const s4 = workbook.addWorksheet('4_Suppliers');
  s4.columns = [
    { header: 'Supplier_ID', key: 'id' },
    { header: 'Supplier_Name', key: 'name' },
    { header: 'Contact_Person', key: 'contactPerson' },
    { header: 'Phone', key: 'phone' },
    { header: 'Email', key: 'email' },
    { header: 'Address', key: 'address' },
    { header: 'Opening_Balance', key: 'openingBalance' },
    { header: 'Current_Balance', key: 'currentBalance' },
    { header: 'Status', key: 'status' },
  ];
  data.suppliers.forEach((s) => {
    s4.addRow({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      openingBalance: s.openingBalance,
      currentBalance: s.currentBalance,
      status: s.status,
    });
  });
  applySheetFormatting(s4);

  // 5. Categories
  const s5 = workbook.addWorksheet('5_Categories');
  s5.columns = [
    { header: 'Category_ID', key: 'id' },
    { header: 'Category_Name', key: 'name' },
    { header: 'Description', key: 'desc' },
    { header: 'Status', key: 'status' },
  ];
  data.categories.forEach((cat) => {
    s5.addRow({ id: cat.id, name: cat.name, desc: cat.description, status: cat.status });
  });
  applySheetFormatting(s5);

  // 6. Brands
  const s6 = workbook.addWorksheet('6_Brands');
  s6.columns = [
    { header: 'Brand_ID', key: 'id' },
    { header: 'Brand_Name', key: 'name' },
    { header: 'Country_Of_Origin', key: 'origin' },
    { header: 'Status', key: 'status' },
  ];
  data.brands.forEach((b) => {
    s6.addRow({ id: b.id, name: b.name, origin: b.countryOfOrigin, status: b.status });
  });
  applySheetFormatting(s6);

  // 7. Products
  const s7 = workbook.addWorksheet('7_Products');
  s7.columns = [
    { header: 'Product_ID', key: 'id' },
    { header: 'Barcode', key: 'barcode' },
    { header: 'Image_URL', key: 'image' },
    { header: 'Product_Name', key: 'name' },
    { header: 'Category_ID', key: 'catId' },
    { header: 'Brand_ID', key: 'brandId' },
    { header: 'Unit', key: 'unit' },
    { header: 'Size', key: 'size' },
    { header: 'Buying_Price', key: 'buyingPrice' },
    { header: 'Selling_Price', key: 'sellingPrice' },
    { header: 'Min_Selling_Price', key: 'minSellingPrice' },
    { header: 'Opening_Stock', key: 'openingStock' },
    { header: 'Current_Stock', key: 'currentStock' },
    { header: 'Low_Stock_Alert', key: 'lowStockAlert' },
    { header: 'Status', key: 'status' },
  ];
  data.products.forEach((p) => {
    s7.addRow({
      id: p.id,
      barcode: p.barcode,
      image: p.imageUrl,
      name: p.name,
      catId: p.categoryId,
      brandId: p.brandId,
      unit: p.unit,
      size: p.size,
      buyingPrice: p.buyingPrice,
      sellingPrice: p.sellingPrice,
      minSellingPrice: p.minSellingPrice,
      openingStock: p.openingStock,
      currentStock: p.currentStock,
      lowStockAlert: p.lowStockAlert,
      status: p.status,
    });
  });
  applySheetFormatting(s7);

  // 8. Sales Orders
  const s8 = workbook.addWorksheet('8_Sales_Orders');
  s8.columns = [
    { header: 'Order_ID', key: 'id' },
    { header: 'Order_Date', key: 'date' },
    { header: 'Customer_ID', key: 'custId' },
    { header: 'Customer_Name', key: 'custName' },
    { header: 'Order_Type', key: 'type' },
    { header: 'Subtotal', key: 'subtotal' },
    { header: 'Discount_Amount', key: 'discount' },
    { header: 'Delivery_Charge', key: 'delivery' },
    { header: 'Grand_Total', key: 'grandTotal' },
    { header: 'Advance_Paid', key: 'advance' },
    { header: 'Due_Amount', key: 'due' },
    { header: 'Payment_Status', key: 'payStatus' },
    { header: 'Delivery_Status', key: 'delStatus' },
    { header: 'Notes', key: 'notes' },
    { header: 'Created_By', key: 'createdBy' },
  ];
  data.salesOrders.forEach((so) => {
    s8.addRow({
      id: so.id,
      date: so.orderDate,
      custId: so.customerId,
      custName: so.customerName || '',
      type: so.orderType,
      subtotal: so.subtotal,
      discount: so.discountAmount,
      delivery: so.deliveryCharge,
      grandTotal: so.grandTotal,
      advance: so.advancePaid,
      due: so.dueAmount,
      payStatus: so.paymentStatus,
      delStatus: so.deliveryStatus,
      notes: so.notes,
      createdBy: so.createdBy,
    });
  });
  applySheetFormatting(s8);

  // 9. Sales Order Items
  const s9 = workbook.addWorksheet('9_Sales_Order_Items');
  s9.columns = [
    { header: 'Item_ID', key: 'id' },
    { header: 'Order_ID', key: 'orderId' },
    { header: 'Product_ID', key: 'prodId' },
    { header: 'Product_Name', key: 'prodName' },
    { header: 'Quantity', key: 'qty' },
    { header: 'Unit_Price', key: 'unitPrice' },
    { header: 'Total_Price', key: 'totalPrice' },
    { header: 'Profit_Amount', key: 'profit' },
  ];
  data.salesOrders.forEach((so) => {
    so.items.forEach((item) => {
      s9.addRow({
        id: item.id,
        orderId: item.orderId,
        prodId: item.productId,
        prodName: item.productName || '',
        qty: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        profit: item.profitAmount,
      });
    });
  });
  applySheetFormatting(s9);

  // 10. Purchases
  const s10 = workbook.addWorksheet('10_Purchases');
  s10.columns = [
    { header: 'Purchase_ID', key: 'id' },
    { header: 'Purchase_Date', key: 'date' },
    { header: 'Supplier_ID', key: 'supId' },
    { header: 'Supplier_Name', key: 'supName' },
    { header: 'Invoice_Number', key: 'invNo' },
    { header: 'Subtotal', key: 'subtotal' },
    { header: 'Discount_Amount', key: 'discount' },
    { header: 'Transport_Cost', key: 'transport' },
    { header: 'Grand_Total', key: 'grandTotal' },
    { header: 'Paid_Amount', key: 'paid' },
    { header: 'Due_Amount', key: 'due' },
    { header: 'Payment_Status', key: 'payStatus' },
    { header: 'Status', key: 'status' },
    { header: 'Notes', key: 'notes' },
  ];
  data.purchases.forEach((po) => {
    s10.addRow({
      id: po.id,
      date: po.purchaseDate,
      supId: po.supplierId,
      supName: po.supplierName || '',
      invNo: po.invoiceNumber,
      subtotal: po.subtotal,
      discount: po.discountAmount,
      transport: po.transportCost,
      grandTotal: po.grandTotal,
      paid: po.paidAmount,
      due: po.dueAmount,
      payStatus: po.paymentStatus,
      status: po.status,
      notes: po.notes,
    });
  });
  applySheetFormatting(s10);

  // 11. Purchase Items
  const s11 = workbook.addWorksheet('11_Purchase_Items');
  s11.columns = [
    { header: 'Item_ID', key: 'id' },
    { header: 'Purchase_ID', key: 'purchaseId' },
    { header: 'Product_ID', key: 'prodId' },
    { header: 'Product_Name', key: 'prodName' },
    { header: 'Quantity', key: 'qty' },
    { header: 'Unit_Cost', key: 'unitCost' },
    { header: 'Total_Cost', key: 'totalCost' },
  ];
  data.purchases.forEach((po) => {
    po.items.forEach((item) => {
      s11.addRow({
        id: item.id,
        purchaseId: item.purchaseId,
        prodId: item.productId,
        prodName: item.productName || '',
        qty: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
      });
    });
  });
  applySheetFormatting(s11);

  // 12. Customer Payments
  const s12 = workbook.addWorksheet('12_Customer_Payments');
  s12.columns = [
    { header: 'Payment_ID', key: 'id' },
    { header: 'Payment_Date', key: 'date' },
    { header: 'Customer_ID', key: 'custId' },
    { header: 'Customer_Name', key: 'custName' },
    { header: 'Order_ID', key: 'orderId' },
    { header: 'Payment_Method', key: 'method' },
    { header: 'Amount', key: 'amount' },
    { header: 'Reference_No', key: 'refNo' },
    { header: 'Notes', key: 'notes' },
  ];
  data.customerPayments.forEach((cp) => {
    s12.addRow({
      id: cp.id,
      date: cp.paymentDate,
      custId: cp.customerId,
      custName: cp.customerName || '',
      orderId: cp.orderId || '',
      method: cp.paymentMethod,
      amount: cp.amount,
      refNo: cp.referenceNo,
      notes: cp.notes,
    });
  });
  applySheetFormatting(s12);

  // 13. Supplier Payments
  const s13 = workbook.addWorksheet('13_Supplier_Payments');
  s13.columns = [
    { header: 'Payment_ID', key: 'id' },
    { header: 'Payment_Date', key: 'date' },
    { header: 'Supplier_ID', key: 'supId' },
    { header: 'Supplier_Name', key: 'supName' },
    { header: 'Purchase_ID', key: 'purchaseId' },
    { header: 'Payment_Method', key: 'method' },
    { header: 'Amount', key: 'amount' },
    { header: 'Reference_No', key: 'refNo' },
    { header: 'Notes', key: 'notes' },
  ];
  data.supplierPayments.forEach((sp) => {
    s13.addRow({
      id: sp.id,
      date: sp.paymentDate,
      supId: sp.supplierId,
      supName: sp.supplierName || '',
      purchaseId: sp.purchaseId || '',
      method: sp.paymentMethod,
      amount: sp.amount,
      refNo: sp.referenceNo,
      notes: sp.notes,
    });
  });
  applySheetFormatting(s13);

  // 14. Expenses
  const s14 = workbook.addWorksheet('14_Expenses');
  s14.columns = [
    { header: 'Expense_ID', key: 'id' },
    { header: 'Expense_Date', key: 'date' },
    { header: 'Category', key: 'category' },
    { header: 'Amount', key: 'amount' },
    { header: 'Payment_Method', key: 'method' },
    { header: 'Description', key: 'desc' },
    { header: 'Reference_No', key: 'refNo' },
  ];
  data.expenses.forEach((exp) => {
    s14.addRow({
      id: exp.id,
      date: exp.expenseDate,
      category: exp.category,
      amount: exp.amount,
      method: exp.paymentMethod,
      desc: exp.description,
      refNo: exp.referenceNo,
    });
  });
  applySheetFormatting(s14);

  // 15. Stock Movement
  const s15 = workbook.addWorksheet('15_Stock_Movement');
  s15.columns = [
    { header: 'Movement_ID', key: 'id' },
    { header: 'Movement_Date', key: 'date' },
    { header: 'Product_ID', key: 'prodId' },
    { header: 'Product_Name', key: 'prodName' },
    { header: 'Type', key: 'type' },
    { header: 'Quantity', key: 'qty' },
    { header: 'Previous_Stock', key: 'prev' },
    { header: 'New_Stock', key: 'newStock' },
    { header: 'Reference_Type', key: 'refType' },
    { header: 'Reference_ID', key: 'refId' },
    { header: 'Remarks', key: 'remarks' },
  ];
  data.stockMovements.forEach((sm) => {
    s15.addRow({
      id: sm.id,
      date: sm.movementDate,
      prodId: sm.productId,
      prodName: sm.productName || '',
      type: sm.type,
      qty: sm.quantity,
      prev: sm.previousStock,
      newStock: sm.newStock,
      refType: sm.referenceType,
      refId: sm.referenceId,
      remarks: sm.remarks,
    });
  });
  applySheetFormatting(s15);

  // 16. Customer Ledger
  const s16 = workbook.addWorksheet('16_Customer_Ledger');
  s16.columns = [
    { header: 'Entry_ID', key: 'id' },
    { header: 'Date', key: 'date' },
    { header: 'Customer_ID', key: 'custId' },
    { header: 'Customer_Name', key: 'custName' },
    { header: 'Transaction_Type', key: 'type' },
    { header: 'Reference_ID', key: 'refId' },
    { header: 'Debit_Invoiced', key: 'debit' },
    { header: 'Credit_Paid', key: 'credit' },
    { header: 'Balance', key: 'balance' },
  ];
  data.customerLedgers.forEach((cl) => {
    s16.addRow({
      id: cl.id,
      date: cl.date,
      custId: cl.customerId,
      custName: cl.customerName || '',
      type: cl.transactionType,
      refId: cl.referenceId,
      debit: cl.debit,
      credit: cl.credit,
      balance: cl.balance,
    });
  });
  applySheetFormatting(s16);

  // 17. Supplier Ledger
  const s17 = workbook.addWorksheet('17_Supplier_Ledger');
  s17.columns = [
    { header: 'Entry_ID', key: 'id' },
    { header: 'Date', key: 'date' },
    { header: 'Supplier_ID', key: 'supId' },
    { header: 'Supplier_Name', key: 'supName' },
    { header: 'Transaction_Type', key: 'type' },
    { header: 'Reference_ID', key: 'refId' },
    { header: 'Debit_Paid', key: 'debit' },
    { header: 'Credit_Invoiced', key: 'credit' },
    { header: 'Balance', key: 'balance' },
  ];
  data.supplierLedgers.forEach((sl) => {
    s17.addRow({
      id: sl.id,
      date: sl.date,
      supId: sl.supplierId,
      supName: sl.supplierName || '',
      type: sl.transactionType,
      refId: sl.referenceId,
      debit: sl.debit,
      credit: sl.credit,
      balance: sl.balance,
    });
  });
  applySheetFormatting(s17);

  // 18. Profit Report
  const s18 = workbook.addWorksheet('18_Profit_Report');
  s18.columns = [
    { header: 'Period_Month', key: 'month' },
    { header: 'Total_Sales_Revenue', key: 'sales' },
    { header: 'Cost_Of_Goods_Sold', key: 'cogs' },
    { header: 'Gross_Profit', key: 'gross' },
    { header: 'Total_Expenses', key: 'expenses' },
    { header: 'Net_Profit_Loss', key: 'net' },
  ];
  const cogs = data.salesOrders.reduce((acc, so) => {
    return (
      acc +
      so.items.reduce((iAcc, item) => {
        const p = data.products.find((prod) => prod.id === item.productId);
        return iAcc + item.quantity * (p ? p.buyingPrice : 0);
      }, 0)
    );
  }, 0);
  const grossProfit = totalSales - cogs;
  s18.addRow({
    month: '2026-07 (July)',
    sales: totalSales,
    cogs: cogs,
    gross: grossProfit,
    expenses: totalExpenses,
    net: grossProfit - totalExpenses,
  });
  applySheetFormatting(s18);

  // 19. Sales Report
  const s19 = workbook.addWorksheet('19_Sales_Report');
  s19.columns = [
    { header: 'Report_ID', key: 'id' },
    { header: 'Report_Date', key: 'date' },
    { header: 'Total_Orders', key: 'orders' },
    { header: 'Retail_Sales_BDT', key: 'retail' },
    { header: 'Wholesale_Sales_BDT', key: 'wholesale' },
    { header: 'Total_Discounts', key: 'discount' },
    { header: 'Total_Collections', key: 'collections' },
  ];
  const retailSales = data.salesOrders.filter((s) => s.orderType === 'Retail').reduce((a, b) => a + b.grandTotal, 0);
  const wholesaleSales = data.salesOrders.filter((s) => s.orderType === 'Wholesale').reduce((a, b) => a + b.grandTotal, 0);
  const totalDiscounts = data.salesOrders.reduce((a, b) => a + b.discountAmount, 0);
  const totalCollections =
    data.salesOrders.reduce((a, b) => a + b.advancePaid, 0) + data.customerPayments.reduce((a, b) => a + b.amount, 0);
  s19.addRow({
    id: 'RPT-SALES-01',
    date: new Date().toISOString().split('T')[0],
    orders: data.salesOrders.length,
    retail: retailSales,
    wholesale: wholesaleSales,
    discount: totalDiscounts,
    collections: totalCollections,
  });
  applySheetFormatting(s19);

  // 20. Purchase Report
  const s20 = workbook.addWorksheet('20_Purchase_Report');
  s20.columns = [
    { header: 'Report_ID', key: 'id' },
    { header: 'Report_Date', key: 'date' },
    { header: 'Total_Purchase_Orders', key: 'pos' },
    { header: 'Total_Purchase_Amount', key: 'amount' },
    { header: 'Total_Paid_To_Suppliers', key: 'paid' },
    { header: 'Total_Supplier_Due', key: 'due' },
  ];
  const totalSupplierPaid =
    data.purchases.reduce((a, b) => a + b.paidAmount, 0) + data.supplierPayments.reduce((a, b) => a + b.amount, 0);
  s20.addRow({
    id: 'RPT-PURCHASE-01',
    date: new Date().toISOString().split('T')[0],
    pos: data.purchases.length,
    amount: totalPurchases,
    paid: totalSupplierPaid,
    due: totalSupplierDue,
  });
  applySheetFormatting(s20);

  // 21. Stock Report
  const s21 = workbook.addWorksheet('21_Stock_Report');
  s21.columns = [
    { header: 'Report_ID', key: 'id' },
    { header: 'Total_SKUs', key: 'skus' },
    { header: 'Total_Stock_Units', key: 'qty' },
    { header: 'Valuation_At_Cost_BDT', key: 'costVal' },
    { header: 'Valuation_At_Retail_BDT', key: 'retailVal' },
    { header: 'Low_Stock_Items_Count', key: 'lowCount' },
  ];
  const totalStockQty = data.products.reduce((a, b) => a + b.currentStock, 0);
  const valAtCost = data.products.reduce((a, b) => a + b.currentStock * b.buyingPrice, 0);
  const valAtRetail = data.products.reduce((a, b) => a + b.currentStock * b.sellingPrice, 0);
  s21.addRow({
    id: 'RPT-STOCK-01',
    skus: data.products.length,
    qty: totalStockQty,
    costVal: valAtCost,
    retailVal: valAtRetail,
    lowCount: lowStockCount,
  });
  applySheetFormatting(s21);

  // 22. Due Report
  const s22 = workbook.addWorksheet('22_Due_Report');
  s22.columns = [
    { header: 'Report_ID', key: 'id' },
    { header: 'Customer_Receivables_Due', key: 'rec' },
    { header: 'Supplier_Payables_Due', key: 'pay' },
    { header: 'Net_Working_Capital', key: 'netCap' },
  ];
  s22.addRow({
    id: 'RPT-DUE-01',
    rec: totalCustomerDue,
    pay: totalSupplierDue,
    netCap: totalCustomerDue - totalSupplierDue,
  });
  applySheetFormatting(s22);

  // 23. Invoice Print Template Reference
  const s23 = workbook.addWorksheet('23_Invoice_Print');
  s23.columns = [
    { header: 'Invoice_No', key: 'invNo' },
    { header: 'Order_Date', key: 'date' },
    { header: 'Customer_Name', key: 'cust' },
    { header: 'Grand_Total_BDT', key: 'total' },
    { header: 'Advance_Paid', key: 'adv' },
    { header: 'Due_Amount', key: 'due' },
    { header: 'Print_Status', key: 'status' },
  ];
  data.salesOrders.forEach((so) => {
    s23.addRow({
      invNo: `INV-${so.id}`,
      date: so.orderDate,
      cust: so.customerName || so.customerId,
      total: so.grandTotal,
      adv: so.advancePaid,
      due: so.dueAmount,
      status: 'Ready for PDF/Print',
    });
  });
  applySheetFormatting(s23);

  // 24. App Settings / Full Database Specification
  const s24 = workbook.addWorksheet('24_App_Settings');
  s24.columns = [
    { header: 'Sheet_Name', key: 'sheet' },
    { header: 'Column_Name', key: 'col' },
    { header: 'Data_Type', key: 'type' },
    { header: 'Is_Primary_Key', key: 'pk' },
    { header: 'Foreign_Keys', key: 'fk' },
    { header: 'Ref_Relationship', key: 'ref' },
    { header: 'IsPartOf_Relationship', key: 'isPartOf' },
    { header: 'Required', key: 'req' },
    { header: 'Initial_Value', key: 'init' },
    { header: 'Valid_If_Rule', key: 'validIf' },
    { header: 'AppSheet_Formula', key: 'formula' },
  ];
  ALL_TABLE_SCHEMAS.forEach((spec) => {
    spec.columns.forEach((col) => {
      s24.addRow({
        sheet: col.sheetName,
        col: col.columnName,
        type: col.appSheetType,
        pk: col.isPrimaryKey ? 'YES' : 'NO',
        fk: col.foreignKeys || '',
        ref: col.refRelationship || '',
        isPartOf: col.isPartOfRelationship ? 'TRUE' : 'FALSE',
        req: col.required ? 'YES' : 'NO',
        init: col.initialValue,
        validIf: col.validIf,
        formula: col.suggestedFormula,
      });
    });
  });
  applySheetFormatting(s24);

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hayat_Haven_Enterprise_ERP_Master_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
