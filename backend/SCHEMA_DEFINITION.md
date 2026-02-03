# Appniva Backend - Database Schema Definition

## Status
- **Phase 2: Scaffolding** ✅ Completed
  - 47 Models generated
  - 47 Controllers generated  
  - 54 Migrations created (includes Sanctum migrations)
  - Laravel 11 + Sanctum configured

- **Phase 3: Database Migrations** 🟡 In Progress
  - Profiles table: ✅ Schema updated
  - Accounts table: ✅ Schema updated
  - Categories table: ✅ Schema updated
  - Tags table: ✅ Schema updated
  - Remaining 43 tables: ⏳ Need schema updates

## Tables to be Migrated (Dependency Order)

### Tier 1: User & Auth (4 tables)
```sql
1. profiles (UUID id - PRIMARY)
   - email (UNIQUE)
   - name
   - primary_currency (default: AOA)
   - monthly_income (DECIMAL)
   - onboarding_completed (BOOL)
   - is_suspended (BOOL)
   - suspended_by (UUID, nullable)
   - suspended_at (TIMESTAMP, nullable)
   - timestamps

2. user_roles
   - user_id (FK profiles.id CASCADE)
   - role (ENUM: admin, user)

3. user_maturity_profiles
   - user_id (FK profiles.id CASCADE)
   - level (ENUM: beginner, intermediate, advanced)
   - has_debts, has_investments, uses_budget, has_fixed_income (BOOL)
   - primary_goal (VARCHAR)
   - onboarding_completed, progress_tracking (BOOL)

4. user_mobile_preferences
   - user_id (FK profiles.id CASCADE)
   - selected_features (JSON array)
```

### Tier 2: Financial Core (6 tables)
```sql
5. accounts
   - id (BIGINT - auto increment)
   - user_id (FK profiles.id CASCADE)
   - name (VARCHAR)
   - type (ENUM: savings, checking, investment, credit_card)
   - currency (CHAR 3, default: AOA)
   - current_balance (DECIMAL 15,2)
   - initial_balance (DECIMAL, nullable)
   - institution_name (VARCHAR, nullable)
   - is_active (BOOL, default: true)
   - timestamps
   - INDEX: (user_id, type, is_active)

6. categories
   - id (BIGINT)
   - user_id (FK profiles.id CASCADE)
   - name (VARCHAR)
   - type (ENUM: expense, income)
   - icon, color (VARCHAR, nullable)
   - is_default (BOOL)
   - timestamps
   - INDEX: (user_id, type)

7. tags
   - id (BIGINT)
   - user_id (FK profiles.id CASCADE)
   - name (VARCHAR)
   - color (VARCHAR, nullable)
   - timestamps
   - INDEX: user_id

8. transactions
   - id (BIGINT)
   - user_id (FK profiles.id CASCADE)
   - account_id (FK accounts.id CASCADE)
   - amount (DECIMAL 15,2)
   - type (ENUM: income, expense, transfer)
   - date (DATE)
   - description (VARCHAR, nullable)
   - category_id (FK categories.id NULLABLE)
   - cost_center_id (FK cost_centers.id NULLABLE)
   - related_account_id (FK accounts.id NULLABLE for transfers)
   - timestamps
   - INDEX: (user_id, account_id, date, type)

9. transaction_tags
   - id (BIGINT)
   - transaction_id (FK transactions.id CASCADE)
   - tag_id (FK tags.id CASCADE)
   - unique: (transaction_id, tag_id)

10. recurring_transactions
    - id (BIGINT)
    - user_id (FK profiles.id CASCADE)
    - account_id (FK accounts.id CASCADE)
    - amount (DECIMAL)
    - type (ENUM)
    - frequency (ENUM: daily, weekly, biweekly, monthly, quarterly, annual)
    - description (VARCHAR)
    - is_active (BOOL)
    - start_date (DATE)
    - end_date (DATE, nullable)
    - last_executed_at (TIMESTAMP, nullable)
    - next_execution_date (DATE)
    - category_id (FK, nullable)
    - timestamps
```

