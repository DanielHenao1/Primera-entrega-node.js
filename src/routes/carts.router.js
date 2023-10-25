import { Router } from "express";
import fs from "fs/promises";

const router = Router();

// Definir una variable para el nombre del archivo de productos
const cartsFile = "./src/data/carrito.json";
const productsFile = "./src/data/productos.json";

// Verificar si el archivo de productos existe, y si no, crearlo
(async () => {
  try {
    await fs.access(cartsFile);
  } catch (error) {
    // Si el archivo no existe, crearlo con un arreglo vacío
    await fs.writeFile(cartsFile, "[]", "utf8");
  }
})();

// Función para generar un ID único para el carrito
function generateUniqueCartId(carts) {
  // Puedes implementar tu lógica para generar IDs únicos aquí
  let uniqueId;
  let isDuplicate;

  do {
    // Genera un ID aleatorio
    uniqueId = Math.floor(Math.random() * 1000000).toString();

    // Verifica si el ID ya existe en la lista de carritos
    isDuplicate = carts.some((cart) => cart.id === uniqueId);
  } while (isDuplicate); // Continúa generando IDs hasta que sea único

  return uniqueId;
}

// Ruta raíz POST para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    // Leer el archivo JSON de carritos
    const data = await fs.readFile(cartsFile, "utf8");
    const carts = JSON.parse(data);

    // Generar un nuevo ID para el carrito (puedes usar un enfoque autoincremental)
    const newCartId = generateUniqueCartId(carts);

    // Crear un objeto para el nuevo carrito
    const newCart = {
      id: newCartId, // Utiliza el ID generado automáticamente
      products: [], // Un carrito nuevo comienza vacío
    };

    // Agregar el nuevo carrito al arreglo de carritos
    carts.push(newCart);

    // Guardar el arreglo actualizado en el archivo JSON
    await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2), "utf8");

    // Responder con el nuevo carrito creado
    res.json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// Ruta GET para listar los productos en un carrito específico por su ID
router.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    // Leer el archivo JSON de carritos
    const data = await fs.readFile(cartsFile, "utf8");
    const carts = JSON.parse(data);

    // Encontrar el carrito con el ID proporcionado
    const cart = carts.find((c) => c.id === cartId);

    // Si se encuentra el carrito, devolver los productos en el carrito; de lo contrario, devolver un error 404
    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// Ruta POST para agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;

    // Leer el archivo JSON de carritos
    const data = await fs.readFile(cartsFile, "utf8");
    const carts = JSON.parse(data);

    // Encontrar el carrito con el ID proporcionado
    const cart = carts.find((c) => c.id === cartId);

    // Verificar si se encontró el carrito
    if (cart) {
      // Leer el archivo JSON de productos
      const productsData = await fs.readFile(productsFile, "utf8");
      const products = JSON.parse(productsData);

      // Encontrar el producto con el ID proporcionado
      const product = products.find((p) => p.id == productId);

      if (product) {
        // Verificar si ya existe el producto en el carrito
        const existingProduct = cart.products.find(
          (p) => p.product === productId
        );

        if (existingProduct) {
          // Si el producto ya existe en el carrito, incrementar la cantidad
          existingProduct.quantity += quantity;
        } else {
          // Si el producto no existe en el carrito, agregarlo
          cart.products.push({
            title: product.title,
            product: productId,
            quantity: quantity,
          });
        }

        // Guardar el carrito actualizado en el archivo JSON
        await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2), "utf8");

        // Responder con el carrito actualizado
        res.json(cart);
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

export default router;
