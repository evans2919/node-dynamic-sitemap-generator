import { create } from "xmlbuilder";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { format } from "date-fns";

// Cambia esto a la URL de tu sitio
dotenv.config();
const hostname = process.env.SITE_URL;
const apiUrl = process.env.API_URL;
const apiToken = process.env.API_TOKEN;

const routes = [
  {
    path: "/",
    changefreq: "daily",
    priority: 1.0,
  },
  {
    path: "/nosotros",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/servicios",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/contacto",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/blog/:slug",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/actividades/:slug", // Nueva ruta para actividades
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    path: "/lider/:slug", // Nueva ruta para líderes
    changefreq: "weekly",
    priority: 0.6,
  },
  // ... otras rutas
];

async function getBlogPosts() {
  const response = await fetch(`${apiUrl}/posts`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data.data; // Accedemos al arreglo de publicaciones dentro de "data"
}

async function getActivities() {
  const response = await fetch(`${apiUrl}/events`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.data;
}

async function getLeaders() {
  const response = await fetch(`${apiUrl}/leaders`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.data;
}

(async () => {
const sitemap = create("sitemap").ele("urlset", {
  xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
});

  for (const route of routes) {
    if (route.path === "/blog/:slug") {
      const blogPosts = await getBlogPosts();

      for (const post of blogPosts) {
        sitemap
          .ele("url")
          .ele("loc")
          .txt(
            `${hostname}${route.path.replace(":slug", post.attributes.slug)}`
          )
          .up()
          .ele("lastmod") // Agrega la etiqueta <lastmod>
          .txt(format(new Date(post.attributes.updatedAt), "yyyy-MM-dd")) // Formatea la fecha de actualización
          .up()
          .ele("changefreq")
          .txt(route.changefreq)
          .up()
          .ele("priority")
          .txt(route.priority)
          .up()
          .up();
      }
    } else if (route.path === "/actividades/:slug") {
      const events = await getActivities();

      for (const event of events) {
        sitemap
          .ele("url")
          .ele("loc")
          .txt(
            `${hostname}${route.path.replace(":slug", event.attributes.slug)}`
          )
          .up()
          .ele("lastmod") // Agrega la etiqueta <lastmod>
          .txt(format(new Date(event.attributes.updatedAt), "yyyy-MM-dd")) // Formatea la fecha de actualización
          .up()
          .ele("changefreq")
          .txt(route.changefreq)
          .up()
          .ele("priority")
          .txt(route.priority)
          .up()
          .up();
      }
    } else if (route.path === "/lider/:slug") {
      const leaders = await getLeaders();

      for (const leader of leaders) {
        sitemap
          .ele("url")
          .ele("loc")
          .txt(
            `${hostname}${route.path.replace(":slug", leader.attributes.slug)}`
          )
          .up()
          .ele("lastmod") // Agrega la etiqueta <lastmod>
          .txt(format(new Date(leader.attributes.updatedAt), "yyyy-MM-dd")) // Formatea la fecha de actualización
          .up()
          .ele("changefreq")
          .txt(route.changefreq)
          .up()
          .ele("priority")
          .txt(route.priority)
          .up()
          .up();
      }
    } else {
      sitemap
        .ele("url")
        .ele("loc")
        .txt(`${hostname}${route.path}`)
        .up()
        .ele("lastmod") // Agrega la etiqueta <lastmod>
        .txt(format(new Date(), "yyyy-MM-dd")) // Formatea la fecha actual
        .up()
        .ele("changefreq")
        .txt(route.changefreq)
        .up()
        .ele("priority")
        .txt(route.priority)
        .up()
        .up();
    }
  }

  const sitemapPath = "./sitemap.xml";

  fs.writeFileSync(sitemapPath, sitemap.end({ prettyPrint: true }));

  console.log(`Sitemap generado en ${sitemapPath}`);
})();