### Tier 3: Budgeting & Planning (6 tables)
```sql
11. cost_centers
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - type (ENUM)
    - description (VARCHAR)
    - is_active (BOOL)
    - timestamps

12. budgets
    - id (BIGINT)
    - user_id (FK CASCADE)
    - category_id (FK CASCADE)
    - month (CHAR 7 = YYYY-MM)
    - amount_limit (DECIMAL)
    - timestamps
    - INDEX: (user_id, month)

13. cost_center_budgets
    - id (BIGINT)
    - user_id (FK CASCADE)
    - cost_center_id (FK CASCADE)
    - month (CHAR 7)
    - amount_limit (DECIMAL)
    - alert_threshold (INT percentage)
    - timestamps

14. goals
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - target_amount (DECIMAL)
    - target_date (DATE)
    - current_saved_amount (DECIMAL)
    - status (ENUM: active, completed, abandoned)
    - currency (CHAR 3)
    - timestamps

15. goal_contributions
    - id (BIGINT)
    - goal_id (FK goals.id CASCADE)
    - amount (DECIMAL)
    - transaction_id (FK transactions.id, nullable)
    - timestamps

16. scenarios
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - time_horizon_years (INT)
    - monthly_income_estimate, monthly_expense_estimate (DECIMAL)
    - salary_increase_rate, inflation_rate, investment_return_rate (DECIMAL)
    - exchange_rate_projection (DECIMAL)
    - future_expenses (JSON)
    - timestamps
```

### Tier 4: Debt Management (2 tables)
```sql
17. debts
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - principal_amount (DECIMAL)
    - current_balance (DECIMAL)
    - type (ENUM: personal_loan, credit_card, mortgage, auto_loan, etc)
    - status (ENUM: active, paid_off, defaulted)
    - interest_rate_annual (DECIMAL)
    - installment_frequency (ENUM: monthly, biweekly, etc)
    - installment_amount (DECIMAL)
    - next_payment_date (DATE)
    - timestamps

18. debt_payments
    - id (BIGINT)
    - debt_id (FK CASCADE)
    - amount (DECIMAL)
    - payment_date (DATE)
    - transaction_id (FK transactions.id, nullable)
    - notes (TEXT)
    - timestamps
```

### Tier 5: Investments (3 tables)
```sql
19. investments
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - investment_type (ENUM: term_deposit, bond, otnr, stock, mutual_fund, crypto)
    - principal_amount (DECIMAL)
    - start_date (DATE)
    - maturity_date (DATE)
    - currency (CHAR 3)
    - institution_name (VARCHAR)
    - timestamps

20. term_deposits
    - id (BIGINT)
    - investment_id (FK CASCADE)
    - term_days (INT)
    - interest_rate_annual (DECIMAL)
    - interest_payment_frequency (ENUM)
    - auto_renew (BOOL)
    - tax_rate (DECIMAL, nullable)

21. bond_otnrs
    - id (BIGINT)
    - investment_id (FK CASCADE)
    - quantity (INT)
    - face_value_per_unit (DECIMAL)
    - coupon_rate_annual (DECIMAL)
    - coupon_frequency (ENUM)
    - isin (VARCHAR)
    - custodian_institution (VARCHAR)
```

### Tier 6: Services (4 tables)
```sql
22. subscriptions
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - amount (DECIMAL)
    - billing_cycle (ENUM: monthly, quarterly, annual)
    - next_renewal_date (DATE)
    - is_active (BOOL)
    - category_id (FK, nullable)
    - account_id (FK, nullable)
    - alert_days_before (INT)
    - timestamps

23. school_fees
    - id (BIGINT)
    - user_id (FK CASCADE)
    - school_name (VARCHAR)
    - student_name (VARCHAR)
    - amount (DECIMAL)
    - academic_year (CHAR 4)
    - due_date (DATE)
    - education_level (VARCHAR)
    - fee_type (VARCHAR)
    - paid (BOOL)
    - payment_proof_url (VARCHAR, nullable)
    - timestamps

24. school_fee_templates
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - school_name, amount, education_level, fee_type (VARCHAR)
    - is_recurring (BOOL)
    - timestamps

25. remittances
    - id (BIGINT)
    - user_id (FK CASCADE)
    - sender_name (VARCHAR)
    - recipient_name (VARCHAR)
    - amount_sent (DECIMAL)
    - amount_received (DECIMAL)
    - currency_from, currency_to (CHAR 3)
    - exchange_rate (DECIMAL)
    - fee (DECIMAL)
    - service_provider (VARCHAR)
    - transfer_date (DATE)
    - status (ENUM: pending, completed, failed)
    - timestamps
```

