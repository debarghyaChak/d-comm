import { useEffect, useState } from "react";

const useProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/products") // ✅ Ensure correct backend URL
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data); // ✅ Debugging log (check console)
        setProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return products; // ✅ Export fetched products dynamically
};

export default useProducts;
