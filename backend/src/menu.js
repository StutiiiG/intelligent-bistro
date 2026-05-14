// The bistro menu. Shared shape with the mobile client.
// `id` is the canonical key the AI uses when emitting cart actions.

export const MENU = [
  {
    id: "spicy-chicken-sandwich",
    name: "Spicy Chicken Sandwich",
    description:
      "Buttermilk-brined chicken thigh, pickled jalapeños, slaw, brioche bun.",
    price: 13.5,
    category: "Sandwiches",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800",
    tags: ["spicy", "chicken", "sandwich"],
  },
  {
    id: "classic-burger",
    name: "Bistro Burger",
    description:
      "Two smashed patties, aged cheddar, caramelized onion, secret sauce.",
    price: 15.0,
    category: "Sandwiches",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    tags: ["beef", "burger", "cheese"],
  },
  {
    id: "truffle-fries",
    name: "Truffle Fries",
    description: "Hand-cut, parmesan, fresh herbs, black truffle oil.",
    price: 8.0,
    category: "Sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
    tags: ["fries", "truffle", "vegetarian"],
  },
  {
    id: "caesar-salad",
    name: "Little Gem Caesar",
    description: "Crispy lettuce, white anchovy, parmesan, sourdough crouton.",
    price: 12.0,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800",
    tags: ["salad", "caesar"],
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "San Marzano tomato, fior di latte, basil, olive oil.",
    price: 16.0,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800",
    tags: ["pizza", "vegetarian", "cheese"],
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Pizza",
    description: "Cup-and-char pepperoni, mozzarella, hot honey.",
    price: 18.0,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
    tags: ["pizza", "pepperoni", "spicy"],
  },
  {
    id: "iced-latte",
    name: "Iced Vanilla Latte",
    description: "Double espresso, vanilla bean syrup, cold milk.",
    price: 5.5,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=800",
    tags: ["coffee", "drink", "iced"],
  },
  {
    id: "sparkling-water",
    name: "Sparkling Water",
    description: "Chilled. Available in small or large.",
    price: 3.0,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800",
    tags: ["water", "drink"],
  },
  {
    id: "chocolate-tart",
    name: "Dark Chocolate Tart",
    description: "70% chocolate ganache, sea salt, almond crust.",
    price: 9.5,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
    tags: ["dessert", "chocolate"],
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Espresso-soaked ladyfingers, mascarpone, cocoa.",
    price: 8.5,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
    tags: ["dessert", "coffee"],
  },
];

export const MENU_BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));