### Tier 7: Split Expenses (5 tables)
```sql
26. split_expenses
    - id (BIGINT)
    - creator_id (FK profiles.id CASCADE)
    - description (VARCHAR)
    - total_amount (DECIMAL)
    - expense_date (DATE)
    - currency (CHAR 3)
    - is_settled (BOOL)
    - receipt_url (VARCHAR, nullable)
    - share_token (VARCHAR, unique, nullable)
    - timestamps

27. split_expense_participants
    - id (BIGINT)
    - expense_id (FK CASCADE)
    - name (VARCHAR)
    - email (VARCHAR, nullable)
    - phone (VARCHAR, nullable)
    - amount_owed (DECIMAL)
    - amount_paid (DECIMAL)
    - is_creator (BOOL)
    - timestamps

28. split_expense_payment_history
    - id (BIGINT)
    - participant_id (FK split_expense_participants.id CASCADE)
    - amount (DECIMAL)
    - payment_date (DATE)
    - notes (TEXT, nullable)
    - timestamps

29. participant_groups
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - timestamps

30. participant_group_members
    - id (BIGINT)
    - group_id (FK participant_groups.id CASCADE)
    - name (VARCHAR)
    - email (VARCHAR, nullable)
    - phone (VARCHAR, nullable)
    - timestamps
```

### Tier 8: Savings Circles (3 tables)
```sql
31. kixikilas
    - id (BIGINT)
    - user_id (FK CASCADE)
    - name (VARCHAR)
    - contribution_amount (DECIMAL)
    - frequency (ENUM: weekly, biweekly, monthly)
    - current_round (INT)
    - total_members (INT)
    - status (ENUM: active, completed, suspended)
    - currency (CHAR 3)
    - timestamps

32. kixikila_members
    - id (BIGINT)
    - kixikila_id (FK CASCADE)
    - name (VARCHAR)
    - email (VARCHAR, nullable)
    - phone (VARCHAR, nullable)
    - is_creator (BOOL)
    - order_number (INT)
    - timestamps

33. kixikila_contributions
    - id (BIGINT)
    - kixikila_id (FK CASCADE)
    - member_id (FK kixikila_members.id CASCADE)
    - amount (DECIMAL)
    - round_number (INT)
    - paid_at (TIMESTAMP)
    - notes (TEXT, nullable)
    - timestamps
```

### Tier 9: Analytics & Insights (4 tables)
```sql
34. insights
    - id (BIGINT)
    - user_id (FK CASCADE)
    - insight_type (ENUM: budget_alert, savings_milestone, spending_pattern, investment_tip)
    - title (VARCHAR)
    - message (TEXT)
    - is_read (BOOL)
    - generated_at (TIMESTAMP)

35. daily_recommendations
    - id (BIGINT)
    - user_id (FK CASCADE)
    - title (VARCHAR)
    - message (TEXT)
    - action_label (VARCHAR, nullable)
    - action_route (VARCHAR, nullable)
    - priority (ENUM: high, medium, low)
    - created_at (TIMESTAMP)

36. financial_scores
    - id (BIGINT)
    - user_id (FK CASCADE)
    - score (INT 0-100)
    - criteria_json (JSON)
    - generated_at (TIMESTAMP)

37. category_prediction_logs
    - id (BIGINT)
    - transaction_id (FK transactions.id CASCADE, nullable)
    - predicted_category_id (FK categories.id, nullable)
    - description (VARCHAR)
    - confidence (DECIMAL 0-1)
    - accepted (BOOL)
    - created_at (TIMESTAMP)
```

