<?php
/**
 * Auto-generate complete migration files for all 47 tables
 * This script will overwrite migration files with complete schema definitions
 */

$schemas = [
    'user_roles' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->enum('role', ['admin', 'user'])->default('user');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->unique(['user_id', 'role']);
        });
    }
MIGRATION,

    'user_maturity_profiles' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('user_maturity_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->boolean('has_debts')->default(false);
            $table->boolean('has_investments')->default(false);
            $table->boolean('uses_budget')->default(false);
            $table->boolean('has_fixed_income')->default(false);
            $table->string('primary_goal')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->integer('progress_tracking')->default(0);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }
MIGRATION,

    'user_mobile_preferences' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('user_mobile_preferences', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->json('selected_features')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }
MIGRATION,

    'cost_centers' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->enum('type', ['income', 'expense'])->default('expense');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'is_active']);
        });
    }
MIGRATION,

    'transaction_tags' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('transaction_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['transaction_id', 'tag_id']);
        });
    }
MIGRATION,

    'recurring_transactions' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['income', 'expense']);
            $table->enum('frequency', ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual']);
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamp('last_executed_at')->nullable();
            $table->date('next_execution_date');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'next_execution_date', 'is_active']);
        });
    }
MIGRATION,

    'budgets' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->char('month', 7); // YYYY-MM format
            $table->decimal('amount_limit', 15, 2);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'month']);
            $table->unique(['user_id', 'category_id', 'month']);
        });
    }
MIGRATION,

    'cost_center_budgets' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('cost_center_budgets', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('cost_center_id')->constrained()->onDelete('cascade');
            $table->char('month', 7);
            $table->decimal('amount_limit', 15, 2);
            $table->integer('alert_threshold')->default(90); // percentage
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'month']);
        });
    }
MIGRATION,

    'goals' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('target_amount', 15, 2);
            $table->date('target_date');
            $table->decimal('current_saved_amount', 15, 2)->default(0);
            $table->enum('status', ['active', 'completed', 'abandoned'])->default('active');
            $table->char('currency', 3)->default('AOA');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'status']);
        });
    }
MIGRATION,

    'goal_contributions' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('goal_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('goal_id');
        });
    }
MIGRATION,

    'scenarios' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->integer('time_horizon_years')->default(5);
            $table->decimal('monthly_income_estimate', 15, 2)->nullable();
            $table->decimal('monthly_expense_estimate', 15, 2)->nullable();
            $table->decimal('salary_increase_rate', 5, 4)->nullable();
            $table->decimal('inflation_rate', 5, 4)->nullable();
            $table->decimal('investment_return_rate', 5, 4)->nullable();
            $table->decimal('exchange_rate_projection', 15, 4)->nullable();
            $table->json('future_expenses')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index('user_id');
        });
    }
MIGRATION,

    'debts' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('current_balance', 15, 2);
            $table->enum('type', ['personal_loan', 'credit_card', 'mortgage', 'auto_loan', 'student_loan', 'other']);
            $table->enum('status', ['active', 'paid_off', 'defaulted'])->default('active');
            $table->decimal('interest_rate_annual', 5, 4)->nullable();
            $table->enum('installment_frequency', ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'])->default('monthly');
            $table->decimal('installment_amount', 15, 2)->nullable();
            $table->date('next_payment_date')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'status']);
        });
    }
MIGRATION,

    'debt_payments' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['debt_id', 'payment_date']);
        });
    }
MIGRATION,

    'investments' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->enum('investment_type', ['term_deposit', 'bond', 'otnr', 'stock', 'mutual_fund', 'crypto']);
            $table->decimal('principal_amount', 15, 2);
            $table->date('start_date');
            $table->date('maturity_date')->nullable();
            $table->char('currency', 3)->default('AOA');
            $table->string('institution_name')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'investment_type']);
        });
    }
MIGRATION,

    'term_deposits' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('term_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->onDelete('cascade');
            $table->integer('term_days');
            $table->decimal('interest_rate_annual', 5, 4);
            $table->enum('interest_payment_frequency', ['monthly', 'quarterly', 'annually', 'at_maturity']);
            $table->boolean('auto_renew')->default(false);
            $table->decimal('tax_rate', 5, 4)->nullable();
            $table->timestamps();
        });
    }
MIGRATION,

    'bond_otnrs' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('bond_otnrs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('face_value_per_unit', 15, 2);
            $table->decimal('coupon_rate_annual', 5, 4);
            $table->enum('coupon_frequency', ['monthly', 'quarterly', 'annually']);
            $table->string('isin')->nullable();
            $table->string('custodian_institution')->nullable();
            $table->timestamps();
        });
    }
