import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <main className="admin-page">
      <h1 style={{ marginBottom: "24px" }}>Нов продукт</h1>
      <ProductForm />
    </main>
  );
}
