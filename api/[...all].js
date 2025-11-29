import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get the full URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  // Log every request
  console.log("========================================");
  console.log("API Request:", method, pathname);
  console.log("========================================");

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ====================
    // TEST ENDPOINT
    // ====================
    if (pathname === "/api/test") {
      return res.status(200).json({
        status: "API working",
        timestamp: new Date().toISOString(),
      });
    }

    // ====================
    // TRIPS
    // ====================

    // GET all trips
    if (pathname === "/api/trips" && method === "GET") {
      console.log("→ Getting all trips");
      const trips = await prisma.trip.findMany({
        include: {
          cities: {
            include: { activities: true },
          },
        },
      });
      console.log("✓ Found", trips.length, "trips");
      return res.status(200).json(trips);
    }

    // POST new trip
    if (pathname === "/api/trips" && method === "POST") {
      console.log("→ Creating trip");
      const { name, cities } = req.body;
      const trip = await prisma.trip.create({
        data: {
          name,
          cities: {
            create: cities.map((city) => ({
              name: city.name,
              transport: city.transport,
              startDate: city.startDate,
              endDate: city.endDate,
              posX: city.position?.x || 100,
              posY: city.position?.y || 300,
            })),
          },
        },
        include: {
          cities: {
            include: { activities: true },
          },
        },
      });
      console.log("✓ Created trip:", trip.id);
      return res.status(201).json(trip);
    }

    // DELETE trip
    if (pathname.startsWith("/api/trips/") && method === "DELETE") {
      const parts = pathname.split("/");
      const tripId = parts[parts.length - 1];

      console.log("→ Deleting trip:", tripId);

      if (!tripId || tripId === "trips") {
        console.log("✗ Invalid trip ID");
        return res.status(400).json({ error: "Invalid trip ID" });
      }

      try {
        await prisma.trip.delete({
          where: { id: tripId },
        });
        console.log("✓ Trip deleted successfully");
        return res.status(200).json({ success: true, message: "Trip deleted" });
      } catch (error) {
        console.error("✗ Error deleting trip:", error.message);
        return res.status(500).json({
          error: "Failed to delete trip",
          details: error.message,
        });
      }
    }

    // ====================
    // CITIES
    // ====================

    // POST new city
    if (pathname === "/api/cities" && method === "POST") {
      console.log("→ Creating city");
      const { tripId, name, transport, startDate, endDate, position } =
        req.body;
      const city = await prisma.city.create({
        data: {
          tripId,
          name,
          transport,
          startDate,
          endDate,
          posX: position?.x || 100,
          posY: position?.y || 300,
        },
        include: { activities: true },
      });
      console.log("✓ Created city:", city.id);
      return res.status(201).json(city);
    }

    // PATCH city
    if (pathname.startsWith("/api/cities/") && method === "PATCH") {
      const parts = pathname.split("/");
      const cityId = parts[parts.length - 1];

      console.log("→ Updating city:", cityId);
      const { position } = req.body;

      try {
        const city = await prisma.city.update({
          where: { id: cityId },
          data: {
            posX: position?.x,
            posY: position?.y,
          },
          include: { activities: true },
        });
        console.log("✓ City updated");
        return res.status(200).json(city);
      } catch (error) {
        console.error("✗ Error updating city:", error.message);
        return res.status(500).json({
          error: "Failed to update city",
          details: error.message,
        });
      }
    }

    // DELETE city
    if (pathname.startsWith("/api/cities/") && method === "DELETE") {
      const parts = pathname.split("/");
      const cityId = parts[parts.length - 1];

      console.log("→ Deleting city:", cityId);

      if (!cityId || cityId === "cities") {
        console.log("✗ Invalid city ID");
        return res.status(400).json({ error: "Invalid city ID" });
      }

      try {
        await prisma.city.delete({
          where: { id: cityId },
        });
        console.log("✓ City deleted successfully");
        return res.status(200).json({ success: true, message: "City deleted" });
      } catch (error) {
        console.error("✗ Error deleting city:", error.message);
        return res.status(500).json({
          error: "Failed to delete city",
          details: error.message,
        });
      }
    }

    // ====================
    // ACTIVITIES
    // ====================

    // POST new activity
    if (pathname === "/api/activities" && method === "POST") {
      console.log("→ Creating activity");
      const { cityId, name, type, color, startTime, endTime, notes, date } =
        req.body;
      const activity = await prisma.activity.create({
        data: {
          cityId,
          name,
          type: type || "other",
          color: color || "#F4D03F",
          startTime,
          endTime,
          notes: notes || "",
          date,
        },
      });
      console.log("✓ Created activity:", activity.id);
      return res.status(201).json(activity);
    }

    // PATCH activity
    if (pathname.startsWith("/api/activities/") && method === "PATCH") {
      const parts = pathname.split("/");
      const activityId = parts[parts.length - 1];

      console.log("→ Updating activity:", activityId);
      const { name, type, color, startTime, endTime, notes } = req.body;

      try {
        const activity = await prisma.activity.update({
          where: { id: activityId },
          data: { name, type, color, startTime, endTime, notes },
        });
        console.log("✓ Activity updated");
        return res.status(200).json(activity);
      } catch (error) {
        console.error("✗ Error updating activity:", error.message);
        return res.status(500).json({
          error: "Failed to update activity",
          details: error.message,
        });
      }
    }

    // DELETE activity
    if (pathname.startsWith("/api/activities/") && method === "DELETE") {
      const parts = pathname.split("/");
      const activityId = parts[parts.length - 1];

      console.log("→ Deleting activity:", activityId);

      if (!activityId || activityId === "activities") {
        console.log("✗ Invalid activity ID");
        return res.status(400).json({ error: "Invalid activity ID" });
      }

      try {
        await prisma.activity.delete({
          where: { id: activityId },
        });
        console.log("✓ Activity deleted successfully");
        return res
          .status(200)
          .json({ success: true, message: "Activity deleted" });
      } catch (error) {
        console.error("✗ Error deleting activity:", error.message);
        return res.status(500).json({
          error: "Failed to delete activity",
          details: error.message,
        });
      }
    }

    // ====================
    // NO ROUTE MATCHED
    // ====================
    console.log("✗ No route matched");
    return res.status(404).json({
      error: "Route not found",
      method: method,
      pathname: pathname,
      message: "This API endpoint does not exist",
    });
  } catch (error) {
    console.error("========================================");
    console.error("💥 SERVER ERROR:", error);
    console.error("========================================");
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