MIGRATION,

    'subscriptions' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('amount', 15, 2);
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'annual']);
            $table->date('next_renewal_date');
            $table->boolean('is_active')->default(true);
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('alert_days_before')->default(7);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'is_active']);
        });
    }
MIGRATION,

    'school_fees' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('school_fees', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('school_name');
            $table->string('student_name');
            $table->decimal('amount', 15, 2);
            $table->char('academic_year', 4);
            $table->date('due_date');
            $table->string('education_level');
            $table->string('fee_type');
            $table->boolean('paid')->default(false);
            $table->string('payment_proof_url')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'academic_year']);
        });
    }
MIGRATION,

    'school_fee_templates' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('school_fee_templates', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->string('school_name');
            $table->decimal('amount', 15, 2);
            $table->string('education_level');
            $table->string('fee_type');
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index('user_id');
        });
    }
MIGRATION,

    'remittances' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('remittances', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('sender_name');
            $table->string('recipient_name');
            $table->decimal('amount_sent', 15, 2);
            $table->decimal('amount_received', 15, 2);
            $table->char('currency_from', 3);
            $table->char('currency_to', 3);
            $table->decimal('exchange_rate', 15, 6);
            $table->decimal('fee', 15, 2)->default(0);
            $table->string('service_provider');
            $table->date('transfer_date');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'status']);
        });
    }
MIGRATION,

    'split_expenses' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('split_expenses', function (Blueprint $table) {
            $table->id();
            $table->uuid('creator_id');
            $table->string('description');
            $table->decimal('total_amount', 15, 2);
            $table->date('expense_date');
            $table->char('currency', 3)->default('AOA');
            $table->boolean('is_settled')->default(false);
            $table->string('receipt_url')->nullable();
            $table->string('share_token')->nullable()->unique();
            $table->timestamps();

            $table->foreign('creator_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['creator_id', 'expense_date']);
        });
    }
MIGRATION,

    'split_expense_participants' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('split_expense_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_expense_id')->constrained('split_expenses')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('amount_owed', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->boolean('is_creator')->default(false);
            $table->timestamps();

            $table->index('split_expense_id');
        });
    }
MIGRATION,

    'split_expense_payment_histories' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('split_expense_payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('split_expense_participant_id')->constrained('split_expense_participants')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('split_expense_participant_id');
        });
    }
MIGRATION,

    'participant_groups' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('participant_groups', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index('user_id');
        });
    }
MIGRATION,

    'participant_group_members' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('participant_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_group_id')->constrained('participant_groups')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();

            $table->index('participant_group_id');
        });
    }
MIGRATION,

    'kixikilas' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('kixikilas', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('name');
            $table->decimal('contribution_amount', 15, 2);
            $table->enum('frequency', ['weekly', 'biweekly', 'monthly']);
            $table->integer('current_round')->default(1);
            $table->integer('total_members')->default(1);
            $table->enum('status', ['active', 'completed', 'suspended'])->default('active');
            $table->char('currency', 3)->default('AOA');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'status']);
        });
    }
MIGRATION,

    'kixikila_members' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('kixikila_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kixikila_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_creator')->default(false);
            $table->integer('order_number');
            $table->timestamps();

            $table->index('kixikila_id');
            $table->unique(['kixikila_id', 'order_number']);
        });
    }
MIGRATION,

    'kixikila_contributions' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('kixikila_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kixikila_id')->constrained()->onDelete('cascade');
            $table->foreignId('kixikila_member_id')->constrained('kixikila_members')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->integer('round_number');
            $table->timestamp('paid_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['kixikila_id', 'round_number']);
            $table->unique(['kixikila_id', 'kixikila_member_id', 'round_number']);
        });
    }
MIGRATION,

    'insights' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('insights', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->enum('insight_type', ['budget_alert', 'savings_milestone', 'spending_pattern', 'investment_tip']);
            $table->string('title');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('generated_at');

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'generated_at']);
        });
    }
MIGRATION,

    'daily_recommendations' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('daily_recommendations', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('title');
            $table->text('message');
            $table->string('action_label')->nullable();
            $table->string('action_route')->nullable();
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            $table->timestamp('created_at');

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
        });
    }
MIGRATION,

    'financial_scores' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('financial_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->integer('score'); // 0-100
            $table->json('criteria_json')->nullable();
            $table->timestamp('generated_at');

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'generated_at']);
        });
    }
