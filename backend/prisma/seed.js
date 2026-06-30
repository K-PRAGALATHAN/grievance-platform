const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const water = await prisma.department.upsert({
    where: { code: "WATER" },
    update: {},
    create: {
      name: "Water Supply Department",
      code: "WATER",
      description: "Handles water leakage, shortage, and pipeline issues",
    },
  });
  const roads = await prisma.department.upsert({
    where: { code: "ROADS" },
    update: {},
    create: {
      name: "Roads Department",
      code: "ROADS",
      description: "Handles potholes, road damage, and street maintenance",
    },
  });

  const sanitation = await prisma.department.upsert({
    where: { code: "SANITATION" },
    update: {},
    create: {
      name: "Sanitation Department",
      code: "SANITATION",
      description: "Handles garbage, drainage, and cleanliness complaints",
    },
  });
  await prisma.complaintCategory.createMany({
    data: [
      { name: "Water Leakage", departmentId: water.id },
      { name: "Water Shortage", departmentId: water.id },
      { name: "Pothole", departmentId: roads.id },
      { name: "Road Damage", departmentId: roads.id },
      { name: "Garbage Collection", departmentId: sanitation.id },
      { name: "Drainage Blockage", departmentId: sanitation.id },
    ],
    skipDuplicates: true,
  });
  await prisma.jurisdiction.createMany({
    data: [
      { name: "Ward 1", type: "WARD" },
      { name: "Ward 2", type: "WARD" },
      { name: "Ward 3", type: "WARD" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
