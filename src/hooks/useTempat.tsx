import ProductService from "@/services/product.service";
import useSWR from "swr";

const useProduct = (id?: number) => {
  const products = useSWR("/api/products", ProductService.getAll);

  const product = useSWR(
    id ? [`/api/products/${id}`, id] : null,
    id ? () => ProductService.getById(Number(id)) : null
  );

  const newArrivalProducts = useSWR(
    "/api/new-arrival",
    ProductService.getNewArrival
  );

  return {
    states: {
      products,
      product,
      newArrivalProducts,
    },
  };
};

export default useProduct;
