<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\RecurringTransaction;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Debt;
use App\Models\Investment;
use App\Models\CostCenter;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Generates large datasets for performance and pagination testing:
     * - Multiple user profiles (100)
     * - Accounts per user (2-5)
     * - Categories per user (10-20)
     * - Tags per user (5-15)
     * - Transactions: 15,000+ total (~150 per user)
     * - Other entities: proportional to transaction volume
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting database seeding with large datasets...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        $this->command->info('🗑️  Clearing existing data...');
        $tables = ['transactions', 'recurring_transactions', 'budgets', 'goals', 'debts',
                   'investments', 'subscriptions', 'cost_centers', 'tags', 'categories',
                   'accounts', 'profiles'];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create test profiles
        $this->command->info('👤 Creating 100 user profiles...');
        $profiles = Profile::factory(100)->create();

        $this->command->info('💰 Creating accounts, categories, and tags for each user...');

        $allAccounts = [];
        $allCategories = [];
        $allTags = [];
        $allCostCenters = [];

        foreach ($profiles as $profile) {
            // Create 2-5 accounts per user
            $accounts = Account::factory(rand(2, 5))->create([
                'user_id' => $profile->id
            ]);
            $allAccounts[$profile->id] = $accounts;

            // Create 10-20 categories per user
            $categories = Category::factory(rand(10, 20))->create([
                'user_id' => $profile->id
            ]);
            $allCategories[$profile->id] = $categories;

            // Create 5-15 tags per user
            $tags = Tag::factory(rand(5, 15))->create([
                'user_id' => $profile->id
            ]);
            $allTags[$profile->id] = $tags;

            // Create 2-5 cost centers per user
            $costCenters = CostCenter::factory(rand(2, 5))->create([
                'user_id' => $profile->id
            ]);
            $allCostCenters[$profile->id] = $costCenters;
        }

        // Create transactions in batches for performance
        $this->command->info('💳 Creating 15,000 transactions (150 per user)...');
        $transactionsCreated = 0;

        foreach ($profiles as $profile) {
            $userAccounts = $allAccounts[$profile->id];
            $userCategories = $allCategories[$profile->id];
            $userCostCenters = $allCostCenters[$profile->id];

            // Create 150 transactions per user (15,000 total)
            for ($i = 0; $i < 150; $i++) {
                $account = $userAccounts->random();
                $category = $userCategories->random();
                $costCenter = rand(0, 100) < 30 ? $userCostCenters->random()->id : null;

                Transaction::create([
                    'user_id' => $profile->id,
                    'account_id' => $account->id,
                    'amount' => fake()->randomFloat(2, 10, 5000),
                    'type' => fake()->randomElement(['income', 'expense']),
                    'date' => fake()->dateTimeBetween('-1 year', 'now'),
                    'description' => fake()->sentence(),
                    'category_id' => $category->id,
                    'cost_center_id' => $costCenter,
                    'related_account_id' => null,
                ]);

                $transactionsCreated++;
            }

            if ($transactionsCreated % 1000 == 0) {
                $this->command->info("  ✓ Created {$transactionsCreated} transactions...");
            }
        }

        $this->command->info('🔄 Creating recurring transactions...');
        foreach ($profiles as $profile) {
            $userAccounts = $allAccounts[$profile->id];
            $userCategories = $allCategories[$profile->id];

            RecurringTransaction::factory(rand(3, 10))->create([
                'user_id' => $profile->id,
                'account_id' => $userAccounts->random()->id,
                'category_id' => $userCategories->random()->id,
            ]);
        }

        $this->command->info('💵 Creating budgets...');
        foreach ($profiles as $profile) {
            $userCategories = $allCategories[$profile->id];

            Budget::factory(rand(3, 8))->create([
                'user_id' => $profile->id,
                'category_id' => $userCategories->random()->id,
            ]);
        }

        $this->command->info('🎯 Creating financial goals...');
        foreach ($profiles as $profile) {
            Goal::factory(rand(2, 5))->create([
                'user_id' => $profile->id,
            ]);
        }

        $this->command->info('💳 Creating debts...');
        foreach ($profiles as $profile) {
            if (rand(0, 100) < 60) { // 60% of users have debts
                Debt::factory(rand(1, 3))->create([
                    'user_id' => $profile->id,
                ]);
            }
        }

        $this->command->info('📈 Creating investments...');
        foreach ($profiles as $profile) {
            if (rand(0, 100) < 40) { // 40% of users have investments
                Investment::factory(rand(1, 4))->create([
                    'user_id' => $profile->id,
                ]);
            }
        }

        $this->command->info('📱 Creating subscriptions...');
        foreach ($profiles as $profile) {
            $userCategories = $allCategories[$profile->id];
            $userAccounts = $allAccounts[$profile->id];

            Subscription::factory(rand(2, 6))->create([
                'user_id' => $profile->id,
                'category_id' => $userCategories->random()->id,
                'account_id' => $userAccounts->random()->id,
            ]);
        }

        $this->command->info('');
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info('  - Profiles: ' . Profile::count());
        $this->command->info('  - Accounts: ' . Account::count());
        $this->command->info('  - Categories: ' . Category::count());
        $this->command->info('  - Tags: ' . Tag::count());
        $this->command->info('  - Transactions: ' . Transaction::count());
        $this->command->info('  - Recurring Transactions: ' . RecurringTransaction::count());
        $this->command->info('  - Budgets: ' . Budget::count());
        $this->command->info('  - Goals: ' . Goal::count());
        $this->command->info('  - Debts: ' . Debt::count());
        $this->command->info('  - Investments: ' . Investment::count());
        $this->command->info('  - Subscriptions: ' . Subscription::count());
        $this->command->info('');
    }
}
