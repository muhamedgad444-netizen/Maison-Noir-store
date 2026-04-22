import { motion } from "framer-motion";

const ProductCard = ({ product }) => {
  return (
    <motion.div
      className="group relative h-[500px] w-full bg-[#0a0a0a] border border-white/5 overflow-hidden cursor-none"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Product Image */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center p-12"
        variants={{
          rest: { x: 0, scale: 1 },
          hover: { x: -60, scale: 1.05 },
        }}
        transition={{ duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95] }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full object-contain"
        />
      </motion.div>

      {/* Description Overlay (Hidden by default) */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-20 flex flex-col justify-center px-8 bg-black/40 backdrop-blur-md"
        variants={{
          rest: { opacity: 0, x: 50 },
          hover: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="serif text-2xl mb-4 italic">{product.name}</h3>
        <div className="space-y-4 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <p>
            <span className="text-white block mb-1">Top</span> {product.top}
          </p>
          <p>
            <span className="text-white block mb-1">Heart</span> {product.heart}
          </p>
          <p>
            <span className="text-white block mb-1">Base</span> {product.base}
          </p>
        </div>
        <button className="mt-10 self-start border-b border-white py-1 text-[11px] tracking-widest hover:text-gray-400 hover:border-gray-400 transition-colors">
          DISCOVER
        </button>
      </motion.div>

      {/* Price Tag */}
      <div className="absolute bottom-6 left-6 z-30 group-hover:opacity-0 transition-opacity">
        <p className="text-xs tracking-tighter opacity-60">{product.price}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
