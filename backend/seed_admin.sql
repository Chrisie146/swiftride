INSERT INTO "User" (id, phone, name, role, "createdAt", "updatedAt")
VALUES ('admin001', '+27821110001', 'Admin', 'ADMIN', NOW(), NOW())
ON CONFLICT DO NOTHING;
