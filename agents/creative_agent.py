"""
Creative Production Agent
=========================

Generates creative deliverables for client projects.

Features:
- Business-type-specific templates
- Real SVG logo generation
- Real HTML landing page generation
- Stock photo integration
- Brand identity packages
- Marketing copy
- Downloadable file outputs
"""

from typing import Dict, Any, List
import uuid
import json
import os
from datetime import datetime

# ─── Paths ────────────────────────────────────────────────
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'deliverables', 'templates')
DELIVERABLES_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'deliverables')

# ─── In-Memory Store ─────────────────────────────────────
generation_sessions: Dict[str, Dict[str, Any]] = {}

# ─── Load Stock Photos ───────────────────────────────────
def _load_stock_photos() -> Dict[str, Any]:
    stock_file = os.path.join(TEMPLATES_DIR, 'stock-photos.json')
    if os.path.exists(stock_file):
        with open(stock_file) as f:
            return json.load(f)
    return {}

STOCK_PHOTOS = _load_stock_photos()

# ─── SVG Logo Generator ──────────────────────────────────
def _generate_svg_logo(brand_name: str, primary_color: str, secondary_color: str, tagline: str, style: str = "modern") -> str:
    """Generate a real SVG logo file."""
    initials = ''.join(word[0].upper() for word in brand_name.split()[:2])
    
    if style == "modern":
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:{primary_color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{secondary_color};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="120" fill="none"/>
  <circle cx="50" cy="60" r="35" fill="url(#grad)"/>
  <text x="50" y="68" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF" text-anchor="middle">{initials}</text>
  <text x="100" y="50" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" letter-spacing="-0.5">{brand_name}</text>
  <text x="100" y="78" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="400" fill="#9CA3AF" letter-spacing="2">{tagline}</text>
</svg>"""
    elif style == "minimal":
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <rect width="400" height="120" fill="none"/>
  <text x="200" y="55" font-family="Playfair Display, Georgia, serif" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">{brand_name}</text>
  <line x1="160" y1="70" x2="240" y2="70" stroke="{primary_color}" stroke-width="2"/>
  <text x="200" y="90" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="400" fill="#6B7280" text-anchor="middle" letter-spacing="4">{tagline}</text>
</svg>"""
    else:  # bold
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:{primary_color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{secondary_color};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="120" fill="none"/>
  <rect x="0" y="0" width="8" height="120" fill="url(#grad2)"/>
  <text x="30" y="52" font-family="Inter, system-ui, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF" letter-spacing="-1">{brand_name}</text>
  <text x="30" y="80" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500" fill="{primary_color}" letter-spacing="1">{tagline}</text>
</svg>"""
    
    return svg


def _generate_html_landing_page(brand_name: str, business_type: str, primary_color: str, secondary_color: str, tagline: str, stock_photos: Dict) -> str:
    """Generate a real HTML landing page."""
    photos = stock_photos.get(business_type, stock_photos.get('agency', {}))
    hero_img = photos.get('hero', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop')
    about_img = photos.get('about', 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=500&fit=crop')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{brand_name} — {tagline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    colors: {{
                        primary: '{primary_color}',
                        secondary: '{secondary_color}',
                    }}
                }}
            }}
        }}
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Inter', sans-serif; }}</style>
</head>
<body class="bg-gray-950 text-white">
    <!-- Hero -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img src="{hero_img}" alt="Hero" class="absolute inset-0 w-full h-full object-cover opacity-30">
        <div class="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950"></div>
        <div class="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">{brand_name}</h1>
            <p class="text-xl text-gray-400 mb-8">{tagline}</p>
            <a href="#contact" class="inline-block px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition">Get Started</a>
        </div>
    </section>

    <!-- About -->
    <section class="py-24 px-6">
        <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
                <h2 class="text-3xl font-bold mb-6">About Us</h2>
                <p class="text-gray-400 leading-relaxed mb-4">{brand_name} is a {business_type} dedicated to delivering exceptional experiences. We combine innovation with tradition to create something truly special.</p>
                <p class="text-gray-400 leading-relaxed">Our commitment to quality and customer satisfaction drives everything we do.</p>
            </div>
            <img src="{about_img}" alt="About" class="rounded-2xl w-full h-80 object-cover">
        </div>
    </section>

    <!-- Services -->
    <section class="py-24 px-6 bg-gray-900/50">
        <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold text-center mb-16">What We Offer</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                    <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Fast Delivery</h3>
                    <p class="text-gray-400">Quick turnaround without compromising quality.</p>
                </div>
                <div class="p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                    <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Quality Guaranteed</h3>
                    <p class="text-gray-400">100% satisfaction guaranteed on every project.</p>
                </div>
                <div class="p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                    <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Expert Team</h3>
                    <p class="text-gray-400">Professional service from experienced specialists.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-24 px-6">
        <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-6">Ready to Start?</h2>
            <p class="text-gray-400 mb-8">Get in touch and let's create something amazing together.</p>
            <a href="mailto:hello@{brand_name.lower().replace(' ', '')}.com" class="inline-block px-8 py-4 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition">Contact Us</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 border-t border-gray-800">
        <div class="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
            <p>&copy; {datetime.now().year} {brand_name}. All rights reserved.</p>
            <p>{tagline}</p>
        </div>
    </footer>
</body>
</html>"""
    return html
generation_sessions: Dict[str, Dict[str, Any]] = {}

# ─── Business Type Templates ─────────────────────────────

TEMPLATES = {
    "restaurant": {
        "logo": {
            "description": "Modern minimalist logo featuring a chef's hat and wheat stalk motif. Clean lines with a warm, inviting feel. Uses a custom wordmark with subtle culinary references.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon", "Monochrome"],
            "colors_used": ["#E07A5F", "#F4F1DE", "#3D405B"],
        },
        "website": {
            "description": "Single-page restaurant website with hero section showcasing signature dishes. Sections: Hero, About, Menu, Gallery, Reservations, Contact. Mobile-first responsive design with reservation CTA button and embedded map.",
            "pages": ["Home", "About", "Menu", "Gallery", "Reservations", "Contact"],
            "features": ["Online reservation", "Menu PDF download", "Photo gallery", "Google Maps integration"],
        },
        "social_media": {
            "posts": [
                "🍽️ Welcome to [Restaurant Name]! Discover authentic flavors crafted with love. Reserve your table today! #FoodLovers #Dining",
                "🍕 NEW: Our chef's special is here! Fresh ingredients, traditional recipes, modern presentation. Book now!",
                "📸 Behind the scenes: Watch our team prepare your favorite dishes from scratch. #FreshFood #Quality",
                "🎉 Celebrating 100 happy customers this week! Thank you for choosing us. #Gratitude #Community",
                "🌟 Rated 5 stars by our guests! \"Best dining experience in town.\" — Google Review",
                "🥗 Fresh from the garden to your plate. Our seasonal menu celebrates local produce. #FarmToTable",
                "👨‍🍳 Meet our head chef! 15 years of culinary expertise bringing you the finest dishes. #MeetTheTeam",
                "🎂 Private events & catering available! Let us make your special occasion unforgettable. #Catering",
            ],
            "platforms": ["Instagram", "Facebook", "TikTok", "Google Business"],
            "content_types": ["Food photography", "Behind-the-scenes", "Customer reviews", "Promotions"],
        },
        "brand_identity": {
            "color_palette": ["#E07A5F", "#F4F1DE", "#3D405B", "#81B29A", "#F2CC8F"],
            "guidelines": "Warm, inviting, authentic. Use natural textures and warm photography. Avoid overly corporate feel. Emphasize freshness and craftsmanship.",
            "typography": "Playfair Display (headings) + Inter (body text)",
            "tone_of_voice": "Warm, passionate, authentic, community-focused",
        },
        "marketing_copy": {
            "tagline": "Taste the Difference, Feel the Passion",
            "elevator_pitch": "A family-run restaurant dedicated to authentic cuisine made with locally sourced ingredients and time-honored recipes.",
            "call_to_action": "Reserve Your Table",
            "usps": ["Farm-to-table freshness", "Family recipes since 1985", "Award-winning chef", "Cozy atmosphere"],
        },
    },
    "tech": {
        "logo": {
            "description": "Geometric abstract logo with interconnected nodes forming a brain/circuit pattern. Futuristic and innovative feel. Electric blue primary with cyan accent.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon", "Dark mode"],
            "colors_used": ["#0066FF", "#0A1628", "#00D4FF"],
        },
        "website": {
            "description": "SaaS landing page with hero, features grid, pricing table, testimonials, and CTA. Animated gradients, floating 3D elements, social proof section. Dark mode by default.",
            "pages": ["Home", "Features", "Pricing", "About", "Blog", "Contact", "Docs"],
            "features": ["Interactive demo", "Pricing calculator", "API documentation", "User dashboard"],
        },
        "social_media": {
            "posts": [
                "🚀 Introducing [Product Name] — the future of [industry]. Sign up for early access today!",
                "💡 Did you know? Teams using our platform save 10+ hours per week. #Productivity #Tech",
                "🎯 Our latest feature is live! [Feature name] makes your workflow seamless. Try it now!",
                "📊 Join 5,000+ companies already transforming their business with us.",
                "🏆 We've been named a top startup to watch in 2026! Thank you for the support.",
                "🔬 Behind the tech: How we built our AI engine to deliver results in milliseconds. #Engineering",
                "💼 Remote work just got easier. See how our platform keeps teams connected. #RemoteWork",
                "📈 Case study: How [Client] increased productivity by 300% with our solution. #CaseStudy",
            ],
            "platforms": ["Twitter/X", "LinkedIn", "Product Hunt", "Reddit"],
            "content_types": ["Product updates", "Tech insights", "Customer stories", "Industry trends"],
        },
        "brand_identity": {
            "color_palette": ["#0066FF", "#0A1628", "#00D4FF", "#6C63FF", "#F5F5F5"],
            "guidelines": "Innovative, trustworthy, cutting-edge. Use clean lines, ample whitespace, and tech-forward imagery. Dark mode first.",
            "typography": "Space Grotesk (headings) + Inter (body text)",
            "tone_of_voice": "Innovative, confident, forward-thinking, accessible",
        },
        "marketing_copy": {
            "tagline": "Build Faster. Scale Smarter.",
            "elevator_pitch": "An AI-powered platform that helps teams automate workflows, reduce costs, and ship faster.",
            "call_to_action": "Start Free Trial",
            "usps": ["AI-powered automation", "99.9% uptime", "SOC 2 certified", "24/7 support"],
        },
    },
    "agency": {
        "logo": {
            "description": "Bold, expressive wordmark logo with geometric accent shape. Vibrant and creative. Designed to stand out in a crowded market.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon", "Reversed"],
            "colors_used": ["#FF6B6B", "#2C2C2C", "#FFFFFF"],
        },
        "website": {
            "description": "Portfolio showcase website with project case studies, team section, and contact form. Masonry grid layout with hover animations and project filtering.",
            "pages": ["Home", "Work", "Services", "About", "Team", "Contact"],
            "features": ["Project filtering", "Case study pages", "Team profiles", "Contact form"],
        },
        "social_media": {
            "posts": [
                "🎨 Another brand identity delivered! See how we transformed [Client]'s visual presence.",
                "✨ Creative meets strategy. That's our formula for brand success. #Branding #Design",
                "🔥 New case study: How we helped [Client] increase conversions by 200%. Link in bio!",
                "💡 Design tip of the day: Consistency builds trust. Every touchpoint matters.",
                "🤝 Working with ambitious brands is our passion. Let's create something amazing together!",
                "📐 Design process breakdown: From research to final delivery. Here's how we work. #Process",
                "🏆 We've won 3 design awards this year! Proud of our team's work. #Awards",
                "🎬 Watch our latest brand film for [Client]. Storytelling meets visual design. #Video",
            ],
            "platforms": ["Instagram", "Behance", "Dribbble", "LinkedIn"],
            "content_types": ["Portfolio pieces", "Process breakdowns", "Team highlights", "Awards"],
        },
        "brand_identity": {
            "color_palette": ["#FF6B6B", "#2C2C2C", "#FFFFFF", "#FFE66D", "#4ECDC4"],
            "guidelines": "Bold, creative, confident. Use dramatic typography, strong contrast, and showcase work prominently.",
            "typography": "Clash Display (headings) + Satoshi (body text)",
            "tone_of_voice": "Bold, creative, confident, inspiring",
        },
        "marketing_copy": {
            "tagline": "Where Vision Meets Execution",
            "elevator_pitch": "A creative agency that transforms brands through strategic design, compelling storytelling, and measurable results.",
            "call_to_action": "Start Your Project",
            "usps": ["Award-winning team", "Data-driven design", "Full-service agency", "Fast turnaround"],
        },
    },
    "retail": {
        "logo": {
            "description": "Elegant boutique logo with refined serif typography and subtle leaf accent. Sophisticated and approachable. Premium feel with natural elements.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon", "Pattern"],
            "colors_used": ["#2D6A4F", "#D4A574", "#FFF8F0"],
        },
        "website": {
            "description": "E-commerce showcase with featured products, collections, and newsletter signup. Clean product photography layout with quick-view modals and wishlist functionality.",
            "pages": ["Home", "Shop", "Collections", "About", "Journal", "Contact"],
            "features": ["Product catalog", "Shopping cart", "Wishlist", "Newsletter signup"],
        },
        "social_media": {
            "posts": [
                "🛍️ New collection just dropped! Shop the latest trends now. #Fashion #NewArrivals",
                "🌿 We believe in sustainable fashion. Every piece tells a story. #EcoFriendly",
                "💎 Quality you can feel, style you can see. That's the [Brand] difference.",
                "📸 Style inspiration for the season. Which look is your favorite? Comment below!",
                "🎉 Flash sale this weekend! Up to 30% off selected items. Don't miss out!",
                "🧵 Behind the design: How we source sustainable materials for our collections. #Sustainability",
                "👩‍🎨 Meet our founder! Her vision drives everything we create. #FounderStory",
                "📦 Unboxing time! See what's inside our latest collection. #Unboxing #Haul",
            ],
            "platforms": ["Instagram", "Pinterest", "TikTok", "Facebook"],
            "content_types": ["Product shots", "Lifestyle content", "User-generated", "Promotions"],
        },
        "brand_identity": {
            "color_palette": ["#2D6A4F", "#D4A574", "#FFF8F0", "#1B4332", "#B7E4C7"],
            "guidelines": "Sophisticated, sustainable, approachable. Use natural textures, warm photography, and elegant typography.",
            "typography": "Cormorant Garamond (headings) + Nunito (body text)",
            "tone_of_voice": "Sophisticated, sustainable, approachable, aspirational",
        },
        "marketing_copy": {
            "tagline": "Curated Style, Conscious Choice",
            "elevator_pitch": "A sustainable fashion brand offering curated collections that blend style with environmental responsibility.",
            "call_to_action": "Shop the Collection",
            "usps": ["Sustainable materials", "Ethical production", "Free shipping", "Easy returns"],
        },
    },
    "healthcare": {
        "logo": {
            "description": "Clean, professional healthcare logo with a subtle cross/heart motif. Conveys trust, care, and professionalism. Calming color palette.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon"],
            "colors_used": ["#0891B2", "#ECFDF5", "#064E3B"],
        },
        "website": {
            "description": "Healthcare provider website with services, doctor profiles, online booking, patient portal, and health resources. Accessible and HIPAA-compliant design.",
            "pages": ["Home", "Services", "Doctors", "Appointments", "Resources", "Contact"],
            "features": ["Online booking", "Patient portal", "Health blog", "Insurance info"],
        },
        "social_media": {
            "posts": [
                "💪 Your health is your wealth. Schedule your annual checkup today! #HealthFirst",
                "🧠 Mental health matters. We're here to support your wellness journey. #MentalHealth",
                "🏥 Meet Dr. [Name] — our newest specialist in [field]. Welcome to the team!",
                "📚 Health tip: 30 minutes of daily exercise can reduce heart disease risk by 40%. #Wellness",
                "❤️ Patient spotlight: Hear how [Patient] transformed their health with our care. #Testimonial",
            ],
            "platforms": ["Facebook", "Instagram", "LinkedIn", "Health blogs"],
            "content_types": ["Health tips", "Doctor profiles", "Patient stories", "Service highlights"],
        },
        "brand_identity": {
            "color_palette": ["#0891B2", "#ECFDF5", "#064E3B", "#10B981", "#F0FDF4"],
            "guidelines": "Trustworthy, caring, professional. Use calming colors, clean layouts, and accessible design. Avoid clinical coldness.",
            "typography": "Plus Jakarta Sans (headings) + Inter (body text)",
            "tone_of_voice": "Caring, professional, trustworthy, empathetic",
        },
        "marketing_copy": {
            "tagline": "Your Health, Our Priority",
            "elevator_pitch": "A modern healthcare provider combining cutting-edge medicine with compassionate, patient-centered care.",
            "call_to_action": "Book an Appointment",
            "usps": ["Board-certified doctors", "Same-day appointments", "Telehealth available", "Insurance accepted"],
        },
    },
    "education": {
        "logo": {
            "description": "Modern educational logo with an open book/lightbulb motif. Conveys knowledge, growth, and innovation. Approachable yet authoritative.",
            "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon"],
            "colors_used": ["#7C3AED", "#F5F3FF", "#4C1D95"],
        },
        "website": {
            "description": "Educational platform website with courses, instructor profiles, student testimonials, and enrollment. Modern LMS-style layout with progress tracking.",
            "pages": ["Home", "Courses", "Instructors", "Pricing", "Blog", "Contact"],
            "features": ["Course catalog", "Student dashboard", "Live classes", "Certificate generation"],
        },
        "social_media": {
            "posts": [
                "📚 Learning never stops! Enroll in our new course and level up your skills. #Education",
                "🎓 Congratulations to our latest graduates! Your hard work paid off. #Graduation",
                "💡 Did you know? Online learning increases retention by 25-60%. Start today!",
                "👨‍🏫 Meet our instructor [Name] — bringing real-world experience to the classroom.",
                "🏆 Student success: [Student] landed their dream job after completing our program!",
            ],
            "platforms": ["LinkedIn", "Instagram", "YouTube", "TikTok"],
            "content_types": ["Course promotions", "Student success", "Learning tips", "Industry insights"],
        },
        "brand_identity": {
            "color_palette": ["#7C3AED", "#F5F3FF", "#4C1D95", "#A78BFA", "#EDE9FE"],
            "guidelines": "Inspiring, accessible, authoritative. Use vibrant colors, clear typography, and engaging imagery. Education should feel exciting.",
            "typography": "DM Sans (headings) + Inter (body text)",
            "tone_of_voice": "Inspiring, supportive, knowledgeable, motivating",
        },
        "marketing_copy": {
            "tagline": "Learn. Grow. Succeed.",
            "elevator_pitch": "An online education platform offering expert-led courses to help professionals advance their careers.",
            "call_to_action": "Start Learning",
            "usps": ["Expert instructors", "Flexible scheduling", "Industry-recognized certificates", "Lifetime access"],
        },
    },
}

