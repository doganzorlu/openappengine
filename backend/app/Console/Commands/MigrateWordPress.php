<?php

namespace App\Console\Commands;

use App\Services\WordPress\WordPressMigrator;
use Illuminate\Console\Command;

class MigrateWordPress extends Command
{
    protected $signature = 'engine:migrate-wp 
                            {slug : Site slug identifier (e.g. berilzorlu)}
                            {--db= : Source WordPress database name}
                            {--prefix=wp_ : WordPress table prefix}
                            {--uploads= : Path to wp-content/uploads directory}';

    protected $description = 'Migrate a WordPress + Elementor site into OpenAppEngine';

    public function handle(WordPressMigrator $migrator): int
    {
        $slug = $this->argument('slug');
        $db = $this->option('db') ?: 'wp_' . $slug;
        $prefix = $this->option('prefix') ?: 'wp_';
        $uploads = $this->option('uploads');

        $this->info("🚀 Starting migration for [{$slug}] from database [{$db}] (prefix: {$prefix})...");

        try {
            $stats = $migrator->migrate($slug, $db, $prefix, $uploads);

            $this->newLine();
            $this->info("✅ Migration completed successfully!");
            $this->table(
                ['Entity', 'Imported Count'],
                [
                    ['Site Name', $stats['site']],
                    ['Pages', $stats['pages']],
                    ['Posts', $stats['posts']],
                    ['Menus', $stats['menus']],
                    ['Forms', $stats['forms']],
                    ['Media/Storage Files', $stats['media'] ?? 0],
                ]
            );

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("❌ Migration failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
