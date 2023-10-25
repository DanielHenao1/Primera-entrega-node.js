import { Router } from "express";
import fs from "fs/promises";

const router = Router();
// Definir una variable para el nombre del archivo de productos
const productsFile = "./src/data/productos.json";

// Verificar si el archivo de productos existe, y si no, crearlo
(async () => {
  try {
    await fs.access(productsFile);
  } catch (error) {
    // Si el archivo no existe, crearlo con un arreglo vacío
    await fs.writeFile(productsFile, "[]", "utf8");
  }
})();

router.get("/", async (req, res) => {
  try {
    // Leer el archivo JSON de productos
    const data = await fs.readFile(productsFile, "utf8");
    const products = JSON.parse(data);

    // Verificar si se proporciona el parámetro de consulta "limit"
    const limit = req.query.limit;

    // Si se proporciona un límite, limitar la lista de productos
    if (limit) {
      const limitedProducts = products.slice(0, parseInt(limit, 10));
      res.json(limitedProducts);
    } else {
      // Si no se proporciona un límite, devolver todos los productos
      res.json(products);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar los productos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Leer el archivo JSON de productos
    const data = await fs.readFile(productsFile, "utf8");
    const products = JSON.parse(data);

    // Obtener el ID desde los parámetros de la ruta
    const productId = req.params.id;

    // Buscar el producto con el ID proporcionado
    const product = products.find((p) => p.id == productId);

    // Si se encuentra el producto, devolverlo; de lo contrario, devolver un error 404
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    // Leer el archivo JSON de productos
    const data = await fs.readFile(productsFile, "utf8");
    const products = JSON.parse(data);

    // Obtener los datos del nuevo producto desde el cuerpo de la solicitud (request body)
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      status,
      thumbnails,
    } = req.body;

    // Verificar que todos los campos obligatorios estén presentes
    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Generar un nuevo ID para el producto (puedes usar un enfoque autoincremental)
    const newProductId = products.length + 1;

    // Crear un objeto para el nuevo producto que incluye el campo "thumbnails"
    const newProduct = {
      id: newProductId, // Utiliza el ID generado automáticamente
      title,
      description,
      code,
      price,
      stock,
      category,
      status: status || true, // Establecer status como true por defecto si no se proporciona
      thumbnails: thumbnails || [], // Agregar el campo "thumbnails"
    };

    // Agregar el nuevo producto al arreglo de productos
    products.push(newProduct);

    // Guardar el arreglo actualizado en el archivo JSON
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2), "utf8");

    // Responder con el nuevo producto agregado
    res.json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    // Leer el archivo JSON de productos
    const data = await fs.readFile(productsFile, "utf8");
    const products = JSON.parse(data);

    // Obtener el ID del producto desde los parámetros de la ruta
    const productId = req.params.id;

    // Encontrar el índice del producto en el arreglo por su ID
    const productIndex = products.findIndex((p) => p.id == productId);

    // Verificar si se encontró el producto
    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener los datos del producto a actualizar desde el cuerpo de la solicitud (request body)
    const updatedProductData = req.body;

    // Asegurarse de que el ID del producto no se modifique
    updatedProductData.id = productId;

    // Actualizar el producto con los campos proporcionados
    products[productIndex] = updatedProductData;

    // Guardar el arreglo actualizado en el archivo JSON
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2), "utf8");

    // Responder con el producto actualizado
    res.json(updatedProductData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Leer el archivo JSON de productos
    const data = await fs.readFile(productsFile, "utf8");
    const products = JSON.parse(data);

    // Obtener el ID del producto desde los parámetros de la ruta
    const productId = req.params.id;

    // Encontrar el índice del producto en el arreglo por su ID
    const productIndex = products.findIndex((p) => p.id === productId);

    // Verificar si se encontró el producto
    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar el producto del arreglo
    products.splice(productIndex, 1);

    // Guardar el arreglo actualizado en el archivo JSON
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2), "utf8");

    // Responder con un mensaje de éxito
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
