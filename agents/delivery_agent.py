"""
Delivery Agent
==============

Packages all deliverables for client delivery.
Creates a comprehensive delivery package with website, brand kit, social posts, and finance summary.
"""

from typing import Dict, Any, List
import os
import json

# ─── Paths ─────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'projects')


def package_delivery(
    project_id: str,
    brand_data: Dict[str, Any],
    content_data: Dict[str, Any],
    social_data: Dict[str, Any],
    finance_data: Dict[str, Any],
    compose_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Package all deliverables for client delivery.
    
    Args:
        project_id: Project identifier
        brand_data: Output from brand agent
        content_data: Output from content agent
        social_data: Output from social agent
        finance_data: Output from finance agent
        compose_result: Output from composer agent
    
    Returns:
        Dict with delivery summary, files, and URLs
    """
    brand_name = brand_data.get("brand_name", "Brand")
    
    # Get file paths
    project_dir = os.path.join(OUTPUT_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    files = []
    
    # Check for generated files
    if os.path.exists(project_dir):
        for f in os.listdir(project_dir):
            files.append({
                "name": f,
                "path": f"/api/files/projects/{project_id}/{f}",
                "type": _get_file_type(f),
                "size_kb": round(os.path.getsize(os.path.join(project_dir, f)) / 1024, 1) if os.path.isfile(os.path.join(project_dir, f)) else 0
            })
    
    # Add logo SVG if it exists
    logo_path = os.path.join(project_dir, "logo.svg")
    if not os.path.exists(logo_path):
        # Generate a simple logo SVG
        _generate_logo_svg(project_dir, brand_name, brand_data.get("color_palette", {}))
        files.append({
            "name": "logo.svg",
            "path": f"/api/files/projects/{project_id}/logo.svg",
            "type": "logo",
            "size_kb": 2.0
        })
    
    # Add brand guidelines HTML
    guidelines_path = os.path.join(project_dir, "brand-guidelines.html")
    if not os.path.exists(guidelines_path):
        _generate_brand_guidelines(project_dir, brand_name, brand_data)
        files.append({
            "name": "brand-guidelines.html",
            "path": f"/api/files/projects/{project_id}/brand-guidelines.html",
            "type": "guidelines",
            "size_kb": 4.0
        })
    
    # Create delivery summary
    delivery = {
        "project_id": project_id,
        "brand_name": brand_name,
        "status": "delivered",
        "website_url": compose_result.get("preview_url", f"/api/files/projects/{project_id}/preview.html"),
        "brand_kit": {
            "logo": f"/api/files/projects/{project_id}/logo.svg",
            "colors": brand_data.get("color_palette", {}),
            "typography": brand_data.get("typography_direction", ""),
            "voice": brand_data.get("brand_voice", ""),
            "guidelines": f"/api/files/projects/{project_id}/brand-guidelines.html"
        },
        "social_posts": {
            "total_posts": social_data.get("total_posts", 0),
            "platforms": social_data.get("platforms", []),
            "posts": social_data.get("posts", [])[:5]  # Return top 5 posts
        },
        "finance": finance_data,
        "files": files,
        "deliverables_count": len(files),
        "message": f"Complete delivery package for {brand_name} — website, brand kit, social assets, and finance summary."
    }
    
    # Save delivery summary
    delivery_path = os.path.join(project_dir, "delivery.json")
    with open(delivery_path, 'w', encoding='utf-8') as f:
        json.dump(delivery, f, indent=2)
    
    return delivery


def _get_file_type(filename: str) -> str:
    """Determine file type from filename."""
    if filename.endswith('.html'):
        return 'website' if 'preview' in filename else 'guidelines'
    elif filename.endswith('.svg'):
        return 'logo'
    elif filename.endswith('.json'):
        return 'data'
    return 'other'


def _generate_logo_svg(output_dir: str, brand_name: str, colors: Dict[str, str]) -> str:
    """Generate a simple SVG logo."""
    primary = colors.get("primary", "#2563EB")
    secondary = colors.get("secondary", "#F3F4F6")
    
    initials = ''.join(word[0].upper() for word in brand_name.split()[:2])
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:{primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="120" fill="none"/>
  <circle cx="50" cy="60" r="35" fill="url(#grad)"/>
  <text x="50" y="68" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF" text-anchor="middle">{initials}</text>
  <text x="100" y="50" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" letter-spacing="-0.5">{brand_name}</text>
  <text x="100" y="78" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="400" fill="#9CA3AF" letter-spacing="2">BRAND IDENTITY</text>
</svg>"""
    
    svg_path = os.path.join(output_dir, "logo.svg")
    os.makedirs(output_dir, exist_ok=True)
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    return svg_path


def _generate_brand_guidelines(output_dir: str, brand_name: str, brand_data: Dict[str, Any]) -> str:
    """Generate brand guidelines HTML."""
    colors = brand_data.get("color_palette", {})
    primary = colors.get("primary", "#2563EB")
    secondary = colors.get("secondary", "#F3F4F6")
    accent = colors.get("accent", "#60A5FA")
    typography = brand_data.get("typography_direction", "Modern sans-serif")
    voice = brand_data.get("brand_voice", "Professional, trustworthy")
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{brand_name} — Brand Guidelines</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Inter', sans-serif; }}</style>
</head>
<body class="bg-gray-950 text-white p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-2">{brand_name}</h1>
        <p class="text-gray-400 text-lg mb-12">Brand Guidelines</p>
        
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6">Color Palette</h2>
            <div class="grid grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="w-full h-24 rounded-xl mb-3" style="background-color: {primary}"></div>
                    <p class="font-medium">Primary</p>
                    <p class="text-gray-500 text-sm">{primary}</p>
                </div>
                <div class="text-center">
                    <div class="w-full h-24 rounded-xl mb-3 border border-gray-700" style="background-color: {secondary}"></div>
                    <p class="font-medium">Secondary</p>
                    <p class="text-gray-500 text-sm">{secondary}</p>
                </div>
                <div class="text-center">
                    <div class="w-full h-24 rounded-xl mb-3" style="background-color: {accent}"></div>
                    <p class="font-medium">Accent</p>
                    <p class="text-gray-500 text-sm">{accent}</p>
                </div>
            </div>
        </section>
        
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6">Typography</h2>
            <p class="text-gray-400 text-lg">{typography}</p>
        </section>
        
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6">Brand Voice</h2>
            <p class="text-gray-400 text-lg">{voice}</p>
        </section>
        
        <footer class="border-t border-gray-800 pt-8 text-center text-gray-600 text-sm">
            <p>Generated by Zero Employee Studio OS</p>
        </footer>
    </div>
</body>
</html>"""
    
    guidelines_path = os.path.join(output_dir, "brand-guidelines.html")
    os.makedirs(output_dir, exist_ok=True)
    with open(guidelines_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return guidelines_path


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_brand = {"brand_name": "Casa Verona", "color_palette": {"primary": "#7B2D26", "secondary": "#F3E6D0", "accent": "#2F5D50"}}
    test_content = {}
    test_social = {"total_posts": 3, "platforms": ["Instagram"], "posts": []}
    test_finance = {"revenue": 499, "net_profit": 449.81, "margin_percent": 90.14}
    test_compose = {"preview_url": "/api/files/projects/test_001/preview.html"}
    
    result = package_delivery("test_001", test_brand, test_content, test_social, test_finance, test_compose)
    print(f"Delivery: {result['deliverables_count']} files for {result['brand_name']}")
