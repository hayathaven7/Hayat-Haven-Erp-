# 09. Future Maintenance & Developer Guide

## 🛠️ Codebase Maintenance Standards

### 1. Code Style & Quality Guidelines
- Always maintain full TypeScript type compliance in `/src/types/erp.ts`.
- Run linter verification before deploying changes:
  ```bash
  npm run lint
  ```
- Run production compilation check:
  ```bash
  npm run build
  ```

---

### 2. How to Add a New ERP Module
1. Update `ModuleType` union type in `/src/types/erp.ts`.
2. Add module ID and title to `ALL_ERP_MODULES` array in `/src/data/initialData.ts`.
3. Create new component in `/src/components/modules/NewModule.tsx`.
4. Register the module view switch case inside `/src/components/ModuleView.tsx`.
5. Add icon mapping in `/src/components/Navigation.tsx`.

---

### 3. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Duplicate Barcode Error** | Product barcode already assigned to another item | Use unique barcode or leave blank for auto generation |
| **Insufficient Stock Error** | Sales order quantity exceeds `currentStock` | Restock item via Purchase Order or perform Stock IN adjustment |
| **Deletion Blocked Alert** | Customer or Supplier has existing ledger history | Deletion is locked to preserve financial ledger audit trails |
| **POS Printer Line Break** | Thermal paper width setting mismatch | Select correct paper size (80mm / 3-inch or 58mm) in Company Settings |