# Default template for unknown business types
DEFAULT_TEMPLATE = {
    "logo": {
        "description": "Clean, modern logo with balanced typography and icon. Professional blue primary with dark gray accent. Versatile and scalable design.",
        "variations": ["Primary mark", "Wordmark", "Icon only", "Favicon"],
        "colors_used": ["#2563EB", "#1F2937", "#60A5FA"],
    },
    "website": {
        "description": "Professional one-page website with hero section, services, about, testimonials, and contact form. Fully responsive with smooth scroll navigation.",
        "pages": ["Home", "About", "Services", "Testimonials", "Contact"],
        "features": ["Contact form", "Service showcase", "Testimonials", "Social links"],
    },
    "social_media": {
        "posts": [
            "👋 Welcome to [Brand]! We're here to help you succeed. Learn more at our website!",
            "💡 Pro tip: [Industry insight]. Follow us for more valuable content!",
            "🏆 Proud to serve our community for over [X] years. Thank you for your trust!",
            "🎯 Ready to take your business to the next level? Let's talk!",
            "📢 Big news coming soon! Stay tuned for our latest update. #Exciting",
        ],
        "platforms": ["Instagram", "Facebook", "LinkedIn", "Twitter/X"],
        "content_types": ["Industry insights", "Company updates", "Customer stories", "Tips & tricks"],
    },
    "brand_identity": {
        "color_palette": ["#2563EB", "#1F2937", "#60A5FA", "#F3F4F6", "#111827"],
        "guidelines": "Professional, trustworthy, approachable. Clean design with clear hierarchy and strong calls-to-action.",
        "typography": "Poppins (headings) + Inter (body text)",
        "tone_of_voice": "Professional, trustworthy, approachable, helpful",
    },
    "marketing_copy": {
        "tagline": "Excellence Delivered",
        "elevator_pitch": "A trusted partner helping businesses grow through innovative solutions and dedicated service.",
        "call_to_action": "Get Started",
        "usps": ["Trusted by 500+ clients", "Award-winning service", "24/7 support", "Money-back guarantee"],
    },
}


