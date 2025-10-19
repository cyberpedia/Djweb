<?php
// Simple front controller for XAMPP/LAMP when DocumentRoot points to repo root.
// Delegates to public/index.php which contains the UI.
require __DIR__ . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.php';