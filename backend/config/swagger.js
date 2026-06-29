const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Della Shop API",
      version: "1.0.0",
      description: "API para productos, inventario, checkout por WhatsApp y panel admin.",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        AdminBearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        CheckoutItem: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            variantId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
          },
        },
        WhatsappCheckoutRequest: {
          type: "object",
          required: ["items"],
          properties: {
            customer: {
              type: "object",
              properties: {
                name: { type: "string", example: "Daniel" },
                phone: { type: "string", example: "3001234567" },
                notes: { type: "string", example: "Entrega en la tarde" },
              },
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CheckoutItem" },
            },
          },
        },
        AdminProductRequest: {
          type: "object",
          required: [
            "name",
            "category",
            "price",
            "shortDescription",
            "longDescription",
            "benefits",
            "ingredients",
            "variants",
          ],
          properties: {
            name: { type: "string", example: "Velvet Matte Lip Cloud" },
            category: { type: "string", example: "Labios" },
            price: { type: "integer", example: 89900 },
            shortDescription: {
              type: "string",
              example: "Labial mousse de larga duracion con acabado aterciopelado.",
            },
            longDescription: {
              type: "string",
              example:
                "Formula flexible para labios definidos, suaves y comodos durante horas.",
            },
            accent: {
              type: "string",
              enum: ["rose", "sand", "gold", "espresso"],
              example: "rose",
            },
            tag: { type: "string", example: "Nuevo" },
            popularity: { type: "integer", example: 88 },
            variant: { type: "string", example: "Mousse soft matte" },
            benefits: {
              type: "array",
              items: { type: "string" },
              example: ["Larga duracion", "Textura ligera"],
            },
            ingredients: {
              type: "array",
              items: { type: "string" },
              example: ["Vitamina E", "Aceite de jojoba"],
            },
            visualStyle: { type: "string", example: "lipstick" },
            visualLabel: { type: "string", example: "Lip Cloud" },
            visualNote: { type: "string", example: "Soft matte" },
            imageUrl: { type: "string", example: "" },
            variants: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "stock"],
                properties: {
                  name: { type: "string", example: "Rose Nude" },
                  shade: { type: "string", example: "Rose Nude" },
                  sku: { type: "string", example: "velvet-matte-lip-cloud-rose-nude" },
                  price: { type: "integer", example: 89900 },
                  stock: { type: "integer", example: 10 },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./server/routes/*.js"],
});

module.exports = {
  swaggerSpec,
};
