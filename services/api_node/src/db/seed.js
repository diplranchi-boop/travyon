const pool = require("./index");

const destinations = [
  {
    name: "Goa Beach Escape",
    state: "Goa",
    city: "Panaji",
    description: "Golden sands, laid-back shacks, and sunset cruises along Goa's vibrant coast.",
    hero_image_url: "https://images.travyon.com/destinations/goa-hero.jpg"
  },
  {
    name: "Jaipur Heritage Trail",
    state: "Rajasthan",
    city: "Jaipur",
    description: "Royal palaces, pink-hued bazaars, and cultural treasures in the heart of Rajasthan.",
    hero_image_url: "https://images.travyon.com/destinations/jaipur-hero.jpg"
  },
  {
    name: "Kerala Backwaters",
    state: "Kerala",
    city: "Kochi",
    description: "Houseboats, palm-lined canals, and serene lagoons across God's Own Country.",
    hero_image_url: "https://images.travyon.com/destinations/kerala-hero.jpg"
  },
  {
    name: "Ladakh Adventure",
    state: "Ladakh",
    city: "Leh",
    description: "High-altitude passes, crystal lakes, and dramatic Himalayan landscapes.",
    hero_image_url: "https://images.travyon.com/destinations/ladakh-hero.jpg"
  },
  {
    name: "Rishikesh Retreat",
    state: "Uttarakhand",
    city: "Rishikesh",
    description: "Yoga by the Ganges, forest hikes, and tranquil ashrams in the foothills.",
    hero_image_url: "https://images.travyon.com/destinations/rishikesh-hero.jpg"
  }
];

const hotels = [
  {
    destination: "Goa Beach Escape",
    name: "Panaji Bay Resort",
    address: "Miramar Beach Road, Panaji, Goa",
    price_from: 6200.0,
    rating: 4.6
  },
  {
    destination: "Goa Beach Escape",
    name: "Candolim Sands Hotel",
    address: "Candolim Main Street, North Goa",
    price_from: 5400.0,
    rating: 4.3
  },
  {
    destination: "Jaipur Heritage Trail",
    name: "Pink City Palace Stay",
    address: "Hawa Mahal Road, Jaipur, Rajasthan",
    price_from: 7100.0,
    rating: 4.7
  },
  {
    destination: "Jaipur Heritage Trail",
    name: "Amber Fort View Inn",
    address: "Amer Fort Road, Jaipur, Rajasthan",
    price_from: 4800.0,
    rating: 4.2
  },
  {
    destination: "Kerala Backwaters",
    name: "Kochi Lagoon Resort",
    address: "Marine Drive, Kochi, Kerala",
    price_from: 5600.0,
    rating: 4.5
  },
  {
    destination: "Kerala Backwaters",
    name: "Alleppey Houseboat Suites",
    address: "Finishing Point, Alappuzha, Kerala",
    price_from: 8900.0,
    rating: 4.8
  },
  {
    destination: "Ladakh Adventure",
    name: "Leh Mountain Lodge",
    address: "Old Leh Road, Leh, Ladakh",
    price_from: 6900.0,
    rating: 4.4
  },
  {
    destination: "Ladakh Adventure",
    name: "Nubra Valley Camp",
    address: "Hunder Village, Nubra Valley, Ladakh",
    price_from: 7500.0,
    rating: 4.1
  },
  {
    destination: "Rishikesh Retreat",
    name: "Ganga Riverside Retreat",
    address: "Tapovan, Rishikesh, Uttarakhand",
    price_from: 5200.0,
    rating: 4.6
  },
  {
    destination: "Rishikesh Retreat",
    name: "Himalayan Yoga Stay",
    address: "Laxman Jhula Road, Rishikesh, Uttarakhand",
    price_from: 4300.0,
    rating: 4.3
  }
];

const packages = [
  {
    destination: "Goa Beach Escape",
    title: "Goa Sun & Sand",
    duration_days: 4,
    price_from: 18999.0,
    inclusions_json: [
      "3 nights premium beachfront stay",
      "Daily breakfast",
      "Sunset cruise with transfers",
      "North Goa guided tour"
    ]
  },
  {
    destination: "Jaipur Heritage Trail",
    title: "Royal Jaipur Weekend",
    duration_days: 3,
    price_from: 14999.0,
    inclusions_json: [
      "2 nights heritage hotel",
      "Amber Fort & City Palace tour",
      "Cultural dinner with folk show"
    ]
  },
  {
    destination: "Kerala Backwaters",
    title: "Backwater Bliss Escape",
    duration_days: 5,
    price_from: 24999.0,
    inclusions_json: [
      "2 nights houseboat stay",
      "2 nights boutique resort",
      "Kathakali performance",
      "Airport transfers"
    ]
  }
];

const upsertDestinations = async () => {
  const values = destinations.map((destination) => [
    destination.name,
    destination.state,
    destination.city,
    destination.description,
    destination.hero_image_url,
    "ACTIVE",
    1
  ]);

  await pool.query(
    `INSERT INTO destinations (name, state, city, description, hero_image_url, status, is_live)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       state = VALUES(state),
       city = VALUES(city),
       description = VALUES(description),
       hero_image_url = VALUES(hero_image_url),
       status = VALUES(status),
       is_live = VALUES(is_live)`,
    [values]
  );
};

const fetchDestinationMap = async () => {
  const [rows] = await pool.query("SELECT id, name FROM destinations");
  return new Map(rows.map((row) => [row.name, row.id]));
};

const upsertHotels = async (destinationMap) => {
  const values = hotels.map((hotel) => [
    destinationMap.get(hotel.destination),
    hotel.name,
    hotel.address,
    hotel.price_from,
    hotel.rating,
    "ACTIVE",
    1
  ]);

  await pool.query(
    `INSERT INTO hotels (destination_id, name, address, price_from, rating, status, is_live)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       address = VALUES(address),
       price_from = VALUES(price_from),
       rating = VALUES(rating),
       status = VALUES(status),
       is_live = VALUES(is_live)`,
    [values]
  );
};

const upsertPackages = async (destinationMap) => {
  const values = packages.map((pkg) => [
    destinationMap.get(pkg.destination),
    pkg.title,
    pkg.title,
    pkg.duration_days,
    pkg.price_from,
    JSON.stringify(pkg.inclusions_json),
    "ACTIVE",
    pkg.price_from,
    1
  ]);

  await pool.query(
    `INSERT INTO packages (destination_id, title, name, duration_days, price_from, inclusions_json, status, price, is_live)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       duration_days = VALUES(duration_days),
       price_from = VALUES(price_from),
       inclusions_json = VALUES(inclusions_json),
       status = VALUES(status),
       price = VALUES(price),
       is_live = VALUES(is_live)`,
    [values]
  );
};

const seedCatalog = async () => {
  await upsertDestinations();
  const destinationMap = await fetchDestinationMap();
  await upsertHotels(destinationMap);
  await upsertPackages(destinationMap);
};

const main = async () => {
  await seedCatalog();
};

if (require.main === module) {
  main()
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}

module.exports = {
  seedCatalog
};
