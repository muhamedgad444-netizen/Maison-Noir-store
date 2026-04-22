import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";

const products = [
  {
    id: 1,
    name: "L'EAU NOIR",
    price: "$240",
    top: "Bergamot",
    heart: "Black Tea",
    base: "Tobacco",
    image: "/bottle1.png",
  },
  {
    id: 2,
    name: "NUIT D'ARGENT",
    price: "$310",
    top: "Juniper",
    heart: "Iris",
    base: "Sandalwood",
    image: "/bottle2.png",
  },
];

export default function App() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] tracking-[0.5em] uppercase mb-4"
        >
          New Collection 2026
        </motion.span>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          className="text-7xl md:text-9xl serif italic"
        >
          Essence of Presence.
        </motion.h1>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-12">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </section>

      {/* About Section (Horizontal Layout) */}
      <section className="py-40 border-t border-white/10 mx-6">
        <div className="flex flex-col md:flex-row gap-20 items-start">
          <h2 className="text-5xl serif md:w-1/3">
            The Architecture <br /> of Scent.
          </h2>
          <div className="md:w-1/2 space-y-6 text-gray-400 leading-relaxed font-light">
            <p>
              Guided by the principles of high-end tailoring and Stuttgart
              precision, our scents are engineered rather than mixed.
            </p>
            <p>
              Every bottle represents a moment in time—frozen, captured, and
              distilled into a singular olfactory experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
