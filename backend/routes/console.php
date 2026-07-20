<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('app:health', function () {
    $this->info('Application is ready.');
})->purpose('Print a quick health message for the application');