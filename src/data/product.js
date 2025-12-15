export const categories = [
  {
    id: "men",
    name: "Men",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop",
    productCount: 124,
  },
  {
    id: "women",
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
    productCount: 186,
  },
  {
    id: "accessories",
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    productCount: 89,
  },
  {
    id: "electronics",
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    productCount: 67,
  },
];
export const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "Essentials",
    category: "men",
    price: 49.99,
    originalPrice: 69.99,
    description:
      "Crafted from 100% organic cotton, this premium t-shirt offers unmatched comfort and durability. The relaxed fit and soft texture make it perfect for everyday wear. Features reinforced stitching and a classic crew neckline.",
    shortDescription: "Organic cotton, relaxed fit, everyday comfort",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 234,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Sage", hex: "#9caf88" },
    ],
    specifications: [
      { label: "Material", value: "100% Organic Cotton" },
      { label: "Fit", value: "Relaxed" },
      { label: "Care", value: "Machine wash cold" },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "Silk Blend Midi Dress",
    brand: "Luxe Collection",
    category: "women",
    price: 189.0,
    description:
      "An elegant midi dress crafted from a luxurious silk blend. Features a flattering A-line silhouette, delicate pleating, and a subtle sheen that catches the light beautifully. Perfect for special occasions or elevated everyday wear.",
    shortDescription: "Silk blend, A-line silhouette, elegant drape",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 156,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Champagne", hex: "#f7e7ce" },
      { name: "Dusty Rose", hex: "#dcae96" },
      { name: "Midnight", hex: "#191970" },
    ],
    specifications: [
      { label: "Material", value: "70% Silk, 30% Polyester" },
      { label: "Length", value: "Midi" },
      { label: "Care", value: "Dry clean only" },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: "Wireless Noise-Canceling Headphones",
    brand: "AudioPro",
    category: "electronics",
    price: 299.0,
    originalPrice: 349.0,
    description:
      "Experience pure audio bliss with our premium wireless headphones. Featuring advanced noise-canceling technology, 40-hour battery life, and ultra-soft memory foam ear cushions. Crystal-clear sound meets all-day comfort.",
    shortDescription: "Active noise canceling, 40hr battery, premium sound",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=800&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 892,
    colors: [
      { name: "Matte Black", hex: "#2d2d2d" },
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Rose Gold", hex: "#b76e79" },
    ],
    specifications: [
      { label: "Battery Life", value: "40 hours" },
      { label: "Connectivity", value: "Bluetooth 5.2" },
      { label: "Weight", value: "250g" },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 4,
    name: "Leather Crossbody Bag",
    brand: "Heritage",
    category: "accessories",
    price: 159.0,
    description:
      "Handcrafted from full-grain Italian leather, this crossbody bag combines timeless elegance with modern functionality. Features adjustable strap, multiple compartments, and antique brass hardware that develops a beautiful patina over time.",
    shortDescription: "Italian leather, handcrafted, timeless design",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 445,
    colors: [
      { name: "Cognac", hex: "#9a463d" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Tan", hex: "#d2691e" },
    ],
    specifications: [
      { label: "Material", value: "Full-grain Italian leather" },
      { label: "Dimensions", value: "25cm x 18cm x 8cm" },
      { label: "Strap", value: "Adjustable, 100-130cm" },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 5,
    name: "Cashmere Blend Sweater",
    brand: "Essentials",
    category: "women",
    price: 129.0,
    description:
      "Wrap yourself in luxury with our cashmere blend sweater. Soft, lightweight, and incredibly warm, it features a relaxed crew neck and ribbed trim. The perfect layering piece for cooler days.",
    shortDescription: "Cashmere blend, ultra-soft, perfect layering",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 312,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Oatmeal", hex: "#d3c4a5" },
      { name: "Charcoal", hex: "#36454f" },
      { name: "Blush", hex: "#de98ab" },
    ],
    specifications: [
      { label: "Material", value: "50% Cashmere, 50% Wool" },
      { label: "Fit", value: "Relaxed" },
      { label: "Care", value: "Dry clean recommended" },
    ],
    inStock: true,
  },
  {
    id: 6,
    name: "Slim Fit Chino Pants",
    brand: "Modern Basics",
    category: "men",
    price: 89.0,
    description:
      "Versatile slim-fit chinos crafted from premium stretch cotton. Perfect for the office or weekend outings. Features a comfortable mid-rise waist and tapered leg for a contemporary silhouette.",
    shortDescription: "Stretch cotton, slim fit, versatile styling",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop",
    ],
    rating: 4.6,
    reviewCount: 567,
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "Khaki", hex: "#c3b091" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Olive", hex: "#556b2f" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    specifications: [
      { label: "Material", value: "98% Cotton, 2% Elastane" },
      { label: "Fit", value: "Slim" },
      { label: "Rise", value: "Mid-rise" },
    ],
    inStock: true,
  },
  {
    id: 7,
    name: "Minimalist Watch",
    brand: "TimeKeeper",
    category: "accessories",
    price: 199.0,
    originalPrice: 249.0,
    description:
      "A stunning minimalist timepiece that embodies modern elegance. Features a Japanese quartz movement, sapphire crystal glass, and a genuine leather strap. Water-resistant to 50 meters.",
    shortDescription: "Japanese quartz, sapphire crystal, timeless elegance",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 723,
    colors: [
      { name: "Silver/Black", hex: "#c0c0c0" },
      { name: "Gold/Brown", hex: "#d4af37" },
      { name: "Rose Gold/Blush", hex: "#b76e79" },
    ],
    specifications: [
      { label: "Movement", value: "Japanese Quartz" },
      { label: "Case Size", value: "40mm" },
      { label: "Water Resistance", value: "50 meters" },
    ],
    inStock: true,
  },
  {
    id: 8,
    name: "Smart Fitness Tracker",
    brand: "FitTech",
    category: "electronics",
    price: 149.0,
    description:
      "Track your health and fitness with precision. Features heart rate monitoring, sleep tracking, GPS, and 7-day battery life. Syncs seamlessly with your smartphone for comprehensive health insights.",
    shortDescription: "Heart rate, GPS, 7-day battery, health insights",
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&h=800&fit=crop",
    ],
    rating: 4.5,
    reviewCount: 1245,
    colors: [
      { name: "Midnight", hex: "#191970" },
      { name: "Sage", hex: "#9caf88" },
      { name: "Coral", hex: "#ff7f50" },
    ],
    specifications: [
      { label: "Battery Life", value: "7 days" },
      { label: "Display", value: "AMOLED" },
      { label: "Water Resistance", value: "5 ATM" },
    ],
    inStock: true,
  },
  {
    id: 9,
    name: "Linen Button-Down Shirt",
    brand: "Summer Collection",
    category: "men",
    price: 79.0,
    description:
      "Breathable pure linen shirt perfect for warm weather. Features a relaxed fit, mother-of-pearl buttons, and a versatile design that transitions effortlessly from beach to dinner.",
    shortDescription: "Pure linen, breathable, summer essential",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=800&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 189,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sky Blue", hex: "#87ceeb" },
      { name: "Sand", hex: "#c2b280" },
    ],
    specifications: [
      { label: "Material", value: "100% Linen" },
      { label: "Fit", value: "Relaxed" },
      { label: "Care", value: "Machine wash cold" },
    ],
    inStock: true,
  },
  {
    id: 10,
    name: "Wide Leg Trousers",
    brand: "Modern Basics",
    category: "women",
    price: 99.0,
    description:
      "Effortlessly chic wide-leg trousers in a flowing fabric. High-waisted design with a flattering pleated front. Perfect for creating sophisticated, comfortable outfits.",
    shortDescription: "High-waisted, flowing fabric, effortless elegance",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",
    ],
    rating: 4.6,
    reviewCount: 234,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Cream", hex: "#fffdd0" },
      { name: "Terracotta", hex: "#c66b3d" },
    ],
    specifications: [
      { label: "Material", value: "65% Polyester, 35% Rayon" },
      { label: "Rise", value: "High-rise" },
      { label: "Leg", value: "Wide leg" },
    ],
    inStock: true,
  },
  {
    id: 11,
    name: "Canvas Sneakers",
    brand: "Stride",
    category: "accessories",
    price: 69.0,
    description:
      "Classic canvas sneakers with a modern twist. Features a cushioned insole, durable rubber outsole, and clean minimalist design. The perfect everyday shoe.",
    shortDescription: "Classic canvas, cushioned comfort, everyday style",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&h=800&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 678,
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Navy", hex: "#1e3a5f" },
    ],
    specifications: [
      { label: "Material", value: "Canvas upper, rubber sole" },
      { label: "Insole", value: "Memory foam" },
      { label: "Closure", value: "Lace-up" },
    ],
    inStock: true,
  },
  {
    id: 12,
    name: "Portable Bluetooth Speaker",
    brand: "SoundWave",
    category: "electronics",
    price: 79.0,
    description:
      "Take your music anywhere with this compact yet powerful Bluetooth speaker. Features 360° sound, IPX7 waterproofing, and 12-hour battery life. Perfect for outdoor adventures.",
    shortDescription: "360° sound, waterproof, 12hr battery",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=800&fit=crop",
    ],
    rating: 4.6,
    reviewCount: 534,
    colors: [
      { name: "Midnight Blue", hex: "#191970" },
      { name: "Forest Green", hex: "#228b22" },
      { name: "Coral", hex: "#ff7f50" },
    ],
    specifications: [
      { label: "Battery Life", value: "12 hours" },
      { label: "Waterproof Rating", value: "IPX7" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
    ],
    inStock: true,
  },
];
export const reviews = [
  {
    id: 1,
    productId: 1,
    author: "Sarah M.",
    rating: 5,
    date: "2024-01-15",
    title: "Perfect everyday tee",
    content:
      "This is hands down the best t-shirt I've ever owned. The cotton is so soft and the fit is exactly what I was looking for. Already ordered two more!",
    verified: true,
  },
  {
    id: 2,
    productId: 1,
    author: "James K.",
    rating: 4,
    date: "2024-01-10",
    title: "Great quality, runs slightly large",
    content:
      "Excellent quality and very comfortable. I'd recommend sizing down if you prefer a more fitted look.",
    verified: true,
  },
  {
    id: 3,
    productId: 1,
    author: "Emily R.",
    rating: 5,
    date: "2024-01-05",
    title: "Worth every penny",
    content:
      "After washing multiple times, it still looks brand new. The organic cotton feels amazing on the skin.",
    verified: true,
  },
];
export const heroSlides = [
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "2026",
    heading: "Effortless Elegance",
    description:
      "Discover timeless pieces crafted for the modern wardrobe. Premium fabrics meet contemporary design.",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop",
    cta: "Shop Collection",
    ctaLink: "/shop?collection=summer",
  },
  {
    id: 2,
    title: "New Season",
    subtitle: "Exclusive",
    heading: "Refined Minimalism",
    description:
      "Clean lines, luxurious textures, and a palette that transcends seasons. Dress for the life you lead.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop",
    cta: "Explore Now",
    ctaLink: "/shop?collection=new",
  },
  {
    id: 3,
    title: "Limited Edition",
    subtitle: "Designer",
    heading: "Artisan Crafted",
    description:
      "Hand-selected pieces from the world's finest ateliers. Where heritage meets innovation.",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop",
    cta: "View Collection",
    ctaLink: "/shop?collection=limited",
  },
];
