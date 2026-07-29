# Hayat Haven ERP Documentation Index

Welcome to the comprehensive technical and operational documentation for **Hayat Haven ERP & Custom Gift Management Platform**.

This documentation suite covers system architecture, database design, security models, business workflows, deployment strategies, and user manuals.

---

## 📚 Table of Contents

1. [01. System Architecture & Folder Structure](./01-SYSTEM_ARCHITECTURE_AND_FOLDER_STRUCTURE.md)
   - High-level architecture
   - Directory tree & component organization
   - Technology stack breakdown

2. [02. Database Schema & Firestore Collections](./02-DATABASE_SCHEMA_AND_FIRESTORE_COLLECTIONS.md)
   - Entity relationship model
   - Detailed collection schemas & data types
   - Offline sync & indexed DB storage structure

3. [03. User Roles & Security Model](./03-USER_ROLES_AND_SECURITY.md)
   - Role Hierarchy (Admin, Manager, Executive)
   - Granular Module Access Matrix
   - Firestore Security Rules & Password Hashing

4. [04. Business Workflows & Operations](./04-BUSINESS_WORKFLOWS_AND_OPERATIONS.md)
   - Sales & Custom Order Lifecycle
   - Procurement & Supplier Ledger Tracking
   - Inventory Management & Negative Stock Guarding
   - Financial Reconciliation & Expense Tracking

5. [05. API & Integration Documentation](./05-API_AND_INTEGRATION_DOCS.md)
   - AI Assistant & WhatsApp Order Parsing API
   - SMS Gateway Integration API
   - Printer & Thermal Receipt Specifications

6. [06. Environment Variables & Deployment Guide](./06-ENVIRONMENT_VARS_AND_DEPLOYMENT.md)
   - Environment Configuration (.env.example)
   - Google Cloud Run Deployment Step-by-Step
   - Firebase Hosting & Rules Deployment

7. [07. Backup, Restore & Disaster Recovery](./07-BACKUP_RESTORE_AND_DISASTER_RECOVERY.md)
   - Automated Firestore Data Backups
   - JSON Local State Export & Manual Import
   - Emergency Rollback & Disaster Recovery Procedures

8. [08. User & Admin Manual](./08-USER_AND_ADMIN_MANUAL.md)
   - Daily Shop Operations Guide for Sales Executives
   - Inventory & Workshop Management Guide
   - Accounts, Profit Reports & Admin Control Panel

9. [09. Future Maintenance & Developer Guide](./09-FUTURE_MAINTENANCE_GUIDE.md)
   - Codebase Health & Quality Guidelines
   - Extending Modules & Adding Custom Fields
   - Troubleshooting Common Production Issues
