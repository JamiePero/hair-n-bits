/**
 * Hair 'N' Bits — Firestore Seed Script
 * Run: node seed.js
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var OR place serviceAccount.json next to this file
 */

const admin = require('firebase-admin')
const path  = require('path')

// Try loading service account from file if env var not set
let credential
try {
  const sa = require('./serviceAccount.json')
  credential = admin.credential.cert(sa)
} catch {
  credential = admin.credential.applicationDefault()
}

admin.initializeApp({ credential })
const db = admin.firestore()

const PLACEHOLDER = (text) =>
  `https://placehold.co/400x500/1a1a1a/F4CD59?text=${encodeURIComponent(text)}`

const PRODUCTS = [
  // Wigs
  {
    name: 'Brazilian Straight Wig 18 inch',
    category: 'wigs',
    price: 450,
    stock: 12,
    description: 'Premium Brazilian straight hair wig, 18 inches, natural black. Lace front with adjustable straps for a secure, natural-looking fit.',
    imageUrl: PLACEHOLDER('Brazilian Wig'),
  },
  {
    name: 'Curly Bob Wig',
    category: 'wigs',
    price: 320,
    stock: 8,
    description: 'Gorgeous curly bob wig in natural black. Heat-resistant fibres allow styling. Short, chic, and full of volume.',
    imageUrl: PLACEHOLDER('Curly Bob'),
  },
  // Hair Mesh
  {
    name: 'Black Hair Net Mesh Pack (6 pcs)',
    category: 'hair-mesh',
    price: 25,
    stock: 50,
    description: 'Pack of 6 fine black hair nets ideal for wig making and hair styling. Stretchy and durable.',
    imageUrl: PLACEHOLDER('Hair Net'),
  },
  {
    name: 'Nude Mesh Wig Cap',
    category: 'hair-mesh',
    price: 30,
    stock: 40,
    description: 'Lightweight nude-toned wig cap with elastic band. Keeps your natural hair flat and secure under wigs.',
    imageUrl: PLACEHOLDER('Wig Cap'),
  },
  // Beads
  {
    name: 'Waist Bead Set (3 strands)',
    category: 'beads',
    price: 60,
    stock: 30,
    description: 'Handcrafted waist bead set in vibrant red, gold and black. Adjustable tie-on design for all body sizes.',
    imageUrl: PLACEHOLDER('Waist Beads'),
  },
  {
    name: 'Ankle Bead Bracelet',
    category: 'beads',
    price: 40,
    stock: 25,
    description: 'Elegant ankle bead bracelet with gold accents. Perfect for beach days or everyday wear.',
    imageUrl: PLACEHOLDER('Ankle Beads'),
  },
  // Dresses
  {
    name: 'Kente Print Midi Dress',
    category: 'dresses',
    price: 180,
    stock: 15,
    description: 'Stunning Kente print midi dress with a wrap silhouette. Celebrates Ghanaian heritage with modern fashion-forward styling.',
    imageUrl: PLACEHOLDER('Kente Dress'),
  },
  {
    name: 'Bodycon Evening Dress',
    category: 'dresses',
    price: 220,
    stock: 10,
    description: 'Figure-hugging bodycon evening dress in deep wine red. Built-in stretch fabric for maximum comfort and confidence.',
    imageUrl: PLACEHOLDER('Bodycon Dress'),
  },
  // Shoes
  {
    name: 'Block Heel Sandals',
    category: 'shoes',
    price: 150,
    stock: 18,
    description: 'Chic block heel sandals with ankle strap. 3-inch heel. Faux leather in nude/black. Sizes 36–42.',
    imageUrl: PLACEHOLDER('Block Heels'),
  },
  {
    name: 'Flat Leather Mules',
    category: 'shoes',
    price: 120,
    stock: 22,
    description: 'Minimalist flat leather mules in classic black. Slip-on design with cushioned insole for all-day comfort.',
    imageUrl: PLACEHOLDER('Flat Mules'),
  },
  // Jewelry
  {
    name: 'Gold Hoop Earring Set',
    category: 'jewelry',
    price: 85,
    stock: 35,
    description: 'Set of 3 gold hoop earrings in small, medium, and large sizes. 18k gold-plated. Hypoallergenic posts.',
    imageUrl: PLACEHOLDER('Gold Hoops'),
  },
  {
    name: 'Layered Chain Necklace',
    category: 'jewelry',
    price: 95,
    stock: 28,
    description: 'Elegant 3-layer gold chain necklace. Adjustable clasp, tarnish-resistant. Adds a premium touch to any outfit.',
    imageUrl: PLACEHOLDER('Chain Necklace'),
  },
]

async function seed() {
  console.log('🌱 Seeding Hair \'N\' Bits products to Firestore...\n')
  const batch = db.batch()
  const col   = db.collection('products')

  for (const product of PRODUCTS) {
    const ref = col.doc()
    batch.set(ref, {
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`  + [${product.category}] ${product.name} — ₵${product.price}`)
  }

  await batch.commit()
  console.log(`\n✅  Seeded ${PRODUCTS.length} products successfully!`)
  process.exit(0)
}

seed().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
