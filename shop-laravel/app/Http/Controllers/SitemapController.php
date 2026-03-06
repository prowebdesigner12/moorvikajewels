<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Collection;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $baseUrl = 'https://moorvikajewels.com';
        $products = Product::select('id', 'slug', 'updated_at')->get();
        $collections = Collection::select('id', 'slug')->get();

        $urls = '';

        // Static Pages
        $staticPages = ['', '/about', '/contact', '/track'];
        foreach ($staticPages as $page) {
            $urls .= "
    <url>
       <loc>{$baseUrl}{$page}</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
    </url>";
        }

        // Products
        foreach ($products as $p) {
            $slug = $p->slug ?: $p->id;
            $lastMod = $p->updated_at->toIso8601String();
            $urls .= "
    <url>
       <loc>{$baseUrl}/product/{$slug}</loc>
       <lastmod>{$lastMod}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
    </url>";
        }

        // Collections
        foreach ($collections as $c) {
            $slug = $c->slug ?: $c->id;
            $urls .= "
    <url>
       <loc>{$baseUrl}/collections/{$slug}</loc>
       <changefreq>weekly</changefreq>
       <priority>0.9</priority>
    </url>";
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ' . $urls . '
</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'text/xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
