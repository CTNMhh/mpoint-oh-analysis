# Prisma Workflow für neue Tabellen

## 1. Schema bearbeiten

```prisma
// prisma/schema.prisma

model Order {
  id         Int         @id @default(autoincrement())
  orderNumber String     @unique @default(cuid())
  userId     Int
  user       User        @relation(fields: [userId], references: [id])
  items      OrderItem[]
  total      Decimal     @db.Decimal(10, 2)
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## 2. Migration ausführen
Führe nach der Schemaänderung eine neue Migration in deinem Docker-Container aus:

```bash
# Terminal in VSCode
docker exec -it mpoint-nextjs npx prisma migrate dev --name add_orders
```

npx prisma migrate deploy

✅ Danach ist deine Datenbank synchron mit dem aktualisierten Prisma-Schema.
