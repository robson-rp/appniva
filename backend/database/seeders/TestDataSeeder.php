<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Goal;
use App\Models\Debt;
use App\Models\Budget;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test data...');

        // Create 5 test profiles
        $profiles = Profile::factory()->count(5)->create();

        $this->command->info('Created 5 profiles');

        foreach ($profiles as $profile) {
            // Create 2-4 accounts per profile
            $accounts = Account::factory()->count(rand(2, 4))->create([
                'user_id' => $profile->id,
            ]);

            // Create 5-10 categories per profile
            $categories = Category::factory()->count(rand(5, 10))->create([
                'user_id' => $profile->id,
            ]);

            // Create 20-50 transactions per profile
            foreach ($accounts as $account) {
                $transactionCount = rand(5, 15);
                foreach (range(1, $transactionCount) as $i) {
                    Transaction::factory()->create([
                        'account_id' => $account->id,
                        'category_id' => $categories->random()->id,
                    ]);
                }
            }

            // Create 2-5 goals per profile
            Goal::factory()->count(rand(2, 5))->create([
                'user_id' => $profile->id,
            ]);

            // Create 1-3 debts per profile
            Debt::factory()->count(rand(1, 3))->create([
                'user_id' => $profile->id,
            ]);

            // Create 3-6 budgets per profile
            foreach (range(1, rand(3, 6)) as $i) {
                Budget::factory()->create([
                    'user_id' => $profile->id,
                    'category_id' => $categories->random()->id,
                ]);
            }

            $this->command->info("Created test data for profile: {$profile->email}");
        }

        $this->command->info('✅ Test data seeding completed!');
        $this->command->info('📊 Summary:');
        $this->command->info("  - Profiles: " . Profile::count());
        $this->command->info("  - Accounts: " . Account::count());
        $this->command->info("  - Categories: " . Category::count());
        $this->command->info("  - Transactions: " . Transaction::count());
        $this->command->info("  - Goals: " . Goal::count());
        $this->command->info("  - Debts: " . Debt::count());
        $this->command->info("  - Budgets: " . Budget::count());
    }
}