MIGRATION,

    'category_prediction_logs' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('category_prediction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('predicted_category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('description');
            $table->decimal('confidence', 3, 2); // 0-1
            $table->boolean('accepted')->default(false);
            $table->timestamp('created_at');

            $table->index('transaction_id');
        });
    }
MIGRATION,

    'bank_reconciliations' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('external_amount', 15, 2);
            $table->date('external_date');
            $table->string('external_description');
            $table->enum('status', ['pending', 'matched', 'unmatched', 'resolved'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'account_id', 'status']);
        });
    }
MIGRATION,

    'financial_products' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('financial_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('product_type', ['savings_account', 'term_deposit', 'investment', 'loan', 'insurance', 'other']);
            $table->string('institution_name');
            $table->decimal('min_amount', 15, 2)->nullable();
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->decimal('interest_rate_annual', 5, 4)->nullable();
            $table->integer('term_min_days')->nullable();
            $table->integer('term_max_days')->nullable();
            $table->json('features')->nullable();
            $table->json('requirements')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('product_type');
        });
    }
MIGRATION,

    'product_requests' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('product_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('financial_product_id')->constrained('financial_products')->onDelete('cascade');
            $table->decimal('requested_amount', 15, 2)->nullable();
            $table->integer('requested_term_days')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->text('response_notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'status']);
        });
    }
MIGRATION,

    'exchange_rates' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->char('base_currency', 3);
            $table->char('target_currency', 3);
            $table->decimal('rate', 15, 6);
            $table->timestamp('fetched_at');
            $table->string('source');
            $table->timestamps();

            $table->index(['base_currency', 'target_currency', 'fetched_at']);
            $table->unique(['base_currency', 'target_currency', 'fetched_at']);
        });
    }
MIGRATION,

    'exchange_rate_alerts' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('exchange_rate_alerts', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->char('base_currency', 3);
            $table->char('target_currency', 3);
            $table->decimal('threshold_rate', 15, 6);
            $table->enum('alert_direction', ['above', 'below']);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'is_active']);
        });
    }
MIGRATION,

    'inflation_rates' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('inflation_rates', function (Blueprint $table) {
            $table->id();
            $table->char('country', 2);
            $table->char('month', 7); // YYYY-MM format
            $table->decimal('annual_rate', 5, 4);
            $table->decimal('monthly_rate', 5, 4);
            $table->string('source');
            $table->timestamps();

            $table->index(['country', 'month']);
            $table->unique(['country', 'month']);
        });
    }
MIGRATION,

    'uploaded_documents' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('uploaded_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('file_url');
            $table->string('original_filename');
            $table->enum('file_type', ['receipt', 'invoice', 'statement', 'other'])->default('other');
            $table->json('extracted_data')->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'processed']);
        });
    }
MIGRATION,

    'security_logs' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('action');
            $table->string('ip_address')->nullable();
            $table->string('device_info')->nullable();
            $table->json('details')->nullable();
            $table->timestamp('created_at');

            $table->foreign('user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
        });
    }
MIGRATION,

    'admin_audit_logs' => <<<'MIGRATION'
    public function up(): void
    {
        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('admin_user_id');
            $table->string('action_type');
            $table->uuid('target_user_id')->nullable();
            $table->string('target_table');
            $table->string('target_id');
            $table->json('details');
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at');

            $table->foreign('admin_user_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('target_user_id')->references('id')->on('profiles')->onDelete('setNull');
            $table->index(['admin_user_id', 'created_at']);
        });
    }
MIGRATION,
];

$migrationsPath = __DIR__ . '/database/migrations';
$filesUpdated = 0;
$errors = [];

foreach ($schemas as $tableName => $upMethod) {
    // Find the migration file for this table
    $files = glob("$migrationsPath/*_create_{$tableName}*_table.php");

    if (empty($files)) {
        $errors[] = "Migration file not found for table: $tableName";
        continue;
    }

    $migrationFile = $files[0];
    $content = file_get_contents($migrationFile);

    // Replace the up() method
    $pattern = '/public function up\(\): void\s*\{.*?\n    \}/s';
    $newContent = preg_replace($pattern, "public function up(): void\n    {" . $upMethod . "\n    }", $content);

    if ($newContent === null) {
        $errors[] = "Failed to update migration for table: $tableName";
        continue;
    }

    file_put_contents($migrationFile, $newContent);
    $filesUpdated++;
    echo "✓ Updated migration for: $tableName\n";
}

echo "\n✓ Successfully updated $filesUpdated migration files\n";

if (!empty($errors)) {
    echo "\n⚠ Errors:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
}