### Tier 10: Advanced (9 tables)
```sql
38. bank_reconciliations
    - id (BIGINT)
    - user_id (FK CASCADE)
    - account_id (FK CASCADE)
    - transaction_id (FK, nullable)
    - external_amount (DECIMAL)
    - external_date (DATE)
    - external_description (VARCHAR)
    - status (ENUM: pending, matched, unmatched, resolved)
    - timestamps

39. financial_products
    - id (BIGINT)
    - name (VARCHAR)
    - product_type (ENUM)
    - institution_name (VARCHAR)
    - min_amount, max_amount (DECIMAL)
    - interest_rate_annual (DECIMAL, nullable)
    - term_min_days, term_max_days (INT, nullable)
    - features (JSON)
    - requirements (JSON)
    - description (TEXT)
    - timestamps

40. product_requests
    - id (BIGINT)
    - user_id (FK CASCADE)
    - product_id (FK financial_products.id)
    - requested_amount (DECIMAL, nullable)
    - requested_term_days (INT, nullable)
    - status (ENUM: pending, approved, rejected)
    - notes (TEXT)
    - response_notes (TEXT, nullable)
    - timestamps

41. exchange_rates
    - id (BIGINT)
    - base_currency (CHAR 3)
    - target_currency (CHAR 3)
    - rate (DECIMAL)
    - fetched_at (TIMESTAMP)
    - source (VARCHAR)
    - timestamps
    - INDEX: (base_currency, target_currency, fetched_at)

42. exchange_rate_alerts
    - id (BIGINT)
    - user_id (FK CASCADE)
    - base_currency (CHAR 3)
    - target_currency (CHAR 3)
    - threshold_rate (DECIMAL)
    - alert_direction (ENUM: above, below)
    - is_active (BOOL)
    - last_triggered_at (TIMESTAMP, nullable)
    - timestamps

43. inflation_rates
    - id (BIGINT)
    - country (CHAR 2)
    - month (CHAR 7 = YYYY-MM)
    - annual_rate (DECIMAL)
    - monthly_rate (DECIMAL)
    - source (VARCHAR)
    - timestamps

44. uploaded_documents
    - id (BIGINT)
    - user_id (FK CASCADE)
    - file_url (VARCHAR)
    - original_filename (VARCHAR)
    - file_type (ENUM: receipt, invoice, statement, other)
    - extracted_data (JSON, nullable)
    - processed (BOOL)
    - timestamps

45. security_logs
    - id (BIGINT)
    - user_id (FK CASCADE)
    - action (VARCHAR)
    - ip_address (VARCHAR)
    - device_info (VARCHAR)
    - details (JSON, nullable)
    - created_at (TIMESTAMP)
    - INDEX: (user_id, created_at)

46. admin_audit_logs
    - id (BIGINT)
    - admin_user_id (FK profiles.id CASCADE)
    - action_type (VARCHAR)
    - target_user_id (FK profiles.id, nullable)
    - target_table (VARCHAR)
    - target_id (VARCHAR)
    - details (JSON)
    - ip_address (VARCHAR)
    - created_at (TIMESTAMP)
    - INDEX: (admin_user_id, created_at)
```

## Next Steps
1. Complete schema definition for remaining 43 tables
2. Create/update migrations with full schema
3. Add indexes and foreign key constraints
4. Run migrations and seed base data
5. Configure API Resources for JSON mapping
6. Create Form Request validation classes
7. Setup Eloquent relationships in Models

## Notes
- All user_id fields reference profiles.id (UUID)
- Foreign keys use CASCADE delete for data consistency
- Timestamps on all tables
- Indexes on frequently filtered columns
- Support for multi-currency transactions (currency field)
- JSON fields for flexible data (features, requirements, extracted_data, etc)