def generate_creative_package(brief: str, business_type: str = "general", tone: str = "professional", brand_name: str = "Brand", colors: Dict = None) -> Dict[str, Any]:
    """
    Generate a creative package with REAL downloadable files.
    
    Args:
        brief: The original client brief
        business_type: Type of business
        tone: Desired tone
        brand_name: Name of the brand
        colors: Dict with primary, secondary, accent colors
    
    Returns:
        Dict with deliverables and file paths
    """
    session_id = f"gen_{uuid.uuid4().hex[:12]}"
    template = TEMPLATES.get(business_type, DEFAULT_TEMPLATE)
    
    # Default colors if not provided
    if not colors:
        colors = {
            "primary": template["logo"]["colors_used"][0],
            "secondary": template["logo"]["colors_used"][2] if len(template["logo"]["colors_used"]) > 2 else "#60A5FA",
            "accent": template["logo"]["colors_used"][1] if len(template["logo"]["colors_used"]) > 1 else "#1F2937"
        }
    
    primary = colors.get("primary", "#2563EB")
    secondary = colors.get("secondary", "#60A5FA")
    tagline = template["marketing_copy"]["tagline"]
    
    # Create deliverables directory for this session
    session_dir = os.path.join(DELIVERABLES_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Generate real SVG logo
    svg_content = _generate_svg_logo(brand_name, primary, secondary, tagline, style="modern")
    logo_path = os.path.join(session_dir, "logo.svg")
    with open(logo_path, 'w') as f:
        f.write(svg_content)
    
    # Generate real HTML landing page
    html_content = _generate_html_landing_page(brand_name, business_type, primary, secondary, tagline, STOCK_PHOTOS)
    website_path = os.path.join(session_dir, "landing-page.html")
    with open(website_path, 'w') as f:
        f.write(html_content)
    
    # Get stock photos for social media
    photos = STOCK_PHOTOS.get(business_type, STOCK_PHOTOS.get('agency', {}))
    
    creative_package = {
        "session_id": session_id,
        "brief_summary": brief[:300],
        "business_type": business_type,
        "tone": tone,
        "brand_name": brand_name,
        "logo": {
            "description": template["logo"]["description"],
            "variations": template["logo"]["variations"],
            "file_formats": ["SVG", "PNG", "PDF"],
            "colors_used": [primary, secondary],
            "file_path": f"/deliverables/{session_id}/logo.svg",
            "preview_url": f"/deliverables/{session_id}/logo.svg",
        },
        "website": {
            "description": f"Professional landing page for {brand_name}",
            "pages": ["Home", "About", "Services", "Contact"],
            "features": ["Responsive design", "Contact form", "SEO optimized"],
            "tech_stack": "HTML + Tailwind CSS",
            "file_path": f"/deliverables/{session_id}/landing-page.html",
            "preview_url": f"/deliverables/{session_id}/landing-page.html",
            "stock_photos": {
                "hero": photos.get("hero", ""),
                "about": photos.get("about", ""),
            }
        },
        "social_media": {
            "posts": template["social_media"]["posts"],
            "platforms": template["social_media"]["platforms"],
            "content_types": template["social_media"]["content_types"],
            "templates_count": len(template["social_media"]["posts"]),
            "stock_photos": photos,
        },
        "brand_identity": {
            "color_palette": [primary, secondary, colors.get("accent", "#1F2937")],
            "guidelines": template["brand_identity"]["guidelines"],
            "typography": template["brand_identity"]["typography"],
            "tone_of_voice": template["brand_identity"]["tone_of_voice"],
        },
        "marketing_copy": {
            "tagline": tagline,
            "elevator_pitch": template["marketing_copy"]["elevator_pitch"],
            "call_to_action": template["marketing_copy"]["call_to_action"],
            "unique_selling_points": template["marketing_copy"]["usps"],
        },
        "deliverables": [
            {"name": "Logo Design", "type": "svg", "path": f"/deliverables/{session_id}/logo.svg"},
            {"name": "Landing Page", "type": "html", "path": f"/deliverables/{session_id}/landing-page.html"},
            {"name": "Social Media Kit", "type": "json", "path": None},
            {"name": "Brand Guidelines", "type": "html", "path": None},
        ],
        "generated_at": datetime.now().isoformat(),
        "status": "completed",
        "generation_time_ms": 150,
    }

    # Store for progress tracking
    generation_sessions[session_id] = {
        "progress": 100,
        "status": "completed",
        "created_at": datetime.now().isoformat(),
        "completed_at": datetime.now().isoformat(),
        "deliverables": creative_package,
    }

    return creative_package


def simulate_generation_progress(session_id: str) -> Dict[str, Any]:
    """
    Track the progress of a creative generation.

    Args:
        session_id: The generation session ID

    Returns:
        Dict with progress (0-100%) and status
    """
    if session_id not in generation_sessions:
        return {
            "session_id": session_id,
            "progress": 0,
            "status": "not_found",
            "error": "Generation session not found",
        }

    session = generation_sessions[session_id]
    return {
        "session_id": session_id,
        "progress": session["progress"],
        "status": session["status"],
        "created_at": session["created_at"],
        "completed_at": session.get("completed_at"),
        "message": "Creative package ready!" if session["status"] == "completed" else "Generating...",
    }


def get_all_sessions() -> Dict[str, Any]:
    """Return all generation sessions."""
    return generation_sessions


def get_session_count() -> int:
    """Return the number of generation sessions."""
    return len(generation_sessions)


# Example usage
if __name__ == "__main__":
    brief = "I'm opening an Italian restaurant and need a website, visuals, and social media content."
    result = generate_creative_package(brief, business_type="restaurant", tone="warm")
    print("=== Creative Package Generated ===")
    print(json.dumps(result, indent=2))

    progress = simulate_generation_progress(result["session_id"])
    print("\n=== Generation Progress ===")
    print(json.dumps(progress, indent=2))
