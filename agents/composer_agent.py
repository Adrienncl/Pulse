"""
Template Composer Agent
=======================

Assembles the final client website by injecting brand + content data into the selected HTML template.
Reads the HTML template, replaces {{variables}} with actual data, and saves the result.
"""

from typing import Dict, Any, List
import os
import re
import json

# ─── Paths ─────────────────────────────────────────────────
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'templates')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'projects')


def compose_site(
    template_id: str,
    brand_data: Dict[str, Any],
    content_data: Dict[str, Any],
    project_id: str = None,
    photos: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Compose the final website by injecting data into the HTML template.
    
    Args:
        template_id: Selected template ID (e.g., "restaurant_premium")
        brand_data: Output from brand agent
        content_data: Output from content agent
        project_id: Unique project identifier
    
    Returns:
        Dict with site_status, template_id, preview_url, deployment_status
    """
    if not project_id:
        import uuid
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
    
    # Read the HTML template
    template_path = os.path.join(TEMPLATES_DIR, f"{template_id}.html")
    if not os.path.exists(template_path):
        # Fallback to restaurant_premium if requested template doesn't exist
        fallback_id = "restaurant_premium"
        fallback_path = os.path.join(TEMPLATES_DIR, f"{fallback_id}.html")
        if os.path.exists(fallback_path):
            template_id = fallback_id
            template_path = fallback_path
        else:
            return {
                "site_status": "error",
                "error": f"Template not found: {template_id}",
                "template_id": template_id,
                "preview_url": None,
                "deployment_status": "failed"
            }
    
    with open(template_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Merge brand and content data into a single injection context
    injection_data = _prepare_injection_data(brand_data, content_data, photos)
    
    # Replace {{variable}} placeholders
    html = _inject_variables(html, injection_data)
    
    # Replace {{#array}}...{{/array}} loops
    html = _inject_loops(html, injection_data)
    
    # Save the composed site
    output_dir = os.path.join(OUTPUT_DIR, project_id)
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'preview.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    # Save the data as JSON for reference
    data_path = os.path.join(output_dir, 'project.json')
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump({
            "project_id": project_id,
            "template_id": template_id,
            "brand": brand_data,
            "content": {k: v for k, v in content_data.items() if k != "social_posts"},
            "composed_at": __import__('datetime').datetime.now().isoformat()
        }, f, indent=2)
    
    return {
        "site_status": "rendered",
        "template_id": template_id,
        "project_id": project_id,
        "preview_url": f"/api/files/projects/{project_id}/preview.html",
        "data_url": f"/api/files/projects/{project_id}/project.json",
        "deployment_status": "ready",
        "file_size_kb": round(os.path.getsize(output_path) / 1024, 1)
    }


def _prepare_injection_data(brand_data: Dict, content_data: Dict, photos: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Prepare flat injection data from brand and content."""
    colors = brand_data.get("color_palette", {})
    category = brand_data.get("category", "restaurant")
    
    # Process photos if provided
    hero_image = content_data.get("hero_image", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop")
    about_image = content_data.get("about_image", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop")
    gallery_images = content_data.get("gallery_images", [
        {"url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop", "alt": "Restaurant interior"},
        {"url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop", "alt": "Signature dish"},
        {"url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=600&fit=crop", "alt": "Dining area"},
    ])
    
    if photos:
        from photo_agent import analyze_photos
        photo_analysis = analyze_photos(photos)
        placements = photo_analysis.get("placements", {})
        
        # Use hero photos for hero section
        if placements.get("hero"):
            hero_image = placements["hero"][0].get("url", hero_image)
        
        # Use about photos for about section
        if placements.get("about"):
            about_image = placements["about"][0].get("url", about_image)
        
        # Use menu/gallery photos for gallery
        gallery_from_photos = []
        for placement_type in ["menu", "gallery"]:
            for photo in placements.get(placement_type, []):
                gallery_from_photos.append({
                    "url": photo.get("url", ""),
                    "alt": photo.get("description", "Photo")
                })
        if gallery_from_photos:
            gallery_images = gallery_from_photos
    
    return {
        # Brand
        "brand_name": brand_data.get("brand_name", "Brand"),
        "tagline": brand_data.get("positioning", "Where quality meets excellence"),
        "primary_color": colors.get("primary", "#2563EB"),
        "secondary_color": colors.get("secondary", "#F3F4F6"),
        "accent_color": colors.get("accent", "#60A5FA"),
        
        # Hero
        "hero_title": content_data.get("hero_title", "Welcome"),
        "hero_subtitle": content_data.get("hero_subtitle", ""),
        "hero_description": content_data.get("hero_description", ""),
        "hero_image": hero_image,
        "cta_text": "Reserve a Table" if category == "restaurant" else "Visitez-nous" if category == "bakery" else "Book Now" if category == "beauty" else "Get Started",
        
        # About
        "about_title": content_data.get("about_title", "About Us"),
        "about_text": content_data.get("about_text", ""),
        "about_text_2": content_data.get("about_text_2", ""),
        "about_image": about_image,
        "years_experience": content_data.get("years_experience", 10),
        
        # Menu
        "menu_title": "Notre Carte" if category == "bakery" else "Our Menu" if category == "restaurant" else "Our Services" if category == "beauty" else "Our Services",
        "menu_subtitle": "Découvrez notre sélection" if category == "bakery" else "Discover our carefully crafted selection" if category == "restaurant" else "Explore what we offer",
        "menu_categories": content_data.get("menu_categories", []),
        "menu_items": content_data.get("menu_items", []),
        
        # Gallery
        "gallery_title": content_data.get("gallery_title", "Gallery"),
        "gallery_subtitle": content_data.get("gallery_subtitle", ""),
        "gallery_images": gallery_images,
        
        # Reservations
        "reservation_title": content_data.get("reservation_title", "Make a Reservation"),
        "reservation_text": content_data.get("reservation_text", ""),
        
        # Testimonials
        "testimonial_title": content_data.get("testimonial_title", "What Our Guests Say"),
        "testimonials": content_data.get("testimonials", []),
        
        # Contact
        "contact_title": content_data.get("contact_title", "Get in Touch"),
        "contact_text": content_data.get("contact_text", ""),
        "contact_address": content_data.get("contact_address", "123 Main Street"),
        "contact_phone": content_data.get("contact_phone", "+1 (555) 123-4567"),
        "contact_email": content_data.get("contact_email", "hello@brand.com"),
        "contact_hours": content_data.get("contact_hours", "Mon-Sun: 11AM - 10PM"),
        
        # Footer
        "footer_description": content_data.get("footer_description", ""),
        "year": __import__('datetime').datetime.now().year,
    }


def _inject_variables(html: str, data: Dict[str, Any]) -> str:
    """Replace {{variable}} placeholders with actual values."""
    def replace_var(match):
        var_name = match.group(1).strip()
        value = data.get(var_name, match.group(0))
        if isinstance(value, (list, dict)):
            return match.group(0)  # Keep loops for later processing
        return str(value)
    
    # Replace simple {{variable}} placeholders
    html = re.sub(r'\{\{(\w+)\}\}', replace_var, html)
    
    return html


def _inject_loops(html: str, data: Dict[str, Any]) -> str:
    """Replace {{#array}}...{{/array}} loops with rendered content."""
    
    # Process {{#menu_items}}...{{/menu_items}}
    html = _process_array_loop(html, "menu_items", data.get("menu_items", []), _render_menu_item)
    
    # Process {{#menu_categories}}...{{/menu_categories}}
    html = _process_simple_loop(html, "menu_categories", data.get("menu_categories", []))
    
    # Process {{#gallery_images}}...{{/gallery_images}}
    html = _process_array_loop(html, "gallery_images", data.get("gallery_images", []), _render_gallery_item)
    
    # Process {{#testimonials}}...{{/testimonials}}
    html = _process_array_loop(html, "testimonials", data.get("testimonials", []), _render_testimonial)
    
    return html


def _process_array_loop(html: str, tag: str, items: List[Dict], renderer) -> str:
    """Process an {{#tag}}...{{/tag}} loop with item rendering."""
    pattern = r'\{\{#' + tag + r'\}\}(.*?)\{\{/' + tag + r'\}\}'
    match = re.search(pattern, html, re.DOTALL)
    
    if not match:
        return html
    
    template = match.group(1)
    rendered_items = []
    
    for item in items:
        rendered = renderer(template, item)
        rendered_items.append(rendered)
    
    return html[:match.start()] + '\n'.join(rendered_items) + html[match.end():]


def _process_simple_loop(html: str, tag: str, items: List[str]) -> str:
    """Process a simple {{#tag}}...{{/tag}} loop with string items."""
    pattern = r'\{\{#' + tag + r'\}\}(.*?)\{\{/' + tag + r'\}\}'
    match = re.search(pattern, html, re.DOTALL)
    
    if not match:
        return html
    
    template = match.group(1)
    rendered_items = []
    
    for item in items:
        rendered = template.replace('{{.}}', item)
        rendered_items.append(rendered)
    
    return html[:match.start()] + '\n'.join(rendered_items) + html[match.end():]


def _render_menu_item(template: str, item: Dict) -> str:
    """Render a single menu item."""
    result = template
    result = result.replace('{{name}}', item.get('name', ''))
    result = result.replace('{{description}}', item.get('description', ''))
    result = result.replace('{{price}}', item.get('price', ''))
    
    # Handle tags - replace the {{#tags}}...{{/tags}} block with rendered tags
    tags = item.get('tags', [])
    tags_pattern = r'\{\{#tags\}\}(.*?)\{\{/tags\}\}'
    tags_match = re.search(tags_pattern, result, re.DOTALL)
    if tags_match:
        if tags:
            # Keep the wrapper div but render the tags inside
            tags_html = ''.join(f'<span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{tag}</span>' for tag in tags)
            result = result[:tags_match.start()] + tags_html + result[tags_match.end():]
        else:
            result = result[:tags_match.start()] + result[tags_match.end():]
    
    return result


def _render_gallery_item(template: str, item: Dict) -> str:
    """Render a single gallery item."""
    result = template
    result = result.replace('{{url}}', item.get('url', ''))
    result = result.replace('{{alt}}', item.get('alt', ''))
    return result


def _render_testimonial(template: str, item: Dict) -> str:
    """Render a single testimonial."""
    result = template
    result = result.replace('{{quote}}', item.get('quote', ''))
    result = result.replace('{{author_name}}', item.get('author_name', ''))
    result = result.replace('{{author_title}}', item.get('author_title', ''))
    result = result.replace('{{author_initial}}', item.get('author_initial', item.get('author_name', 'A')[0]))
    
    # Handle stars
    stars = item.get('stars', 5)
    stars_html = '<svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>' * stars
    result = re.sub(r'\{\{#stars\}\}.*?\{\{/stars\}\}', stars_html, result, flags=re.DOTALL)
    
    return result


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_brand = {
        "brand_name": "Casa Verona",
        "category": "restaurant",
        "positioning": "Authentic Italian dining with a warm, premium atmosphere.",
        "color_palette": {"primary": "#7B2D26", "secondary": "#F3E6D0", "accent": "#2F5D50"},
    }
    test_content = {
        "hero_title": "Authentic Italian Dining in the Heart of the City",
        "hero_subtitle": "Handmade pasta, warm hospitality, and timeless Italian flavors.",
        "cta_text": "Reserve a Table",
        "menu_items": [
            {"name": "Tagliatelle al Ragù", "description": "Fresh handmade tagliatelle with slow-cooked beef ragù.", "price": "$22", "tags": ["Signature"]},
        ],
    }
    
    result = compose_site("restaurant_premium", test_brand, test_content, "test_001")
    print("Composition result:", result)
